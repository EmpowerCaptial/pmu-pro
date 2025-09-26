import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
}) : null

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
    }

    const { 
      amount, 
      currency, 
      paymentMethod,
      clientName,
      clientEmail,
      items,
      successUrl, 
      cancelUrl 
    } = await req.json();

    if (!amount || !currency || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Map payment method to Stripe payment method type
    const stripePaymentMethod = {
      'affirm': 'affirm',
      'afterpay': 'afterpay_clearpay',
      'klarna': 'klarna'
    }[paymentMethod];

    if (!stripePaymentMethod) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    // Create line items from cart
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: currency.toLowerCase(),
        product_data: {
          name: item.name || 'PMU Service',
          description: item.description || 'Professional PMU service',
        },
        unit_amount: Math.round((item.price || 0) * 100), // Convert to cents
      },
      quantity: item.quantity || 1,
    }));

    // Create Stripe checkout session for BNPL payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: [stripePaymentMethod],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        paymentType: 'bnpl',
        paymentMethod: paymentMethod,
        clientName: clientName,
        clientEmail: clientEmail
      },
      customer_email: clientEmail,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      // BNPL specific settings
      payment_method_options: {
        [stripePaymentMethod]: {
          // BNPL specific options can be added here
        }
      }
    });

    return NextResponse.json({ 
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error("Stripe BNPL checkout session error:", error);
    return NextResponse.json(
      { 
        error: "Failed to create BNPL payment session", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    );
  }
}
