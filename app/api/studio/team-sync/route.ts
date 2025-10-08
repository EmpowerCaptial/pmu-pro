import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }

    // Get the studio owner's information
    const owner = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        studioName: true,
        businessName: true
      }
    })

    if (!owner) {
      return NextResponse.json({ error: 'Studio owner not found' }, { status: 404 })
    }

    // Get all team members from the database
    const studioName = owner.studioName || owner.businessName
    const teamMembers = await prisma.user.findMany({
      where: {
        studioName: studioName,
        role: {
          in: ['student', 'licensed', 'instructor', 'owner']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        licenseNumber: true,
        licenseState: true,
        phone: true,
        avatar: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Format team members for frontend
    const formattedTeamMembers = teamMembers.map(member => ({
      id: member.id,
      name: member.name || 'Unknown',
      email: member.email,
      status: 'active' as const,
      invitedAt: member.createdAt?.toISOString() || new Date().toISOString(),
      joinedAt: member.createdAt?.toISOString() || new Date().toISOString(),
      role: member.role as 'student' | 'licensed' | 'instructor' | 'owner',
      licenseNumber: member.licenseNumber,
      licenseState: member.licenseState,
      phone: member.phone,
      avatar: member.avatar
    }))

    return NextResponse.json({
      success: true,
      teamMembers: formattedTeamMembers,
      studioName: studioName,
      owner: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        role: owner.role
      }
    })

  } catch (error) {
    console.error('Error syncing team members:', error)
    return NextResponse.json({ 
      error: 'Failed to sync team members',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }}

export async function POST(request: NextRequest) {
  try {
    const { action, teamMemberId, updates } = await request.json()
    
    if (!action) {
      return NextResponse.json({ error: 'Action required' }, { status: 400 })
    }

    switch (action) {
      case 'update_role':
        if (!teamMemberId || !updates?.role) {
          return NextResponse.json({ error: 'Team member ID and role required' }, { status: 400 })
        }
        
        await prisma.user.update({
          where: { id: teamMemberId },
          data: { 
            role: updates.role,
            isLicenseVerified: updates.role === 'licensed' || updates.role === 'instructor'
          }
        })
        
        return NextResponse.json({ success: true, message: 'Role updated successfully' })
        
      case 'remove_member':
        if (!teamMemberId) {
          return NextResponse.json({ error: 'Team member ID required' }, { status: 400 })
        }
        
        // Don't actually delete the user, just remove from studio
        await prisma.user.update({
          where: { id: teamMemberId },
          data: { 
            studioName: null,
            role: 'artist' // Reset to default role
          }
        })
        
        return NextResponse.json({ success: true, message: 'Team member removed successfully' })
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json({ 
      error: 'Failed to update team member',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }}
