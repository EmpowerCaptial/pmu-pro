import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

// GET /api/financial/weekly - Get weekly financial data
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Missing user email' }, { status: 401 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate date range for this week (Monday to Sunday)
    const now = new Date()
    const dayOfWeek = now.getDay()
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Sunday = 0, so go back 6 days
    
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - daysToMonday)
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    // Get appointments for this week
    const appointments = await prisma.appointment.findMany({
      where: {
        userId: user.id,
        startTime: {
          gte: startOfWeek,
          lte: endOfWeek
        },
        status: {
          in: ['completed', 'confirmed']
        }
      },
      include: {
        procedures: true
      }
    })

    // Calculate weekly totals
    const totalRevenue = appointments.reduce((sum, appointment) => {
      return sum + Number(appointment.price || 0)
    }, 0)

    const serviceCount = appointments.length

    // Find top service
    const serviceTypes = appointments.map(apt => apt.serviceType || 'Unknown')
    const serviceCounts = serviceTypes.reduce((acc, service) => {
      acc[service] = (acc[service] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topService = Object.entries(serviceCounts).reduce((a, b) => 
      serviceCounts[a[0]] > serviceCounts[b[0]] ? a : b, 
      ['Unknown', 0]
    )[0]

    // Calculate growth percentage (compare with previous week)
    const previousWeekStart = new Date(startOfWeek)
    previousWeekStart.setDate(startOfWeek.getDate() - 7)
    
    const previousWeekEnd = new Date(endOfWeek)
    previousWeekEnd.setDate(endOfWeek.getDate() - 7)

    const previousWeekAppointments = await prisma.appointment.findMany({
      where: {
        userId: user.id,
        startTime: {
          gte: previousWeekStart,
          lte: previousWeekEnd
        },
        status: {
          in: ['completed', 'confirmed']
        }
      }
    })

    const previousWeekRevenue = previousWeekAppointments.reduce((sum, appointment) => {
      return sum + Number(appointment.price || 0)
    }, 0)

    const growthPercentage = previousWeekRevenue > 0 
      ? ((totalRevenue - previousWeekRevenue) / previousWeekRevenue) * 100
      : 0

    return NextResponse.json({
      totalRevenue,
      serviceCount,
      topService,
      growthPercentage: Math.round(growthPercentage * 10) / 10, // Round to 1 decimal
      weekStart: startOfWeek.toISOString(),
      weekEnd: endOfWeek.toISOString()
    })

  } catch (error) {
    console.error('Error fetching weekly financial data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weekly financial data' },
      { status: 500 }
    )
  }
}
