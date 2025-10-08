import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET /api/admin/tickets - Get all support tickets
export async function GET(request: NextRequest) {
  try {
    // Check if database is available
    await prisma.$connect()
    
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

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
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
      prisma.supportTicket.count({ where })
    ])

    // Calculate ticket metrics
    const metrics = await prisma.supportTicket.groupBy({
      by: ['status'],
      _count: { status: true }
    })

    const priorityMetrics = await prisma.supportTicket.groupBy({
      by: ['priority'],
      _count: { priority: true }
    })

    return NextResponse.json({
      success: true,
      data: tickets,
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
    console.error('Error fetching tickets:', error)
    
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('datasource')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database not configured. Please set up PostgreSQL database in Vercel.',
          data: []
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tickets', data: [] },
      { status: 500 }
    )
  }}

// POST /api/admin/tickets - Create a new ticket
export async function POST(request: NextRequest) {
  try {
    const { title, description, priority, userId, category } = await request.json()

    if (!title || !description || !priority) {
      return NextResponse.json(
        { error: 'Title, description, and priority are required' },
        { status: 400 }
      )
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        title,
        description,
        priority,
        status: 'open',
        category: category || 'general',
        userId: userId || null,
        createdBy: 'admin',
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
      data: ticket
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create ticket' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/tickets - Update ticket status
export async function PUT(request: NextRequest) {
  try {
    const { ticketId, updates } = await request.json()

    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
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

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
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
      data: updatedTicket
    })

  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update ticket' },
      { status: 500 }
    )
  }
}
