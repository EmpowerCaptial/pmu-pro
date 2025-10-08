import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET /api/procedures - Get all procedures for a user
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to find user and procedures
    try {
      const user = await prisma.user.findUnique({
        where: { email: userEmail }
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const procedures = await prisma.procedure.findMany({
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
          service: {
            select: {
              id: true,
              name: true
            }
          },
          appointment: {
            select: {
              id: true,
              startTime: true,
              endTime: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({ procedures })

    } catch (dbError) {
      console.log('Database error:', dbError)
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

  } catch (error) {
    console.error('Error fetching procedures:', error)
    return NextResponse.json({ error: 'Failed to fetch procedures' }, { status: 500 })
  }
}

// POST /api/procedures - Create new procedure
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      clientId,
      serviceId,
      appointmentId,
      procedureType,
      voltage,
      needleConfiguration,
      needleSize,
      pigmentBrand,
      pigmentColor,
      lotNumber,
      depth,
      technique,
      duration,
      areaTreated,
      notes,
      beforePhotos,
      afterPhotos,
      healingProgress,
      procedureDate,
      followUpDate,
      touchUpScheduled,
      touchUpDate,
      isCompleted
    } = body

    // Validate required fields
    if (!clientId || !procedureType) {
      return NextResponse.json(
        { error: 'Client ID and procedure type are required' },
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

      // Create procedure
      const procedure = await prisma.procedure.create({
        data: {
          userId: user.id,
          clientId,
          serviceId: serviceId || null,
          appointmentId: appointmentId || null,
          procedureType,
          voltage: voltage || null,
          needleConfiguration: needleConfiguration || '',
          needleSize: needleSize || null,
          pigmentBrand: pigmentBrand || '',
          pigmentColor: pigmentColor || '',
          lotNumber: lotNumber || null,
          depth: depth || null,
          technique: technique || null,
          duration: duration || null,
          areaTreated: areaTreated || null,
          notes: notes || null,
          beforePhotos: beforePhotos || [],
          afterPhotos: afterPhotos || [],
          healingProgress: healingProgress || null,
          procedureDate: procedureDate ? new Date(procedureDate) : new Date(),
          followUpDate: followUpDate ? new Date(followUpDate) : null,
          touchUpScheduled: touchUpScheduled || false,
          touchUpDate: touchUpDate ? new Date(touchUpDate) : null,
          isCompleted: isCompleted || false
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
          service: {
            select: {
              id: true,
              name: true
            }
          },
          appointment: {
            select: {
              id: true,
              startTime: true,
              endTime: true
            }
          }
        }
      })

      return NextResponse.json({ procedure }, { status: 201 })

    } catch (dbError) {
      console.log('Database error creating procedure:', dbError)
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

  } catch (error) {
    console.error('Error creating procedure:', error)
    return NextResponse.json(
      { error: 'Failed to create procedure' },
      { status: 500 }
    )
  }
}
