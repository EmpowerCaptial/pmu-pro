import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    const { studioName, businessName } = await request.json()
    
    if (!studioName && !businessName) {
      return NextResponse.json({ error: 'At least one name required' }, { status: 400 })
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: {
        ...(studioName && { studioName }),
        ...(businessName && { businessName })
      }
    })

    // Also update all team members in the same studio to have the same studioName
    if (studioName && updatedUser.role === 'owner') {
      await prisma.user.updateMany({
        where: {
          studioName: updatedUser.studioName,
          role: { in: ['student', 'licensed', 'instructor'] }
        },
        data: {
          studioName: studioName
        }
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        studioName: updatedUser.studioName,
        businessName: updatedUser.businessName
      }
    })

  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

