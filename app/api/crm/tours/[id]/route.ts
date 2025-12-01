import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCrmUser } from '@/lib/server/crm-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireCrmUser(request)

    const tour = await prisma.tour.findUnique({
      where: { id: params.id },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
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

    if (!tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, tour })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('CRM tour GET error:', error)
    return NextResponse.json({ error: 'Failed to load tour' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireCrmUser(request)
    const body = await request.json()
    const { contactId, start, end, location, status, notes } = body

    // Validate required fields if provided
    if (start && end && new Date(start) >= new Date(end)) {
      return NextResponse.json(
        { error: 'End time must be after start time.' },
        { status: 400 }
      )
    }

    const tour = await prisma.tour.update({
      where: { id: params.id },
      data: {
        ...(contactId !== undefined && { contactId }),
        ...(start !== undefined && { start: new Date(start) }),
        ...(end !== undefined && { end: new Date(end) }),
        ...(location !== undefined && { location }),
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes: notes?.trim() || null })
      },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
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

    return NextResponse.json({ success: true, tour })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('CRM tour PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update tour' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireCrmUser(request)

    await prisma.tour.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('CRM tour DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete tour' }, { status: 500 })
  }
}

