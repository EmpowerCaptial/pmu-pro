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
      artistName,
      artistEmail,
      businessType,
      country,
      currency = 'usd'
    } = body

    // Validate required fields
    if (!artistId || !artistName || !artistEmail || !businessType || !country) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country,
      email: artistEmail,
      business_type: businessType,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        url: process.env.NEXT_PUBLIC_BASE_URL,
        mcc: '7299', // Personal Care Services
        product_description: 'PMU (Permanent Makeup) Services',
      },
      tos_acceptance: {
        date: Math.floor(Date.now() / 1000),
        ip: request.ip || '127.0.0.1',
      },
      metadata: {
        artistId,
        artistName,
        platform: 'PMU Pro'
      }
    })

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/stripe-connect/refresh`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/stripe-connect/success`,
      type: 'account_onboarding',
      collect: 'eventually_due',
    })

    return NextResponse.json({
      success: true,
      accountId: account.id,
      accountLink: accountLink.url,
      account: {
        id: account.id,
        status: account.charges_enabled ? 'active' : 'pending',
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        requirements: {
          currentlyDue: account.requirements?.currently_due || [],
          eventuallyDue: account.requirements?.eventually_due || [],
          pastDue: account.requirements?.past_due || [],
          pendingVerification: account.requirements?.pending_verification || [],
          disabled: account.requirements?.disabled || false
        }
      }
    })
  } catch (error) {
    console.error('Stripe Connect account creation error:', error)
    
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
        error: 'Failed to create Stripe Connect account' 
      },
      { status: 500 }
    )
  }
}
