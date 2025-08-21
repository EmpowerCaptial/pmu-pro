import { useState, useEffect } from 'react'
import { 
  canAccessFeature, 
  getAvailableFeatures, 
  getUpgradeRequiredFeatures, 
  getPlanComparison,
  type SubscriptionPlan,
  type FeatureAccess 
} from '@/lib/feature-access'

interface UseFeatureAccessReturn {
  canAccess: (feature: string) => FeatureAccess
  availableFeatures: string[]
  upgradeRequiredFeatures: string[]
  planComparison: ReturnType<typeof getPlanComparison>
  isLoading: boolean
  error: string | null
}

export function useFeatureAccess(userPlan: SubscriptionPlan = 'inactive'): UseFeatureAccessReturn {
  const [availableFeatures, setAvailableFeatures] = useState<string[]>([])
  const [upgradeRequiredFeatures, setUpgradeRequiredFeatures] = useState<string[]>([])
  const [planComparison, setPlanComparison] = useState(getPlanComparison(userPlan))
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      setIsLoading(true)
      setError(null)
      
      const available = getAvailableFeatures(userPlan)
      const upgradeRequired = getUpgradeRequiredFeatures(userPlan)
      const comparison = getPlanComparison(userPlan)
      
      setAvailableFeatures(available)
      setUpgradeRequiredFeatures(upgradeRequired)
      setPlanComparison(comparison)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feature access')
    } finally {
      setIsLoading(false)
    }
  }, [userPlan])

  const canAccess = (feature: string): FeatureAccess => {
    return canAccessFeature(feature, userPlan)
  }

  return {
    canAccess,
    availableFeatures,
    upgradeRequiredFeatures,
    planComparison,
    isLoading,
    error
  }
}

// Hook for checking a single feature
export function useFeatureCheck(feature: string, userPlan: SubscriptionPlan = 'inactive') {
  const [access, setAccess] = useState<FeatureAccess>({ canAccess: false })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      setIsLoading(true)
      const featureAccess = canAccessFeature(feature, userPlan)
      setAccess(featureAccess)
    } catch (err) {
      setAccess({
        canAccess: false,
        message: 'Failed to check feature access',
        upgradeRequired: false
      })
    } finally {
      setIsLoading(false)
    }
  }, [feature, userPlan])

  return { access, isLoading }
}
