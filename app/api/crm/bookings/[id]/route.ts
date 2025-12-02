import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCrmUser } from '@/lib/server/crm-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireCrmUser(request)

    const booking = await prisma.clientBooking.findUnique({
      where: { id: params.id },
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

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('CRM booking GET error:', error)
    return NextResponse.json({ error: 'Failed to load booking' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { portalUser, staffRecord } = await requireCrmUser(request)
    const body = await request.json()
    const { clientName, bookingType, bookingDate, procedureDate, status, isPromo, notes, contactId } = body

    // Check if trying to change status from 'showed' to something else
    const existingBooking = await prisma.clientBooking.findUnique({
      where: { id: params.id }
    })

    if (existingBooking?.status === 'showed' && status && status !== 'showed') {
      const userRole = portalUser.role?.toLowerCase() ?? ''
      if (userRole !== 'owner' && userRole !== 'hr') {
        return NextResponse.json(
          { error: 'Only owners and HR can change status from "Showed"' },
          { status: 403 }
        )
      }
    }

    // Validate booking type if provided
    if (bookingType && !['licensed_artist', 'student', 'intro_session', 'tour'].includes(bookingType)) {
      return NextResponse.json(
        { error: 'Booking type must be "licensed_artist", "student", "intro_session", or "tour".' },
        { status: 400 }
      )
    }

    const booking = await prisma.clientBooking.update({
      where: { id: params.id },
      data: {
        ...(clientName !== undefined && { clientName: clientName.trim() }),
        ...(bookingType !== undefined && { bookingType }),
        ...(bookingDate !== undefined && { bookingDate: new Date(bookingDate) }),
        ...(procedureDate !== undefined && { procedureDate: new Date(procedureDate) }),
        ...(status !== undefined && { status }),
        ...(isPromo !== undefined && { isPromo }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
        ...(contactId !== undefined && { contactId: contactId || null })
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
    console.error('CRM booking PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireCrmUser(request)

    await prisma.clientBooking.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('CRM booking DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })
  }
}
