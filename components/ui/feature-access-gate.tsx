import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lock, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { canAccessFeature, type SubscriptionPlan, type FeatureAccess } from '@/lib/feature-access'

interface FeatureAccessGateProps {
  feature: string
  userPlan: SubscriptionPlan
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgradePrompt?: boolean
}

export function FeatureAccessGate({ 
  feature, 
  userPlan, 
  children, 
  fallback,
  showUpgradePrompt = true 
}: FeatureAccessGateProps) {
  const access = canAccessFeature(feature, userPlan)

  if (access.canAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (!showUpgradePrompt) {
    return null
  }

  return (
    <Card className="border-lavender/30 bg-gradient-to-br from-lavender/5 to-beige/10">
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-lavender/20 flex items-center justify-center">
          <Lock className="h-8 w-8 text-lavender" />
        </div>
        <CardTitle className="text-lavender-700">Premium Feature</CardTitle>
        <CardDescription>
          {access.message || 'This feature requires a Premium subscription'}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="bg-lavender/10 text-lavender border-lavender/30">
            <Star className="h-3 w-3 mr-1" />
            Premium Only
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Upgrade to Premium to unlock:</p>
          <ul className="text-left max-w-md mx-auto space-y-1">
            <li>• Advanced AI Analysis</li>
            <li>• Pigment Matching</li>
            <li>• Portfolio Sharing</li>
            <li>• Unified Skin Analysis</li>
            <li>• Color Correction Tools</li>
            <li>• And much more...</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/billing">
            <Button className="bg-lavender hover:bg-lavender-600 text-white">
              <Star className="h-4 w-4 mr-2" />
              Upgrade to Premium
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link href="/billing">
            <Button variant="outline" className="border-lavender/30 text-lavender hover:bg-lavender/5">
              View Plans
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

// Higher-order component for feature access
export function withFeatureAccess<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  feature: string,
  userPlan: SubscriptionPlan
) {
  return function FeatureAccessWrappedComponent(props: P) {
    const access = canAccessFeature(feature, userPlan)
    
    if (!access.canAccess) {
      return (
        <FeatureAccessGate 
          feature={feature} 
          userPlan={userPlan} 
          children={null}
        />
      )
    }
    
    return <WrappedComponent {...props} />
  }
}

// Hook-based feature access gate
export function useFeatureAccessGate(feature: string, userPlan: SubscriptionPlan) {
  const access = canAccessFeature(feature, userPlan)
  
  return {
    canAccess: access.canAccess,
    message: access.message,
    upgradeRequired: access.upgradeRequired,
    FeatureGate: ({ children, fallback, showUpgradePrompt = true }: {
      children: React.ReactNode
      fallback?: React.ReactNode
      showUpgradePrompt?: boolean
    }) => (
      <FeatureAccessGate
        feature={feature}
        userPlan={userPlan}
        children={children}
        fallback={fallback}
        showUpgradePrompt={showUpgradePrompt}
      />
    )
  }
}
