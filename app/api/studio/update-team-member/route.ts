import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

/**
 * PATCH /api/studio/update-team-member
 * 
 * Update a team member's role, status, or permissions
 */
export async function PATCH(request: NextRequest) {
  try {
    const ownerEmail = request.headers.get('x-user-email')
    
    if (!ownerEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify owner
    const owner = await prisma.user.findUnique({
      where: { email: ownerEmail },
      select: {
        id: true,
        role: true,
        studioName: true
      }
    })

    if (!owner || !['owner', 'manager', 'director', 'admin', 'hr'].includes(owner.role?.toLowerCase() || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { memberId, role, status, permissions, locationId, hasAllLocationAccess } = body

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 })
    }

    // Verify member exists and is in same studio
    const member = await prisma.user.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studioName: true,
        permissions: true,
        licenseNumber: true
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    if (member.studioName !== owner.studioName) {
      return NextResponse.json({ error: 'Cannot modify members from other studios' }, { status: 403 })
    }

    // Build update data
    const updateData: any = {}

    if (role) {
      // Validate role
      const validRoles = ['student', 'licensed', 'instructor', 'staff', 'director', 'hr', 'manager']
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }
      updateData.role = role
      
      // Update license status based on role
      if (role === 'licensed' || role === 'instructor') {
        updateData.isLicenseVerified = true
        if (!member.licenseNumber || member.licenseNumber === 'N/A') {
          updateData.licenseNumber = 'PENDING'
          updateData.licenseState = 'PENDING'
        }
      }
    }

    if (status) {
      // Status is not directly stored in User model, but we can track it
      // For now, we'll use a custom field or handle it differently
      // Since status isn't in the schema, we'll skip it or add a note
      console.log(`Status update requested for ${member.email}: ${status}`)
      // TODO: Add status field to User model if needed
    }

    if (permissions && Array.isArray(permissions)) {
      updateData.permissions = permissions
    }

    // School location (for students: which location they're assigned to; for instructors: which location or all)
    if (locationId !== undefined) {
      updateData.locationId = locationId === '' || locationId == null ? null : locationId
    }
    if (typeof hasAllLocationAccess === 'boolean') {
      updateData.hasAllLocationAccess = hasAllLocationAccess
    }

    // Update the member
    const updated = await prisma.user.update({
      where: { id: memberId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        studioName: true,
        locationId: true,
        hasAllLocationAccess: true
      }
    })

    console.log(`✅ Updated team member ${updated.name}:`, {
      role: updated.role,
      permissions: updated.permissions ? 'Set' : 'Not set'
    })

    return NextResponse.json({
      success: true,
      member: updated,
      message: `Team member ${updated.name} updated successfully`
    })

  } catch (error: any) {
    console.error('Error updating team member:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update team member',
        details: error.message
      },
      { status: 500 }
    )
  }
}

