import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      to, 
      formType, 
      formLink, 
      customMessage, 
      clientName 
    } = body

    if (!to || !formType || !formLink) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('API: Sending consent form email to:', to)

    // Generate email content
    const subject = `Consent Form: ${formType} - PMU Pro`
    const html = generateConsentFormEmailHTML(formType, formLink, customMessage, clientName)
    const text = generateConsentFormEmailText(formType, formLink, customMessage, clientName)

    // Send email
    await EmailService.sendEmail({
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@thepmuguide.com',
      subject,
      html,
      text
    })

    console.log('API: Consent form email sent successfully to:', to)

    return NextResponse.json({ 
      success: true, 
      message: 'Consent form sent successfully' 
    })

  } catch (error) {
    console.error('API: Error sending consent form email:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send consent form email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function generateConsentFormEmailHTML(formType: string, formLink: string, customMessage?: string, clientName?: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Consent Form - PMU Pro</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8B5CF6, #A855F7); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #8B5CF6, #A855F7); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>PMU Pro</h1>
          <p>Professional Permanent Makeup Platform</p>
        </div>
        
        <div class="content">
          <h2>Consent Form Ready</h2>
          <p>Hello${clientName ? ` ${clientName}` : ''},</p>
          
          <p>Your ${formType} consent form is ready for completion. Please click the button below to access and sign your form:</p>
          
          <div style="text-align: center;">
            <a href="${formLink}" class="button">Complete Consent Form</a>
          </div>
          
          ${customMessage ? `<p><strong>Additional Message:</strong><br>${customMessage}</p>` : ''}
          
          <div class="warning">
            <strong>Important:</strong> This form link will expire in 7 days for security purposes.
          </div>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>The PMU Pro Team</p>
        </div>
        
        <div class="footer">
          <p>© 2024 PMU Pro. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateConsentFormEmailText(formType: string, formLink: string, customMessage?: string, clientName?: string): string {
  return `
Consent Form Ready

Hello${clientName ? ` ${clientName}` : ''},

Your ${formType} consent form is ready for completion. Please use the link below to access and sign your form:

${formLink}

${customMessage ? `Additional Message: ${customMessage}` : ''}

Important: This form link will expire in 7 days for security purposes.

If you have any questions or need assistance, please don't hesitate to contact us.

Best regards,
The PMU Pro Team

© 2024 PMU Pro. All rights reserved.
This is an automated email, please do not reply.
  `.trim()
}

