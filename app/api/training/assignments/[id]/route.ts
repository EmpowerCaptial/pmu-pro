import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const MANAGE_ROLES = ['owner', 'director', 'manager', 'instructor']

function parseFloatOrNull(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const parsed = typeof value === 'number' ? value : parseFloat(String(value))
  return Number.isNaN(parsed) ? null : parsed
}

async function requireAuthorizedUser(request: NextRequest) {
  const userEmail = request.headers.get('x-user-email')
  if (!userEmail) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true, role: true }
  })

  if (!user) return null
  const role = user.role?.toLowerCase() || ''
  if (!MANAGE_ROLES.includes(role)) {
    throw new Error('Forbidden')
  }
  return user
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthorizedUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
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
      rubric,
      videoId
    } = body || {}

    if (!weekId || !title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields.' },
        { status: 400 }
      )
    }

    // Check if assignment exists to preserve order
    const existing = await prisma.trainingAssignment.findUnique({
      where: { id: params.id },
      select: { order: true }
    })

    // For new assignments, calculate order based on max order in the week + 1
    // For existing assignments, preserve the existing order
    let orderValue: number
    if (existing) {
      // Preserve existing order when updating
      orderValue = existing.order
    } else {
      // For new assignments, find max order in the week and add 1
      const maxOrderResult = await prisma.trainingAssignment.aggregate({
        where: { weekId },
        _max: { order: true }
      })
      const maxOrder = maxOrderResult._max.order ?? 0
      orderValue = maxOrder + 1
    }

    const updatedAssignment = await prisma.trainingAssignment.upsert({
      where: { id: params.id },
      update: {
        weekId,
        title: title.trim(),
        description: (description || '').trim(),
        dueDateLabel: (dueDateLabel || 'Due date shared in class').trim(),
        dueDateISO: dueDateISO || null,
        status: (status || 'pending').toLowerCase(),
        estimatedHours: parseFloatOrNull(estimatedHours),
        rubric: rubric ? String(rubric) : null,
        videoId: videoId || null,
        // Don't update order - preserve existing order
        order: orderValue
      },
      create: {
        id: params.id,
        weekId,
        title: title.trim(),
        description: (description || '').trim(),
        dueDateLabel: (dueDateLabel || 'Due date shared in class').trim(),
        dueDateISO: dueDateISO || null,
        status: (status || 'pending').toLowerCase(),
        estimatedHours: parseFloatOrNull(estimatedHours),
        rubric: rubric ? String(rubric) : null,
        videoId: videoId || null,
        order: orderValue,
        createdBy: user.id
      }
    })

    return NextResponse.json({
      success: true,
      assignment: updatedAssignment
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update assignment'
    const status = message === 'Forbidden' ? 403 : 500
    if (status === 500) {
      console.error('Training assignment PATCH error:', error)
    }
    return NextResponse.json(
      { success: false, error: status === 403 ? 'Forbidden' : message },
      { status }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuthorizedUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.trainingAssignment.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      )
    }
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }
    console.error('Training assignment DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete assignment' },
      { status: 500 }
    )
  }
}

