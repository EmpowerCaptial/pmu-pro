import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET /api/time-tracking - Get time tracking sessions for a user
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

    // Get time tracking sessions
    const sessions = await prisma.timeTrackingSession.findMany({
      where: {
        userId: currentUser.id
      },
      include: {
        breakSessions: true
      },
      orderBy: {
        clockInTime: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      sessions,
      count: sessions.length
    })

  } catch (error) {
    console.error('Error fetching time tracking sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time tracking sessions' },
      { status: 500 }
    )
  }
}

// POST /api/time-tracking - Clock in/out or manage breaks
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, lat, lng, location, notes, reason } = body

    // Get the current user
    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const now = new Date()

    switch (action) {
      case 'clockIn': {
        // Check if user is already clocked in
        const activeSession = await prisma.timeTrackingSession.findFirst({
          where: {
            userId: currentUser.id,
            clockOutTime: null
          }
        })

        if (activeSession) {
          return NextResponse.json({ error: 'Already clocked in' }, { status: 400 })
        }

        // Create new session
        const session = await prisma.timeTrackingSession.create({
          data: {
            userId: currentUser.id,
            clockInTime: now,
            location,
            lat,
            lng,
            notes
          }
        })

        return NextResponse.json({
          success: true,
          session,
          message: 'Clocked in successfully'
        })
      }

      case 'clockOut': {
        // Find active session
        const activeSession = await prisma.timeTrackingSession.findFirst({
          where: {
            userId: currentUser.id,
            clockOutTime: null
          },
          include: {
            breakSessions: true
          }
        })

        if (!activeSession) {
          return NextResponse.json({ error: 'No active session found' }, { status: 400 })
        }

        // End any active breaks
        const activeBreaks = activeSession.breakSessions.filter(breakSession => !breakSession.endTime)
        for (const breakSession of activeBreaks) {
          await prisma.breakSession.update({
            where: { id: breakSession.id },
            data: {
              endTime: now,
              duration: (now.getTime() - breakSession.startTime.getTime()) / (1000 * 60 * 60) // hours
            }
          })
        }

        // Calculate total hours worked
        const totalBreakHours = activeSession.breakSessions.reduce((sum, breakSession) => {
          const endTime = breakSession.endTime || now
          return sum + ((endTime.getTime() - breakSession.startTime.getTime()) / (1000 * 60 * 60))
        }, 0)

        const totalHours = ((now.getTime() - activeSession.clockInTime.getTime()) / (1000 * 60 * 60)) - totalBreakHours

        // Update session
        const updatedSession = await prisma.timeTrackingSession.update({
          where: { id: activeSession.id },
          data: {
            clockOutTime: now,
            totalHours: Math.max(0, totalHours)
          }
        })

        return NextResponse.json({
          success: true,
          session: updatedSession,
          message: 'Clocked out successfully'
        })
      }

      case 'startBreak': {
        // Find active session
        const activeSession = await prisma.timeTrackingSession.findFirst({
          where: {
            userId: currentUser.id,
            clockOutTime: null
          },
          include: {
            breakSessions: true
          }
        })

        if (!activeSession) {
          return NextResponse.json({ error: 'No active session found' }, { status: 400 })
        }

        // Check if already on break
        const activeBreak = activeSession.breakSessions.find(breakSession => !breakSession.endTime)
        if (activeBreak) {
          return NextResponse.json({ error: 'Already on break' }, { status: 400 })
        }

        // Create break session
        const breakSession = await prisma.breakSession.create({
          data: {
            sessionId: activeSession.id,
            startTime: now,
            reason
          }
        })

        return NextResponse.json({
          success: true,
          breakSession,
          message: 'Break started'
        })
      }

      case 'endBreak': {
        // Find active session
        const activeSession = await prisma.timeTrackingSession.findFirst({
          where: {
            userId: currentUser.id,
            clockOutTime: null
          },
          include: {
            breakSessions: true
          }
        })

        if (!activeSession) {
          return NextResponse.json({ error: 'No active session found' }, { status: 400 })
        }

        // Find active break
        const activeBreak = activeSession.breakSessions.find(breakSession => !breakSession.endTime)
        if (!activeBreak) {
          return NextResponse.json({ error: 'No active break found' }, { status: 400 })
        }

        // End break
        const duration = (now.getTime() - activeBreak.startTime.getTime()) / (1000 * 60 * 60) // hours

        const updatedBreak = await prisma.breakSession.update({
          where: { id: activeBreak.id },
          data: {
            endTime: now,
            duration
          }
        })

        return NextResponse.json({
          success: true,
          breakSession: updatedBreak,
          message: 'Break ended'
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in time tracking action:', error)
    return NextResponse.json(
      { error: 'Failed to process time tracking action' },
      { status: 500 }
    )
  }
}
