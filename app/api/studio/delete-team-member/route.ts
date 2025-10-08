import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')

    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    // Verify the requester is an owner/manager/director
    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { role: true, studioName: true }
    })

    if (!currentUser || !['owner', 'manager', 'director'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Unauthorized. Only owners, managers, and directors can delete team members.' }, { status: 403 })
    }

    const { memberId } = await request.json()

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 })
    }

    // Get the member to be deleted
    const memberToDelete = await prisma.user.findUnique({
      where: { id: memberId },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        studioName: true 
      }
    })

    if (!memberToDelete) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Verify the member belongs to the same studio
    if (memberToDelete.studioName !== currentUser.studioName) {
      return NextResponse.json({ error: 'Cannot delete members from other studios' }, { status: 403 })
    }

    // Prevent deleting owners
    if (memberToDelete.role === 'owner') {
      return NextResponse.json({ error: 'Cannot delete studio owners. Transfer ownership first.' }, { status: 403 })
    }

    // Delete the team member from the database
    await prisma.user.delete({
      where: { id: memberId }
    })

    console.log(`✅ Deleted team member: ${memberToDelete.name} (${memberToDelete.email})`)

    return NextResponse.json({ 
      success: true, 
      message: 'Team member deleted successfully',
      deletedMember: {
        id: memberToDelete.id,
        name: memberToDelete.name,
        email: memberToDelete.email
      }
    })
  } catch (error) {
    console.error('Error deleting team member:', error)
    return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 })
  }}

