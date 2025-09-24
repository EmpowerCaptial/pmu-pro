import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export const dynamic = "force-dynamic"

// GET /api/financial/daily - Get daily financial data
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

    // Calculate today's date range
    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)

    // Get today's appointments
    const todaysAppointments = await prisma.appointment.findMany({
      where: {
        userId: user.id,
        startTime: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ['completed', 'confirmed']
        }
      }
    })

    // Calculate today's revenue
    const todaysRevenue = todaysAppointments.reduce((sum, appointment) => {
      return sum + (appointment.price || 0)
    }, 0)

    const transactionCount = todaysAppointments.length

    // Get Stripe balance if user has Stripe Connect account
    let stripeBalance = 0
    let canPayout = false
    
    try {
      if (user.stripeId) {
        // Get Stripe Connect account balance
        const balance = await stripe.balance.retrieve({
          stripeAccount: user.stripeId
        })
        
        // Calculate available balance (immediately available)
        stripeBalance = balance.available.reduce((sum, item) => {
          return sum + item.amount
        }, 0) / 100 // Convert from cents to dollars
        
        // Check if payout is possible (minimum $1.00)
        canPayout = stripeBalance >= 1.00
      }
    } catch (stripeError) {
      console.error('Error fetching Stripe balance:', stripeError)
      // Continue without Stripe data
    }

    // Calculate system balance (money in the system but not yet transferred to Stripe)
    // This would be appointments that are completed but not yet processed for payout
    const systemBalance = todaysRevenue * 0.1 // Example: 10% of today's revenue is system balance

    return NextResponse.json({
      todaysRevenue,
      stripeBalance,
      systemBalance,
      transactionCount,
      canPayout,
      date: startOfDay.toISOString()
    })

  } catch (error) {
    console.error('Error fetching daily financial data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch daily financial data' },
      { status: 500 }
    )
  }
}

// POST /api/financial/daily - Process immediate payout
export async function POST(request: NextRequest) {
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

    if (!user.stripeId) {
      return NextResponse.json({ error: 'Stripe Connect account not set up' }, { status: 400 })
    }

    // Get current Stripe balance
    const balance = await stripe.balance.retrieve({
      stripeAccount: user.stripeId
    })

    const availableBalance = balance.available.reduce((sum, item) => {
      return sum + item.amount
    }, 0)

    if (availableBalance < 100) { // $1.00 minimum in cents
      return NextResponse.json({ error: 'Insufficient balance for payout' }, { status: 400 })
    }

    // Create instant payout
    const payout = await stripe.transfers.create({
      amount: availableBalance,
      currency: 'usd',
      destination: user.stripeId,
      transfer_group: `payout_${Date.now()}`
    }, {
      stripeAccount: user.stripeId
    })

    return NextResponse.json({
      success: true,
      payoutId: payout.id,
      amount: availableBalance / 100, // Convert from cents to dollars
      status: payout.status
    })

  } catch (error) {
    console.error('Error processing payout:', error)
    return NextResponse.json(
      { error: 'Failed to process payout' },
      { status: 500 }
    )
  }
}
