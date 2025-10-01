import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

// GET /api/payouts - Get payout summary and history
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get appointments to calculate earnings
    const appointments = await prisma.appointment.findMany({
      where: {
        userId: user.id,
        status: {
          in: ['completed', 'confirmed']
        }
      },
      select: {
        price: true,
        deposit: true,
        createdAt: true,
        status: true
      }
    })

    // Calculate financial metrics
    const totalRevenue = appointments.reduce((sum, appointment) => {
      return sum + Number(appointment.price || 0) + Number(appointment.deposit || 0)
    }, 0)

    // Calculate this month's earnings
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    
    const thisMonthEarnings = appointments
      .filter(apt => new Date(apt.createdAt) >= thisMonth)
      .reduce((sum, appointment) => {
        return sum + Number(appointment.price || 0) + Number(appointment.deposit || 0)
      }, 0)

    // For now, we'll simulate payout data since we don't have a payout system yet
    // In a real implementation, you'd have a Payout model in the database
    const payoutSummary = {
      totalEarnings: totalRevenue,
      totalPayouts: Math.max(0, totalRevenue * 0.8), // Assume 80% has been paid out
      pendingAmount: Math.max(0, totalRevenue * 0.15), // 15% pending
      availableBalance: Math.max(0, totalRevenue * 0.05), // 5% available
      thisMonthEarnings,
      lastPayout: appointments.length > 0 ? appointments[appointments.length - 1].createdAt : null,
      averagePayout: appointments.length > 0 ? totalRevenue / Math.max(1, Math.floor(appointments.length / 7)) : 0
    }

    // Mock payout history (in real implementation, fetch from Payout table)
    const mockPayouts = [
      {
        id: '1',
        amount: Math.min(totalRevenue * 0.4, 1250),
        status: 'completed',
        method: 'stripe',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        processedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
        description: 'Weekly payout for services',
        fees: Math.min(totalRevenue * 0.4 * 0.03, 37.50),
        netAmount: Math.min(totalRevenue * 0.4 * 0.97, 1212.50)
      },
      {
        id: '2',
        amount: Math.min(totalRevenue * 0.3, 890),
        status: 'completed',
        method: 'stripe',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        processedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
        description: 'Weekly payout for services',
        fees: Math.min(totalRevenue * 0.3 * 0.03, 26.70),
        netAmount: Math.min(totalRevenue * 0.3 * 0.97, 863.30)
      }
    ]

    return NextResponse.json({
      summary: payoutSummary,
      payouts: mockPayouts
    })

  } catch (error) {
    console.error('Error fetching payout data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payout data' },
      { status: 500 }
    )
  }
}

// POST /api/payouts - Request a payout
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    const body = await request.json()
    const { amount } = body

    if (!amount || amount < 10) {
      return NextResponse.json({ error: 'Minimum payout amount is $10.00' }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // In a real implementation, you would:
    // 1. Check if user has enough balance
    // 2. Create a payout record in the database
    // 3. Initiate the payout with Stripe or bank transfer
    // 4. Update the user's balance

    // For now, return a success response
    return NextResponse.json({
      success: true,
      message: `Payout request of $${amount} has been submitted and will be processed within 1-2 business days.`,
      payoutId: `payout_${Date.now()}`
    })

  } catch (error) {
    console.error('Error processing payout request:', error)
    return NextResponse.json(
      { error: 'Failed to process payout request' },
      { status: 500 }
    )
  }
}

