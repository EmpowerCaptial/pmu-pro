import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getTransactionStripeAccount } from '@/lib/stripe-management';

// Import Stripe error types for better error handling
const StripeError = Stripe.errors?.StripeError || Error;

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
      cancelUrl,
      stripeAccountId,
      isOwnerAccount
    } = await req.json();

    if (!amount || !currency || !paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Map payment method to Stripe payment method type
    const paymentMethodMap: Record<string, 'affirm' | 'afterpay_clearpay' | 'klarna'> = {
      'affirm': 'affirm',
      'afterpay': 'afterpay_clearpay',
      'klarna': 'klarna'
    };

    const stripePaymentMethod = paymentMethodMap[paymentMethod];

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
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: [stripePaymentMethod],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        paymentType: 'bnpl',
        paymentMethod: paymentMethod,
        clientName: clientName,
        clientEmail: clientEmail,
        stripeAccountId: stripeAccountId || 'default',
        isOwnerAccount: isOwnerAccount ? 'true' : 'false'
      },
      customer_email: clientEmail || undefined,
      billing_address_collection: 'required',
      // Affirm and other BNPL methods typically require shipping address for verification
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      // BNPL specific settings
      payment_method_options: {
        [stripePaymentMethod]: {
          // Stripe handles BNPL-specific requirements automatically
          // Note: capture_method is not valid for checkout sessions
        }
      }
    };

    let session: Stripe.Checkout.Session;

    // For Enterprise Studio, use the specified Stripe account
    if (stripeAccountId && isOwnerAccount) {
      // Use Stripe Connect for owner account
      session = await stripe.checkout.sessions.create(sessionConfig, {
        stripeAccount: stripeAccountId
      });
    } else if (stripeAccountId && !isOwnerAccount) {
      // Use artist's own account
      session = await stripe.checkout.sessions.create(sessionConfig, {
        stripeAccount: stripeAccountId
      });
    } else {
      // Use default account
      session = await stripe.checkout.sessions.create(sessionConfig);
    }

    return NextResponse.json({ 
      success: true,
      sessionId: session.id,
      url: session.url
    });

  } catch (error: any) {
    console.error("Stripe BNPL checkout session error:", error);
    
    // Check for specific Stripe errors
    if (error?.type && error?.code) {
      console.error("Stripe error details:", {
        type: error.type,
        code: error.code,
        message: error.message,
        param: error.param,
        decline_code: error.decline_code
      });
      
      // Provide more specific error messages
      let errorMessage = "Failed to create BNPL payment session";
      if (error.type === 'StripeInvalidRequestError') {
        errorMessage = `Invalid request: ${error.message}`;
        // Check for common Affirm-specific errors
        if (error.message?.toLowerCase().includes('affirm')) {
          errorMessage = `Affirm payment error: ${error.message}. Please ensure Affirm is enabled in your Stripe account and the amount meets Affirm's requirements (typically $50-$30,000).`;
        }
      } else if (error.type === 'StripeAPIError') {
        errorMessage = `Stripe API error: ${error.message}`;
      } else if (error.type === 'StripeAuthenticationError') {
        errorMessage = "Stripe authentication failed. Please check your API keys.";
      } else {
        errorMessage = error.message || "Failed to create BNPL payment session";
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: error.message,
          type: error.type,
          code: error.code
        }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Failed to create BNPL payment session", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    );
  }
}
