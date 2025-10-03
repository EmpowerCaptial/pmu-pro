import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { ArtistApplicationService } from '@/lib/artist-application-service'

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

        return NextResponse.json({
          success: true,
          message: 'Application approved and user database updated',
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
