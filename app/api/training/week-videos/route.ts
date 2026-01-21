import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

const MANAGE_ROLES = ['owner', 'director', 'manager', 'hr', 'staff', 'admin', 'instructor']

async function requireAuthorizedUser(request: NextRequest) {
  const userEmail = request.headers.get('x-user-email')
  if (!userEmail) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), user: null }
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true, role: true }
  })

  const role = user?.role?.toLowerCase() || ''
  if (!user || !MANAGE_ROLES.includes(role)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), user: null }
  }

  return { error: null, user }
}

// GET: Fetch videos assigned to a week
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const weekId = searchParams.get('weekId')

    if (!weekId) {
      return NextResponse.json({ error: 'weekId is required' }, { status: 400 })
    }

    const assignments = await prisma.weekVideoAssignment.findMany({
      where: { weekId },
      include: {
        video: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { order: 'asc' }
    })

    const videos = assignments.map(assignment => {
      const upload = assignment.video
      const isUrlVideo = upload.fileType.startsWith('training-video-url')
      
      // Parse metadata from fileType
      let metadata: any = {}
      if (upload.fileType.includes('|')) {
        const [, encoded] = upload.fileType.split('|')
        if (encoded) {
          try {
            const json = Buffer.from(encoded, 'base64').toString('utf8')
            metadata = JSON.parse(json)
          } catch (e) {
            // Ignore parse errors
          }
        }
      }

      return {
        id: upload.id,
        title: upload.fileName,
        description: metadata.description || '',
        duration: metadata.durationLabel || 'Self-paced',
        url: isUrlVideo ? metadata.videoUrl || upload.fileUrl : upload.fileUrl,
        fileSize: upload.fileSize,
        uploadedAt: upload.createdAt.toISOString(),
        uploadedBy: metadata.uploaderName || upload.user?.name || upload.user?.email || 'Unknown',
        videoType: isUrlVideo ? 'url' : 'file',
        order: assignment.order
      }
    })

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('Error fetching week videos:', error)
    return NextResponse.json({ error: 'Failed to fetch week videos' }, { status: 500 })
  }
}

// POST: Assign videos to a week
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuthorizedUser(request)
    if (authResult.error) return authResult.error
    const user = authResult.user!

    const body = await request.json()
    const { weekId, videoIds } = body

    if (!weekId || !Array.isArray(videoIds)) {
      return NextResponse.json({ error: 'weekId and videoIds array are required' }, { status: 400 })
    }

    // Delete existing assignments for this week
    await prisma.weekVideoAssignment.deleteMany({
      where: { weekId }
    })

    // Create new assignments
    const assignments = await Promise.all(
      videoIds.map((videoId: string, index: number) =>
        prisma.weekVideoAssignment.create({
          data: {
            weekId,
            videoId,
            order: index,
            createdBy: user.id
          }
        })
      )
    )

    return NextResponse.json({ success: true, assignments })
  } catch (error) {
    console.error('Error assigning videos to week:', error)
    return NextResponse.json({ error: 'Failed to assign videos' }, { status: 500 })
  }
}

