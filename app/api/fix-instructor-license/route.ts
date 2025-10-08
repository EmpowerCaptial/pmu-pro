import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Update the user to have license verification
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        isLicenseVerified: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        selectedPlan: true,
        hasActiveSubscription: true,
        isLicenseVerified: true
      }
    })

    console.log('✅ Fixed instructor license verification for:', email)

    return NextResponse.json({
      success: true,
      message: 'License verification updated successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('Error updating license verification:', error)
    return NextResponse.json({ 
      error: 'Failed to update license verification' 
    }, { status: 500 })
  }
}
