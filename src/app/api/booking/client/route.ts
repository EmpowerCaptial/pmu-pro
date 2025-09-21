import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { 
      clientId, 
      serviceType, 
      scheduledDate, 
      scheduledTime, 
      duration, 
      price, 
      notes,
      deposit 
    } = body

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

    // Create appointment/booking record
    // Note: This would integrate with your existing appointment system
    // For now, we'll create a simple record that can be expanded
    const appointment = await prisma.appointment.create({
      data: {
        userId: user.id,
        clientId: clientId,
        title: `${serviceType} - ${client.name}`,
        serviceType: serviceType,
        duration: duration || 120, // Default 2 hours
        startTime: new Date(`${scheduledDate}T${scheduledTime}`),
        endTime: new Date(new Date(`${scheduledDate}T${scheduledTime}`).getTime() + (duration || 120) * 60000),
        status: 'scheduled',
        price: price || 0,
        deposit: deposit || 0,
        paymentStatus: 'pending',
        source: 'client_management',
        notes: notes,
        reminderSent: false
      }
    })

    return NextResponse.json({ 
      appointment,
      message: 'Appointment booked successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error booking appointment:', error)
    return NextResponse.json(
      { error: 'Failed to book appointment' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    let whereClause: any = {
      userId: user.id,
      status: { not: 'cancelled' }
    }

    if (clientId) {
      whereClause.clientId = clientId
    }

    // Get appointments
    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      },
      orderBy: { startTime: 'desc' }
    })

    return NextResponse.json({ appointments })

  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}
