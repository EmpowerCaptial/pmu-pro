import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleUpload } from '@vercel/blob/client'

export const dynamic = 'force-dynamic'

const RESOURCE_PREFIX = 'resource-library'
const ALLOWED_UPLOAD_ROLES = ['owner', 'director', 'manager', 'hr', 'staff', 'admin']
const MAX_RESOURCE_BYTES = 150 * 1024 * 1024 // 150MB

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

        if (!user || !ALLOWED_UPLOAD_ROLES.includes(user.role?.toLowerCase() || '')) {
          throw new Error('Forbidden')
        }

        let payload: { category?: string; title?: string; fileSize?: number; originalFilename?: string } = {}
        if (clientPayload) {
          try {
            payload = JSON.parse(clientPayload)
          } catch (error) {
            console.warn('Failed to parse client payload for resource upload:', error)
          }
        }

        if (!pathname.startsWith(`${RESOURCE_PREFIX}/`)) {
          throw new Error('Invalid upload destination')
        }

        const category = sanitizeCategory(payload.category || 'general')
        const normalizedTitle = (payload.title || payload.originalFilename || 'Resource Document').trim()
        const safeTitle = normalizedTitle.length > 180 ? `${normalizedTitle.slice(0, 177)}...` : normalizedTitle

        return {
          allowedContentTypes: ['application/pdf'],
          maximumSizeInBytes: MAX_RESOURCE_BYTES,
          tokenPayload: JSON.stringify({
            userId: user.id,
            uploaderName: user.name || user.email,
            category,
            title: safeTitle,
            fileSize: payload.fileSize || 0,
            originalFilename: payload.originalFilename || safeTitle
          }),
          cacheControlMaxAge: 60 * 60 * 24 * 30 // 30 days
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        if (!tokenPayload) return

        try {
          const metadata = JSON.parse(tokenPayload)
          await prisma.fileUpload.create({
            data: {
              userId: metadata.userId,
              fileName: metadata.title,
              fileUrl: blob.url,
              fileType: `${RESOURCE_PREFIX}:${metadata.category || 'general'}`,
              fileSize: (blob as any).size ?? metadata.fileSize ?? 0,
              mimeType: blob.contentType || 'application/pdf',
              isTemporary: false
            }
          })
        } catch (error) {
          console.error('Failed to record resource upload:', error)
        }
      }
    })

    if (response.type === 'blob.generate-client-token') {
      return NextResponse.json(response)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resource library upload handler error:', error)
    const message = error instanceof Error ? error.message : 'Failed to upload resource'
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}
