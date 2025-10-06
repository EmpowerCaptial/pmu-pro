import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = request.headers.get('x-user-email')
    const studioName = searchParams.get('studioName')

    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }

    // Get the requesting user
    const requestingUser = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!requestingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has permission to view student hours
    const canViewStudentHours = requestingUser.role === 'owner' || 
                               requestingUser.role === 'manager' || 
                               requestingUser.role === 'director' ||
                               requestingUser.role === 'instructor'

    if (!canViewStudentHours) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get all students in the same studio
    const students = await prisma.user.findMany({
      where: {
        role: {
          in: ['student', 'apprentice']
        },
        studioName: studioName || requestingUser.studioName
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studioName: true
      }
    })

    // For now, return mock data for student hours
    // In a real implementation, you'd have a separate table for clock entries
    const studentHours = students.map(student => ({
      id: student.id,
      name: student.name,
      email: student.email,
      role: student.role,
      totalHours: Math.floor(Math.random() * 500) + 100, // Mock hours between 100-600
      recentEntries: [
        {
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          hours: Math.floor(Math.random() * 8) + 4
        },
        {
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          hours: Math.floor(Math.random() * 8) + 4
        },
        {
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          hours: Math.floor(Math.random() * 8) + 4
        }
      ]
    }))

    return NextResponse.json({ 
      success: true, 
      students: studentHours 
    })

  } catch (error) {
    console.error('Error fetching student hours:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch student hours',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
