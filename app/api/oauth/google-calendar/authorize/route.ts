import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET /api/oauth/google-calendar/authorize - Start Google Calendar OAuth flow
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Missing user email' }, { status: 401 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, name: true, email: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if Google Calendar OAuth is configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.json({ 
        error: 'Google Calendar integration not configured. Please contact support.' 
      }, { status: 500 })
    }

    // Generate state parameter for security
    const state = Buffer.from(JSON.stringify({
      userId: user.id,
      timestamp: Date.now()
    })).toString('base64')

    // Build Google OAuth URL
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    googleAuthUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID)
    googleAuthUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepmuguide.com'}/api/oauth/google-calendar/callback`)
    googleAuthUrl.searchParams.set('response_type', 'code')
    googleAuthUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events')
    googleAuthUrl.searchParams.set('access_type', 'offline')
    googleAuthUrl.searchParams.set('prompt', 'consent')
    googleAuthUrl.searchParams.set('state', state)

    // Redirect to Google OAuth
    return NextResponse.redirect(googleAuthUrl.toString())

  } catch (error) {
    console.error('Google Calendar OAuth authorization error:', error)
    return NextResponse.json(
      { error: 'Failed to start Google Calendar authorization' },
      { status: 500 }
    )
  }
}
