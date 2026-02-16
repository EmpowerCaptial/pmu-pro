import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/supervision-sessions?view=instructor|student
// Instructor: returns sessions where I am the instructor (so they see booked times)
// Student: returns sessions where I am the student
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, role: true }
    })
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const view = request.nextUrl.searchParams.get('view') || 'instructor'
    const where =
      view === 'instructor'
        ? { instructorId: currentUser.id }
        : { studentId: currentUser.id }

    const sessions = await prisma.supervisionSession.findMany({
      where: { ...where, status: { not: 'cancelled' } },
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        student: { select: { id: true, name: true, email: true } },
        location: { select: { id: true, name: true } }
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }]
    })

    // Map to booking-like shape for supervision page
    const items = sessions.map((s) => ({
      id: s.id,
      instructorId: s.instructorId,
      instructorName: s.instructor.name,
      date: s.date.toISOString().split('T')[0],
      time: s.time,
      clientName: s.clientName,
      clientEmail: s.clientEmail,
      clientPhone: s.clientPhone,
      clientInfo: {
        name: s.clientName,
        email: s.clientEmail,
        phone: s.clientPhone
      },
      service: { name: s.serviceName },
      status: s.status,
      depositSent: s.depositSent,
      depositLink: s.depositLink,
      appointmentId: s.appointmentId,
      apprenticeName: s.student.name,
      apprenticeEmail: s.student.email,
      type: 'supervision_booking',
      createdAt: s.createdAt.toISOString()
    }))

    return NextResponse.json({ sessions: items })
  } catch (error) {
    console.error('Supervision sessions GET error:', error)
    return NextResponse.json(
      { error: 'Failed to load supervision sessions' },
      { status: 500 }
    )
  }
}

// POST /api/supervision-sessions - Student books an instructor
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, name: true, email: true, role: true, locationId: true }
    })
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      instructorId,
      date,
      time,
      clientName,
      clientEmail,
      clientPhone,
      serviceName,
      serviceId,
      locationId
    } = body

    if (!instructorId || !date || !time || !clientName || !serviceName) {
      return NextResponse.json(
        { error: 'instructorId, date, time, clientName, and serviceName are required' },
        { status: 400 }
      )
    }

    // Verify instructor exists and (if student has location) instructor has access to that location
    const instructor = await prisma.user.findFirst({
      where: { id: instructorId },
      select: { id: true, name: true, email: true, locationId: true, hasAllLocationAccess: true }
    })
    if (!instructor) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 })
    }

    const studentLocationId = currentUser.locationId || locationId
    if (studentLocationId) {
      const instructorAtLocation =
        instructor.hasAllLocationAccess || instructor.locationId === studentLocationId
      if (!instructorAtLocation) {
        return NextResponse.json(
          { error: 'This instructor is not available at your school location' },
          { status: 403 }
        )
      }
    }

    const session = await prisma.supervisionSession.create({
      data: {
        studentId: currentUser.id,
        instructorId: instructor.id,
        locationId: studentLocationId || null,
        date: new Date(date),
        time: String(time),
        clientName: String(clientName).trim(),
        clientEmail: clientEmail ? String(clientEmail).trim() : null,
        clientPhone: clientPhone ? String(clientPhone).trim() : null,
        serviceName: String(serviceName).trim(),
        serviceId: serviceId || null,
        status: 'pending-deposit',
        depositSent: false
      },
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        student: { select: { id: true, name: true, email: true } }
      }
    })

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        instructorId: session.instructorId,
        instructorName: session.instructor.name,
        date: session.date.toISOString().split('T')[0],
        time: session.time,
        clientName: session.clientName,
        status: session.status,
        type: 'supervision_booking'
      }
    })
  } catch (error) {
    console.error('Supervision sessions POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create supervision session' },
      { status: 500 }
    )
  }
}
