import { NextRequest, NextResponse } from 'next/server'
import { del } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const VIDEO_PREFIX = 'training-video'
const VIDEO_URL_PREFIX = 'training-video-url'
const PRIVILEGED_ROLES = ['owner', 'director', 'manager', 'admin']
const ALLOWED_DELETE_ROLES = [...PRIVILEGED_ROLES, 'hr', 'staff', 'instructor']

function decodeMetadata(fileType: string) {
  if (!fileType.startsWith(VIDEO_PREFIX) && !fileType.startsWith('training-video-url')) return {}
  const [, encoded] = fileType.split('|')
  if (!encoded) return {}
  try {
    const json = Buffer.from(encoded, 'base64').toString('utf8')
    return JSON.parse(json) as {
      blobPathname?: string
      originalFilename?: string
      description?: string
      durationLabel?: string
      videoUrl?: string
      uploaderName?: string
      category?: string
      coverImageUrl?: string
    }
  } catch (error) {
    console.warn('Failed to decode training video metadata:', error)
    return {}
  }
}

function encodeMetadata(metadata: any) {
  const json = JSON.stringify(metadata)
  return Buffer.from(json, 'utf8').toString('base64')
}

function formatFileType(metadata: any, isUrlVideo: boolean = false) {
  const prefix = isUrlVideo ? VIDEO_URL_PREFIX : VIDEO_PREFIX
  return `${prefix}|${encodeMetadata(metadata)}`
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, role: true, name: true, email: true }
    })

    if (!user || !ALLOWED_DELETE_ROLES.includes(user.role?.toLowerCase() || '')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const upload = await prisma.fileUpload.findUnique({
      where: { id: params.id }
    })

    if (!upload || (!upload.fileType.startsWith(VIDEO_PREFIX) && !upload.fileType.startsWith(VIDEO_URL_PREFIX))) {
      return NextResponse.json({ success: false, error: 'Video not found' }, { status: 404 })
    }

    const role = user.role?.toLowerCase() || ''
    if (upload.userId && upload.userId !== user.id && !PRIVILEGED_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Only the uploader or studio leadership can edit this video.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, durationLabel, url, category, coverImageUrl } = body

    const existingMetadata = decodeMetadata(upload.fileType)

    // Update metadata with new values (keep existing if not provided)
    const updatedMetadata = {
      description: description !== undefined ? (description || '') : (existingMetadata.description || ''),
      durationLabel: durationLabel !== undefined ? (durationLabel || '') : (existingMetadata.durationLabel || ''),
      videoUrl: url !== undefined ? url.trim() : (existingMetadata.videoUrl || upload.fileUrl),
      uploaderName: existingMetadata.uploaderName || user.name || user.email,
      category: category !== undefined ? (category || '') : (existingMetadata.category || ''),
      coverImageUrl: coverImageUrl !== undefined ? (coverImageUrl || '') : (existingMetadata.coverImageUrl || '')
    }

    // Validate URL if provided
    if (url !== undefined) {
      try {
        new URL(url.trim())
      } catch {
        return NextResponse.json({ success: false, error: 'Invalid URL format' }, { status: 400 })
      }
    }

    const normalizedTitle = title !== undefined ? title.trim() : upload.fileName
    const truncatedTitle = normalizedTitle.length > 180 ? `${normalizedTitle.slice(0, 177)}…` : normalizedTitle
    const safeTitle = truncatedTitle || 'Lecture Video'

    const isUrlVideo = upload.fileType.startsWith(VIDEO_URL_PREFIX)
    const formattedFileType = formatFileType(updatedMetadata, isUrlVideo)

    await prisma.fileUpload.update({
      where: { id: params.id },
      data: {
        fileName: safeTitle,
        fileUrl: url !== undefined ? url.trim() : upload.fileUrl,
        fileType: formattedFileType
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Training video PATCH error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update training video' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, role: true }
    })

    if (!user || !ALLOWED_DELETE_ROLES.includes(user.role?.toLowerCase() || '')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const upload = await prisma.fileUpload.findUnique({
      where: { id: params.id }
    })

    if (!upload || (!upload.fileType.startsWith(VIDEO_PREFIX) && !upload.fileType.startsWith(VIDEO_URL_PREFIX))) {
      return NextResponse.json({ success: false, error: 'Video not found' }, { status: 404 })
    }

    const metadata = decodeMetadata(upload.fileType)
    const blobPath = metadata.blobPathname || new URL(upload.fileUrl).pathname.replace(/^\/+/, '')

    const role = user.role?.toLowerCase() || ''
    if (upload.userId && upload.userId !== user.id && !PRIVILEGED_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Only the uploader or studio leadership can delete this video.' },
        { status: 403 }
      )
    }

    if (blobPath) {
      try {
        await del(blobPath)
      } catch (error) {
        console.error('Failed to delete training video blob:', error)
        return NextResponse.json({ success: false, error: 'Failed to remove video file.' }, { status: 500 })
      }
    }

    await prisma.fileUpload.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Training video DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete training video' }, { status: 500 })
  }
}

