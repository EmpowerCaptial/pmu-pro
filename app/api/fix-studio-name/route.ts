import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { email, studioName } = await request.json()

    if (!email || !studioName) {
      return NextResponse.json(
        { error: 'Email and studio name are required' },
        { status: 400 }
      )
    }

    // Update the user's studio name
    await prisma.$executeRaw`
      UPDATE "users" 
      SET "studioName" = ${studioName}, "updatedAt" = NOW()
      WHERE "email" = ${email}
    `

    // Get the updated user
    const updatedUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        businessName: true,
        studioName: true,
        selectedPlan: true,
        hasActiveSubscription: true,
        isLicenseVerified: true
      }
    })

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Studio name updated successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('Error updating studio name:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = {
      error: 'Failed to update studio name',
      details: errorMessage,
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(errorDetails, { status: 500 })
  }}
