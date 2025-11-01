import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET /api/room-bookings - Get all room bookings for a studio
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user to determine studio
    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        studioName: true,
        role: true
      }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!currentUser.studioName) {
      return NextResponse.json({ error: 'User not part of a studio' }, { status: 404 })
    }

    // Get bookings for the studio
    const bookings = await prisma.roomBooking.findMany({
      where: {
        studioName: currentUser.studioName
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    return NextResponse.json({ 
      success: true, 
      bookings,
      count: bookings.length 
    })

  } catch (error) {
    console.error('Error fetching room bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room bookings' },
      { status: 500 }
    )
  }
}

// POST /api/room-bookings - Create a new room booking
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { roomName, bookingDate, startTime, endTime, serviceType, clientName, notes } = body

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        studioName: true,
        role: true,
        employmentType: true
      }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has permission to book rooms
    if (!currentUser.studioName) {
      return NextResponse.json(
        { error: 'You must be part of a studio to book rooms' },
        { status: 403 }
      )
    }

    // Check if licensed esthetician has booth rent agreement
    if ((currentUser.role === 'licensed' || currentUser.role === 'instructor') && 
        currentUser.employmentType !== 'booth_renter') {
      return NextResponse.json(
        { error: 'Licensed estheticians must have a booth rent agreement on file to book treatment rooms' },
        { status: 403 }
      )
    }

    // Check if student is booking ProCell service only
    if (currentUser.role === 'student') {
      if (!serviceType) {
        return NextResponse.json(
          { error: 'Students must specify a service type when booking rooms' },
          { status: 400 }
        )
      }
      // Check if the service contains "ProCell" (case-insensitive)
      if (!serviceType.toLowerCase().includes('procell') && 
          !serviceType.toLowerCase().includes('proc cell') && 
          !serviceType.toLowerCase().includes('proc-cell')) {
        return NextResponse.json(
          { error: 'Students can only book treatment rooms for ProCell services' },
          { status: 403 }
        )
      }
    }

    // Check for overlapping bookings
    const overlappingBooking = await prisma.roomBooking.findFirst({
      where: {
        studioName: currentUser.studioName,
        roomName,
        status: 'confirmed',
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime) } }
            ]
          },
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } }
            ]
          },
          {
            AND: [
              { startTime: { gte: new Date(startTime) } },
              { endTime: { lte: new Date(endTime) } }
            ]
          }
        ]
      }
    })

    if (overlappingBooking) {
      return NextResponse.json(
        { 
          error: 'This time slot is already booked for this room',
          conflictingBooking: overlappingBooking
        },
        { status: 409 }
      )
    }

    // Create booking
    const booking = await prisma.roomBooking.create({
      data: {
        userId: currentUser.id,
        studioName: currentUser.studioName,
        roomName,
        bookingDate: new Date(bookingDate),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        serviceType: serviceType || null,
        clientName: clientName || null,
        notes: notes || null,
        status: 'confirmed'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      booking 
    })

  } catch (error) {
    console.error('Error creating room booking:', error)
    return NextResponse.json(
      { error: 'Failed to create room booking' },
      { status: 500 }
    )
  }
}

// DELETE /api/room-bookings - Cancel/delete a room booking
export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId } = body

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        studioName: true,
        role: true
      }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the booking
    const booking = await prisma.roomBooking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check permissions - only owner, director, manager can delete any booking, or the user who made the booking
    const canDelete = currentUser.role === 'owner' || 
                     currentUser.role === 'director' || 
                     currentUser.role === 'manager' ||
                     booking.userId === currentUser.id

    if (!canDelete) {
      return NextResponse.json(
        { error: 'You do not have permission to cancel this booking' },
        { status: 403 }
      )
    }

    // Delete the booking
    await prisma.roomBooking.delete({
      where: { id: bookingId }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Room booking cancelled successfully' 
    })

  } catch (error) {
    console.error('Error deleting room booking:', error)
    return NextResponse.json(
      { error: 'Failed to cancel room booking' },
      { status: 500 }
    )
  }
}

