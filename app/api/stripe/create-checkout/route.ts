import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const { priceId, plan, successUrl, cancelUrl } = await request.json()

    if (!priceId) {
      return NextResponse.json({ error: "Price ID is required" }, { status: 400 })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXTAUTH_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXTAUTH_URL}/billing`,
      allow_promotion_codes: true,
      metadata: {
        plan: plan,
      },
      subscription_data: {
        metadata: {
          plan: plan,
        },
      },
    })

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" }, 
      { status: 500 }
    )
  }
}
