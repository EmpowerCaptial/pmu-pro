import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET /api/training/zoom-sessions - Get all Zoom live sessions
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all zoom-session file uploads
    const sessions = await prisma.fileUpload.findMany({
      where: {
        fileType: {
          startsWith: 'zoom-session'
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Parse session data from fileType metadata
    const parsedSessions = sessions.map(session => {
      // fileType format: "zoom-session|title|meetingId|password|scheduledDate|status"
      const parts = session.fileType.split('|')
      return {
        id: session.id,
        title: parts[1] || session.fileName,
        meetingId: parts[2] || '',
        password: parts[3] || '',
        meetingUrl: session.fileUrl,
        scheduledDate: parts[4] || null,
        status: parts[5] || 'scheduled', // scheduled, live, ended
        description: session.mimeType || '', // Using mimeType field to store description
        createdAt: session.createdAt,
        createdBy: session.userId
      }
    })

    return NextResponse.json({ sessions: parsedSessions })
  } catch (error) {
    console.error('Error fetching Zoom sessions:', error)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

// POST /api/training/zoom-sessions - Create a new Zoom live session
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role - only instructors and above can create sessions
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const allowedRoles = ['owner', 'director', 'manager', 'hr', 'staff', 'admin', 'instructor']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized - Instructor access required' }, { status: 403 })
    }

    const body = await request.json()
    const { title, meetingUrl, meetingId, password, scheduledDate, description, status } = body

    if (!title || !meetingUrl) {
      return NextResponse.json({ error: 'Title and meeting URL are required' }, { status: 400 })
    }

    // Validate meeting URL format (Zoom links)
    const zoomUrlPattern = /^https?:\/\/(.*\.)?(zoom\.us|zoom\.gov)\//
    if (!zoomUrlPattern.test(meetingUrl)) {
      return NextResponse.json({ error: 'Invalid Zoom meeting URL format' }, { status: 400 })
    }

    // Create fileType with metadata: "zoom-session|title|meetingId|password|scheduledDate|status"
    const fileType = `zoom-session|${title}|${meetingId || ''}|${password || ''}|${scheduledDate || ''}|${status || 'scheduled'}`

    // Create file upload entry for the Zoom session
    const session = await prisma.fileUpload.create({
      data: {
        userId: user.id,
        fileName: title,
        fileUrl: meetingUrl,
        fileType: fileType,
        fileSize: 0, // Not applicable for Zoom links
        mimeType: description || '' // Store description in mimeType field
      }
    })

    // Parse and return the created session
    const parts = session.fileType.split('|')
    return NextResponse.json({
      session: {
        id: session.id,
        title: parts[1] || session.fileName,
        meetingId: parts[2] || '',
        password: parts[3] || '',
        meetingUrl: session.fileUrl,
        scheduledDate: parts[4] || null,
        status: parts[5] || 'scheduled',
        description: session.mimeType || '',
        createdAt: session.createdAt,
        createdBy: session.userId
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating Zoom session:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}

// DELETE /api/training/zoom-sessions/[id] - Delete a Zoom session
// This will be handled in a separate [id]/route.ts file

