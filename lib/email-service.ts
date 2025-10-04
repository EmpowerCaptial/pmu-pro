// Email service with SendGrid integration
// Production-ready with proper error handling and environment-aware logging

export interface EmailOptions {
  to: string
  from?: string
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
    const fromEmail = options.from || process.env.SENDGRID_FROM_EMAIL || 'noreply@thepmuguide.com'
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 EmailService.sendEmail called');
      console.log('📧 Environment:', process.env.NODE_ENV);
      console.log('📧 To:', options.to);
      console.log('📧 From:', fromEmail);
      console.log('📧 Subject:', options.subject);
    }
    
    if (this.isDevelopment) {
      // In development, log the email to console
      console.log('📧 EMAIL SENT (Development Mode)')
      console.log('To:', options.to)
      console.log('From:', fromEmail)
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
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Sending production email via SendGrid...');
      }
      await this.sendProductionEmail({ ...options, from: fromEmail })
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
   * Send subscription update email
   */
  static async sendSubscriptionUpdateEmail(options: {
    to: string
    userName: string
    changeType: 'upgrade' | 'downgrade' | 'activation' | 'suspension' | 'payment_success' | 'payment_failed'
    oldPlan?: string
    newPlan: string
    features?: string[]
    message?: string
  }): Promise<void> {
    const subject = `Subscription Update - ${this.getSubscriptionSubject(options.changeType)}`
    const html = this.generateSubscriptionUpdateEmailHTML(options)
    const text = this.generateSubscriptionUpdateEmailText(options)

    await this.sendEmail({
      to: options.to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@thepmuguide.com',
      subject,
      html,
      text
    })
  }

  /**
   * Send instructor invitation email
   */
  static async sendInstructorInvitation(options: {
    to: string
    instructorName: string
    studioName: string
    studioOwnerName: string
  }): Promise<void> {
    const subject = `Instructor Invitation - Join ${options.studioName} on PMU Pro`
    const html = this.generateInstructorInvitationHTML(options)
    const text = this.generateInstructorInvitationText(options)

    await this.sendEmail({
      to: options.to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@thepmuguide.com',
      subject,
      html,
      text
    })
  }

  /**
   * Get appropriate subject line for subscription changes
   */
  private static getSubscriptionSubject(changeType: string): string {
    switch (changeType) {
      case 'upgrade': return 'Plan Upgraded Successfully'
      case 'downgrade': return 'Plan Updated'
      case 'activation': return 'Subscription Activated'
      case 'suspension': return 'Subscription Suspended'
      case 'payment_success': return 'Payment Successful'
      case 'payment_failed': return 'Payment Failed'
      default: return 'Subscription Update'
    }
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
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 sendProductionEmail called');
      }
      
      // Check if SendGrid API key is available
      const sendGridApiKey = process.env.SENDGRID_API_KEY
      
      if (!sendGridApiKey) {
        if (process.env.NODE_ENV === 'development') {
          console.log('❌ SendGrid API key not configured');
        }
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
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Email sent successfully via SendGrid to: ${options.to}`)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ SendGrid email failed:', error)
      }
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

  /**
   * Generate HTML email content for subscription updates
   */
  private static generateSubscriptionUpdateEmailHTML(options: {
    userName: string
    changeType: 'upgrade' | 'downgrade' | 'activation' | 'suspension' | 'payment_success' | 'payment_failed'
    oldPlan?: string
    newPlan: string
    features?: string[]
    message?: string
  }): string {
    const getHeaderColor = () => {
      switch (options.changeType) {
        case 'upgrade': return 'linear-gradient(135deg, #10B981, #059669)'
        case 'activation': return 'linear-gradient(135deg, #10B981, #059669)'
        case 'payment_success': return 'linear-gradient(135deg, #10B981, #059669)'
        case 'downgrade': return 'linear-gradient(135deg, #F59E0B, #D97706)'
        case 'suspension': return 'linear-gradient(135deg, #EF4444, #DC2626)'
        case 'payment_failed': return 'linear-gradient(135deg, #EF4444, #DC2626)'
        default: return 'linear-gradient(135deg, #8B5CF6, #A855F7)'
      }
    }

    const getIcon = () => {
      switch (options.changeType) {
        case 'upgrade': return '📈'
        case 'activation': return '🎉'
        case 'payment_success': return '✅'
        case 'downgrade': return '📉'
        case 'suspension': return '⏸️'
        case 'payment_failed': return '❌'
        default: return '📋'
      }
    }

    const getTitle = () => {
      switch (options.changeType) {
        case 'upgrade': return 'Plan Upgraded Successfully!'
        case 'activation': return 'Subscription Activated!'
        case 'payment_success': return 'Payment Successful!'
        case 'downgrade': return 'Plan Updated'
        case 'suspension': return 'Subscription Suspended'
        case 'payment_failed': return 'Payment Failed'
        default: return 'Subscription Update'
      }
    }

    const getMessage = () => {
      switch (options.changeType) {
        case 'upgrade':
          return options.message || `Congratulations! Your subscription has been upgraded from ${options.oldPlan || 'your previous plan'} to ${options.newPlan}.`
        case 'activation':
          return options.message || `Your ${options.newPlan} subscription has been activated and you now have full access to all features.`
        case 'payment_success':
          return options.message || `Your payment has been processed successfully. Your ${options.newPlan} subscription is active.`
        case 'downgrade':
          return options.message || `Your subscription has been updated to ${options.newPlan}.`
        case 'suspension':
          return options.message || `Your subscription has been suspended. Please contact support to reactivate.`
        case 'payment_failed':
          return options.message || `Your payment could not be processed. Please update your payment method to continue your ${options.newPlan} subscription.`
        default:
          return options.message || 'Your subscription has been updated.'
      }
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${getHeaderColor()}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B5CF6; }
          .feature-list ul { margin: 0; padding-left: 20px; }
          .feature-list li { margin: 8px 0; }
          .plan-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0; }
          .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #8B5CF6, #A855F7); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${getIcon()} PMU Pro</h1>
            <p>${getTitle()}</p>
          </div>
          
          <div class="content">
            <h2>Hello ${options.userName}!</h2>
            <p>${getMessage()}</p>
            
            <div class="plan-info">
              <h3>Current Plan: ${options.newPlan}</h3>
              ${options.oldPlan ? `<p><strong>Previous Plan:</strong> ${options.oldPlan}</p>` : ''}
            </div>
            
            ${options.features && options.features.length > 0 ? `
            <div class="feature-list">
              <h3>Your Plan Includes:</h3>
              <ul>
                ${options.features.map(feature => `<li>${feature}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
            
            ${options.changeType === 'payment_failed' ? `
            <div class="warning">
              <strong>Action Required:</strong> Please update your payment method to avoid service interruption.
            </div>
            ` : ''}
            
            ${options.changeType === 'activation' || options.changeType === 'upgrade' ? `
            <div class="success">
              <strong>You're all set!</strong> Start exploring your new features and make the most of your PMU Pro subscription.
            </div>
            ` : ''}
            
            <div style="text-align: center;">
              <a href="https://thepmuguide.com/dashboard" class="button">Access Your Dashboard</a>
            </div>
            
            <p>If you have any questions about your subscription, please don't hesitate to contact our support team.</p>
            
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
   * Generate plain text email content for subscription updates
   */
  private static generateSubscriptionUpdateEmailText(options: {
    userName: string
    changeType: 'upgrade' | 'downgrade' | 'activation' | 'suspension' | 'payment_success' | 'payment_failed'
    oldPlan?: string
    newPlan: string
    features?: string[]
    message?: string
  }): string {
    const getTitle = () => {
      switch (options.changeType) {
        case 'upgrade': return 'Plan Upgraded Successfully!'
        case 'activation': return 'Subscription Activated!'
        case 'payment_success': return 'Payment Successful!'
        case 'downgrade': return 'Plan Updated'
        case 'suspension': return 'Subscription Suspended'
        case 'payment_failed': return 'Payment Failed'
        default: return 'Subscription Update'
      }
    }

    const getMessage = () => {
      switch (options.changeType) {
        case 'upgrade':
          return options.message || `Congratulations! Your subscription has been upgraded from ${options.oldPlan || 'your previous plan'} to ${options.newPlan}.`
        case 'activation':
          return options.message || `Your ${options.newPlan} subscription has been activated and you now have full access to all features.`
        case 'payment_success':
          return options.message || `Your payment has been processed successfully. Your ${options.newPlan} subscription is active.`
        case 'downgrade':
          return options.message || `Your subscription has been updated to ${options.newPlan}.`
        case 'suspension':
          return options.message || `Your subscription has been suspended. Please contact support to reactivate.`
        case 'payment_failed':
          return options.message || `Your payment could not be processed. Please update your payment method to continue your ${options.newPlan} subscription.`
        default:
          return options.message || 'Your subscription has been updated.'
      }
    }

    return `
${getTitle()}

Hello ${options.userName}!

${getMessage()}

Current Plan: ${options.newPlan}
${options.oldPlan ? `Previous Plan: ${options.oldPlan}` : ''}

${options.features && options.features.length > 0 ? `
Your Plan Includes:
${options.features.map(feature => `- ${feature}`).join('\n')}
` : ''}

${options.changeType === 'payment_failed' ? `
ACTION REQUIRED: Please update your payment method to avoid service interruption.
` : ''}

${options.changeType === 'activation' || options.changeType === 'upgrade' ? `
You're all set! Start exploring your new features and make the most of your PMU Pro subscription.
` : ''}

Access your dashboard: https://thepmuguide.com/dashboard

If you have any questions about your subscription, please don't hesitate to contact our support team.

Best regards,
The PMU Pro Team

© 2024 PMU Pro. All rights reserved.
This is an automated email, please do not reply.
    `.trim()
  }

  /**
   * Generate HTML content for instructor invitation email
   */
  private static generateInstructorInvitationHTML(options: {
    instructorName: string
    studioName: string
    studioOwnerName: string
  }): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Instructor Invitation - ${options.studioName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; color: #6b7280; }
        .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .highlight { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎓 Instructor Invitation</h1>
        <p>Join ${options.studioName} on PMU Pro</p>
      </div>
      
      <div class="content">
        <h2>Hello ${options.instructorName}!</h2>
        
        <p><strong>${options.studioOwnerName}</strong> from <strong>${options.studioName}</strong> has invited you to join their studio as an instructor on PMU Pro.</p>
        
        <div class="highlight">
          <h3>What This Means:</h3>
          <ul>
            <li>✅ Access to Enterprise Studio Supervision features</li>
            <li>✅ Ability to manage apprentice training sessions</li>
            <li>✅ Set your availability for supervision bookings</li>
            <li>✅ Access to advanced studio management tools</li>
            <li>✅ Collaborate with other instructors in the studio</li>
          </ul>
        </div>
        
        <h3>Next Steps:</h3>
        <ol>
          <li><strong>Create your account</strong> (if you don't have one already)</li>
          <li><strong>Complete your instructor profile</strong> with your license information</li>
          <li><strong>Start managing apprentices</strong> and setting your availability</li>
        </ol>
        
        <div style="text-align: center;">
          <a href="https://thepmuguide.com/auth/signup?invitation=instructor&studio=${encodeURIComponent(options.studioName)}" class="button">
            Accept Invitation & Join Studio
          </a>
        </div>
        
        <p>If you have any questions about this invitation or need help getting started, please don't hesitate to reach out.</p>
        
        <p>Welcome to the PMU Pro community!</p>
        
        <p>Best regards,<br>
        The PMU Pro Team</p>
      </div>
      
      <div class="footer">
        <p>This invitation was sent by ${options.studioOwnerName} from ${options.studioName}</p>
        <p>© 2024 PMU Pro. All rights reserved.</p>
        <p>If you did not expect this invitation, you can safely ignore this email.</p>
      </div>
    </body>
    </html>
    `.trim()
  }

  /**
   * Generate text content for instructor invitation email
   */
  private static generateInstructorInvitationText(options: {
    instructorName: string
    studioName: string
    studioOwnerName: string
  }): string {
    return `
INSTRUCTOR INVITATION - Join ${options.studioName} on PMU Pro

Hello ${options.instructorName}!

${options.studioOwnerName} from ${options.studioName} has invited you to join their studio as an instructor on PMU Pro.

WHAT THIS MEANS:
✅ Access to Enterprise Studio Supervision features
✅ Ability to manage apprentice training sessions  
✅ Set your availability for supervision bookings
✅ Access to advanced studio management tools
✅ Collaborate with other instructors in the studio

NEXT STEPS:
1. Create your account (if you don't have one already)
2. Complete your instructor profile with your license information
3. Start managing apprentices and setting your availability

ACCEPT INVITATION:
Visit: https://thepmuguide.com/auth/signup?invitation=instructor&studio=${encodeURIComponent(options.studioName)}

If you have any questions about this invitation or need help getting started, please don't hesitate to reach out.

Welcome to the PMU Pro community!

Best regards,
The PMU Pro Team

---
This invitation was sent by ${options.studioOwnerName} from ${options.studioName}
© 2024 PMU Pro. All rights reserved.
If you did not expect this invitation, you can safely ignore this email.
    `.trim()
  }
}
