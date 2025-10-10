import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET - Fetch all team members for a studio
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    // Find the requesting user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        role: true,
        studioName: true,
        selectedPlan: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all team members in this studio (including the owner)
    const teamMembers = await prisma.user.findMany({
      where: {
        studioName: user.studioName
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        specialties: true,
        certifications: true,
        avatar: true,
        phone: true,
        businessName: true,
        studioName: true,
        licenseNumber: true,
        licenseState: true,
        createdAt: true
      },
      orderBy: [
        { role: 'asc' },
        { name: 'asc' }
      ]
    })

    // Transform to consistent format
    const formattedMembers = teamMembers.map(member => ({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      status: 'active', // All database users are active
      specialties: member.specialties,
      certifications: member.certifications,
      avatar: member.avatar,
      phone: member.phone,
      businessName: member.businessName,
      studioName: member.studioName,
      licenseNumber: member.licenseNumber,
      licenseState: member.licenseState,
      invitedAt: member.createdAt.toISOString(),
      joinedAt: member.createdAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      teamMembers: formattedMembers,
      studioName: user.studioName,
      count: formattedMembers.length
    })

  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    )
  }
}

