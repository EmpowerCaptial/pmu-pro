import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to } = body

    if (!to) {
      return NextResponse.json(
        { error: 'Email address required' },
        { status: 400 }
      )
    }

    console.log('Test Email: Sending test email to:', to)

    // Send a simple test email
    await EmailService.sendEmail({
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@thepmuguide.com',
      subject: 'PMU Pro - Email Test',
      html: `
        <h1>Email Test Successful!</h1>
        <p>This is a test email from PMU Pro to verify that email sending is working correctly.</p>
        <p>If you received this email, the SendGrid integration is working properly.</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      `,
      text: 'Email Test Successful! This is a test email from PMU Pro to verify that email sending is working correctly.'
    })

    console.log('Test Email: Test email sent successfully to:', to)

    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully',
      sentTo: to
    })

  } catch (error) {
    console.error('Test Email: Error sending test email:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}


