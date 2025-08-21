import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      artistId,
      stripeAccountId,
      amount,
      currency = 'usd',
      description,
      metadata
    } = body

    // Validate required fields
    if (!artistId || !stripeAccountId || !amount || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Convert amount to cents for Stripe
    const amountInCents = Math.round(amount * 100)

    // Create transfer to the connected account
    const transfer = await stripe.transfers.create({
      amount: amountInCents,
      currency,
      destination: stripeAccountId,
      description,
      metadata: {
        artistId,
        platform: 'PMU Pro',
        ...metadata
      }
    })

    // Create payout from the connected account
    const payout = await stripe.payouts.create({
      amount: amountInCents,
      currency,
      stripe_account: stripeAccountId,
      metadata: {
        artistId,
        transferId: transfer.id,
        platform: 'PMU Pro'
      }
    }, {
      stripeAccount: stripeAccountId
    })

    return NextResponse.json({
      success: true,
      transferId: transfer.id,
      payoutId: payout.id,
      amount: amountInCents / 100,
      currency,
      status: payout.status
    })
  } catch (error) {
    console.error('Stripe Connect payout creation error:', error)
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create payout' 
      },
      { status: 500 }
    )
  }
}
