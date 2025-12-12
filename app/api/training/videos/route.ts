import { NextRequest, NextResponse } from 'next/server'
import { handleUpload } from '@vercel/blob/client'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const VIDEO_PREFIX = 'training-video'
const ALLOWED_UPLOAD_ROLES = ['owner', 'director', 'manager', 'hr', 'staff', 'admin', 'instructor']
const MAX_VIDEO_BYTES = 500 * 1024 * 1024 // 500MB

interface VideoMetadataPayload {
  title?: string
  description?: string
  durationLabel?: string
  originalFilename?: string
  fileSize?: number
  userId?: string
  uploaderName?: string
}

interface EncodedMetadata {
  description?: string
  durationLabel?: string
  blobPathname?: string
  originalFilename?: string
  uploaderName?: string
}

function encodeMetadata(metadata: EncodedMetadata) {
  const json = JSON.stringify(metadata)
  return Buffer.from(json, 'utf8').toString('base64')
}

function decodeMetadata(value?: string | null): EncodedMetadata {
  if (!value) return {}
  if (!value.includes('|')) return {}
  const [, encoded] = value.split('|')
  if (!encoded) return {}
  try {
    const json = Buffer.from(encoded, 'base64').toString('utf8')
    return JSON.parse(json)
  } catch (error) {
    console.warn('Failed to decode training video metadata:', error)
    return {}
  }
}

function formatFileType(metadata: EncodedMetadata) {
  return `${VIDEO_PREFIX}|${encodeMetadata(metadata)}`
}

function parseFileType(fileType: string) {
  if (fileType.startsWith(VIDEO_PREFIX)) {
    return decodeMetadata(fileType)
  }
  // Also handle URL-based videos
  if (fileType.startsWith('training-video-url')) {
    return decodeMetadata(fileType)
  }
  return {}
}

export async function GET() {
  try {
    const uploads = await prisma.fileUpload.findMany({
      where: {
        OR: [
          {
            fileType: {
              startsWith: VIDEO_PREFIX
            }
          },
          {
            fileType: {
              startsWith: 'training-video-url'
            }
          }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    const videos = uploads.map(upload => {
      const isUrlVideo = upload.fileType.startsWith('training-video-url')
      const metadata = parseFileType(upload.fileType)
      
      // For URL videos, the URL is stored in fileUrl
      // For file uploads, the URL is also in fileUrl (blob URL)
      const videoUrl = upload.fileUrl

      return {
        id: upload.id,
        title: upload.fileName,
        description: metadata.description || '',
        duration: metadata.durationLabel || '',
        url: videoUrl,
        blobPathname: metadata.blobPathname || '',
        fileSize: upload.fileSize,
        mimeType: upload.mimeType,
        uploadedAt: upload.createdAt,
        uploadedBy: metadata.uploaderName || upload.user?.name || upload.user?.email || 'Unknown',
        videoType: isUrlVideo ? 'url' : 'file'
      }
    })

    return NextResponse.json({ success: true, videos })
  } catch (error) {
    console.error('Training videos GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load training videos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json()

    const response = await handleUpload({
      request,
      body: rawBody,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const userEmail = request.headers.get('x-user-email')
        if (!userEmail) {
          throw new Error('Unauthorized')
        }

        const user = await prisma.user.findUnique({
          where: { email: userEmail },
          select: { id: true, email: true, name: true, role: true }
        })

        const role = user?.role?.toLowerCase() || ''
        if (!user || !ALLOWED_UPLOAD_ROLES.includes(role)) {
          throw new Error('Forbidden')
        }

        let payload: VideoMetadataPayload = {}
        if (clientPayload) {
          try {
            payload = JSON.parse(clientPayload)
          } catch (error) {
            console.warn('Failed to parse training video client payload:', error)
          }
        }

        if (!pathname.startsWith(`${VIDEO_PREFIX}/`)) {
          throw new Error('Invalid upload destination')
        }

        const normalizedTitle = (payload.title || payload.originalFilename || 'Lecture Video').trim()
        const truncatedTitle = normalizedTitle.length > 180 ? `${normalizedTitle.slice(0, 177)}…` : normalizedTitle
        const safeTitle = truncatedTitle || 'Lecture Video'

        return {
          allowedContentTypes: [
            'video/mp4',
            'video/mpeg',
            'video/quicktime',
            'video/x-msvideo',
            'video/x-m4v',
            'video/webm',
            'video/ogg',
            'video/3gpp',
            'video/3gpp2',
            'video/*'
          ],
          maximumSizeInBytes: MAX_VIDEO_BYTES,
          tokenPayload: JSON.stringify({
            userId: user.id,
            uploaderName: user.name || user.email,
            title: safeTitle,
            description: payload.description || '',
            durationLabel: payload.durationLabel || '',
            fileSize: payload.fileSize || 0,
            originalFilename: payload.originalFilename || safeTitle
          }),
          cacheControlMaxAge: 60 * 60 * 24 * 30 // 30 days
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        if (!tokenPayload) return

        try {
          const metadata = JSON.parse(tokenPayload) as Required<VideoMetadataPayload> & { title: string; uploaderName?: string }
          const formattedFileType = formatFileType({
            description: metadata.description,
            durationLabel: metadata.durationLabel,
            blobPathname: blob.pathname,
            originalFilename: metadata.originalFilename,
            uploaderName: metadata.uploaderName
          })

          await prisma.fileUpload.create({
            data: {
              userId: metadata.userId,
              fileName: metadata.title,
              fileUrl: blob.url,
              fileType: formattedFileType,
              fileSize: Number((blob as any).size ?? metadata.fileSize ?? 0),
              mimeType: blob.contentType || 'video/mp4',
              isTemporary: false
            }
          })
        } catch (error) {
          console.error('Failed to record training video upload:', error)
        }
      }
    })

    if (response.type === 'blob.generate-client-token') {
      return NextResponse.json(response)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Training video upload error:', error)
    const message = error instanceof Error ? error.message : 'Failed to upload training video'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}

