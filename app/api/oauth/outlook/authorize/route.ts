import { NextRequest, NextResponse } from 'next/server'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 })
    }

    // Microsoft Graph OAuth configuration
    const clientId = process.env.MICROSOFT_CLIENT_ID?.trim()
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepmuguide.com'}/api/oauth/outlook/callback`
    
    if (!clientId) {
      return NextResponse.json({ error: 'Microsoft OAuth not configured' }, { status: 500 })
    }

    // Microsoft Graph OAuth scopes for calendar access
    const scopes = [
      'https://graph.microsoft.com/calendars.readwrite',
      'https://graph.microsoft.com/user.read',
      'offline_access'
    ].join(' ')

    // Generate state parameter for security
    const state = Buffer.from(JSON.stringify({ email, timestamp: Date.now() })).toString('base64')

    // Microsoft OAuth authorization URL
    const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', scopes)
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('response_mode', 'query')

    return NextResponse.redirect(authUrl.toString())

  } catch (error) {
    console.error('Outlook OAuth authorization error:', error)
    return NextResponse.json({ error: 'Failed to initiate Outlook authorization' }, { status: 500 })
  }
}
