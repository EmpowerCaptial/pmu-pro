import { type NextRequest, NextResponse } from "next/server"
import { stripe, validateStripeConfig } from "@/lib/stripe"
import Stripe from "stripe"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to update user subscription
async function updateUserSubscription(email: string, subscriptionData: {
  stripeCustomerId: string
  stripeSubscriptionId: string
  subscriptionStatus: string
  hasActiveSubscription: boolean
}) {
  try {
    await prisma.user.update({
      where: { email },
      data: {
        stripeCustomerId: subscriptionData.stripeCustomerId,
        stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
        subscriptionStatus: subscriptionData.subscriptionStatus,
        hasActiveSubscription: subscriptionData.hasActiveSubscription
      }
    })
  } catch (error) {
    console.error('Error updating user in database:', error)
    throw error
  }
}

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
          
          try {
            // Get subscription details from Stripe
            const subscription = await stripe.subscriptions.retrieve(subscriptionId)
            
            // Find user by email (from session metadata or customer email)
            const userEmail = session.customer_details?.email || session.metadata?.email
            
            if (userEmail) {
              // Update user subscription in database
              await updateUserSubscription(userEmail, {
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                subscriptionStatus: subscription.status,
                hasActiveSubscription: subscription.status === 'active' || subscription.status === 'trialing'
              })
              
              console.log(`Updated user subscription: ${userEmail} - Status: ${subscription.status}`)
            }
          } catch (error) {
            console.error('Error updating user subscription:', error)
          }
        }
        break

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription
        console.log('Subscription updated:', updatedSubscription.id)
        
        try {
          // Find user by subscription ID
          const user = await prisma.user.findFirst({
            where: { stripeSubscriptionId: updatedSubscription.id }
          })
          
          if (user) {
            await updateUserSubscription(user.email, {
              stripeCustomerId: updatedSubscription.customer as string,
              stripeSubscriptionId: updatedSubscription.id,
              subscriptionStatus: updatedSubscription.status,
              hasActiveSubscription: updatedSubscription.status === 'active' || updatedSubscription.status === 'trialing'
            })
            
            console.log(`Updated subscription for user: ${user.email} - Status: ${updatedSubscription.status}`)
          }
        } catch (error) {
          console.error('Error updating subscription:', error)
        }
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        console.log('Subscription canceled:', deletedSubscription.id)
        
        try {
          // Find user by subscription ID and deactivate subscription
          const user = await prisma.user.findFirst({
            where: { stripeSubscriptionId: deletedSubscription.id }
          })
          
          if (user) {
            await updateUserSubscription(user.email, {
              stripeCustomerId: deletedSubscription.customer as string,
              stripeSubscriptionId: deletedSubscription.id,
              subscriptionStatus: 'canceled',
              hasActiveSubscription: false
            })
            
            console.log(`Deactivated subscription for user: ${user.email}`)
          }
        } catch (error) {
          console.error('Error deactivating subscription:', error)
        }
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment succeeded for invoice:', invoice.id)
        
        try {
          // Access subscription ID from invoice data
          const subscriptionId = (invoice as any).subscription
          if (subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId)
            const user = await prisma.user.findFirst({
              where: { stripeSubscriptionId: subscription.id }
            })
            
            if (user) {
              await updateUserSubscription(user.email, {
                stripeCustomerId: subscription.customer as string,
                stripeSubscriptionId: subscription.id,
                subscriptionStatus: subscription.status,
                hasActiveSubscription: subscription.status === 'active' || subscription.status === 'trialing'
              })
              
              console.log(`Payment succeeded for user: ${user.email}`)
            }
          }
        } catch (error) {
          console.error('Error handling successful payment:', error)
        }
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice
        console.log('Payment failed for invoice:', failedInvoice.id)
        
        try {
          const subscriptionId = (failedInvoice as any).subscription
          if (subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId)
            const user = await prisma.user.findFirst({
              where: { stripeSubscriptionId: subscription.id }
            })
            
            if (user) {
              await updateUserSubscription(user.email, {
                stripeCustomerId: subscription.customer as string,
                stripeSubscriptionId: subscription.id,
                subscriptionStatus: subscription.status,
                hasActiveSubscription: false
              })
              
              console.log(`Payment failed for user: ${user.email} - Status: ${subscription.status}`)
            }
          }
        } catch (error) {
          console.error('Error handling failed payment:', error)
        }
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
