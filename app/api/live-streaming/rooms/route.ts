import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// POST /api/live-streaming/rooms - Create a new live streaming room
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role - only instructors and above can create rooms
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
    const { title, description } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Generate a unique room name
    const roomName = `training-${Date.now()}-${Math.random().toString(36).substring(7)}`

    // Create room using Daily.co API
    const dailyApiKey = process.env.DAILY_API_KEY
    if (!dailyApiKey) {
      return NextResponse.json({ error: 'Daily.co API key not configured' }, { status: 500 })
    }

    const dailyResponse = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${dailyApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: roomName,
        privacy: 'public',
        properties: {
          enable_chat: true,
          enable_screenshare: true,
          enable_recording: false, // Can be enabled later if needed
          max_participants: 50,
          start_video_off: false,
          start_audio_off: false
        }
      })
    })

    if (!dailyResponse.ok) {
      const errorData = await dailyResponse.text()
      console.error('Daily.co API error:', errorData)
      return NextResponse.json({ error: 'Failed to create Daily.co room' }, { status: 500 })
    }

    const dailyRoom = await dailyResponse.json()

    // Store room info in database
    const room = await prisma.fileUpload.create({
      data: {
        userId: user.id,
        fileName: title,
        fileUrl: dailyRoom.url || dailyRoom.config?.url || '',
        fileType: `live-streaming-room|${roomName}|${dailyRoom.id || ''}`,
        fileSize: 0,
        mimeType: description || ''
      }
    })

    return NextResponse.json({
      room: {
        id: room.id,
        roomId: dailyRoom.id || roomName,
        roomName: roomName,
        roomUrl: dailyRoom.url || dailyRoom.config?.url || '',
        title: title,
        description: description || '',
        createdAt: room.createdAt
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating live streaming room:', error)
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }
}

// GET /api/live-streaming/rooms - Get all active live streaming rooms
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all live-streaming-room file uploads
    const rooms = await prisma.fileUpload.findMany({
      where: {
        fileType: {
          startsWith: 'live-streaming-room'
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // Limit to recent 20 rooms
    })

    // Parse room data from fileType metadata
    const parsedRooms = rooms.map(room => {
      // fileType format: "live-streaming-room|roomName|dailyRoomId"
      const parts = room.fileType.split('|')
      return {
        id: room.id,
        roomId: parts[2] || '',
        roomName: parts[1] || '',
        roomUrl: room.fileUrl,
        title: room.fileName,
        description: room.mimeType || '',
        createdAt: room.createdAt,
        createdBy: room.userId
      }
    })

    return NextResponse.json({ rooms: parsedRooms })
  } catch (error) {
    console.error('Error fetching live streaming rooms:', error)
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }
}

