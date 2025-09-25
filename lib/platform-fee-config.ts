// Platform fee configuration based on subscription plans
export interface PlatformFeeConfig {
  percentage: number
  minimumFee: number
  maximumFee: number
  description: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  platformFee: PlatformFeeConfig
}

// Platform fee structure by subscription plan
export const SUBSCRIPTION_PLATFORM_FEES: Record<string, PlatformFeeConfig> = {
  starter: {
    percentage: 0.10, // 10%
    minimumFee: 5,    // $5 minimum
    maximumFee: 50,   // $50 maximum
    description: '10% platform fee (min $5, max $50)'
  },
  professional: {
    percentage: 0,    // 0% - FREE for Professional subscribers
    minimumFee: 0,    // $0 minimum
    maximumFee: 0,    // $0 maximum
    description: 'No platform fees for Professional subscribers'
  },
  studio: {
    percentage: 0,    // 0% - FREE for Studio subscribers
    minimumFee: 0,    // $0 minimum
    maximumFee: 0,    // $0 maximum
    description: 'No platform fees for Studio subscribers'
  },
  // Legacy plan names for backward compatibility
  basic: {
    percentage: 0.10, // 10%
    minimumFee: 5,    // $5 minimum
    maximumFee: 50,   // $50 maximum
    description: '10% platform fee (min $5, max $50)'
  },
  premium: {
    percentage: 0,    // 0% - FREE for Premium subscribers
    minimumFee: 0,    // $0 minimum
    maximumFee: 0,    // $0 maximum
    description: 'No platform fees for Premium subscribers'
  },
  // Trial users get starter plan fees
  trial: {
    percentage: 0.10, // 10%
    minimumFee: 5,    // $5 minimum
    maximumFee: 50,   // $50 maximum
    description: '10% platform fee (min $5, max $50)'
  },
  // Inactive users get starter plan fees
  inactive: {
    percentage: 0.10, // 10%
    minimumFee: 5,    // $5 minimum
    maximumFee: 50,   // $50 maximum
    description: '10% platform fee (min $5, max $50)'
  }
}

// Calculate platform fee based on subscription plan and service amount
export function calculatePlatformFee(
  subscriptionPlan: string,
  serviceAmount: number
): {
  feeAmount: number
  feePercentage: number
  description: string
  netReceipt: number
} {
  const feeConfig = SUBSCRIPTION_PLATFORM_FEES[subscriptionPlan] || SUBSCRIPTION_PLATFORM_FEES.starter
  
  // Calculate fee amount
  let feeAmount = serviceAmount * feeConfig.percentage
  
  // Apply minimum and maximum limits
  if (feeAmount < feeConfig.minimumFee) {
    feeAmount = feeConfig.minimumFee
  }
  if (feeAmount > feeConfig.maximumFee) {
    feeAmount = feeConfig.maximumFee
  }
  
  // Calculate net receipt (what artist receives)
  const netReceipt = serviceAmount - feeAmount
  
  return {
    feeAmount,
    feePercentage: feeConfig.percentage,
    description: feeConfig.description,
    netReceipt
  }
}

// Get fee information for display
export function getFeeDisplayInfo(subscriptionPlan: string) {
  const feeConfig = SUBSCRIPTION_PLATFORM_FEES[subscriptionPlan] || SUBSCRIPTION_PLATFORM_FEES.starter
  
  if (feeConfig.percentage === 0) {
    return {
      platformFee: 'FREE',
      netReceipt: '~97% of service amount',
      description: feeConfig.description
    }
  }
  
  return {
    platformFee: `${(feeConfig.percentage * 100).toFixed(0)}% (min $${feeConfig.minimumFee}, max $${feeConfig.maximumFee})`,
    netReceipt: '~87% of service amount',
    description: feeConfig.description
  }
}

// Example usage and calculations
export const FEE_EXAMPLES = {
  starter: {
    serviceAmount: 450,
    platformFee: 45, // 10% of $450
    stripeFee: 13.35, // 2.9% + $0.30
    artistNet: 391.65, // $450 - $45 - $13.35
    percentage: 87.0
  },
  professional: {
    serviceAmount: 450,
    platformFee: 0, // FREE for Professional
    stripeFee: 13.35, // 2.9% + $0.30
    artistNet: 436.65, // $450 - $0 - $13.35
    percentage: 97.0
  },
  studio: {
    serviceAmount: 450,
    platformFee: 0, // FREE for Studio
    stripeFee: 13.35, // 2.9% + $0.30
    artistNet: 436.65, // $450 - $0 - $13.35
    percentage: 97.0
  }
}
