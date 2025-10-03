import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

// GET /api/notifications - Get notifications for a user
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Missing user email' }, { status: 401 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get notifications for this user
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 notifications
    })

    return NextResponse.json({ notifications })

  } catch (error) {
    console.error('Error retrieving notifications:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve notifications' },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    const body = await request.json()
    const { type, title, message, priority = 'medium', actionRequired = false, metadata } = body
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Missing user email' }, { status: 401 })
    }

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Type, title, and message are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        type,
        title,
        message,
        priority,
        actionRequired,
        metadata: metadata || {}
      }
    })

    return NextResponse.json({ 
      success: true, 
      notification,
      message: 'Notification created successfully' 
    })

  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

// PUT /api/notifications - Mark notification as read
export async function PUT(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    const body = await request.json()
    const { notificationId, isRead = true } = body
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Missing user email' }, { status: 401 })
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update notification
    const notification = await prisma.notification.updateMany({
      where: { 
        id: notificationId,
        userId: user.id // Ensure user can only update their own notifications
      },
      data: { isRead }
    })

    if (notification.count === 0) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Notification updated successfully' 
    })

  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}