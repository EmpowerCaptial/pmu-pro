import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TrialService } from '@/lib/trial-service'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { email, trialData } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user already exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      // User already exists, just update their trial status
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          isLicenseVerified: true,
          hasActiveSubscription: false, // Will be updated by Stripe webhook
          subscriptionStatus: 'trial'
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Trial user synced to database',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          isLicenseVerified: updatedUser.isLicenseVerified,
          hasActiveSubscription: updatedUser.hasActiveSubscription,
          subscriptionStatus: updatedUser.subscriptionStatus
        }
      })
    }

    // Create new user from trial data
    const newUser = await prisma.user.create({
      data: {
        email,
        name: trialData?.name || email.split('@')[0],
        isLicenseVerified: true,
        hasActiveSubscription: false, // Will be updated by Stripe webhook
        subscriptionStatus: 'trial',
        role: 'user',
        // Add any other trial data if available
        ...(trialData?.studioName && { studioName: trialData.studioName })
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Trial user created in database',
      user: {
        id: newUser.id,
        email: newUser.email,
        isLicenseVerified: newUser.isLicenseVerified,
        hasActiveSubscription: newUser.hasActiveSubscription,
        subscriptionStatus: newUser.subscriptionStatus
      }
    })

  } catch (error) {
    console.error('Error syncing trial user to database:', error)
    return NextResponse.json(
      { error: 'Failed to sync trial user to database' },
      { status: 500 }
    )
  }}
