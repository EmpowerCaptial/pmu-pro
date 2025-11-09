import { NextRequest, NextResponse } from 'next/server'
import { del } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const VIDEO_PREFIX = 'training-video'
const PRIVILEGED_ROLES = ['owner', 'director', 'manager', 'admin']
const ALLOWED_DELETE_ROLES = [...PRIVILEGED_ROLES, 'hr', 'staff', 'instructor']

function decodeMetadata(fileType: string) {
  if (!fileType.startsWith(VIDEO_PREFIX)) return {}
  const [, encoded] = fileType.split('|')
  if (!encoded) return {}
  try {
    const json = Buffer.from(encoded, 'base64').toString('utf8')
    return JSON.parse(json) as {
      blobPathname?: string
      originalFilename?: string
      description?: string
      durationLabel?: string
    }
  } catch (error) {
    console.warn('Failed to decode training video metadata for delete:', error)
    return {}
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

    if (!upload || !upload.fileType.startsWith(VIDEO_PREFIX)) {
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

