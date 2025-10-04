// Client limit enforcement service for subscription plans
export interface ClientLimitInfo {
  currentCount: number
  maxAllowed: number
  isAtLimit: boolean
  canAddMore: boolean
  upgradeRequired: boolean
  upgradePlan?: string
}

export interface PlanLimits {
  starter: number
  professional: number
  studio: number
  enterprise: number
}

export const PLAN_CLIENT_LIMITS: PlanLimits = {
  starter: 50,
  professional: 200,
  studio: -1, // Unlimited
  enterprise: -1 // Unlimited
}

export class ClientLimitService {
  /**
   * Check if user can add more clients based on their plan
   */
  static checkClientLimit(
    userPlan: string,
    currentClientCount: number
  ): ClientLimitInfo {
    const maxAllowed = this.getMaxClientsForPlan(userPlan)
    const isAtLimit = maxAllowed !== -1 && currentClientCount >= maxAllowed
    const canAddMore = !isAtLimit
    const upgradeRequired = isAtLimit
    const upgradePlan = this.getRecommendedUpgradePlan(userPlan)

    return {
      currentCount: currentClientCount,
      maxAllowed,
      isAtLimit,
      canAddMore,
      upgradeRequired,
      upgradePlan
    }
  }

  /**
   * Get maximum clients allowed for a plan
   */
  static getMaxClientsForPlan(plan: string): number {
    const normalizedPlan = plan.toLowerCase()
    return PLAN_CLIENT_LIMITS[normalizedPlan as keyof PlanLimits] || 50
  }

  /**
   * Get recommended upgrade plan for a user
   */
  static getRecommendedUpgradePlan(currentPlan: string): string {
    switch (currentPlan.toLowerCase()) {
      case 'starter':
        return 'professional'
      case 'professional':
        return 'studio'
      default:
        return 'studio'
    }
  }

  /**
   * Check if user needs to upgrade before adding a client
   */
  static canAddClient(userPlan: string, currentClientCount: number): boolean {
    const limitInfo = this.checkClientLimit(userPlan, currentClientCount)
    return limitInfo.canAddMore
  }

  /**
   * Get upgrade message for client limit reached
   */
  static getUpgradeMessage(userPlan: string, currentClientCount: number): string {
    const limitInfo = this.checkClientLimit(userPlan, currentClientCount)
    
    if (!limitInfo.upgradeRequired) {
      return ''
    }

    const remaining = limitInfo.maxAllowed - limitInfo.currentCount
    const upgradePlan = limitInfo.upgradePlan

    switch (userPlan.toLowerCase()) {
      case 'starter':
        return `You've reached your limit of ${limitInfo.maxAllowed} clients. Upgrade to Professional to manage up to 200 clients and unlock advanced features!`
      case 'professional':
        return `You've reached your limit of ${limitInfo.maxAllowed} clients. Upgrade to Studio for unlimited clients and team management features!`
      default:
        return `Client limit reached. Upgrade to ${upgradePlan} for more capacity!`
    }
  }

  /**
   * Get plan comparison for upgrade prompt
   */
  static getPlanComparison(currentPlan: string) {
    switch (currentPlan.toLowerCase()) {
      case 'starter':
        return {
          current: { name: 'Starter', clients: 50, price: 10 },
          upgrade: { name: 'Professional', clients: 200, price: 49 },
          benefits: ['4x more clients', 'Advanced analytics', 'Custom branding']
        }
      case 'professional':
        return {
          current: { name: 'Professional', clients: 200, price: 49 },
          upgrade: { name: 'Studio', clients: 'Unlimited', price: 99 },
          benefits: ['Unlimited clients', 'Team management', 'Multi-artist scheduling']
        }
      default:
        return null
    }
  }
}
