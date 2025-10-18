import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET /api/financial/daily - Get daily financial data
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

    // Calculate date range for today
    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)

    // Get appointments for today
    const appointments = await prisma.appointment.findMany({
      where: {
        userId: currentUser.id,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      select: {
        id: true,
        price: true,
        status: true,
        createdAt: true
      }
    })

    // Calculate totals
    const totalRevenue = appointments.reduce((sum, apt) => sum + (apt.price || 0), 0)
    const totalGratuity = 0 // Gratuity not tracked in Appointment model
    const completedAppointments = appointments.filter(apt => apt.status === 'completed').length

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalGratuity,
        totalAppointments: appointments.length,
        completedAppointments,
        date: startOfDay
      }
    })

  } catch (error) {
    console.error('Error fetching daily financial data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch daily financial data' },
      { status: 500 }
    )
  }
}