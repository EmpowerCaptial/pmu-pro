import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      checkoutSessionId,
      serviceId,
      serviceName,
      amount,
      clientEmail,
      clientName,
      artistId,
      artistName,
      metadata
    } = body

    // Validate required fields
    if (!amount || !clientEmail || !serviceName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Convert amount to cents for Stripe
    const amountInCents = Math.round(amount * 100)

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: serviceName,
              description: `PMU Service: ${serviceName}`,
              metadata: {
                serviceId,
                artistId,
                artistName,
                clientName
              }
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel?session_id={CHECKOUT_SESSION_ID}`,
      customer_email: clientEmail,
      metadata: {
        checkoutSessionId,
        serviceId,
        artistId,
        artistName,
        clientName,
        clientEmail,
        customPrice: metadata.customPrice?.toString() || '',
        gratuityPercentage: metadata.gratuityPercentage?.toString() || '',
        notes: metadata.notes || ''
      },
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      payment_intent_data: {
        metadata: {
          checkoutSessionId,
          serviceId,
          artistId,
          clientId: metadata.clientId,
          customPrice: metadata.customPrice?.toString() || '',
          gratuityPercentage: metadata.gratuityPercentage?.toString() || '',
          notes: metadata.notes || ''
        },
      },
      // Stripe Connect integration
      application_fee_amount: Math.round(amount * 0.10 * 100), // 10% platform fee
      transfer_data: {
        destination: metadata.artistStripeAccountId, // Artist's Stripe Connect account
      },
      allow_promotion_codes: true,
      customer_creation: 'always',
      locale: 'en',
      submit_type: 'pay',
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      redirectUrl: session.url,
    })
  } catch (error) {
    console.error('Stripe checkout session creation error:', error)
    
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
        error: 'Failed to create checkout session' 
      },
      { status: 500 }
    )
  }
}
