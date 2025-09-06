import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { DepositPaymentService } from "@/lib/deposit-payment-service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' }, 
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const depositId = session.metadata?.depositId;
    
    if (!depositId) {
      console.error('No deposit ID found in session metadata');
      return;
    }

    // Update deposit payment status to paid
    await DepositPaymentService.updateDepositStatus(depositId, 'PAID', {
      stripeSessionId: session.id,
      paidAt: new Date()
    });

    console.log(`Deposit payment ${depositId} marked as paid`);

    // TODO: Send confirmation email to client
    // TODO: Send notification to artist
    // TODO: Update appointment status if linked

  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // This is a backup handler in case checkout.session.completed doesn't fire
    const depositId = paymentIntent.metadata?.depositId;
    
    if (!depositId) {
      return;
    }

    // Check if deposit is already marked as paid
    const deposit = await DepositPaymentService.getDepositByLink(depositId);
    if (deposit && deposit.status === 'PENDING') {
      await DepositPaymentService.updateDepositStatus(depositId, 'PAID', {
        stripePaymentIntentId: paymentIntent.id,
        paidAt: new Date()
      });

      console.log(`Deposit payment ${depositId} marked as paid via payment intent`);
    }

  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const depositId = paymentIntent.metadata?.depositId;
    
    if (!depositId) {
      return;
    }

    console.log(`Payment failed for deposit ${depositId}:`, paymentIntent.last_payment_error);

    // TODO: Send failure notification to client
    // TODO: Send notification to artist

  } catch (error) {
    console.error('Error handling payment intent failed:', error);
  }
}
