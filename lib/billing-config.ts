// Billing configuration for PMU Pro
export const BILLING_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for new PMU artists',
    price: 29,
    priceId: 'price_starter_monthly', // This should be your actual Stripe price ID
    features: [
      'Up to 50 clients',
      'Consent form management',
      'Client CRM',
      'Document upload & signatures',
      'Portfolio management',
      'Basic analytics',
      'Email support'
    ],
    popular: false
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'For established PMU artists',
    price: 49,
    priceId: 'price_professional_monthly', // This should be your actual Stripe price ID
    features: [
      'Unlimited clients',
      'All Starter features',
      'Advanced analytics',
      'Custom branding',
      'Priority support',
      'API access',
      'Advanced reporting',
      'Client portal access'
    ],
    popular: true
  },
  studio: {
    id: 'studio',
    name: 'Studio',
    description: 'For PMU studios and teams',
    price: 79,
    priceId: 'price_studio_monthly', // This should be your actual Stripe price ID
    features: [
      'All Professional features',
      'Multi-artist support',
      'Team management',
      'Advanced integrations',
      'Dedicated support',
      'Custom onboarding',
      'White-label options',
      'Advanced security'
    ],
    popular: false
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
  starter: 'price_1S44Qn2NnsVhahaHDeNYTT9A',
  professional: 'price_1S44RZ2NnsVhahaHfPua5Llk',
  studio: 'price_1S44TP2NnsVhahaHGr8H7L3f'
}

// Get the appropriate price ID based on environment
export function getPriceId(plan: 'starter' | 'professional' | 'studio'): string {
  // In production, you would use real Stripe price IDs
  // For now, we'll use test IDs
  return TEST_PRICE_IDS[plan]
}
