import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'

export const dynamic = 'force-dynamic'

const RESOURCE_PREFIX = 'resource-library'
const ALLOWED_ROLES = ['owner', 'director', 'manager', 'hr', 'staff', 'admin']

function toCategory(fileType: string) {
  if (!fileType.startsWith(RESOURCE_PREFIX)) return 'general'
  const parts = fileType.split(':')
  return parts[1] || 'general'
}

function sanitizeCategory(category: string | null) {
  if (!category) return 'general'
  return category.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'general'
}

export async function GET() {
  try {
    const uploads = await prisma.fileUpload.findMany({
      where: {
        fileType: {
          startsWith: RESOURCE_PREFIX
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    const resources = uploads.map(upload => ({
      id: upload.id,
      title: upload.fileName,
      url: upload.fileUrl,
      fileType: upload.mimeType,
      fileSize: upload.fileSize,
      category: toCategory(upload.fileType),
      uploadedAt: upload.createdAt,
      uploadedBy: upload.user ? (upload.user.name || upload.user.email) : 'Unknown'
    }))

    return NextResponse.json({ success: true, resources })
  } catch (error) {
    console.error('Resource library GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load resources' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, email: true, name: true, role: true }
    })

    if (!user || !ALLOWED_ROLES.includes(user.role?.toLowerCase() || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const category = sanitizeCategory(formData.get('category') as string | null)
    const title = (formData.get('title') as string | null)?.trim()

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be under 50MB' }, { status: 400 })
    }

    const fileNameSafe = file.name.replace(/[^a-z0-9.\-]/gi, '_')
    const blobKey = `${RESOURCE_PREFIX}/${user.id}/${Date.now()}-${fileNameSafe}`

    const blob = await put(blobKey, file, { access: 'public' })

    const created = await prisma.fileUpload.create({
      data: {
        userId: user.id,
        fileName: title || file.name,
        fileUrl: blob.url,
        fileType: `${RESOURCE_PREFIX}:${category}`,
        fileSize: file.size,
        mimeType: file.type,
        isTemporary: false
      }
    })

    return NextResponse.json({
      success: true,
      resource: {
        id: created.id,
        title: created.fileName,
        url: created.fileUrl,
        fileType: created.mimeType,
        fileSize: created.fileSize,
        category,
        uploadedAt: created.createdAt,
        uploadedBy: user.name || user.email
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Resource library upload error:', error)
    return NextResponse.json({ success: false, error: 'Failed to upload resource' }, { status: 500 })
  }
}
