// Simple email service for development
// In production, integrate with SendGrid, AWS SES, Resend, or Mailgun

export interface EmailOptions {
  to: string
  from: string
  subject: string
  html: string
  text?: string
}

export class EmailService {
  private static isDevelopment = process.env.NODE_ENV === 'development'

  /**
   * Send an email (development mode logs to console, production sends real email)
   */
  static async sendEmail(options: EmailOptions): Promise<void> {
    if (this.isDevelopment) {
      // In development, log the email to console
      console.log('📧 EMAIL SENT (Development Mode)')
      console.log('To:', options.to)
      console.log('From:', options.from)
      console.log('Subject:', options.subject)
      console.log('HTML Content:', options.html)
      console.log('---')
      
      // Extract magic link from HTML content for easy testing
      const magicLinkMatch = options.html.match(/href="([^"]+)"/)
      if (magicLinkMatch) {
        console.log('🔗 MAGIC LINK FOR TESTING:')
        console.log(magicLinkMatch[1])
        console.log('---')
      }
    } else {
      // In production, send real email
      await this.sendProductionEmail(options)
    }
  }

  /**
   * Send magic link email
   */
  static async sendMagicLinkEmail(email: string, magicLinkUrl: string, userName?: string): Promise<void> {
    const subject = 'Sign in to PMU Pro'
    const html = this.generateMagicLinkEmailHTML(magicLinkUrl, userName)
    const text = this.generateMagicLinkEmailText(magicLinkUrl, userName)

    await this.sendEmail({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@thepmuguide.com',
      subject,
      html,
      text
    })
  }

  /**
   * Send signature request email
   */
  static async sendSignatureRequestEmail(options: {
    to: string
    documentTitle: string
    signatureUrl: string
    artistName: string
    personalMessage?: string
  }): Promise<void> {
    const subject = `Signature Request: ${options.documentTitle}`
    const html = this.generateSignatureRequestEmailHTML(options)
    const text = this.generateSignatureRequestEmailText(options)

    await this.sendEmail({
      to: options.to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@thepmuguide.com',
      subject,
      html,
      text
    })
  }

  /**
   * Generate HTML email content for magic link
   */
  private static generateMagicLinkEmailHTML(magicLinkUrl: string, userName?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sign in to PMU Pro</title>
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
            <h2>Welcome back${userName ? `, ${userName}` : ''}!</h2>
            <p>Click the button below to sign in to your PMU Pro account:</p>
            
            <div style="text-align: center;">
              <a href="${magicLinkUrl}" class="button">Sign In to PMU Pro</a>
            </div>
            
            <div class="warning">
              <strong>Important:</strong> This link will expire in 24 hours and can only be used once.
            </div>
            
            <p>If you didn't request this email, you can safely ignore it.</p>
            
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

  /**
   * Generate plain text email content for magic link
   */
  private static generateMagicLinkEmailText(magicLinkUrl: string, userName?: string): string {
    return `
Welcome back${userName ? `, ${userName}` : ''}!

Click the link below to sign in to your PMU Pro account:

${magicLinkUrl}

Important: This link will expire in 24 hours and can only be used once.

If you didn't request this email, you can safely ignore it.

Best regards,
The PMU Pro Team

© 2024 PMU Pro. All rights reserved.
This is an automated email, please do not reply.
    `.trim()
  }

  /**
   * Send production email using SendGrid
   */
  private static async sendProductionEmail(options: EmailOptions): Promise<void> {
    try {
      // Check if SendGrid API key is available
      const sendGridApiKey = process.env.SENDGRID_API_KEY
      if (!sendGridApiKey) {
        throw new Error('SendGrid API key not configured')
      }

      // Import SendGrid dynamically to avoid build issues
      const sgMail = require('@sendgrid/mail')
      sgMail.setApiKey(sendGridApiKey)

      // Prepare SendGrid message format
      const msg = {
        to: options.to,
        from: options.from,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html)
      }

      // Send email via SendGrid
      await sgMail.send(msg)
      
      console.log(`✅ Email sent successfully via SendGrid to: ${options.to}`)
    } catch (error) {
      console.error('❌ SendGrid email failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`SendGrid email failed: ${errorMessage}`)
    }
  }

  /**
   * Strip HTML tags to create plain text fallback
   */
  private static stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  }

  /**
   * Generate HTML email content for signature request
   */
  private static generateSignatureRequestEmailHTML(options: {
    documentTitle: string
    signatureUrl: string
    artistName: string
    personalMessage?: string
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Signature Request: ${options.documentTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B5CF6, #A855F7); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #8B5CF6, #A855F7); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .message { background: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PMU Pro</h1>
            <p>Digital Signature Request</p>
          </div>
          
          <div class="content">
            <h2>Document Signature Request</h2>
            <p>Hello!</p>
            <p>${options.artistName} has requested your signature on the following document:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0;">
              <h3 style="margin: 0 0 10px 0; color: #8B5CF6;">${options.documentTitle}</h3>
            </div>
            
            ${options.personalMessage ? `
            <div class="message">
              <strong>Personal Message from ${options.artistName}:</strong><br>
              ${options.personalMessage}
            </div>
            ` : ''}
            
            <p>Please click the button below to review and sign the document:</p>
            
            <div style="text-align: center;">
              <a href="${options.signatureUrl}" class="button">Review & Sign Document</a>
            </div>
            
            <div class="warning">
              <strong>Important:</strong> This signature link will expire in 7 days for security purposes.
            </div>
            
            <p>If you have any questions, please contact ${options.artistName} directly.</p>
            
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

  /**
   * Generate plain text email content for signature request
   */
  private static generateSignatureRequestEmailText(options: {
    documentTitle: string
    signatureUrl: string
    artistName: string
    personalMessage?: string
  }): string {
    return `
Document Signature Request

Hello!

${options.artistName} has requested your signature on the following document:

${options.documentTitle}

${options.personalMessage ? `Personal Message from ${options.artistName}:\n${options.personalMessage}\n` : ''}

Please click the link below to review and sign the document:

${options.signatureUrl}

Important: This signature link will expire in 7 days for security purposes.

If you have any questions, please contact ${options.artistName} directly.

Best regards,
The PMU Pro Team

© 2024 PMU Pro. All rights reserved.
This is an automated email, please do not reply.
    `.trim()
  }
}
