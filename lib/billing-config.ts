// Billing configuration for PMU Pro
export const BILLING_PLANS = {
  basic: {
    id: 'basic',
    name: 'PMU Pro Basic',
    description: 'Essential tools for PMU artists',
    price: 29,
    priceId: 'price_1OqX8X2eZvKYlo2C9QZQZQZQ', // This should be your actual Stripe price ID
    features: [
      'AI Contraindication Analysis',
      'Basic Photo Analysis',
      'Client Management',
      'Basic Reports',
      'Email Support',
      'Document Upload',
      'Standard Forms'
    ],
    popular: false
  },
  premium: {
    id: 'premium',
    name: 'PMU Pro Premium',
    description: 'Complete PMU business solution',
    price: 36.99,
    priceId: 'price_1OqX8X2eZvKYlo2C9QZQZQZQ', // This should be your actual Stripe price ID
    features: [
      'Everything in Basic',
      'Advanced AI Analysis',
      'Pigment Matching',
      'Portfolio Sharing',
      'Advanced Analytics',
      'Priority Support',
      'Custom Branding',
      'Unified Skin Analysis',
      'Color Correction Tools',
      'ProCell Analysis'
    ],
    popular: true
  }
}

// Company information
export const COMPANY_INFO = {
  name: 'The PMU Guide',
  domain: 'thepmuguide.com',
  email: 'admin@thepmuguide.com',
  supportEmail: 'support@thepmuguide.com',
  website: 'https://thepmuguide.com'
}

// For development/testing, you can use these test price IDs
export const TEST_PRICE_IDS = {
  basic: 'price_1OqX8X2eZvKYlo2C9QZQZQZQ',
  premium: 'price_1OqX8X2eZvKYlo2C9QZQZQZQ'
}

// Get the appropriate price ID based on environment
export function getPriceId(plan: 'basic' | 'premium'): string {
  // In production, you would use real Stripe price IDs
  // For now, we'll use test IDs
  return TEST_PRICE_IDS[plan]
}
