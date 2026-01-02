import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// DELETE /api/live-streaming/rooms/[id] - Delete a live streaming room
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role
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

    const roomId = params.id

    // Find the room
    const room = await prisma.fileUpload.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Check if user owns the room or has privileged role
    const privilegedRoles = ['owner', 'director', 'manager', 'admin']
    if (room.userId !== user.id && !privilegedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized - You can only delete your own rooms' }, { status: 403 })
    }

    // Parse room name from fileType
    const parts = room.fileType.split('|')
    const roomName = parts[1] || ''

    // Delete room from Daily.co
    const dailyApiKey = process.env.DAILY_API_KEY
    if (dailyApiKey && roomName) {
      try {
        await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${dailyApiKey}`
          }
        })
      } catch (error) {
        console.error('Error deleting Daily.co room:', error)
        // Continue with database deletion even if Daily.co deletion fails
      }
    }

    // Delete from database
    await prisma.fileUpload.delete({
      where: { id: roomId }
    })

    return NextResponse.json({ success: true, message: 'Room deleted successfully' })
  } catch (error) {
    console.error('Error deleting live streaming room:', error)
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 })
  }
}

