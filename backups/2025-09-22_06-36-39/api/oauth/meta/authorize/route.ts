import { NextResponse } from 'next/server'

export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: process.env.META_REDIRECT_URI!,
    scope: [
      'ads_management',
      'business_management',
      'pages_read_engagement',
      'pages_manage_metadata',
      // messaging scopes can be added later:
      // 'pages_messaging','instagram_manage_messages'
    ].join(','),
    response_type: 'code',
    state: 'marketing_meta_auth' // Add state for security
  })
  
  return NextResponse.redirect('https://www.facebook.com/v18.0/dialog/oauth?' + params.toString())
}
