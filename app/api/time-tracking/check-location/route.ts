import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// POST /api/time-tracking/check-location - Check if student is still within range and auto-clock-out if needed
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { lat, lng } = body

    if (!lat || !lng) {
      return NextResponse.json({ error: 'Location coordinates required' }, { status: 400 })
    }

    // Get the current user
    const currentUser = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Only check location for students
    if (currentUser.role !== 'student') {
      return NextResponse.json({ 
        success: true, 
        message: 'Location monitoring only applies to students',
        withinRange: true 
      })
    }

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
      return NextResponse.json({ 
        success: true, 
        message: 'No active session to monitor',
        withinRange: true 
      })
    }

    // Get studio geolocation settings
    const studioSettings = await prisma.studioSettings.findUnique({
      where: { studioName: currentUser.studioName || undefined }
    })

    if (!studioSettings || !studioSettings.lat || !studioSettings.lng) {
      // No geolocation settings configured, allow location
      return NextResponse.json({ 
        success: true, 
        message: 'No geolocation settings configured for this studio',
        withinRange: true 
      })
    }

    // Calculate distance from studio
    const distance = calculateDistance(lat, lng, studioSettings.lat, studioSettings.lng)
    const withinRange = distance <= studioSettings.radius

    if (!withinRange) {
      // Student is outside range - auto-clock-out
      const now = new Date()

      // End any active breaks first
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

      // Update session with auto-clock-out
      const updatedSession = await prisma.timeTrackingSession.update({
        where: { id: activeSession.id },
        data: {
          clockOutTime: now,
          totalHours: Math.max(0, totalHours),
          notes: `${activeSession.notes || ''}\n[AUTO-CLOCK-OUT: Left studio area - ${distance.toFixed(1)}m away]`.trim()
        }
      })

      return NextResponse.json({
        success: true,
        withinRange: false,
        autoClockOut: true,
        message: `Automatically clocked out - you were ${distance.toFixed(1)}m away from the studio`,
        session: updatedSession
      })
    }

    return NextResponse.json({
      success: true,
      withinRange: true,
      message: `Still within range (${distance.toFixed(1)}m from studio)`,
      distance: distance
    })

  } catch (error) {
    console.error('Error checking location:', error)
    return NextResponse.json(
      { error: 'Failed to check location' },
      { status: 500 }
    )
  }
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180
  const φ2 = lat2 * Math.PI/180
  const Δφ = (lat2-lat1) * Math.PI/180
  const Δλ = (lon2-lon1) * Math.PI/180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c // Distance in meters
}
