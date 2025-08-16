import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
})

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
  basicPriceId: process.env.STRIPE_BASIC_PRICE_ID!,
  premiumPriceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
}

// Price configurations for PMU Pro plans
export const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'PMU Pro Basic',
    description: 'Essential tools for PMU artists',
    price: 29,
    priceId: process.env.STRIPE_BASIC_PRICE_ID,
    features: [
      'AI Contraindication Analysis',
      'Basic Photo Analysis',
      'Client Management',
      'Basic Reports',
      'Email Support'
    ]
  },
  premium: {
    name: 'PMU Pro Premium',
    description: 'Complete PMU business solution',
    price: 79,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    features: [
      'Everything in Basic',
      'Advanced AI Analysis',
      'Pigment Matching',
      'Portfolio Sharing',
      'Advanced Analytics',
      'Priority Support',
      'Custom Branding'
    ]
  }
}
