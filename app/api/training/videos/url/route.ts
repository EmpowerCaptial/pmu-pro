import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const VIDEO_PREFIX = 'training-video-url'
const ALLOWED_UPLOAD_ROLES = ['owner', 'director', 'manager', 'hr', 'staff', 'admin', 'instructor']

interface EncodedMetadata {
  description?: string
  durationLabel?: string
  videoUrl?: string
  uploaderName?: string
  category?: string
  coverImageUrl?: string
}

function encodeMetadata(metadata: EncodedMetadata) {
  const json = JSON.stringify(metadata)
  return Buffer.from(json, 'utf8').toString('base64')
}

function formatFileType(metadata: EncodedMetadata) {
  return `${VIDEO_PREFIX}|${encodeMetadata(metadata)}`
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
    if (!user || !ALLOWED_UPLOAD_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, durationLabel, url, category, coverImageUrl } = body

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (!url || !url.trim()) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url.trim())
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    const normalizedTitle = title.trim()
    const truncatedTitle = normalizedTitle.length > 180 ? `${normalizedTitle.slice(0, 177)}…` : normalizedTitle
    const safeTitle = truncatedTitle || 'Lecture Video'

    const formattedFileType = formatFileType({
      description: description || '',
      durationLabel: durationLabel || '',
      videoUrl: url.trim(),
      uploaderName: user.name || user.email,
      category: category || '',
      coverImageUrl: coverImageUrl || ''
    })

    await prisma.fileUpload.create({
      data: {
        userId: user.id,
        fileName: safeTitle,
        fileUrl: url.trim(),
        fileType: formattedFileType,
        fileSize: 0, // URL-based videos have no file size
        mimeType: 'video/url',
        isTemporary: false
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Training video URL save error:', error)
    const message = error instanceof Error ? error.message : 'Failed to save video URL'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

