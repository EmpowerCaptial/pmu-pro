import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      const errorDescription = searchParams.get('error_description') || 'Authorization failed'
      return NextResponse.redirect(`/integrations/calendar?error=${encodeURIComponent(errorDescription)}`)
    }

    if (!code || !state) {
      return NextResponse.redirect('/integrations/calendar?error=' + encodeURIComponent('Missing authorization code'))
    }

    // Decode state parameter
    let stateData
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    } catch {
      return NextResponse.redirect('/integrations/calendar?error=' + encodeURIComponent('Invalid state parameter'))
    }

    const { email } = stateData

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID?.trim() || '',
        client_secret: process.env.MICROSOFT_CLIENT_SECRET?.trim() || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepmuguide.com'}/api/oauth/outlook/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Token exchange failed:', errorData)
      return NextResponse.redirect('/integrations/calendar?error=' + encodeURIComponent('Failed to exchange authorization code'))
    }

    const tokenData = await tokenResponse.json()
    const { access_token, refresh_token, expires_in } = tokenData

    // Get user info from Microsoft Graph
    const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    })

    if (!userResponse.ok) {
      return NextResponse.redirect('/integrations/calendar?error=' + encodeURIComponent('Failed to get user information'))
    }

    const userData = await userResponse.json()

    // Get user's calendars
    const calendarsResponse = await fetch('https://graph.microsoft.com/v1.0/me/calendars', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    })

    let calendars = []
    if (calendarsResponse.ok) {
      const calendarsData = await calendarsResponse.json()
      calendars = calendarsData.value || []
    }

    // Find the user in our database
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.redirect('/integrations/calendar?error=' + encodeURIComponent('User not found'))
    }

    // Save the integration
    const integration = await prisma.calendarIntegration.create({
      data: {
        userId: user.id,
        provider: 'OUTLOOK_CALENDAR',
        providerName: 'Outlook Calendar',
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt: new Date(Date.now() + (expires_in * 1000)),
        calendarId: calendars.find((c: any) => c.isDefault)?.id || calendars[0]?.id,
        calendarName: calendars.find((c: any) => c.isDefault)?.name || calendars[0]?.name || 'Primary Calendar',
        isActive: true,
        syncDirection: 'BIDIRECTIONAL',
        syncFrequency: 15,
        metadata: {
          microsoftUserId: userData.id,
          microsoftEmail: userData.mail || userData.userPrincipalName,
          availableCalendars: calendars.map((c: any) => ({
            id: c.id,
            name: c.name,
            isDefault: c.isDefault
          }))
        }
      }
    })

    return NextResponse.redirect(`/integrations/calendar?success=${encodeURIComponent('Successfully connected to Outlook Calendar!')}`)

  } catch (error) {
    console.error('Outlook OAuth callback error:', error)
    return NextResponse.redirect('/integrations/calendar?error=' + encodeURIComponent('Failed to complete Outlook connection'))
  }
}
