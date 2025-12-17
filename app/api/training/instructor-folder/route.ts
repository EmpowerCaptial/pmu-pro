import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const INSTRUCTOR_FOLDER_PREFIX = 'instructor-folder'
const ALLOWED_ROLES = ['owner', 'director', 'manager', 'hr', 'staff', 'admin', 'instructor']

interface EncodedMetadata {
  title?: string
  url?: string
  type?: string
  uploaderName?: string
}

function encodeMetadata(metadata: EncodedMetadata) {
  const json = JSON.stringify(metadata)
  return Buffer.from(json, 'utf8').toString('base64')
}

function formatFileType(metadata: EncodedMetadata) {
  return `${INSTRUCTOR_FOLDER_PREFIX}|${encodeMetadata(metadata)}`
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

    const role = user?.role?.toLowerCase() || ''
    if (!user || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, url, type } = body

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (type === 'url' && (!url || !url.trim())) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    if (type === 'url') {
      // Validate URL format
      try {
        new URL(url.trim())
      } catch {
        return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
      }
    }

    const normalizedTitle = title.trim()
    const truncatedTitle = normalizedTitle.length > 180 ? `${normalizedTitle.slice(0, 177)}…` : normalizedTitle
    const safeTitle = truncatedTitle || 'Instructor Resource'

    const formattedFileType = formatFileType({
      title: safeTitle,
      url: type === 'url' ? url.trim() : undefined,
      type: type || 'file',
      uploaderName: user.name || user.email
    })

    await prisma.fileUpload.create({
      data: {
        userId: user.id,
        fileName: safeTitle,
        fileUrl: type === 'url' ? url.trim() : '',
        fileType: formattedFileType,
        fileSize: 0, // URL-based resources have no file size
        mimeType: type === 'url' ? 'text/url' : 'application/octet-stream',
        isTemporary: false
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Instructor folder save error:', error)
    const message = error instanceof Error ? error.message : 'Failed to save resource'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

