import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email-service'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { memberEmail, memberName, memberPassword, memberRole, studioName, studioOwnerName } = await request.json()

    if (!memberEmail || !memberName || !memberPassword) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: memberEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(memberPassword, 12)

    // Create the user account using raw SQL to avoid Prisma schema issues
    const userId = `cmg${Date.now()}${Math.random().toString(36).substr(2, 9)}`
    
    await prisma.$executeRaw`
      INSERT INTO "users" (
        "id", "email", "name", "password", "role", "selectedPlan", 
        "hasActiveSubscription", "isLicenseVerified", "businessName", "studioName",
        "licenseNumber", "licenseState", "createdAt", "updatedAt"
      ) VALUES (
        ${userId}, ${memberEmail}, ${memberName}, ${hashedPassword}, ${memberRole}, 'studio',
        true, ${memberRole === 'licensed' || memberRole === 'instructor'}, ${studioName}, ${studioName},
        ${memberRole === 'licensed' || memberRole === 'instructor' ? 'PENDING' : ''}, 
        ${memberRole === 'licensed' || memberRole === 'instructor' ? 'PENDING' : ''},
        NOW(), NOW()
      )
    `
    
    const newUser = {
      id: userId,
      email: memberEmail,
      name: memberName,
      role: memberRole,
      selectedPlan: 'studio',
      hasActiveSubscription: true,
      isLicenseVerified: memberRole === 'licensed' || memberRole === 'instructor',
      businessName: studioName,
      studioName: studioName
    }

    // Create invitation email content based on role
    const getRoleDescription = (role: string) => {
      switch (role) {
        case 'student':
          return 'You have been invited to join as a Student/Apprentice. You will use the supervision booking system and require instructor oversight for all procedures.'
        case 'licensed':
          return 'You have been invited to join as a Licensed Artist. You will use the regular booking system and can work independently with clients.'
        case 'instructor':
          return 'You have been invited to join as an Instructor. You can supervise students, manage your availability, and access instructor management features.'
        default:
          return 'You have been invited to join the studio team.'
      }
    }

    const getInvitationLink = (role: string) => {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://thepmuguide.com'
      switch (role) {
        case 'student':
          return `${baseUrl}/studio/supervision?tab=find`
        case 'licensed':
          return `${baseUrl}/booking`
        case 'instructor':
          return `${baseUrl}/studio/supervision?tab=availability`
        default:
          return `${baseUrl}/auth/signup`
      }
    }

    const emailContent = {
      to: memberEmail,
      subject: `You've been invited to join ${studioName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Studio Team Invitation</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #374151; margin-top: 0;">Welcome to ${studioName}!</h2>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
              Hi ${memberName},
            </p>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
              ${studioOwnerName} has invited you to join their studio team on PMU Pro.
            </p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Your Role: ${memberRole === 'licensed' ? 'Licensed Artist' : memberRole === 'instructor' ? 'Instructor' : 'Student/Apprentice'}</h3>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-bottom: 0;">
                ${getRoleDescription(memberRole)}
              </p>
            </div>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #92400e; margin-top: 0;">Your Login Credentials</h3>
              <p style="color: #92400e; font-size: 14px; line-height: 1.5; margin-bottom: 10px;">
                <strong>Email:</strong> ${memberEmail}
              </p>
              <p style="color: #92400e; font-size: 14px; line-height: 1.5; margin-bottom: 0;">
                <strong>Password:</strong> ${memberPassword}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${getInvitationLink(memberRole)}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Log In Now
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              You can now log in using the credentials above. We recommend changing your password after your first login for security.
            </p>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              If you have any questions, please contact ${studioOwnerName} directly.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              This invitation was sent by ${studioOwnerName} for ${studioName}.<br>
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        </div>
      `
    }

    await EmailService.sendEmail(emailContent)

    return NextResponse.json({ 
      success: true, 
      message: 'Team member invitation sent successfully',
      userId: newUser.id
    })

  } catch (error) {
    console.error('Error sending team member invitation:', error)
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = {
      error: 'Failed to send invitation',
      details: errorMessage,
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(errorDetails, { status: 500 })
  }}
