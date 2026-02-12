import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET /api/attendance/export - Export attendance sheet
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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const format = searchParams.get('format') || 'csv' // 'csv' or 'json'

    const where: any = {}

    // Filter by location based on instructor access
    if (user.role.toLowerCase() === 'instructor' && !user.hasAllLocationAccess) {
      where.locationId = user.locationId
    } else if (locationId) {
      where.locationId = locationId
    }

    if (date) {
      where.date = new Date(date)
    } else if (startDate && endDate) {
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
            name: true,
            email: true
          }
        },
        instructor: {
          select: {
            name: true,
            email: true
          }
        },
        location: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { date: 'desc' },
        { student: { name: 'asc' } }
      ]
    })

    if (format === 'csv') {
      // Generate CSV
      const headers = ['Date', 'Student Name', 'Student Email', 'Status', 'Location', 'Instructor', 'Notes']
      const rows = attendance.map(record => [
        new Date(record.date).toLocaleDateString(),
        record.student.name,
        record.student.email,
        record.status,
        record.location.name,
        record.instructor.name,
        record.notes || ''
      ])

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="attendance-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else {
      // Return JSON
      return NextResponse.json({
        success: true,
        data: attendance
      })
    }

  } catch (error) {
    console.error('Error exporting attendance:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to export attendance' },
      { status: 500 }
    )
  }
}

