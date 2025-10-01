import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Initialize Stripe with conditional API key
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
}) : null

export async function GET(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    )
  }

  try {
    // Get user email from header
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({
        success: true,
        account: null,
        message: 'No user email provided'
      })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { stripeConnectAccountId: true }
    })

    if (!user || !user.stripeConnectAccountId) {
      return NextResponse.json({
        success: true,
        account: null,
        message: 'No Stripe Connect account found for this user'
      })
    }

    // Retrieve account details from Stripe
    const account = await stripe.accounts.retrieve(user.stripeConnectAccountId)
    
    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        status: account.details_submitted ? 'active' : 'pending',
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        requirements: account.requirements?.currently_due || [],
      }
    })
  } catch (error: any) {
    console.error('Stripe account status error:', error)
    
    // If account doesn't exist in Stripe anymore, return null
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json({
        success: true,
        account: null,
        message: 'Stripe account not found'
      })
    }
    
    return NextResponse.json(
      { error: 'Failed to get account status', details: error.message },
      { status: 500 }
    )
  }
}
