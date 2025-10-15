import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// GET /api/oauth/google-calendar/callback - Handle Google Calendar OAuth callback
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      const errorDescription = searchParams.get('error_description') || 'Unknown error'
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepmuguide.com'}/integrations/calendar?error=${encodeURIComponent(`Google Calendar connection failed: ${errorDescription}`)}`
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepmuguide.com'}/integrations/calendar?error=${encodeURIComponent('Missing authorization code or state')}`
      )
    }

    // Decode and validate state
    let stateData
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    } catch (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepmuguide.com'}/integrations/calendar?error=${encodeURIComponent('Invalid state parameter')}`
      )
    }

    const { userId } = stateData
    if (!userId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepmuguide.com'}/integrations/calendar?error=${encodeURIComponent('Invalid user state')}`
      )
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepmuguide.com'}/api/oauth/google-calendar/callback`,
        grant_type: 'authorization_code',
        code: code,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Google token exchange error:', errorData)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepmuguide.com'}/integrations/calendar?error=${encodeURIComponent('Failed to exchange authorization code for access token')}`
      )
    }

    const tokenData = await tokenResponse.json()
    const { access_token, refresh_token, expires_in } = tokenData

    // Get user's calendar list
    const calendarsResponse = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    })

    if (!calendarsResponse.ok) {
      console.error('Failed to fetch calendar list')
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepmuguide.com'}/integrations/calendar?error=${encodeURIComponent('Failed to fetch calendar list')}`
      )
    }

    const calendarsData = await calendarsResponse.json()
    const calendars = calendarsData.items || []

    // Find primary calendar or first available calendar
    const primaryCalendar = calendars.find((cal: any) => cal.primary) || calendars[0]
    
    if (!primaryCalendar) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepmuguide.com'}/integrations/calendar?error=${encodeURIComponent('No calendars found in your Google account')}`
      )
    }

    // Check if integration already exists
    const existingIntegration = await prisma.calendarIntegration.findFirst({
      where: {
        userId: userId,
        provider: 'GOOGLE_CALENDAR'
      }
    })

    if (existingIntegration) {
      // Update existing integration
      await prisma.calendarIntegration.update({
        where: { id: existingIntegration.id },
        data: {
          apiKey: refresh_token, // Store refresh token as the "API key"
          calendarId: primaryCalendar.id,
          calendarName: primaryCalendar.summary,
          isActive: true,
          lastSyncAt: new Date()
        }
      })
    } else {
      // Create new integration
      await prisma.calendarIntegration.create({
        data: {
          userId: userId,
          provider: 'GOOGLE_CALENDAR',
          providerName: 'Google Calendar',
          apiKey: refresh_token, // Store refresh token as the "API key"
          calendarId: primaryCalendar.id,
          calendarName: primaryCalendar.summary,
          syncDirection: 'BIDIRECTIONAL',
          syncFrequency: 15,
          isActive: true,
          lastSyncAt: new Date()
        }
      })
    }

    // Redirect back to calendar integration page with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepmuguide.com'}/integrations/calendar?success=${encodeURIComponent('Google Calendar connected successfully! Your calendar will now sync automatically.')}`
    )

  } catch (error) {
    console.error('Google Calendar OAuth callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepmuguide.com'}/integrations/calendar?error=${encodeURIComponent('Failed to connect Google Calendar. Please try again.')}`
    )
  }
}
