import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(req: NextRequest) {
  try {
    const { priceId = 'price_selfserve_123', customerId } = await req.json()
    const origin = new URL(req.url).origin

    const params: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [{ 
        price: priceId, 
        quantity: 1 
      }],
      success_url: `${origin}/marketing?subscribe=success`,
      cancel_url: `${origin}/marketing?subscribe=cancel`,
      automatic_tax: { enabled: true },
      billing_address_collection: 'required',
      customer_update: { address: 'auto' },
      allow_promotion_codes: true,
      metadata: {
        plan_type: 'marketing_self_serve',
        source: 'marketing_page'
      }
    }

    if (customerId) {
      params.customer = customerId
    } else {
      params.customer_creation = 'always'
    }

    const session = await stripe.checkout.sessions.create(params)
    
    return NextResponse.json({ 
      success: true,
      url: session.url 
    })
    
  } catch (error) {
    console.error('Stripe subscription error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create subscription session' 
      },
      { status: 500 }
    )
  }
}
