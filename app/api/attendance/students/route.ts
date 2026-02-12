import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET /api/attendance/students - Get students for attendance marking
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

    const where: any = {
      role: {
        in: ['student', 'apprentice']
      }
    }

    // Filter by location based on instructor access
    if (user.role.toLowerCase() === 'instructor' && !user.hasAllLocationAccess) {
      // Instructors without all-location access can only see their location's students
      where.locationId = user.locationId
    } else if (locationId) {
      // Directors/Owners or instructors with all-location access can filter by location
      where.locationId = locationId
    }

    const students = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        locationId: true,
        location: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: students
    })

  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

