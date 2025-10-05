import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getTransactionStripeAccount } from '@/lib/stripe-management'

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
}) : null

interface CreatePaymentCheckoutRequest {
  amount: number
  currency: string
  clientName: string
  clientEmail: string
  items: any[]
  successUrl: string
  cancelUrl: string
  stripeAccountId?: string | null
  isOwnerAccount?: boolean
}

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 })
    }

    const body: CreatePaymentCheckoutRequest = await request.json()
    const { 
      amount, 
      currency, 
      clientName, 
      clientEmail, 
      items, 
      successUrl, 
      cancelUrl,
      stripeAccountId,
      isOwnerAccount
    } = body

    // Validation
    if (!amount || !currency || !clientName || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, currency, clientName, successUrl, cancelUrl' },
        { status: 400 }
      )
    }

    // Create or retrieve customer
    const customer = await stripe.customers.create({
      email: clientEmail,
      name: clientName,
      metadata: {
        source: 'PMU-Pro-Payment'
      }
    })

    // Create checkout session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      line_items: items.map(item => ({
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: item.name || 'PMU Service',
            description: `Service for ${clientName}`,
          },
          unit_amount: Math.round((item.price || 0) * 100), // Convert to cents
        },
        quantity: item.quantity || 1,
      })),
      customer: customer.id,
      success_url: successUrl,
      cancel_url: cancelUrl,
      payment_method_types: ['card', 'klarna', 'affirm', 'afterpay_clearpay'],
      billing_address_collection: 'required',
      metadata: {
        clientName,
        clientEmail,
        paymentType: 'service',
        source: 'PMU-Pro-Payment',
        stripeAccountId: stripeAccountId || 'default',
        isOwnerAccount: isOwnerAccount ? 'true' : 'false'
      }
    }

    let session: Stripe.Checkout.Session

    // For Enterprise Studio, use the specified Stripe account
    if (stripeAccountId && isOwnerAccount) {
      // Use Stripe Connect for owner account
      session = await stripe.checkout.sessions.create(sessionConfig, {
        stripeAccount: stripeAccountId
      })
    } else if (stripeAccountId && !isOwnerAccount) {
      // Use artist's own account
      session = await stripe.checkout.sessions.create(sessionConfig, {
        stripeAccount: stripeAccountId
      })
    } else {
      // Use default account
      session = await stripe.checkout.sessions.create(sessionConfig)
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      message: 'Payment checkout session created successfully'
    })

  } catch (error) {
    console.error('Stripe payment checkout creation error:', error)
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Payment error: ${error.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create payment checkout session' },
      { status: 500 }
    )
  }
}
