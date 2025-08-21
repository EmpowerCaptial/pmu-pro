// Feature access control for PMU Pro subscription plans
export type SubscriptionPlan = 'basic' | 'premium' | 'trial' | 'inactive'

export interface FeatureAccess {
  canAccess: boolean
  message?: string
  upgradeRequired?: boolean
}

// Define all available features
export const FEATURES = {
  // Basic features (available to all paid plans)
  BASIC: {
    AI_CONTRAINDICATION_ANALYSIS: 'ai_contraindication_analysis',
    BASIC_PHOTO_ANALYSIS: 'basic_photo_analysis',
    CLIENT_MANAGEMENT: 'client_management',
    BASIC_REPORTS: 'basic_reports',
    EMAIL_SUPPORT: 'email_support',
    DOCUMENT_UPLOAD: 'document_upload',
    STANDARD_FORMS: 'standard_forms',
  },
  
  // Premium features (only available to premium plan)
  PREMIUM: {
    ADVANCED_AI_ANALYSIS: 'advanced_ai_analysis',
    PIGMENT_MATCHING: 'pigment_matching',
    PORTFOLIO_SHARING: 'portfolio_sharing',
    ADVANCED_ANALYTICS: 'advanced_analytics',
    PRIORITY_SUPPORT: 'priority_support',
    CUSTOM_BRANDING: 'custom_branding',
    UNIFIED_SKIN_ANALYSIS: 'unified_skin_analysis',
    COLOR_CORRECTION_TOOL: 'color_correction_tool',
    PROCEL_ANALYSIS: 'procel_analysis',
    ADVANCED_CLIENT_TOOLS: 'advanced_client_tools',
  }
} as const

// Feature access configuration
export const FEATURE_ACCESS_CONFIG = {
  [FEATURES.BASIC.AI_CONTRAINDICATION_ANALYSIS]: {
    basic: true,
    premium: true,
    trial: true,
    inactive: false
  },
  [FEATURES.BASIC.BASIC_PHOTO_ANALYSIS]: {
    basic: true,
    premium: true,
    trial: true,
    inactive: false
  },
  [FEATURES.BASIC.CLIENT_MANAGEMENT]: {
    basic: true,
    premium: true,
    trial: true,
    inactive: false
  },
  [FEATURES.BASIC.BASIC_REPORTS]: {
    basic: true,
    premium: true,
    trial: true,
    inactive: false
  },
  [FEATURES.BASIC.EMAIL_SUPPORT]: {
    basic: true,
    premium: true,
    trial: true,
    inactive: false
  },
  [FEATURES.BASIC.DOCUMENT_UPLOAD]: {
    basic: true,
    premium: true,
    trial: true,
    inactive: false
  },
  [FEATURES.BASIC.STANDARD_FORMS]: {
    basic: true,
    premium: true,
    trial: true,
    inactive: false
  },
  
  // Premium features
  [FEATURES.PREMIUM.ADVANCED_AI_ANALYSIS]: {
    basic: false,
    premium: true,
    trial: false,
    inactive: false
  },
  [FEATURES.PREMIUM.PIGMENT_MATCHING]: {
    basic: false,
    premium: true,
    trial: false,
    inactive: false
  },
  [FEATURES.PREMIUM.PORTFOLIO_SHARING]: {
    basic: false,
    premium: true,
    trial: false,
    inactive: false
  },
  [FEATURES.PREMIUM.ADVANCED_ANALYTICS]: {
    basic: false,
    premium: true,
    trial: false,
    inactive: false
  },
  [FEATURES.PREMIUM.PRIORITY_SUPPORT]: {
    basic: false,
    premium: true,
    trial: false,
    inactive: false
  },
  [FEATURES.PREMIUM.CUSTOM_BRANDING]: {
    basic: false,
    premium: true,
    trial: false,
    inactive: false
  },
  [FEATURES.PREMIUM.UNIFIED_SKIN_ANALYSIS]: {
    basic: false,
    premium: true,
    trial: false,
    inactive: false
  },
  [FEATURES.PREMIUM.COLOR_CORRECTION_TOOL]: {
    basic: false,
    premium: true,
    trial: false,
    inactive: false
  },
  [FEATURES.PREMIUM.PROCEL_ANALYSIS]: {
    basic: false,
    premium: true,
    trial: false,
    inactive: false
  },
  [FEATURES.PREMIUM.ADVANCED_CLIENT_TOOLS]: {
    basic: false,
    premium: true,
    trial: false,
    inactive: false
  }
}

// Check if user can access a specific feature
export function canAccessFeature(feature: string, plan: SubscriptionPlan): FeatureAccess {
  const config = FEATURE_ACCESS_CONFIG[feature as keyof typeof FEATURE_ACCESS_CONFIG]
  
  if (!config) {
    return {
      canAccess: false,
      message: 'Feature not found',
      upgradeRequired: false
    }
  }
  
  const canAccess = config[plan] || false
  
  if (!canAccess) {
    return {
      canAccess: false,
      message: `This feature requires a Premium subscription`,
      upgradeRequired: true
    }
  }
  
  return {
    canAccess: true
  }
}

// Get all features available for a specific plan
export function getAvailableFeatures(plan: SubscriptionPlan): string[] {
  const availableFeatures: string[] = []
  
  Object.entries(FEATURE_ACCESS_CONFIG).forEach(([feature, config]) => {
    if (config[plan]) {
      availableFeatures.push(feature)
    }
  })
  
  return availableFeatures
}

// Get features that require upgrade for a specific plan
export function getUpgradeRequiredFeatures(plan: SubscriptionPlan): string[] {
  const upgradeFeatures: string[] = []
  
  Object.entries(FEATURE_ACCESS_CONFIG).forEach(([feature, config]) => {
    if (!config[plan] && config.premium) {
      upgradeFeatures.push(feature)
    }
  })
  
  return upgradeFeatures
}

// Get plan comparison for upgrade prompts
export function getPlanComparison(currentPlan: SubscriptionPlan) {
  const currentFeatures = getAvailableFeatures(currentPlan)
  const upgradeFeatures = getUpgradeRequiredFeatures(currentPlan)
  
  return {
    currentPlan,
    currentFeatures,
    upgradeFeatures,
    totalCurrentFeatures: currentFeatures.length,
    totalUpgradeFeatures: upgradeFeatures.length
  }
}

// Feature descriptions for UI display
export const FEATURE_DESCRIPTIONS = {
  [FEATURES.BASIC.AI_CONTRAINDICATION_ANALYSIS]: 'AI-powered contraindication screening for client safety',
  [FEATURES.BASIC.BASIC_PHOTO_ANALYSIS]: 'Basic photo analysis for client assessment',
  [FEATURES.BASIC.CLIENT_MANAGEMENT]: 'Manage client information and records',
  [FEATURES.BASIC.BASIC_REPORTS]: 'Generate basic client reports and documentation',
  [FEATURES.BASIC.EMAIL_SUPPORT]: 'Email support for basic questions',
  [FEATURES.BASIC.DOCUMENT_UPLOAD]: 'Upload and store client documents',
  [FEATURES.BASIC.STANDARD_FORMS]: 'Access to standard PMU forms and templates',
  
  [FEATURES.PREMIUM.ADVANCED_AI_ANALYSIS]: 'Advanced AI analysis with detailed insights',
  [FEATURES.PREMIUM.PIGMENT_MATCHING]: 'AI-powered pigment matching and recommendations',
  [FEATURES.PREMIUM.PORTFOLIO_SHARING]: 'Share your portfolio with clients and social media',
  [FEATURES.PREMIUM.ADVANCED_ANALYTICS]: 'Detailed analytics and business insights',
  [FEATURES.PREMIUM.PRIORITY_SUPPORT]: 'Priority customer support with faster response times',
  [FEATURES.PREMIUM.CUSTOM_BRANDING]: 'Customize the app with your brand colors and logo',
  [FEATURES.PREMIUM.UNIFIED_SKIN_ANALYSIS]: 'Comprehensive skin analysis with Fitzpatrick classification',
  [FEATURES.PREMIUM.COLOR_CORRECTION_TOOL]: 'Advanced color correction and pigment analysis',
  [FEATURES.PREMIUM.PROCEL_ANALYSIS]: 'Professional ProCell analysis tools',
  [FEATURES.PREMIUM.ADVANCED_CLIENT_TOOLS]: 'Advanced client management and analysis tools'
}

// Get feature description
export function getFeatureDescription(feature: string): string {
  return FEATURE_DESCRIPTIONS[feature as keyof typeof FEATURE_DESCRIPTIONS] || 'Feature description not available'
}
