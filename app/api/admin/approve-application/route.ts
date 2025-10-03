import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { ArtistApplicationService } from '@/lib/artist-application-service'
import { EmailService } from '@/lib/email-service'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { applicationId, status, reviewedBy, notes } = await request.json()

    if (!applicationId || !status || !reviewedBy) {
      return NextResponse.json(
        { error: 'Application ID, status, and reviewer are required' },
        { status: 400 }
      )
    }

    // Update the application status in localStorage
    const updatedApplication = ArtistApplicationService.updateApplicationStatus(
      applicationId,
      status,
      reviewedBy,
      notes
    )

    if (!updatedApplication) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // If application is approved, also update the user's database record
    if (status === 'approved') {
      // Find the user by email from the application
      const user = await prisma.user.findUnique({
        where: { email: updatedApplication.email }
      })

      if (user) {
        // Update user's license verification and subscription status
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            isLicenseVerified: true,
            subscriptionStatus: 'active',
            hasActiveSubscription: true,
            // Set to studio plan if they're applying for instructor role
            selectedPlan: 'studio'
          },
          select: {
            id: true,
            email: true,
            name: true,
            isLicenseVerified: true,
            subscriptionStatus: true,
            hasActiveSubscription: true,
            selectedPlan: true,
            role: true
          }
        })

        console.log('✅ User approved and database updated:', {
          email: updatedUser.email,
          isLicenseVerified: updatedUser.isLicenseVerified,
          subscriptionStatus: updatedUser.subscriptionStatus
        })

        // Send approval email to the user
        try {
          await EmailService.sendEmail({
            to: updatedUser.email,
            from: process.env.SENDGRID_FROM_EMAIL || 'noreply@thepmuguide.com',
            subject: '🎉 Your PMU Pro Application Has Been Approved!',
            html: generateApprovalEmailHTML(updatedUser.name || updatedApplication.name, updatedApplication.businessName, updatedApplication.email),
            text: generateApprovalEmailText(updatedUser.name || updatedApplication.name, updatedApplication.businessName, updatedApplication.email)
          })
          
          console.log('✅ Approval email sent to:', updatedUser.email)
        } catch (emailError) {
          console.error('❌ Failed to send approval email:', emailError)
          // Don't fail the approval if email fails
        }

        return NextResponse.json({
          success: true,
          message: 'Application approved, user database updated, and approval email sent',
          application: updatedApplication,
          user: updatedUser
        })
      } else {
        console.warn('⚠️ Application approved but user not found in database:', updatedApplication.email)
        return NextResponse.json({
          success: true,
          message: 'Application approved but user not found in database',
          application: updatedApplication,
          warning: 'User not found in database'
        })
      }
    }

    // For other statuses (denied, needs_info), just update the application
    return NextResponse.json({
      success: true,
      message: `Application ${status}`,
      application: updatedApplication
    })

  } catch (error) {
    console.error('Error approving application:', error)
    return NextResponse.json(
      { error: 'Failed to approve application' },
      { status: 500 }
    )
  }
}

function generateApprovalEmailHTML(userName: string, businessName?: string, userEmail?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thepmuguide.com'
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Approved - PMU Pro</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8B5CF6, #A855F7); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .button { display: inline-block; background: #8B5CF6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .features { background: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .feature { margin: 10px 0; padding: 10px; background: white; border-radius: 6px; border-left: 4px solid #8B5CF6; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Congratulations!</h1>
          <h2>Your PMU Pro Application Has Been Approved</h2>
        </div>
        
        <div class="content">
          <p>Dear ${userName},</p>
          
          <p>We're thrilled to inform you that your PMU Pro application has been <strong>approved</strong>! Welcome to the PMU Pro community.</p>
          
          ${businessName ? `<p><strong>Business:</strong> ${businessName}</p>` : ''}
          
          <p>You now have full access to all PMU Pro features, including:</p>
          
          <div class="features">
            <div class="feature">
              <strong>🎨 AI-Powered Skin Analysis</strong><br>
              Advanced skin tone analysis and pigment recommendations
            </div>
            <div class="feature">
              <strong>👥 Client Management System</strong><br>
              Complete client database and document management
            </div>
            <div class="feature">
              <strong>📋 Professional Forms & Consent</strong><br>
              Industry-standard consent forms and intake documents
            </div>
            <div class="feature">
              <strong>🎓 Enterprise Studio Supervision</strong><br>
              Advanced supervision tools for instructors and apprentices
            </div>
            <div class="feature">
              <strong>💳 Payment Processing</strong><br>
              Integrated Stripe payment system for client payments
            </div>
          </div>
          
          <p>Ready to get started? Click the button below to access your PMU Pro dashboard:</p>
          
          <div style="text-align: center;">
            <a href="${baseUrl}/auth/login" class="button">Access PMU Pro Dashboard</a>
          </div>
          
          <p><strong>Your Login Credentials:</strong></p>
          <ul>
            <li>Email: ${userEmail || 'Your registered email'}</li>
            <li>Password: Your existing password</li>
          </ul>
          
          <p>If you have any questions or need assistance getting started, our support team is here to help.</p>
          
          <p>Welcome to PMU Pro!</p>
          
          <p>Best regards,<br>
          The PMU Pro Team</p>
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

function generateApprovalEmailText(userName: string, businessName?: string, userEmail?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thepmuguide.com'
  
  return `
🎉 Congratulations! Your PMU Pro Application Has Been Approved

Dear ${userName},

We're thrilled to inform you that your PMU Pro application has been approved! Welcome to the PMU Pro community.

${businessName ? `Business: ${businessName}` : ''}

You now have full access to all PMU Pro features, including:

🎨 AI-Powered Skin Analysis
Advanced skin tone analysis and pigment recommendations

👥 Client Management System
Complete client database and document management

📋 Professional Forms & Consent
Industry-standard consent forms and intake documents

🎓 Enterprise Studio Supervision
Advanced supervision tools for instructors and apprentices

💳 Payment Processing
Integrated Stripe payment system for client payments

Ready to get started? Visit: ${baseUrl}/auth/login

Your Login Credentials:
- Email: Your registered email
- Password: Your existing password

If you have any questions or need assistance getting started, our support team is here to help.

Welcome to PMU Pro!

Best regards,
The PMU Pro Team

© 2024 PMU Pro. All rights reserved.
This is an automated email, please do not reply.
  `.trim()
}
