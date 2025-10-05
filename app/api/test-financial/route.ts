import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Missing user email' }, { status: 401 })
    }

    console.log('🔍 Testing financial API with user:', userEmail)

    // Test basic user lookup
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('✅ User found:', user.id)

    // Test basic appointment count
    const appointmentCount = await prisma.appointment.count({
      where: {
        userId: user.id
      }
    })

    console.log('✅ Appointment count:', appointmentCount)

    // Test today's appointments
    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)

    const todaysAppointments = await prisma.appointment.findMany({
      where: {
        userId: user.id,
        startTime: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      select: {
        id: true,
        price: true,
        status: true
      }
    })

    console.log('✅ Today\'s appointments:', todaysAppointments.length)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      stats: {
        totalAppointments: appointmentCount,
        todaysAppointments: todaysAppointments.length,
        todaysRevenue: todaysAppointments.reduce((sum, apt) => sum + Number(apt.price || 0), 0)
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Financial test error:', error)
    return NextResponse.json(
      { 
        error: 'Financial test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
