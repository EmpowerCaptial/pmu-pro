import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET /api/attendance - Get attendance records
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { 
        id: true,
        role: true,
        locationId: true,
        hasAllLocationAccess: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only allow Instructors, Directors, and Owners
    const allowedRoles = ['instructor', 'director', 'owner']
    if (!allowedRoles.includes(user.role.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get('locationId')
    const date = searchParams.get('date')
    const studentId = searchParams.get('studentId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}

    // Filter by location based on instructor access
    if (user.role.toLowerCase() === 'instructor' && !user.hasAllLocationAccess) {
      // Instructors without all-location access can only see their location
      where.locationId = user.locationId
    } else if (locationId) {
      // Directors/Owners or instructors with all-location access can filter by location
      where.locationId = locationId
    }

    if (date) {
      where.date = new Date(date)
    }

    if (studentId) {
      where.studentId = studentId
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        location: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { date: 'desc' },
        { student: { name: 'asc' } }
      ]
    })

    return NextResponse.json({
      success: true,
      data: attendance
    })

  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attendance' },
      { status: 500 }
    )
  }
}

// POST /api/attendance - Mark attendance
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role
    const instructor = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { 
        id: true,
        role: true,
        locationId: true,
        hasAllLocationAccess: true
      }
    })

    if (!instructor) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only allow Instructors, Directors, and Owners
    const allowedRoles = ['instructor', 'director', 'owner']
    if (!allowedRoles.includes(instructor.role.toLowerCase())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { studentId, locationId, date, status, notes } = await request.json()

    if (!studentId || !locationId || !date || !status) {
      return NextResponse.json(
        { error: 'Student ID, location ID, date, and status are required' },
        { status: 400 }
      )
    }

    // Verify instructor has access to this location
    if (instructor.role.toLowerCase() === 'instructor' && !instructor.hasAllLocationAccess) {
      if (instructor.locationId !== locationId) {
        return NextResponse.json(
          { error: 'You do not have access to mark attendance for this location' },
          { status: 403 }
        )
      }
    }

    // Verify student belongs to this location
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { locationId: true, role: true }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    if (student.role.toLowerCase() !== 'student' && student.role.toLowerCase() !== 'apprentice') {
      return NextResponse.json({ error: 'User is not a student' }, { status: 400 })
    }

    if (student.locationId !== locationId) {
      return NextResponse.json(
        { error: 'Student does not belong to this location' },
        { status: 400 }
      )
    }

    // Check if attendance already exists for this student/date/location
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        studentId_locationId_date: {
          studentId,
          locationId,
          date: new Date(date)
        }
      }
    })

    let attendance
    if (existingAttendance) {
      // Update existing attendance
      attendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          status,
          notes: notes || null,
          instructorId: instructor.id,
          updatedAt: new Date()
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          instructor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          location: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
    } else {
      // Create new attendance record
      attendance = await prisma.attendance.create({
        data: {
          studentId,
          instructorId: instructor.id,
          locationId,
          date: new Date(date),
          status,
          notes: notes || null
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          instructor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          location: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: attendance
    }, { status: existingAttendance ? 200 : 201 })

  } catch (error: any) {
    console.error('Error marking attendance:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Attendance already exists for this student on this date' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to mark attendance' },
      { status: 500 }
    )
  }
}

