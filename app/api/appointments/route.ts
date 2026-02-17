import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET /api/appointments - Get appointments for a user
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the current user
    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get appointments for the user
    // Show appointments where user is the owner (userId) OR assigned instructor (instructorId)
    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [
          { userId: currentUser.id },
          { instructorId: currentUser.id }
        ]
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      appointments,
      count: appointments.length
    })

  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}

// POST /api/appointments - Create a new appointment
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the current user
    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      clientName,
      clientEmail,
      clientPhone,
      service,
      date,
      time,
      duration,
      price,
      deposit,
      status,
      instructorId, // Optional: for supervision bookings
      notes
    } = body

    if (!clientName || !service || !date || !time) {
      return NextResponse.json(
        { error: 'clientName, service, date, and time are required' },
        { status: 400 }
      )
    }

    // Find or create client
    let client = await prisma.client.findFirst({
      where: {
        userId: currentUser.id,
        OR: [
          { email: clientEmail || '' },
          { phone: clientPhone || '' }
        ]
      }
    })

    if (!client) {
      // Create new client
      client = await prisma.client.create({
        data: {
          userId: currentUser.id,
          name: clientName,
          email: clientEmail || null,
          phone: clientPhone || null
        }
      })
    }

    // Parse date and time
    const dateTime = new Date(`${date}T${time}`)
    if (isNaN(dateTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date or time format' },
        { status: 400 }
      )
    }

    const durationMinutes = duration || 120
    const endTime = new Date(dateTime.getTime() + durationMinutes * 60 * 1000)

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        userId: currentUser.id,
        instructorId: instructorId || null, // Set instructorId if provided (for supervision bookings)
        clientId: client.id,
        title: service,
        serviceType: service,
        duration: durationMinutes,
        startTime: dateTime,
        endTime: endTime,
        status: status || 'scheduled',
        price: price || null,
        deposit: deposit || null,
        paymentStatus: 'pending',
        source: 'booking',
        notes: notes || null
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      appointment
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to create appointment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}