import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET /api/team-messages - Get messages for current user
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Missing user email' }, { status: 401 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, studioName: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all messages (sent and received) - exclude deleted messages
    const [sentMessages, receivedMessages] = await Promise.all([
      prisma.teamMessage.findMany({
        where: { 
          senderId: user.id,
          isDeleted: false // Exclude deleted messages from sender's view
        },
        include: {
          recipient: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.teamMessage.findMany({
        where: { 
          recipientId: user.id,
          isArchived: false // Exclude archived messages from recipient's inbox
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ])

    return NextResponse.json({
      sentMessages,
      receivedMessages,
      unreadCount: receivedMessages.filter(m => !m.isRead).length
    })

  } catch (error) {
    console.error('Error fetching team messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/team-messages - Send a message
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Missing user email' }, { status: 401 })
    }

    const body = await request.json()
    const { recipientId, subject, message } = body

    if (!recipientId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Find sender
    const sender = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, studioName: true, role: true }
    })

    if (!sender) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify recipient exists and is in same studio
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true, studioName: true, role: true }
    })

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    // Verify they're in the same studio (or sender is owner)
    if (sender.studioName !== recipient.studioName && sender.role !== 'owner') {
      return NextResponse.json({ error: 'Can only message team members in your studio' }, { status: 403 })
    }

    // Create message
    const teamMessage = await prisma.teamMessage.create({
      data: {
        senderId: sender.id,
        recipientId,
        subject: subject || null,
        message
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({ message: teamMessage }, { status: 201 })

  } catch (error) {
    console.error('Error sending team message:', error)
    return NextResponse.json(
      { error: 'Failed to send message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PUT /api/team-messages - Mark message as read, archive, or delete
export async function PUT(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'Missing user email' }, { status: 401 })
    }

    const body = await request.json()
    const { messageId, action } = body

    if (!messageId) {
      return NextResponse.json({ error: 'Missing message ID' }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let updateData: any = {}
    let whereClause: any = { id: messageId }

    if (action === 'read') {
      // Mark as read (only if user is the recipient)
      updateData = {
        isRead: true,
        readAt: new Date()
      }
      whereClause.recipientId = user.id
    } else if (action === 'archive') {
      // Archive message (only if user is the recipient)
      updateData = {
        isArchived: true
      }
      whereClause.recipientId = user.id
    } else if (action === 'delete') {
      // Delete message (only if user is the sender)
      updateData = {
        isDeleted: true
      }
      whereClause.senderId = user.id
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update message
    const message = await prisma.teamMessage.updateMany({
      where: whereClause,
      data: updateData
    })

    if (message.count === 0) {
      return NextResponse.json({ error: 'Message not found or access denied' }, { status: 404 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error updating team message:', error)
    return NextResponse.json(
      { error: 'Failed to update message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

