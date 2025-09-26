import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/complaints - Get all complaints
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (priority) {
      where.priority = priority
    }

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.complaint.count({ where })
    ])

    // Calculate complaint metrics
    const metrics = await prisma.complaint.groupBy({
      by: ['status'],
      _count: { status: true }
    })

    const priorityMetrics = await prisma.complaint.groupBy({
      by: ['priority'],
      _count: { priority: true }
    })

    return NextResponse.json({
      success: true,
      data: complaints,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      metrics: {
        status: metrics.reduce((acc, metric) => {
          acc[metric.status] = metric._count.status
          return acc
        }, {} as Record<string, number>),
        priority: priorityMetrics.reduce((acc, metric) => {
          acc[metric.priority] = metric._count.priority
          return acc
        }, {} as Record<string, number>)
      }
    })

  } catch (error) {
    console.error('Error fetching complaints:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch complaints' },
      { status: 500 }
    )
  }
}

// POST /api/admin/complaints - Create a new complaint
export async function POST(request: NextRequest) {
  try {
    const { subject, description, priority, userId, category } = await request.json()

    if (!subject || !description || !priority) {
      return NextResponse.json(
        { error: 'Subject, description, and priority are required' },
        { status: 400 }
      )
    }

    const complaint = await prisma.complaint.create({
      data: {
        subject,
        description,
        priority,
        status: 'new',
        category: category || 'general',
        userId: userId || null,
        reportedBy: 'admin',
        assignedTo: null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: complaint
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating complaint:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create complaint' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/complaints - Update complaint status
export async function PUT(request: NextRequest) {
  try {
    const { complaintId, updates } = await request.json()

    if (!complaintId) {
      return NextResponse.json(
        { error: 'Complaint ID is required' },
        { status: 400 }
      )
    }

    const allowedUpdates = [
      'status',
      'priority',
      'assignedTo',
      'resolution',
      'notes'
    ]

    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key]
        return obj
      }, {} as any)

    // Add updated timestamp
    filteredUpdates.updatedAt = new Date()

    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: filteredUpdates,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedComplaint
    })

  } catch (error) {
    console.error('Error updating complaint:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update complaint' },
      { status: 500 }
    )
  }
}
