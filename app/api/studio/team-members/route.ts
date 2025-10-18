import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET /api/studio/team-members - Get team members for a studio
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the current user
    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all team members in the same studio
    const teamMembers = await prisma.user.findMany({
      where: {
        studioName: currentUser.studioName,
        id: { not: currentUser.id } // Exclude the current user
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        businessName: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      teamMembers,
      count: teamMembers.length
    })

  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    )
  }
}