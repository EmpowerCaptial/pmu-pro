import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET /api/team-messages/recipients - Get list of team members user can message
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Missing user email' }, { status: 401 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, studioName: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all team members in the same studio (excluding self)
    const teamMembers = await prisma.user.findMany({
      where: {
        studioName: user.studioName,
        id: { not: user.id } // Exclude self
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true
      },
      orderBy: [
        { role: 'asc' }, // Owner first, then instructor, licensed, student
        { name: 'asc' }
      ]
    })

    return NextResponse.json({ recipients: teamMembers })

  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team members', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

