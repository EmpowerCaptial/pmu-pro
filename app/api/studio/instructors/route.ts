import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    // Find the requesting user to get their studio
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        studioName: true,
        role: true,
        selectedPlan: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has access to instructor data
    if (user.selectedPlan !== 'studio') {
      return NextResponse.json({ 
        error: 'Enterprise Studio subscription required' 
      }, { status: 403 })
    }

    // Find all instructors in the same studio
    const instructors = await prisma.user.findMany({
      where: {
        studioName: user.studioName,
        role: { in: ['instructor', 'artist'] }, // Include both instructors and artists
        id: { not: user.id } // Exclude the requesting user
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        specialties: true,
        certifications: true,
        bio: true,
        phone: true,
        businessName: true
      }
    })

    return NextResponse.json({
      success: true,
      instructors,
      studioName: user.studioName
    })

  } catch (error) {
    console.error('Error fetching studio instructors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch instructors' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
