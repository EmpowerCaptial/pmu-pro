import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCrmUser } from '@/lib/server/crm-auth'
import { EmailService } from '@/lib/email-service'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { staffRecord } = await requireCrmUser(request)
    const body = await request.json()
    const { contactId, to, subject, message } = body

    if (!contactId || !to || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: contactId, to, subject, and message are required.' },
        { status: 400 }
      )
    }

    // Validate recipient email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid recipient email address.' },
        { status: 400 }
      )
    }

    // Use verified SendGrid sender address
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@thepmuguide.com'

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

    // Send email using verified SendGrid sender address
    let emailSent = false
    let emailError: Error | null = null

    try {
      await EmailService.sendEmail({
        to,
        from: fromEmail,
        subject,
        html,
        text: message
      })
      emailSent = true
    } catch (err) {
      emailError = err instanceof Error ? err : new Error(String(err))
      console.error('Email sending failed:', emailError)
      // Log full error details for debugging
      if (err && typeof err === 'object' && 'response' in err) {
        const sgError = err as any
        console.error('SendGrid error response:', sgError.response?.body)
        console.error('SendGrid error code:', sgError.code)
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
          from: fromEmail,
          to,
          emailSent,
          error: emailError?.message
        }
      }
    })

    if (!emailSent) {
      // Extract SendGrid error details if available
      let errorDetails = emailError?.message || 'Unknown error'
      let userFriendlyMessage = 'Failed to send email'
      
      if (emailError && typeof emailError === 'object' && 'response' in emailError) {
        const sgError = emailError as any
        const responseBody = sgError.response?.body
        if (responseBody) {
          errorDetails = JSON.stringify(responseBody)
          if (Array.isArray(responseBody.errors)) {
            const firstError = responseBody.errors[0]
            if (firstError?.message) {
              userFriendlyMessage = firstError.message
            }
          }
        }
      } else if (errorDetails.includes('SendGrid API key')) {
        userFriendlyMessage = 'SendGrid API key is not configured. Please contact your administrator.'
      } else if (errorDetails.includes('unauthorized') || errorDetails.includes('401')) {
        userFriendlyMessage = 'SendGrid authentication failed. Please check API key configuration.'
      } else if (errorDetails.includes('forbidden') || errorDetails.includes('403')) {
        userFriendlyMessage = 'SendGrid access denied. The sender address may not be verified.'
      }

      return NextResponse.json(
        {
          error: userFriendlyMessage,
          details: process.env.NODE_ENV === 'development' ? errorDetails : 'Email service is not properly configured.',
          suggestion: 'You can use the "Open in Email Client" button to send the email manually, or contact support to configure email sending.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully'
    })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('CRM send email error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      {
        error: 'Failed to process email request',
        details: process.env.NODE_ENV === 'development' ? errorMessage : 'An unexpected error occurred.',
        suggestion: 'You can use the "Open in Email Client" button to send the email manually.'
      },
      { status: 500 }
    )
  }
}

