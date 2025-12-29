import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// DELETE /api/training/zoom-sessions/[id] - Delete a Zoom live session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role - only instructors and above can delete sessions
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const allowedRoles = ['owner', 'director', 'manager', 'hr', 'staff', 'admin', 'instructor']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized - Instructor access required' }, { status: 403 })
    }

    const sessionId = params.id

    // Find the session
    const session = await prisma.fileUpload.findUnique({
      where: { id: sessionId }
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Check if user owns the session or has privileged role
    const privilegedRoles = ['owner', 'director', 'manager', 'admin']
    if (session.userId !== user.id && !privilegedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized - You can only delete your own sessions' }, { status: 403 })
    }

    // Delete the session
    await prisma.fileUpload.delete({
      where: { id: sessionId }
    })

    return NextResponse.json({ success: true, message: 'Session deleted successfully' })
  } catch (error) {
    console.error('Error deleting Zoom session:', error)
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 })
  }
}

