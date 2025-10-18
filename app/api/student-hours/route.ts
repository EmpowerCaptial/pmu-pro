import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET /api/student-hours - Get student hours for instructors
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

    // Only instructors, managers, directors, and owners can access this
    if (!['instructor', 'manager', 'director', 'owner'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get all students in the same studio
    const students = await prisma.user.findMany({
      where: {
        studioName: currentUser.studioName,
        role: 'student'
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    })

    // Calculate real student hours from time tracking sessions
    const studentHours = await Promise.all(students.map(async (student) => {
      // Get all completed time tracking sessions for this student
      const sessions = await prisma.timeTrackingSession.findMany({
        where: {
          userId: student.id,
          clockOutTime: { not: null } // Only completed sessions
        },
        include: {
          breakSessions: true
        }
      })

      // Calculate total hours worked
      const totalHours = sessions.reduce((sum, session) => {
        return sum + (session.totalHours || 0)
      }, 0)

      // Get procedure count from appointments
      const procedureCount = await prisma.appointment.count({
        where: {
          userId: student.id,
          status: 'completed'
        }
      })

      // Get last activity (most recent session or appointment)
      const lastSession = sessions[0]
      const lastAppointment = await prisma.appointment.findFirst({
        where: {
          userId: student.id
        },
        orderBy: {
          startTime: 'desc'
        }
      })

      const lastActivity = lastSession?.clockInTime || lastAppointment?.startTime || student.createdAt

      // Get procedure types from completed appointments
      const procedureTypes = await prisma.appointment.findMany({
        where: {
          userId: student.id,
          status: 'completed'
        },
        select: {
          serviceType: true
        },
        distinct: ['serviceType']
      })

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal place
        procedures: procedureCount,
        lastActivity,
        procedureTypes: procedureTypes.map(p => p.serviceType)
      }
    }))

    return NextResponse.json({
      success: true,
      studentHours,
      count: studentHours.length
    })

  } catch (error) {
    console.error('Error fetching student hours:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student hours' },
      { status: 500 }
    )
  }
}