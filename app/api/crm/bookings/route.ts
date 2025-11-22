import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCrmUser } from '@/lib/server/crm-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireCrmUser(request)

    const statusParam = request.nextUrl.searchParams.get('status')
    const bookingTypeParam = request.nextUrl.searchParams.get('bookingType')
    const startDate = request.nextUrl.searchParams.get('startDate')
    const endDate = request.nextUrl.searchParams.get('endDate')

    const whereClause: any = {}

    if (statusParam) {
      whereClause.status = statusParam
    }

    if (bookingTypeParam) {
      whereClause.bookingType = bookingTypeParam
    }

    if (startDate || endDate) {
      whereClause.procedureDate = {}
      if (startDate) {
        whereClause.procedureDate.gte = new Date(startDate)
      }
      if (endDate) {
        whereClause.procedureDate.lte = new Date(endDate)
      }
    }

    // Check if table exists before querying
    try {
      const bookings = await prisma.clientBooking.findMany({
      where: whereClause,
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        staff: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        procedureDate: 'desc'
      }
    })

      return NextResponse.json({ success: true, bookings })
    } catch (prismaError: any) {
      // Check if it's a table doesn't exist error
      if (prismaError?.code === 'P2021' || prismaError?.message?.includes('does not exist') || prismaError?.message?.includes('relation "client_bookings"')) {
        console.error('Client Booking table not found. Run migration script:', prismaError)
        return NextResponse.json(
          { 
            error: 'Client Booking table not found. Please run database migrations.',
            code: 'P2021'
          },
          { status: 500 }
        )
      }
      throw prismaError
    }
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('CRM bookings GET error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorCode = (error as any)?.code
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Error details:', { errorMessage, errorCode, errorStack, error })
    
    // Return error details in development, generic message in production
    return NextResponse.json(
      { 
        error: 'Failed to load bookings',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        code: errorCode
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { staffRecord } = await requireCrmUser(request)
    const body = await request.json()
    const { clientName, bookingType, bookingDate, procedureDate, status, notes, contactId } = body

    if (!clientName || !bookingType || !bookingDate || !procedureDate) {
      return NextResponse.json(
        { error: 'Client name, booking type, booking date, and procedure date are required.' },
        { status: 400 }
      )
    }

    if (!['licensed_artist', 'student'].includes(bookingType)) {
      return NextResponse.json(
        { error: 'Booking type must be either "licensed_artist" or "student".' },
        { status: 400 }
      )
    }

    const booking = await prisma.clientBooking.create({
      data: {
        clientName: clientName.trim(),
        bookingType,
        bookingDate: new Date(bookingDate),
        procedureDate: new Date(procedureDate),
        status: status || 'scheduled',
        notes: notes?.trim() || null,
        contactId: contactId || null,
        staffId: staffRecord.id
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
        },
        staff: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('CRM bookings POST error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Error details:', { errorMessage, errorStack, error })
    
    // Check if it's a Prisma error
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2021') {
        return NextResponse.json(
          { error: 'Client Booking table not found. Please run database migrations.' },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create booking',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}
