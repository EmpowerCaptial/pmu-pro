import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCrmUser } from '@/lib/server/crm-auth'

export async function GET(request: NextRequest) {
  try {
    await requireCrmUser(request)
    const range = request.nextUrl.searchParams.get('range') ?? 'upcoming'

    const now = new Date()
    const tours = await prisma.tour.findMany({
      where: {
        ...(range === 'upcoming'
          ? { start: { gte: now } }
          : range === 'past'
            ? { start: { lt: now } }
            : {})
      },
      orderBy: { start: 'asc' },
      include: {
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        staff: true
      }
    })

    return NextResponse.json({ tours })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('CRM tours GET error:', error)
    return NextResponse.json({ error: 'Failed to load tours' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { staffRecord } = await requireCrmUser(request)
    const body = await request.json()
    const { contactId, start, end, location, notes } = body

    if (!contactId || !start || !end || !location) {
      return NextResponse.json({ error: 'Contact, start, end, and location are required.' }, { status: 400 })
    }

    const tour = await prisma.tour.create({
      data: {
        contactId,
        staffId: staffRecord.id,
        start: new Date(start),
        end: new Date(end),
        location,
        notes,
        status: 'SCHEDULED'
      }
    })

    return NextResponse.json({ success: true, tour })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('CRM tours POST error:', error)
    return NextResponse.json({ error: 'Failed to schedule tour' }, { status: 500 })
  }
}
