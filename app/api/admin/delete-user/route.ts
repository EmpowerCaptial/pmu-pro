import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

/**
 * DELETE /api/admin/delete-user
 * Admin endpoint to permanently delete users from the database
 * 
 * Security: Only accessible by users with 'owner' role
 * 
 * Request body:
 * {
 *   "userIdToDelete": "string",  // The ID of the user to delete
 *   "confirmEmail": "string"     // Email confirmation for safety
 * }
 */
export async function DELETE(request: NextRequest) {
  try {
    // 1. Authentication - Get requesting user
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Verify requester is an owner (admin)
    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { 
        id: true, 
        email: true, 
        role: true,
        studioName: true 
      }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Security: Only owners can delete users
    if (currentUser.role !== 'owner') {
      return NextResponse.json(
        { error: 'Unauthorized. Only studio owners can delete users.' },
        { status: 403 }
      )
    }

    // 3. Parse request body
    const body = await request.json()
    const { userIdToDelete, confirmEmail } = body

    if (!userIdToDelete) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // 4. Get the user to be deleted
    const userToDelete = await prisma.user.findUnique({
      where: { id: userIdToDelete },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studioName: true,
        _count: {
          select: {
            clients: true,
            appointments: true,
            procedures: true
          }
        }
      }
    })

    if (!userToDelete) {
      return NextResponse.json({ error: 'User to delete not found' }, { status: 404 })
    }

    // 5. Email confirmation check
    if (confirmEmail && confirmEmail !== userToDelete.email) {
      return NextResponse.json(
        { error: 'Email confirmation does not match. Please type the exact email address.' },
        { status: 400 }
      )
    }

    // 6. Prevent self-deletion
    if (userToDelete.id === currentUser.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account. Transfer ownership first.' },
        { status: 400 }
      )
    }

    // 7. Prevent deleting owners (unless they're from same studio and current user wants to remove a co-owner)
    if (userToDelete.role === 'owner' && userToDelete.studioName !== currentUser.studioName) {
      return NextResponse.json(
        { error: 'Cannot delete owners from other studios.' },
        { status: 403 }
      )
    }

    // 8. Only allow deleting users from same studio OR users without studio
    if (userToDelete.studioName && userToDelete.studioName !== currentUser.studioName) {
      return NextResponse.json(
        { error: 'Can only delete users from your own studio.' },
        { status: 403 }
      )
    }

    // 9. Check if user has data (warn about cascade deletion)
    const hasData = userToDelete._count.clients > 0 || 
                    userToDelete._count.appointments > 0 || 
                    userToDelete._count.procedures > 0

    // 10. Delete the user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userIdToDelete }
    })

    // 11. Return success with details about what was deleted
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      deletedUser: {
        id: userToDelete.id,
        name: userToDelete.name,
        email: userToDelete.email,
        role: userToDelete.role
      },
      cascadeDeleted: hasData ? {
        clients: userToDelete._count.clients,
        appointments: userToDelete._count.appointments,
        procedures: userToDelete._count.procedures
      } : null
    })

  } catch (error) {
    console.error('Error in DELETE /api/admin/delete-user:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

