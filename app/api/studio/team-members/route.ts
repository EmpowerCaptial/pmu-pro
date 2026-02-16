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

    // Get the current user (include location for student filtering)
    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studioName: true,
        locationId: true,
        hasAllLocationAccess: true
      }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all team members in the same studio (include location for supervision filtering)
    let dbTeamMembers = await prisma.user.findMany({
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
        studioName: true,
        createdAt: true,
        locationId: true,
        hasAllLocationAccess: true,
        specialties: true,
        certifications: true,
        bio: true,
        phone: true,
        licenseNumber: true
      }
    })

    // If requester is a student/apprentice and has a school location, only show instructors at that location (or with all-access)
    const forStudentLocation = request.nextUrl.searchParams.get('forStudentLocation') === 'true'
    const studentLocationId = currentUser.locationId
    if (forStudentLocation && studentLocationId) {
      const role = (currentUser.role || '').toLowerCase()
      const isStudent = ['student', 'apprentice'].includes(role)
      if (isStudent) {
        dbTeamMembers = dbTeamMembers.filter(
          (m) =>
            m.hasAllLocationAccess === true ||
            m.locationId === studentLocationId
        )
      }
    }

    // Format team members with required fields for frontend
    const teamMembers = dbTeamMembers.map(member => ({
      ...member,
      status: 'active' as const,
      invitedAt: member.createdAt?.toISOString() || new Date().toISOString(),
      joinedAt: member.createdAt?.toISOString() || new Date().toISOString()
    }))

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