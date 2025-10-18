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

    // For now, return mock data for student hours
    // TODO: Implement actual time tracking when TimeBlock model is properly set up
    const studentHours = students.map(student => ({
      id: student.id,
      name: student.name,
      email: student.email,
      totalHours: 0, // Mock data
      procedures: 0, // Mock data
      lastActivity: student.createdAt,
      procedureTypes: [] // Mock data
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