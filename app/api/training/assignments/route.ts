import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

const MANAGE_ROLES = ['owner', 'director', 'manager', 'instructor']

function parseFloatOrNull(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const parsed = typeof value === 'number' ? value : parseFloat(String(value))
  return Number.isNaN(parsed) ? null : parsed
}

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')

    if (userEmail) {
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { id: true }
      })

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    const assignments = await prisma.trainingAssignment.findMany({
      orderBy: [
        { weekId: 'asc' },
        { order: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      assignments
    })
  } catch (error) {
    console.error('Training assignments GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load assignments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, role: true }
    })

    const role = user?.role?.toLowerCase() || ''
    if (!user || !MANAGE_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      weekId,
      title,
      description,
      dueDateLabel,
      dueDateISO,
      status,
      estimatedHours,
      rubric
    } = body || {}

    if (!weekId || !title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields.' },
        { status: 400 }
      )
    }

          // Calculate order based on max order in the week + 1
          const maxOrderResult = await prisma.trainingAssignment.aggregate({
            where: { weekId },
            _max: { order: true }
          })
          const maxOrder = maxOrderResult._max.order ?? 0
          const newOrder = maxOrder + 1

          const newAssignment = await prisma.trainingAssignment.create({
            data: {
              weekId,
              title: title.trim(),
              description: (description || '').trim(),
              dueDateLabel: (dueDateLabel || 'Due date shared in class').trim(),
              dueDateISO: dueDateISO || null,
              status: (status || 'pending').toLowerCase(),
              estimatedHours: parseFloatOrNull(estimatedHours),
              rubric: rubric ? String(rubric) : null,
              order: newOrder,
              createdBy: user.id
            }
          })

    return NextResponse.json({
      success: true,
      assignment: newAssignment
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2021') {
        console.error('Training assignments POST missing table:', error)
        return NextResponse.json({ success: false, error: 'Training assignments table not found. Please run the latest Prisma migrations.' }, { status: 500 })
      }
      if (error.code === 'P2003') {
        console.error('Training assignments POST foreign key error:', error)
        return NextResponse.json({ success: false, error: 'Assignment could not reference its creator. Ensure the user exists in the database.' }, { status: 400 })
      }
    }
    console.error('Training assignments POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create assignment' },
      { status: 500 }
    )
  }
}

