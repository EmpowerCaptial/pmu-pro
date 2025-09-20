import { NextRequest, NextResponse } from 'next/server'
import { TimeBlock, TimeBlockRequest, validateTimeBlock } from '@/lib/time-blocks'
import { mockTimeBlocks } from '@/lib/time-blocks'

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

    // Filter mock data based on parameters
    let blocks = mockTimeBlocks.filter(block => block.userId === userId)

    if (date) {
      blocks = blocks.filter(block => block.date === date)
    } else if (startDate && endDate) {
      blocks = blocks.filter(block => block.date >= startDate && block.date <= endDate)
    }

    return NextResponse.json({ success: true, data: blocks })
  } catch (error: any) {
    console.error('Error fetching time blocks:', error)
    return NextResponse.json({ error: 'Failed to fetch time blocks' }, { status: 500 })
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

    // Create new time block
    const newBlock: TimeBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: body.userId || 'demo_artist_001', // TODO: Get from auth
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      type: body.type,
      title: body.title,
      notes: body.notes,
      isRecurring: body.isRecurring || false,
      recurringPattern: body.recurringPattern,
      recurringEndDate: body.recurringEndDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // In a real app, save to database
    // For now, add to mock data
    mockTimeBlocks.push(newBlock)

    return NextResponse.json({ success: true, data: newBlock })
  } catch (error: any) {
    console.error('Error creating time block:', error)
    return NextResponse.json({ error: 'Failed to create time block' }, { status: 500 })
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

    // Find and update the time block
    const blockIndex = mockTimeBlocks.findIndex(block => block.id === body.id)
    if (blockIndex === -1) {
      return NextResponse.json({ error: 'Time block not found' }, { status: 404 })
    }

    const updatedBlock: TimeBlock = {
      ...mockTimeBlocks[blockIndex],
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      type: body.type,
      title: body.title,
      notes: body.notes,
      isRecurring: body.isRecurring || false,
      recurringPattern: body.recurringPattern,
      recurringEndDate: body.recurringEndDate,
      updatedAt: new Date().toISOString()
    }

    mockTimeBlocks[blockIndex] = updatedBlock

    return NextResponse.json({ success: true, data: updatedBlock })
  } catch (error: any) {
    console.error('Error updating time block:', error)
    return NextResponse.json({ error: 'Failed to update time block' }, { status: 500 })
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

    // Find and remove the time block
    const blockIndex = mockTimeBlocks.findIndex(block => block.id === id)
    if (blockIndex === -1) {
      return NextResponse.json({ error: 'Time block not found' }, { status: 404 })
    }

    mockTimeBlocks.splice(blockIndex, 1)

    return NextResponse.json({ success: true, message: 'Time block deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting time block:', error)
    return NextResponse.json({ error: 'Failed to delete time block' }, { status: 500 })
  }
}
