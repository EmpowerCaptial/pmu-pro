import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCrmUser } from '@/lib/server/crm-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireCrmUser(request)

    // Get month offset from query parameter (0 = current month, 1 = previous month, etc.)
    const monthOffsetParam = request.nextUrl.searchParams.get('monthOffset')
    const monthOffset = monthOffsetParam ? parseInt(monthOffsetParam, 10) : 0
    
    // Validate month offset (0 to 3, meaning current month and up to 3 months back)
    if (isNaN(monthOffset) || monthOffset < 0 || monthOffset > 3) {
      return NextResponse.json(
        { error: 'Month offset must be between 0 and 3' },
        { status: 400 }
      )
    }

    // Calculate the target month based on offset
    const now = new Date()
    const targetDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)
    
    // Get target month's date range (first day to last day)
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0)
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
    const tourCount = completedBookings.filter(b => b.bookingType === 'tour').length
    const promoCount = completedBookings.filter(b => b.isPromo).length
    const noPromoCount = completedBookings.filter(b => !b.isPromo).length

    return NextResponse.json({
      success: true,
      period: {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString(),
        month: targetDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
        monthOffset
      },
      totals: {
        totalCompleted,
        licensedCount,
        studentCount,
        introSessionCount,
        tourCount,
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

