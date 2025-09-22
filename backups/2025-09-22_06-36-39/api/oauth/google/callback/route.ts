import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')
  
  // Validate state parameter for security
  if (state !== 'marketing_google_auth') {
    return NextResponse.redirect('/marketing?connect=google_error&reason=invalid_state')
  }
  
  if (error) {
    return NextResponse.redirect('/marketing?connect=google_error&reason=' + error)
  }
  
  if (!code) {
    return NextResponse.redirect('/marketing?connect=google_error&reason=no_code')
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: 'authorization_code',
        code: code,
      }),
    })
    
    const tokenData = await tokenResponse.json()
    
    if (tokenData.error) {
      console.error('Google token exchange error:', tokenData.error)
      return NextResponse.redirect('/marketing?connect=google_error&reason=token_exchange_failed')
    }
    
    // TODO: Store encrypted access token in database
    // For now, just redirect with success
    console.log('Google access token received:', tokenData.access_token)
    
    return NextResponse.redirect('/marketing?connect=google_success')
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect('/marketing?connect=google_error&reason=server_error')
  }
}
