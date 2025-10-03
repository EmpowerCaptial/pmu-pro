import { NextRequest, NextResponse } from 'next/server'
import { getSupervisionUser, canPublishAvailability, checkStudioSupervisionAccess } from '@/lib/studio-supervision-gate'
import { StudioSupervisionService } from '@/lib/studio-supervision-service'
import { AuthService } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    // Get auth token
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = await AuthService.verifyToken(token)
    
    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    const supervisionUser = await getSupervisionUser(user.id)
    if (!supervisionUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check Enterprise Studio access
    const accessCheck = canPublishAvailability(supervisionUser)
    if (!accessCheck) {
      return NextResponse.json({ 
        error: "Enterprise Studio Supervision requires Studio ($99/month) subscription and INSTRUCTOR role" 
      }, { status: 403 })
    }

    const data = await req.json()
    
    // Validate required fields
    if (!data.startUtc || !data.endUtc) {
      return NextResponse.json({ error: "startUtc and endUtc are required" }, { status: 400 })
    }

    // Create availability block
    const availability = await StudioSupervisionService.createAvailability({
      supervisorId: user.id,
      startUtc: new Date(data.startUtc),
      endUtc: new Date(data.endUtc),
      location: data.location,
      notes: data.notes,
      capacity: data.capacity || 1,
      bufferMinutes: data.bufferMinutes || 15
    })

    return NextResponse.json({ 
      success: true, 
      availability 
    })

  } catch (error: any) {
    console.error('Error creating supervision availability:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create availability' },
      { status: 400 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get auth token
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = await AuthService.verifyToken(token)
    
    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const supervisorId = searchParams.get('supervisorId')
    const fromDate = searchParams.get('from')
    const toDate = searchParams.get('to')

    // Check Enterprise Studio access for supervision user
    const supervisionUser = await getSupervisionUser(user.id)
    if (!supervisionUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get availability blocks
    let availability: any[]
    
    if (supervisorId === 'me' || supervisorId === user.id) {
      // Get my availability blocks
      const from = fromDate ? new Date(fromDate) : undefined
      const to = toDate ? new Date(toDate) : undefined
      
      availability = await StudioSupervisionService.getAvailabilityForSupervisor(user.id, from, to)
    } else if (supervisorId) {
      // Get specific supervisor's published availability (for apprentices)
      const from = fromDate ? new Date(fromDate) : undefined
      const to = toDate ? new Date(toDate) : undefined
      
      // Check if user is apprentice or admin
      const supervisionUser = await getSupervisionUser(user.id)
      if (!supervisionUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      
      const accessCheck = checkStudioSupervisionAccess(supervisionUser)
      if (!accessCheck.canAccess || 
          (accessCheck.userRole !== 'APPRENTICE' && accessCheck.userRole !== 'ADMIN')) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }
      
      availability = await StudioSupervisionService.getAvailabilityForSupervisor(supervisorId, from, to)
    } else {
      // Get all available blocks for booking (apprentice view)
      const from = fromDate ? new Date(fromDate) : new Date()
      const to = toDate ? new Date(toDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      
      // Check if user is apprentice
      const supervisionUser = await getSupervisionUser(user.id)
      if (!supervisionUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      
      const accessCheck = checkStudioSupervisionAccess(supervisionUser)
      if (!accessCheck.canAccess || accessCheck.userRole !== 'APPRENTICE') {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }
      
      availability = await StudioSupervisionService.getAvailableBlocksForBooking(from, to)
    }

    return NextResponse.json({ 
      success: true, 
      availability 
    })

  } catch (error: any) {
    console.error('Error fetching supervision availability:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Get auth token
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = await AuthService.verifyToken(token)
    
    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const availabilityId = searchParams.get('id')
    
    if (!availabilityId) {
      return NextResponse.json({ error: "Availability ID is required" }, { status: 400 })
    }

    // Check Enterprise Studio access
    const supervisionUser = await getSupervisionUser(user.id)
    if (!supervisionUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const accessCheck = canPublishAvailability(supervisionUser)
    if (!accessCheck) {
      return NextResponse.json({ 
        error: "Enterprise Studio Supervision requires Studio ($99/month) subscription and INSTRUCTOR role" 
      }, { status: 403 })
    }

    const data = await req.json()

    // Update availability block (ensure supervisor owns it)
    await prisma.$queryRaw`
      UPDATE supervision_availability 
      SET start_utc = ${data.startUtc ? new Date(data.startUtc) : null},
          end_utc = ${data.endUtc ? new Date(data.endUtc) : null},
          location = ${data.location || null},
          notes = ${data.notes || null},
          capacity = ${data.capacity || null},
          buffer_minutes = ${data.bufferMinutes || null},
          is_published = ${data.isPublished !== undefined ? data.isPublished : null},
          updated_at = NOW()
      WHERE id = ${availabilityId}
      AND supervisor_id = ${user.id}
      RETURNING *
    `

    return NextResponse.json({ 
      success: true, 
      message: 'Availability updated successfully'
    })

  } catch (error: any) {
    console.error('Error updating supervision availability:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update availability' },
      { status: 400 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Get auth token
    const authHeader = req.headers.get("authorization")
    if (!authHeader || authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = await AuthService.verifyToken(token)
    
    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const availabilityId = searchParams.get('id')
    
    if (!availabilityId) {
      return NextResponse.json({ error: "Availability ID is required" }, { status: 400 })
    }

    // Check Enterprise Studio access
    const supervisionUser = await getSupervisionUser(user.id)
    if (!supervisionUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const accessCheck = canPublishAvailability(supervisionUser)
    if (!accessCheck) {
      return NextResponse.json({ 
        error: "Enterprise Studio Supervision requires Studio ($99/month) subscription and INSTRUCTOR role" 
      }, { status: 403 })
    }

    // Check if there are any bookings that would be affected
    const bookings = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM supervision_booking 
      WHERE availability_id = ${availabilityId} 
      AND status IN ('CONFIRMED', 'REQUESTED')
    `

    if ((bookings as any).count > 0) {
      return NextResponse.json({ 
        error: "Cannot delete availability with active bookings"
      }, { status: 400 })
    }

    // Delete availability block
    await prisma.$queryRaw`
      DELETE FROM supervision_availability 
      WHERE id = ${availabilityId}
      AND supervisor_id = ${user.id}
    `

    return NextResponse.json({ 
      success: true, 
      message: 'Availability deleted successfully'
    })

  } catch (error: any) {
    console.error('Error deleting supervision availability:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete availability' },
      { status: 400 }
    )
  }
}
