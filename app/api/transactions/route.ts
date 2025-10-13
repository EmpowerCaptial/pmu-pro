import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/transactions - Record a cash/non-Stripe transaction
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')

    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }

    const body = await request.json()
    const { 
      clientName, 
      clientEmail, 
      clientPhone, 
      items, 
      subtotal, 
      tax, 
      tip, 
      discount,
      total, 
      paymentMethod 
    } = body

    if (!total || !paymentMethod) {
      return NextResponse.json({ error: 'Total and payment method required' }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find or create client
    let client = null
    if (clientEmail) {
      client = await prisma.client.findFirst({
        where: { 
          userId: user.id,
          email: clientEmail 
        }
      })
    } else if (clientName) {
      client = await prisma.client.findFirst({
        where: { 
          userId: user.id,
          name: clientName 
        }
      })
    }

    // If no client found, create one
    if (!client && clientName) {
      client = await prisma.client.create({
        data: {
          userId: user.id,
          name: clientName,
          email: clientEmail || null,
          phone: clientPhone || null
        }
      })
    }

    // Create appointment record for this transaction
    // Note: clientId is required, so we must ensure a client exists
    const finalClientId = client?.id
    
    if (!finalClientId) {
      return NextResponse.json({ 
        error: 'Client required',
        message: 'Unable to find or create client for this transaction'
      }, { status: 400 })
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: user.id,
        clientId: finalClientId,
        serviceType: items?.map((i: any) => i.name).join(', ') || 'POS Transaction',
        title: `POS - ${paymentMethod.toUpperCase()}`,
        duration: 60,
        startTime: new Date(),
        endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour duration
        price: total,
        status: 'completed',
        paymentStatus: 'paid',
        notes: `POS Transaction - ${paymentMethod}\nSubtotal: $${(subtotal || 0).toFixed(2)}\nTax: $${(tax || 0).toFixed(2)}\nTip: $${(tip || 0).toFixed(2)}\nDiscount: $${(discount || 0).toFixed(2)}\nTotal: $${total.toFixed(2)}`
      }
    })

    return NextResponse.json({ 
      success: true, 
      appointmentId: appointment.id,
      message: 'Transaction recorded successfully' 
    })

  } catch (error) {
    console.error('Error recording transaction:', error)
    return NextResponse.json({ 
      error: 'Failed to record transaction',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

