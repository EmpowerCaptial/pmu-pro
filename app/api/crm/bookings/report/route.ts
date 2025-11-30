import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCrmUser } from '@/lib/server/crm-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireCrmUser(request)

    // Get current month's date range (first day to last day)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    endOfMonth.setHours(23, 59, 59, 999)

    // Get all completed bookings (status: 'showed') for the current month
    const completedBookings = await prisma.clientBooking.findMany({
      where: {
        status: 'showed',
        procedureDate: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        procedureDate: 'desc'
      }
    })

    // Calculate totals
    const totalCompleted = completedBookings.length
    const licensedCount = completedBookings.filter(b => b.bookingType === 'licensed_artist').length
    const studentCount = completedBookings.filter(b => b.bookingType === 'student').length
    const introSessionCount = completedBookings.filter(b => b.bookingType === 'intro_session').length
    const promoCount = completedBookings.filter(b => b.isPromo).length
    const noPromoCount = completedBookings.filter(b => !b.isPromo).length

    return NextResponse.json({
      success: true,
      period: {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString(),
        month: now.toLocaleString('default', { month: 'long', year: 'numeric' })
      },
      totals: {
        totalCompleted,
        licensedCount,
        studentCount,
        introSessionCount,
        promoCount,
        noPromoCount
      },
      bookings: completedBookings.map(booking => ({
        id: booking.id,
        clientName: booking.clientName,
        bookingType: booking.bookingType,
        procedureDate: booking.procedureDate.toISOString(),
        isPromo: booking.isPromo,
        contact: booking.contact
      }))
    })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('CRM bookings report GET error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Failed to generate report',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

