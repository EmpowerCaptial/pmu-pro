import Stripe from 'stripe'

// Environment variable validation with better error handling
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY
const STRIPE_BASIC_PRICE_ID = process.env.STRIPE_BASIC_PRICE_ID
const STRIPE_PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID

// Only throw error at runtime, not during build
if (!STRIPE_SECRET_KEY && typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  console.warn('⚠️ STRIPE_SECRET_KEY is not set. Please configure environment variables.')
}

// Initialize Stripe with fallback for build time
export const stripe = STRIPE_SECRET_KEY 
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
      typescript: true,
    })
  : null

// Stripe configuration with fallbacks
export const STRIPE_CONFIG = {
  publishableKey: STRIPE_PUBLISHABLE_KEY || '',
  basicPriceId: STRIPE_BASIC_PRICE_ID || '',
  premiumPriceId: STRIPE_PREMIUM_PRICE_ID || '',
}

// Helper function to validate Stripe configuration
export function validateStripeConfig() {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
  }
  if (!stripe) {
    throw new Error('Stripe client is not initialized')
  }
  return true
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
    price: 99,
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
