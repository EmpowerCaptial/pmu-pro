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
    await EmailService.sendEmail({
      to,
      from: fromEmail,
      subject,
      html,
      text: message
    })

    // Create interaction record
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
          to
        }
      }
    })

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
    
    // Check for specific SendGrid errors
    let userFriendlyMessage = 'Failed to send email'
    if (errorMessage.includes('SendGrid API key')) {
      userFriendlyMessage = 'SendGrid API key is not configured. Please contact your administrator.'
    } else if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
      userFriendlyMessage = 'SendGrid authentication failed. Please check API key configuration.'
    } else if (errorMessage.includes('forbidden') || errorMessage.includes('403')) {
      userFriendlyMessage = 'SendGrid access denied. The sender address may not be verified.'
    }
    
    return NextResponse.json(
      {
        error: userFriendlyMessage,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        suggestion: 'You can copy the email details and send manually using your email client, or contact support to configure email sending.'
      },
      { status: 500 }
    )
  }
}

