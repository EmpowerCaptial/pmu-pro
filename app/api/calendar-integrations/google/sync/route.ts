import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// POST /api/calendar-integrations/google/sync - Sync Google Calendar events
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Missing user email' }, { status: 401 })
    }

    const { integrationId } = await request.json()

    if (!integrationId) {
      return NextResponse.json({ error: 'Missing integration ID' }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find the Google Calendar integration
    const integration = await prisma.calendarIntegration.findFirst({
      where: {
        id: integrationId,
        userId: user.id,
        provider: 'GOOGLE_CALENDAR',
        isActive: true
      }
    })

    if (!integration) {
      return NextResponse.json({ error: 'Google Calendar integration not found' }, { status: 404 })
    }

    if (!integration.apiKey) {
      return NextResponse.json({ 
        error: 'Google Calendar integration has no refresh token' 
      }, { status: 400 })
    }

    // Get fresh access token using refresh token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID?.trim() || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET?.trim() || '',
        refresh_token: integration.apiKey, // This is the refresh token
        grant_type: 'refresh_token',
      }),
    })

    if (!tokenResponse.ok) {
      return NextResponse.json({ 
        error: 'Failed to refresh Google Calendar access token' 
      }, { status: 400 })
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Fetch events from Google Calendar
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))
    
    const eventsResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${integration.calendarId}/events?` +
      `timeMin=${now.toISOString()}&timeMax=${thirtyDaysFromNow.toISOString()}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (!eventsResponse.ok) {
      return NextResponse.json({ 
        error: 'Failed to fetch events from Google Calendar' 
      }, { status: 400 })
    }

    const eventsData = await eventsResponse.json()
    const events = eventsData.items || []

    let syncedCount = 0
    let skippedCount = 0

    // Process each event
    for (const event of events) {
      try {
        // Skip events that are all-day or don't have a specific time
        if (!event.start?.dateTime) {
          skippedCount++
          continue
        }

        const startTime = new Date(event.start.dateTime)
        const endTime = new Date(event.end?.dateTime || event.start.dateTime)

        // Check if this event already exists
        const existingAppointment = await prisma.appointment.findFirst({
          where: {
            userId: user.id,
            startTime: startTime,
            endTime: endTime,
            title: event.summary || 'Google Calendar Event'
          }
        })

        if (existingAppointment) {
          skippedCount++
          continue
        }

        // Create a client record for the Google Calendar event
        const client = await prisma.client.create({
          data: {
            userId: user.id,
            name: event.summary || 'Google Calendar Event',
            email: event.attendees?.[0]?.email || '',
            phone: '',
            notes: `Imported from Google Calendar: ${event.description || ''}`
          }
        })

        // Create appointment from Google Calendar event
        await prisma.appointment.create({
          data: {
            userId: user.id,
            clientId: client.id,
            title: event.summary || 'Google Calendar Event',
            serviceType: 'Google Calendar Event',
            startTime: startTime,
            endTime: endTime,
            duration: Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)), // Duration in minutes
            status: 'scheduled',
            notes: event.description || '',
            source: 'google_calendar',
            price: 0,
            paymentStatus: 'pending'
          }
        })

        syncedCount++

      } catch (error) {
        console.error('Error processing event:', event.id, error)
        skippedCount++
      }
    }

    // Update last sync time
    await prisma.calendarIntegration.update({
      where: { id: integration.id },
      data: { lastSyncAt: new Date() }
    })

    return NextResponse.json({
      success: true,
      syncedCount,
      skippedCount,
      totalEvents: events.length,
      message: `Successfully synced ${syncedCount} events from Google Calendar`
    })

  } catch (error) {
    console.error('Google Calendar sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync Google Calendar events' },
      { status: 500 }
    )
  }
}
