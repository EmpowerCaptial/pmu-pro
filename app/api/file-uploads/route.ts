import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
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

    // Check if user has permission to upload (for instructor folder, need instructor role)
    if (fileType.startsWith('instructor-folder:')) {
      const ALLOWED_ROLES = ['owner', 'director', 'manager', 'hr', 'staff', 'admin', 'instructor']
      const userRole = user?.role?.toLowerCase() || ''
      if (!user || !ALLOWED_ROLES.includes(userRole)) {
        console.log('User does not have permission to upload to instructor folder')
        return NextResponse.json({ error: 'Forbidden: Only instructors and administrators can upload to instructor folder' }, { status: 403 })
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

    console.log('Uploading to Vercel Blob...')
    const fileName = `uploads/${user.id}/${fileType}/${Date.now()}-${file.name}`
    console.log('Blob filename:', fileName)
    
    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
    })

    console.log('Blob uploaded successfully:', blob.url)

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
