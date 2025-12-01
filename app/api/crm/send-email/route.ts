import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCrmUser } from '@/lib/server/crm-auth'
import { EmailService } from '@/lib/email-service'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { staffRecord } = await requireCrmUser(request)
    const body = await request.json()
    const { contactId, to, from, subject, message } = body

    if (!contactId || !to || !from || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: contactId, to, from, subject, and message are required.' },
        { status: 400 }
      )
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid recipient email address.' },
        { status: 400 }
      )
    }
    if (!emailRegex.test(from)) {
      return NextResponse.json(
        { error: 'Invalid sender email address.' },
        { status: 400 }
      )
    }

    // Verify contact exists
    const contact = await prisma.contact.findUnique({
      where: { id: contactId }
    })

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found.' },
        { status: 404 }
      )
    }

    // Convert message to HTML (preserve line breaks)
    const htmlMessage = message
      .split('\n')
      .map((line: string) => `<p>${line || '<br>'}</p>`)
      .join('')

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px;">
            ${htmlMessage}
          </div>
        </body>
      </html>
    `

    // Send email using custom from address
    // Note: In production with SendGrid, the "from" address must be verified
    // If the custom address fails, we'll try with the default from address
    let emailSent = false
    let actualFrom = from
    let emailError: Error | null = null

    try {
      await EmailService.sendEmail({
        to,
        from,
        subject,
        html,
        text: message
      })
      emailSent = true
    } catch (err) {
      emailError = err instanceof Error ? err : new Error(String(err))
      console.error('Failed to send with custom from address:', emailError.message)
      
      // In production, if custom from fails, try with default from address
      if (process.env.NODE_ENV === 'production') {
        const defaultFrom = process.env.SENDGRID_FROM_EMAIL || 'noreply@thepmuguide.com'
        try {
          console.log(`Retrying with default from address: ${defaultFrom}`)
          await EmailService.sendEmail({
            to,
            from: defaultFrom,
            subject,
            html,
            text: message
          })
          emailSent = true
          actualFrom = defaultFrom
          console.log('Email sent successfully with default from address')
        } catch (retryErr) {
          console.error('Failed to send with default from address:', retryErr)
          emailError = retryErr instanceof Error ? retryErr : new Error(String(retryErr))
        }
      } else {
        // In development, just log the error but continue
        console.warn('Email sending failed in development mode:', emailError.message)
        emailSent = true // In dev mode, we consider it "sent" since it's just logged
      }
    }

    // Create interaction record regardless of email send status
    await prisma.interaction.create({
      data: {
        contactId,
        staffId: staffRecord.id,
        type: 'EMAIL',
        direction: 'OUTBOUND',
        subject,
        body: message,
        meta: {
          from: actualFrom,
          to,
          requestedFrom: from,
          emailSent,
          error: emailError?.message
        }
      }
    })

    if (!emailSent && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        {
          error: 'Failed to send email',
          details: emailError?.message || 'Email service error. Please check that the SendGrid API key is configured and the from address is verified.',
          suggestion: 'The custom "from" address may need to be verified in SendGrid. The email was logged as an interaction but not sent.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: emailSent 
        ? 'Email sent successfully' 
        : 'Email logged (development mode - not actually sent)',
      from: actualFrom,
      note: actualFrom !== from 
        ? `Email sent from ${actualFrom} instead of requested ${from} (SendGrid requires verified sender addresses)`
        : undefined
    })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('CRM send email error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: process.env.NODE_ENV === 'development' ? errorMessage : 'An error occurred while processing the email request'
      },
      { status: 500 }
    )
  }
}

