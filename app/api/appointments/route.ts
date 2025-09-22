import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

// GET /api/appointments - Get all appointments for a user
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to find user and appointments
    try {
      const user = await prisma.user.findUnique({
        where: { email: userEmail }
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const appointments = await prisma.appointment.findMany({
        where: {
          userId: user.id
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          procedures: {
            select: {
              id: true,
              procedureType: true,
              isCompleted: true
            }
          }
        },
        orderBy: { startTime: 'desc' }
      })

      return NextResponse.json({ appointments })

    } catch (dbError) {
      console.log('Database error:', dbError)
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}

// POST /api/appointments - Create new appointment
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      clientId,
      serviceType,
      title,
      duration,
      startTime,
      endTime,
      status,
      notes,
      price,
      deposit
    } = body

    // Validate required fields
    if (!clientId || !serviceType || !title || !duration || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Client ID, service type, title, duration, start time, and end time are required' },
        { status: 400 }
      )
    }

    // Try to find user
    try {
      const user = await prisma.user.findUnique({
        where: { email: userEmail }
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Verify client belongs to user
      const client = await prisma.client.findFirst({
        where: {
          id: clientId,
          userId: user.id,
          isActive: true
        }
      })

      if (!client) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 })
      }

      // Create appointment
      const appointment = await prisma.appointment.create({
        data: {
          userId: user.id,
          clientId,
          title,
          serviceType,
          duration,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          status: status || 'scheduled',
          notes: notes || null,
          price: price || 0,
          deposit: deposit || 0
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          procedures: {
            select: {
              id: true,
              procedureType: true,
              isCompleted: true
            }
          }
        }
      })

      return NextResponse.json({ appointment }, { status: 201 })

    } catch (dbError) {
      console.log('Database error creating appointment:', dbError)
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    )
  }
}
