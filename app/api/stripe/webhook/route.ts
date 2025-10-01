import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
}) : null

const prisma = new PrismaClient()
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id)
  
  if (session.mode === 'subscription' && session.subscription && stripe) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    await handleSubscriptionUpdated(subscription)
  } else if (session.mode === 'subscription' && session.customer && stripe) {
    // Fallback: if no subscription ID, try to find subscription by customer
    console.log('No subscription ID in session, searching by customer')
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: session.customer as string,
        status: 'active',
        limit: 1
      })
      
      if (subscriptions.data.length > 0) {
        await handleSubscriptionUpdated(subscriptions.data[0])
      }
    } catch (error) {
      console.error('Error finding subscription by customer:', error)
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id)
  
  const customerId = subscription.customer as string
  const metadata = subscription.metadata
  
  if (metadata.type === 'artist_subscription' && metadata.userId) {
    const plan = metadata.plan || 'starter'
    
    try {
      // Try to update existing user
      await prisma.user.update({
        where: { id: metadata.userId },
        data: {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: customerId,
          subscriptionStatus: subscription.status,
          hasActiveSubscription: subscription.status === 'active',
          selectedPlan: plan
        }
      })
      
      console.log(`Updated user ${metadata.userId} subscription to ${plan} plan`)
    } catch (error) {
      // If user doesn't exist, try to find by email from customer
      console.log(`User ${metadata.userId} not found, trying to find by customer email`)
      
      try {
        const customer = await stripe?.customers.retrieve(customerId) as Stripe.Customer
        if (customer.email) {
          // Try to find user by email
          let user = await prisma.user.findUnique({
            where: { email: customer.email }
          })
          
          if (!user) {
            // Create user if doesn't exist
            user = await prisma.user.create({
              data: {
                email: customer.email,
                name: customer.name || customer.email.split('@')[0],
                password: 'temp-password',
                businessName: customer.name || 'PMU Studio',
                phone: customer.phone || '',
                licenseNumber: '',
                licenseState: '',
                yearsExperience: '',
                selectedPlan: plan,
                hasActiveSubscription: subscription.status === 'active',
                isLicenseVerified: true,
                role: 'artist',
                subscriptionStatus: subscription.status,
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscription.id
              }
            })
            console.log(`Created new user ${user.id} for email ${customer.email}`)
          } else {
            // Update existing user
            await prisma.user.update({
              where: { id: user.id },
              data: {
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: customerId,
                subscriptionStatus: subscription.status,
                hasActiveSubscription: subscription.status === 'active',
                selectedPlan: plan
              }
            })
            console.log(`Updated existing user ${user.id} subscription to ${plan} plan`)
          }
        }
      } catch (customerError) {
        console.error('Error handling subscription for non-existent user:', customerError)
      }
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id)
  
  const metadata = subscription.metadata
  
  if (metadata.type === 'artist_subscription' && metadata.userId) {
    // Update user subscription status
    await prisma.user.update({
      where: { id: metadata.userId },
      data: {
        stripeSubscriptionId: null,
        subscriptionStatus: 'canceled',
        hasActiveSubscription: false
      }
    })
    
    console.log(`Canceled subscription for user ${metadata.userId}`)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Invoice payment succeeded:', invoice.id)
  
  if ((invoice as any).subscription && stripe) {
    const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string)
    await handleSubscriptionUpdated(subscription)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id)
  
  if ((invoice as any).subscription && stripe) {
    const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string)
    await handleSubscriptionUpdated(subscription)
  }
}