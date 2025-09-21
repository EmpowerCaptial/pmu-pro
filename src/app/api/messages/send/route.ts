import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { 
      clientId, 
      messageType, 
      message, 
      subject,
      sendVia = 'email' // email, sms, or both
    } = body

    // Verify client belongs to user
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId: user.id,
        isActive: true
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Generate message content based on type
    let messageContent = message
    let messageSubject = subject || `Message from ${user.businessName}`

    if (messageType === 'appointment') {
      messageSubject = `Appointment Reminder - ${user.businessName}`
      if (!messageContent) {
        messageContent = `Hi ${client.name},\n\nThis is a reminder about your upcoming appointment. Please arrive 10 minutes early.\n\nBest regards,\n${user.businessName}`
      }
    } else if (messageType === 'aftercare') {
      messageSubject = `Aftercare Instructions - ${user.businessName}`
      if (!messageContent) {
        messageContent = `Hi ${client.name},\n\nHere are your aftercare instructions:\n\n• Keep the area clean and dry for 24 hours\n• Apply provided ointment as directed\n• Avoid direct sunlight\n• No swimming for 2 weeks\n\nIf you have any questions, please don't hesitate to contact us.\n\nBest regards,\n${user.businessName}`
      }
    } else if (messageType === 'followup') {
      messageSubject = `Follow-up Check - ${user.businessName}`
      if (!messageContent) {
        messageContent = `Hi ${client.name},\n\nWe hope you're healing well! This is a quick check-in to see how your procedure is progressing.\n\nPlease let us know if you have any concerns or questions.\n\nBest regards,\n${user.businessName}`
      }
    } else if (messageType === 'promotion') {
      messageSubject = `Special Offer - ${user.businessName}`
      if (!messageContent) {
        messageContent = `Hi ${client.name},\n\nWe have a special offer just for you! Contact us to learn more about our current promotions.\n\nBest regards,\n${user.businessName}`
      }
    }

    // For now, we'll just log the message and return success
    // In a real implementation, you would integrate with email/SMS services
    console.log('Message to be sent:', {
      to: client.email || client.phone,
      subject: messageSubject,
      message: messageContent,
      sendVia,
      clientName: client.name,
      businessName: user.businessName
    })

    // Create a message record (you might want to add a messages table to your schema)
    // For now, we'll just return success

    return NextResponse.json({ 
      message: 'Message sent successfully',
      details: {
        clientName: client.name,
        messageType,
        sendVia,
        subject: messageSubject
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
