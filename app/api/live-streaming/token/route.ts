import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// POST /api/live-streaming/token - Generate a Daily.co token for joining a room
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { roomName, isOwner = false } = body

    if (!roomName) {
      return NextResponse.json({ error: 'Room name is required' }, { status: 400 })
    }

    const dailyApiKey = process.env.DAILY_API_KEY
    if (!dailyApiKey) {
      return NextResponse.json({ error: 'Daily.co API key not configured' }, { status: 500 })
    }

    // Generate token using Daily.co API
    const tokenResponse = await fetch('https://api.daily.co/v1/meeting-tokens', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${dailyApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          is_owner: isOwner,
          user_name: user.name || user.email,
          user_id: user.id
        },
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours expiry
      })
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Daily.co token API error:', errorData)
      return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 })
    }

    const tokenData = await tokenResponse.json()

    return NextResponse.json({
      token: tokenData.token,
      roomName: roomName
    })
  } catch (error) {
    console.error('Error generating Daily.co token:', error)
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 })
  }
}

