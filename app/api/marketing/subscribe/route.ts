import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(req: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Stripe is not configured. Please contact support.' 
        },
        { status: 503 }
      )
    }

    const { priceId = 'price_1S4p1m2NnsVhahaHGvMtyPTr', customerId } = await req.json()
    const origin = new URL(req.url).origin

    console.log('Creating Stripe session with priceId:', priceId)

    // Use the actual Stripe product and price
    const params: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription', // Back to subscription mode with real price
      line_items: [{ 
        price: priceId, // Use the actual price ID from Stripe
        quantity: 1 
      }],
      success_url: `${origin}/marketing?subscribe=success`,
      cancel_url: `${origin}/marketing?subscribe=cancel`,
      automatic_tax: { enabled: true },
      billing_address_collection: 'required',
      allow_promotion_codes: true,
      metadata: {
        plan_type: 'marketing_self_serve',
        source: 'marketing_page'
      }
    }

    if (customerId) {
      params.customer = customerId
      params.customer_update = { address: 'auto' }
    }
    // For subscriptions, customer creation is handled automatically

    const session = await stripe.checkout.sessions.create(params)
    
    console.log('Stripe session created:', session.id)
    
    return NextResponse.json({ 
      success: true,
      url: session.url 
    })
    
  } catch (error) {
    console.error('Stripe subscription error:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create subscription session'
    if (error instanceof Error) {
      if (error.message.includes('No such price')) {
        errorMessage = 'Invalid price configuration. Please contact support.'
      } else if (error.message.includes('Invalid API Key')) {
        errorMessage = 'Payment system configuration error. Please contact support.'
      } else {
        errorMessage = `Payment error: ${error.message}`
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage 
      },
      { status: 500 }
    )
  }
}
