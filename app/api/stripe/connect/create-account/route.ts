import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with conditional API key
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
}) : null

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const { artistId, artistName, artistEmail, businessType, country, currency } = body

    // Create Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: country || 'US',
      email: artistEmail,
      business_type: businessType || 'individual',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      settings: {
        payouts: {
          schedule: {
            interval: 'daily',
          },
        },
      },
    })

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/stripe-connect?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/stripe-connect?success=true`,
      type: 'account_onboarding',
    })

    // Store account information (in a real app, this would go to a database)
    // For now, we'll return the account info
    
    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        status: account.details_submitted ? 'active' : 'pending',
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        requirements: account.requirements?.currently_due || [],
      },
      accountLink: accountLink.url,
    })
  } catch (error: any) {
    console.error('Stripe Connect error:', error)
    
    // Return more specific error information
    let errorMessage = 'Failed to create Stripe Connect account'
    let errorCode = 'STRIPE_ERROR'
    
    if (error.type) {
      errorCode = error.type
      switch (error.type) {
        case 'invalid_request_error':
          errorMessage = 'Invalid request to Stripe. Please check your Stripe configuration.'
          break
        case 'api_error':
          errorMessage = 'Stripe API error. Please try again later.'
          break
        case 'authentication_error':
          errorMessage = 'Stripe authentication failed. Please check your API keys.'
          break
        case 'rate_limit_error':
          errorMessage = 'Rate limit exceeded. Please try again later.'
          break
        default:
          errorMessage = error.message || errorMessage
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        errorCode: errorCode,
        details: error.message,
        type: error.type
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    )
  }

  try {
    // In a real app, you'd get the account ID from the database based on the user
    // For now, we'll return a mock response
    return NextResponse.json({
      success: true,
      account: null, // No existing account
    })
  } catch (error) {
    console.error('Stripe account status error:', error)
    return NextResponse.json(
      { error: 'Failed to get account status' },
      { status: 500 }
    )
  }
}
