import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')
  
  // Validate state parameter for security
  if (state !== 'marketing_meta_auth') {
    return NextResponse.redirect('/marketing?connect=meta_error&reason=invalid_state')
  }
  
  if (error) {
    return NextResponse.redirect('/marketing?connect=meta_error&reason=' + error)
  }
  
  if (!code) {
    return NextResponse.redirect('/marketing?connect=meta_error&reason=no_code')
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        redirect_uri: process.env.META_REDIRECT_URI!,
        code: code,
      }),
    })
    
    const tokenData = await tokenResponse.json()
    
    if (tokenData.error) {
      console.error('Meta token exchange error:', tokenData.error)
      return NextResponse.redirect('/marketing?connect=meta_error&reason=token_exchange_failed')
    }
    
    // TODO: Store encrypted access token in database
    // For now, just redirect with success
    console.log('Meta access token received:', tokenData.access_token)
    
    return NextResponse.redirect('/marketing?connect=meta_success')
  } catch (error) {
    console.error('Meta OAuth callback error:', error)
    return NextResponse.redirect('/marketing?connect=meta_error&reason=server_error')
  }
}
