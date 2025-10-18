import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET /api/financial/weekly - Get weekly financial data
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

    // Calculate date range for this week
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    // Get appointments for this week
    const appointments = await prisma.appointment.findMany({
      where: {
        userId: currentUser.id,
        createdAt: {
          gte: startOfWeek,
          lte: endOfWeek
        }
      },
      select: {
        id: true,
        price: true,
        gratuityAmount: true,
        status: true,
        createdAt: true
      }
    })

    // Calculate totals
    const totalRevenue = appointments.reduce((sum, apt) => sum + (apt.price || 0), 0)
    const totalGratuity = appointments.reduce((sum, apt) => sum + (apt.gratuityAmount || 0), 0)
    const completedAppointments = appointments.filter(apt => apt.status === 'completed').length

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalGratuity,
        totalAppointments: appointments.length,
        completedAppointments,
        startDate: startOfWeek,
        endDate: endOfWeek
      }
    })

  } catch (error) {
    console.error('Error fetching weekly financial data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weekly financial data' },
      { status: 500 }
    )
  }
}