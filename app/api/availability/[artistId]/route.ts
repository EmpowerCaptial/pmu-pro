import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/availability/[artistId]?date=2024-01-15
// Returns available time slots for an artist on a specific date
export async function GET(
  request: NextRequest,
  { params }: { params: { artistId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 })
    }

    const artistId = params.artistId

    // Get artist's existing appointments for the date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        userId: artistId,
        startTime: {
          gte: new Date(`${date}T00:00:00`),
          lt: new Date(`${date}T23:59:59`)
        },
        status: {
          not: 'cancelled'
        }
      },
      select: {
        startTime: true,
        endTime: true,
        duration: true
      }
    })

    // Get artist's time blocks for the date (from mock data for now)
    // In production, this would query the database
    const timeBlocksResponse = await fetch(
      `${request.nextUrl.origin}/api/time-blocks?userId=${artistId}&date=${date}`,
      { headers: request.headers }
    )
    
    let timeBlocks: any[] = []
    if (timeBlocksResponse.ok) {
      const timeBlocksData = await timeBlocksResponse.json()
      timeBlocks = timeBlocksData.data || []
    }

    // Generate all possible time slots (9 AM to 8 PM, 30-minute intervals)
    const allSlots: Array<{ time: string; display: string; available: boolean }> = []
    
    for (let hour = 9; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 20 && minute > 0) break // Stop at 8:00 PM
        
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        let display: string
        
        if (hour === 12) {
          display = `12:${minute.toString().padStart(2, '0')} PM`
        } else if (hour > 12) {
          display = `${hour - 12}:${minute.toString().padStart(2, '0')} PM`
        } else {
          display = `${hour}:${minute.toString().padStart(2, '0')} AM`
        }
        
        allSlots.push({ time, display, available: true })
      }
    }

    // Helper function to convert time string to minutes since midnight
    const timeToMinutes = (timeStr: string): number => {
      const [hours, minutes] = timeStr.split(':').map(Number)
      return hours * 60 + minutes
    }
    
    // Mark slots as unavailable based on time blocks
    const unavailableBlocks = timeBlocks.filter((block: any) => block.type === 'unavailable')
    
    for (const slot of allSlots) {
      const slotMinutes = timeToMinutes(slot.time)
      const slotEndMinutes = slotMinutes + 30 // 30-minute slot
      
      // Check if slot conflicts with unavailable time blocks
      for (const block of unavailableBlocks) {
        const blockStartMinutes = timeToMinutes(block.startTime)
        const blockEndMinutes = timeToMinutes(block.endTime)
        
        // Check for overlap: slot overlaps if it starts before block ends AND ends after block starts
        if (slotMinutes < blockEndMinutes && slotEndMinutes > blockStartMinutes) {
          slot.available = false
          break
        }
      }
      
      // Check if slot conflicts with existing appointments
      if (slot.available) {
        for (const appointment of existingAppointments) {
          const appointmentStart = new Date(appointment.startTime)
          const appointmentEnd = new Date(appointment.endTime)
          const slotStart = new Date(`${date}T${slot.time}:00`)
          const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000) // 30-minute slot
          
          // Check for overlap
          if (slotStart < appointmentEnd && slotEnd > appointmentStart) {
            slot.available = false
            break
          }
        }
      }
    }

    // Filter to only available slots
    const availableSlots = allSlots.filter(slot => slot.available)

    return NextResponse.json({
      success: true,
      date,
      artistId,
      totalSlots: allSlots.length,
      availableSlots: availableSlots.length,
      slots: availableSlots,
      allSlots: allSlots, // Include all slots for debugging
      blockedBy: {
        appointments: existingAppointments.length,
        timeBlocks: unavailableBlocks.length
      }
    })

  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

