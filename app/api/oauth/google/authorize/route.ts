import { NextResponse } from 'next/server'

export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
    access_type: 'offline',
    prompt: 'consent',
    response_type: 'code',
    scope: [
      'https://www.googleapis.com/auth/adwords',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ].join(' '),
    state: 'marketing_google_auth' // Add state for security
  })
  
  return NextResponse.redirect('https://accounts.google.com/o/oauth2/v2/auth?' + params.toString())
}
