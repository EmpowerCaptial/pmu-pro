import { NextRequest, NextResponse } from 'next/server'
import { put, BlobStoreSuspendedError, BlobStoreNotFoundError, BlobAccessError } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// POST /api/file-uploads - Upload file to Vercel Blob and save metadata
export async function POST(request: NextRequest) {
  try {
    console.log('File upload API called')
    
    const userEmail = request.headers.get('x-user-email')
    console.log('User email:', userEmail)
    
    if (!userEmail) {
      console.log('No user email provided')
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    console.log('Parsing form data...')
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('fileType') as string || 'document'

    console.log('Looking up user in database...')
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, email: true, name: true, role: true }
    })

    console.log('User lookup result:', {
      userExists: !!user,
      userId: user?.id,
      userEmail: user?.email,
      userRole: user?.role,
      fileType
    })

    // Check if user has permission to upload (for instructor folder, need instructor role)
    if (fileType.startsWith('instructor-folder:')) {
      const ALLOWED_ROLES = ['owner', 'director', 'manager', 'hr', 'staff', 'admin', 'instructor']
      const userRole = user?.role?.toLowerCase() || ''
      const normalizedUserRole = userRole.trim()
      
      console.log('Instructor folder upload check:', {
        userExists: !!user,
        userRole: user?.role,
        normalizedUserRole,
        allowedRoles: ALLOWED_ROLES,
        isAllowed: user && ALLOWED_ROLES.includes(normalizedUserRole),
        roleComparison: ALLOWED_ROLES.map(r => ({ role: r, matches: r === normalizedUserRole }))
      })
      
      if (!user) {
        console.log('User not found for instructor folder upload')
        return NextResponse.json({ 
          error: 'User not found. Please log in to upload files.',
          details: 'Unable to find user account. Please ensure you are logged in.',
          debug: {
            userExists: false,
            userEmail,
            fileType
          }
        }, { status: 401 })
      }
      
      if (!ALLOWED_ROLES.includes(normalizedUserRole)) {
        console.log('User does not have permission to upload to instructor folder', {
          user: { id: user.id, email: user.email, role: user.role },
          normalizedUserRole,
          allowedRoles: ALLOWED_ROLES,
          userEmail,
          fileType
        })
        return NextResponse.json({ 
          error: 'Forbidden: Only instructors and administrators can upload to instructor folder',
          details: `Your role (${user.role || 'none'}) is not authorized. Required roles: ${ALLOWED_ROLES.join(', ')}`,
          debug: {
            userExists: true,
            userRole: user.role,
            normalizedUserRole,
            userEmail,
            allowedRoles: ALLOWED_ROLES
          }
        }, { status: 403 })
      }
    }

    // If user not found in database, create a demo user entry (but not for instructor folder)
    if (!user) {
      if (fileType.startsWith('instructor-folder:')) {
        return NextResponse.json({ error: 'User not found. Please log in to upload files.' }, { status: 401 })
      }
      console.log('User not found in database, creating demo user...')
      user = await prisma.user.create({
        data: {
          email: userEmail,
          name: 'Demo User',
          password: 'demo', // Placeholder password for demo users
          businessName: 'Demo Studio',
          phone: '',
          licenseNumber: '',
          licenseState: '',
          yearsExperience: '',
          selectedPlan: 'demo',
          hasActiveSubscription: false,
          isLicenseVerified: false,
          role: 'artist',
          subscriptionStatus: 'demo'
        }
      })
      console.log('Demo user created:', user.id)
    } else {
      console.log('User found:', user.id)
    }
    const clientId = formData.get('clientId') as string || null
    const isTemporary = formData.get('isTemporary') === 'true'

    if (!file) {
      console.log('No file provided in form data')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('File received:', file.name, file.size, file.type)

    // Validate file type - allow images, PDFs, Office documents, PowerPoint, Keynote, and archives
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'com.apple.keynote',
      'application/x-iwork-keynote-sffkey',
      'text/plain',
      'application/zip'
    ]

    // Also check file extension as fallback (MIME types can be inconsistent, especially for Keynote)
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const allowedExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'key', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'txt', 'zip']

    const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension || '')

    if (!isValidType) {
      console.log('Invalid file type:', file.type, 'Extension:', fileExtension)
      return NextResponse.json({ error: 'File type not allowed. Please upload PDF, Word, PowerPoint, Keynote, images, or ZIP files.' }, { status: 400 })
    }

    // Validate file size (150MB limit for presentations and large files)
    if (file.size > 150 * 1024 * 1024) {
      console.log('File too large:', file.size)
      return NextResponse.json({ error: 'File size must be less than 150MB' }, { status: 400 })
    }

    // Check if BLOB_READ_WRITE_TOKEN is available
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN
    console.log('Blob token check:', {
      tokenExists: !!blobToken,
      tokenLength: blobToken?.length || 0,
      tokenPrefix: blobToken?.substring(0, 15) || 'none',
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('BLOB')).join(', ')
    })
    
    if (!blobToken) {
      console.error('BLOB_READ_WRITE_TOKEN is not set in environment variables')
      return NextResponse.json({ 
        error: 'Blob storage is not configured. Please set BLOB_READ_WRITE_TOKEN in Vercel environment variables.',
        details: 'Go to Vercel Dashboard → Settings → Environment Variables → Add BLOB_READ_WRITE_TOKEN',
        availableEnvKeys: Object.keys(process.env).filter(k => k.includes('BLOB'))
      }, { status: 500 })
    }

    console.log('Uploading to Vercel Blob...')
    
    // Sanitize fileType for use in path (replace colons and special chars with hyphens)
    const sanitizedFileType = fileType.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-')
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const fileName = `uploads/${user.id}/${sanitizedFileType}/${Date.now()}-${sanitizedFileName}`
    
    console.log('Blob filename:', fileName)
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      originalFileType: fileType,
      sanitizedFileType
    })
    
    // Upload to Vercel Blob - pass File directly like portfolio upload does
    // Don't pass token explicitly - let it read from process.env (like portfolio upload does)
    // This matches the working portfolio upload pattern
    let blob
    try {
      console.log('Calling Vercel Blob put()...')
      console.log('Token check before upload:', {
        tokenInEnv: !!process.env.BLOB_READ_WRITE_TOKEN,
        tokenLength: process.env.BLOB_READ_WRITE_TOKEN?.length || 0,
        tokenPrefix: process.env.BLOB_READ_WRITE_TOKEN?.substring(0, 20) || 'none'
      })
      blob = await put(fileName, file, {
        access: 'public',
        // Don't pass token - let it read from process.env automatically (like portfolio upload)
      })
      console.log('Blob uploaded successfully:', blob.url)
    } catch (blobError: any) {
      console.error('Vercel Blob upload error:', blobError)
      console.error('Blob error details:', {
        message: blobError?.message,
        status: blobError?.status,
        statusCode: blobError?.statusCode,
        code: blobError?.code,
        name: blobError?.name,
        stack: blobError?.stack,
        response: blobError?.response ? JSON.stringify(blobError.response) : 'no response',
        tokenPresent: !!blobToken,
        tokenLength: blobToken?.length || 0,
        isBlobStoreSuspended: blobError instanceof BlobStoreSuspendedError,
        isBlobStoreNotFound: blobError instanceof BlobStoreNotFoundError,
        isBlobAccessError: blobError instanceof BlobAccessError
      })
      
      // Handle specific Blob errors
      if (blobError instanceof BlobStoreSuspendedError) {
        return NextResponse.json({ 
          error: 'Blob Store is suspended. Please check your Vercel Blob Store status.',
          details: 'Your Blob Store has been paused or suspended. Go to Vercel Dashboard → Storage → Blob Store to check the status.',
          troubleshooting: 'Contact Vercel support or check your Blob Store billing/usage limits'
        }, { status: 403 })
      }
      
      if (blobError instanceof BlobStoreNotFoundError) {
        return NextResponse.json({ 
          error: 'Blob Store not found. Please verify your BLOB_READ_WRITE_TOKEN.',
          details: 'The token may be invalid or pointing to a non-existent Blob Store.',
          troubleshooting: 'Verify the token in Vercel Dashboard → Storage → Blob Store → Copy the read-write token'
        }, { status: 403 })
      }
      
      if (blobError instanceof BlobAccessError) {
        return NextResponse.json({ 
          error: 'Access denied to Blob Store. The token may not have the required permissions.',
          details: blobError?.message || 'Access denied',
          troubleshooting: 'Verify the token has read-write permissions and matches your Blob Store'
        }, { status: 403 })
      }
      
      // Check if it's a permission/authentication error
      if (blobError?.message?.includes('Forbidden') || blobError?.statusCode === 403 || blobError?.status === 403) {
        // Extract error ID from message if present
        const errorIdMatch = blobError?.message?.match(/sfo\d+::[\w-]+/)
        const errorId = errorIdMatch ? errorIdMatch[0] : null
        
        return NextResponse.json({ 
          error: 'Upload permission denied. The BLOB_READ_WRITE_TOKEN may be invalid or the Blob Store may be paused.',
          details: blobError?.message || 'Forbidden',
          errorId: errorId,
          errorName: blobError?.name,
          errorCode: blobError?.code,
          troubleshooting: [
            '1. Check Vercel Dashboard → Storage → Blob Store → Ensure it is not paused',
            '2. Verify BLOB_READ_WRITE_TOKEN is set in Vercel → Settings → Environment Variables',
            '3. Ensure the token matches the one from your Blob Store',
            '4. Redeploy after adding/updating the environment variable',
            '5. Check that the token starts with "vercel_blob_rw_"',
            '6. Visit /api/file-uploads/verify-token to test the token'
          ],
          tokenPresent: !!blobToken,
          tokenPrefix: blobToken?.substring(0, 20) || 'none',
          debug: {
            errorType: typeof blobError,
            errorConstructor: blobError?.constructor?.name,
            hasMessage: !!blobError?.message,
            messageLength: blobError?.message?.length || 0
          }
        }, { status: 403 })
      }
      
      // Re-throw to be caught by outer catch
      throw blobError
    }

    // Save file metadata to database
    const fileUpload = await prisma.fileUpload.create({
      data: {
        userId: user.id,
        clientId: clientId,
        fileName: file.name,
        fileUrl: blob.url,
        fileType: fileType,
        fileSize: file.size,
        mimeType: file.type,
        isTemporary: isTemporary
      }
    })

    console.log('File upload completed successfully')
    return NextResponse.json({ 
      success: true, 
      fileUpload: {
        id: fileUpload.id,
        fileName: fileUpload.fileName,
        fileUrl: fileUpload.fileUrl,
        fileType: fileUpload.fileType,
        fileSize: fileUpload.fileSize,
        mimeType: fileUpload.mimeType,
        isTemporary: fileUpload.isTemporary
      }
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json(
      { 
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET /api/file-uploads - Get user's uploaded files
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileType = searchParams.get('fileType')
    const clientId = searchParams.get('clientId')
    const includeTemporary = searchParams.get('includeTemporary') === 'true'

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const whereClause: any = {
      userId: user.id
    }

    // Support multiple fileType filters (comma-separated or multiple params)
    if (fileType) {
      // Check if it's a prefix match (for instructor-folder:)
      if (fileType.includes('instructor-folder:')) {
        whereClause.fileType = {
          startsWith: 'instructor-folder:'
        }
      } else {
        whereClause.fileType = fileType
      }
    }

    if (clientId) {
      whereClause.clientId = clientId
    }

    if (!includeTemporary) {
      whereClause.isTemporary = false
    }

    const files = await prisma.fileUpload.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ files })
  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    )
  }
}

// DELETE /api/file-uploads - Delete file
export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('id')

    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const file = await prisma.fileUpload.findFirst({
      where: {
        id: fileId,
        userId: user.id
      }
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Delete from database
    await prisma.fileUpload.delete({
      where: { id: fileId }
    })

    // Note: In production, you might want to also delete from Vercel Blob
    // This would require additional API calls to Vercel Blob

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}
