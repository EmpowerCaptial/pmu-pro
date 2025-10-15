import { NextRequest, NextResponse } from 'next/server'
import { TimeBlockRequest, validateTimeBlock } from '@/lib/time-blocks'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/time-blocks - Get time blocks for a user and date range
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Build query for database
    const where: any = { userId }

    if (date) {
      where.date = date
    } else if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate
      }
    }

    // Fetch from database
    const blocks = await prisma.timeBlock.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    })

    // Convert to expected format (Prisma returns createdAt/updatedAt as Date objects)
    const formattedBlocks = blocks.map(block => ({
      ...block,
      createdAt: block.createdAt.toISOString(),
      updatedAt: block.updatedAt.toISOString()
    }))

    return NextResponse.json({ success: true, data: formattedBlocks })
  } catch (error: any) {
    console.error('Error fetching time blocks:', error)
    return NextResponse.json({ error: 'Failed to fetch time blocks', details: error.message }, { status: 500 })
  }
}

// POST /api/time-blocks - Create a new time block
export async function POST(request: NextRequest) {
  try {
    const body: TimeBlockRequest = await request.json()
    
    // Validate the time block
    const errors = validateTimeBlock(body)
    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 })
    }

    if (!body.userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Create new time block in database
    const newBlock = await prisma.timeBlock.create({
      data: {
        userId: body.userId,
        date: body.date,
        startTime: body.startTime,
        endTime: body.endTime,
        type: body.type,
        title: body.title,
        notes: body.notes || null,
        isRecurring: body.isRecurring || false,
        recurringPattern: body.recurringPattern || null,
        recurringEndDate: body.recurringEndDate || null
      }
    })

    // Convert to expected format
    const formattedBlock = {
      ...newBlock,
      createdAt: newBlock.createdAt.toISOString(),
      updatedAt: newBlock.updatedAt.toISOString()
    }

    return NextResponse.json({ success: true, data: formattedBlock })
  } catch (error: any) {
    console.error('Error creating time block:', error)
    return NextResponse.json({ error: 'Failed to create time block', details: error.message }, { status: 500 })
  }
}

// PUT /api/time-blocks - Update an existing time block
export async function PUT(request: NextRequest) {
  try {
    const body: TimeBlockRequest & { id: string } = await request.json()
    
    if (!body.id) {
      return NextResponse.json({ error: 'Time block ID is required' }, { status: 400 })
    }

    // Validate the time block
    const errors = validateTimeBlock(body)
    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 })
    }

    // Update in database
    const updatedBlock = await prisma.timeBlock.update({
      where: { id: body.id },
      data: {
        date: body.date,
        startTime: body.startTime,
        endTime: body.endTime,
        type: body.type,
        title: body.title,
        notes: body.notes || null,
        isRecurring: body.isRecurring || false,
        recurringPattern: body.recurringPattern || null,
        recurringEndDate: body.recurringEndDate || null
      }
    })

    // Convert to expected format
    const formattedBlock = {
      ...updatedBlock,
      createdAt: updatedBlock.createdAt.toISOString(),
      updatedAt: updatedBlock.updatedAt.toISOString()
    }

    return NextResponse.json({ success: true, data: formattedBlock })
  } catch (error: any) {
    console.error('Error updating time block:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Time block not found' }, { status: 404 })
    }
    
    return NextResponse.json({ error: 'Failed to update time block', details: error.message }, { status: 500 })
  }
}

// DELETE /api/time-blocks - Delete a time block
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Time block ID is required' }, { status: 400 })
    }

    // Delete from database
    await prisma.timeBlock.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Time block deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting time block:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Time block not found' }, { status: 404 })
    }
    
    return NextResponse.json({ error: 'Failed to delete time block', details: error.message }, { status: 500 })
  }
}
