import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
}) : null

const prisma = new PrismaClient()

interface SubscribeRequest {
  planId: 'starter' | 'professional' | 'studio'
  userEmail: string
  isTrialUpgrade?: boolean
}

// Stripe price IDs for artist subscription plans
const PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER || process.env.STRIPE_BASIC_PRICE_ID || 'price_starter_monthly',
  professional: process.env.STRIPE_PRICE_PRO || process.env.STRIPE_PREMIUM_PRICE_ID || 'price_professional_monthly', 
  studio: process.env.STRIPE_PRICE_ENTERPRISE || process.env.STRIPE_STUDIO_PRICE_ID || 'price_studio_monthly'
}

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 503 }
      )
    }

    const body: SubscribeRequest = await request.json()
    const { planId, userEmail, isTrialUpgrade } = body

    if (!planId || !userEmail) {
      return NextResponse.json(
        { error: 'Plan ID and user email are required' },
        { status: 400 }
      )
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      // If this is a trial upgrade, create the user
      if (isTrialUpgrade) {
        user = await prisma.user.create({
          data: {
            email: userEmail,
            name: userEmail.split('@')[0],
            password: 'temp-password',
            businessName: 'PMU Studio',
            licenseNumber: '',
            licenseState: '',
            yearsExperience: '',
            isLicenseVerified: true,
            hasActiveSubscription: false,
            subscriptionStatus: 'trial',
            role: 'user'
          }
        })
        console.log(`Created user for trial upgrade: ${userEmail}`)
      } else {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
    }

    // Get the price ID for the selected plan
    const priceId = PRICE_IDS[planId]
    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        name: user.name,
        metadata: {
          userId: user.id,
          plan: planId
        }
      })
      customerId = customer.id

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      })
    }

    // Create checkout session for subscription
    const origin = new URL(request.url).origin
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        plan: planId,
        type: 'artist_subscription',
        isTrialUpgrade: isTrialUpgrade?.toString() || 'false'
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plan: planId,
          type: 'artist_subscription',
          isTrialUpgrade: isTrialUpgrade?.toString() || 'false'
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      payment_method_collection: 'always'
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url
    })

  } catch (error) {
    console.error('Artist subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription session' },
      { status: 500 }
    )
  }
}
