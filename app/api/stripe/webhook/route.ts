import { type NextRequest, NextResponse } from "next/server"
import { stripe, validateStripeConfig } from "@/lib/stripe"
import Stripe from "stripe"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature provided" }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
  }

  // Validate Stripe configuration
  try {
    validateStripeConfig()
  } catch (error) {
    console.error("Stripe configuration error:", error)
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
  }

  if (!stripe) {
    return NextResponse.json({ error: "Stripe client not initialized" }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Checkout session completed:', session.id)
        
        // Handle successful subscription creation
        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription as string
          const customerId = session.customer as string
          const plan = session.metadata?.plan
          
          // TODO: Update user record in your database
          // Example: await updateUserSubscription(customerId, subscriptionId, plan)
          console.log(`New subscription: ${subscriptionId} for customer: ${customerId} on plan: ${plan}`)
        }
        break

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription
        console.log('Subscription updated:', updatedSubscription.id)
        
        // Handle subscription changes (plan changes, etc.)
        // TODO: Update user subscription in database
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        console.log('Subscription canceled:', deletedSubscription.id)
        
        // Handle subscription cancellation
        // TODO: Update user record to remove subscription access
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment succeeded for invoice:', invoice.id)
        
        // Handle successful payment
        // TODO: Extend user's subscription period
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice
        console.log('Payment failed for invoice:', failedInvoice.id)
        
        // Handle failed payment
        // TODO: Send notification to user about failed payment
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      { error: "Error processing webhook" }, 
      { status: 500 }
    )
  }
}
