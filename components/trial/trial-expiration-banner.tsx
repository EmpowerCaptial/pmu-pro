"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock, Crown, X } from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'

interface TrialExpirationBannerProps {
  onSubscribe?: () => void
  onDismiss?: () => void
}

export function TrialExpirationBanner({ onSubscribe, onDismiss }: TrialExpirationBannerProps) {
  const { currentUser } = useDemoAuth()
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if user is on trial
    if ((currentUser as any)?.selectedPlan === 'demo' || !(currentUser as any)?.hasActiveSubscription) {
      // Calculate days remaining (simulate 30-day trial)
      const trialStart = new Date('2024-01-01') // This would come from user data
      const trialEnd = new Date(trialStart.getTime() + (30 * 24 * 60 * 60 * 1000))
      const now = new Date()
      const remaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      setDaysRemaining(Math.max(0, remaining))
    }
  }, [currentUser])

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  const handleSubscribe = () => {
    onSubscribe?.()
  }

  // Don't show if user has active subscription or banner is dismissed
  if ((currentUser as any)?.hasActiveSubscription || isDismissed || daysRemaining === null) {
    return null
  }

  // Don't show if trial has more than 7 days remaining
  if (daysRemaining > 7) {
    return null
  }

  const getBannerType = () => {
    if (daysRemaining <= 0) return 'expired'
    if (daysRemaining <= 3) return 'urgent'
    return 'warning'
  }

  const bannerType = getBannerType()

  const getBannerConfig = () => {
    switch (bannerType) {
      case 'expired':
        return {
          bgColor: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
          icon: AlertTriangle,
          title: 'Trial Expired',
          message: 'Your trial has expired. Subscribe now to continue using PMU Pro.',
          buttonText: 'Subscribe Now',
          buttonVariant: 'default' as const,
          buttonClass: 'bg-red-600 hover:bg-red-700 text-white'
        }
      case 'urgent':
        return {
          bgColor: 'bg-orange-50 border-orange-200',
          textColor: 'text-orange-800',
          icon: AlertTriangle,
          title: 'Trial Ending Soon',
          message: `Your trial expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}. Subscribe to avoid losing access.`,
          buttonText: 'Subscribe Now',
          buttonVariant: 'default' as const,
          buttonClass: 'bg-orange-600 hover:bg-orange-700 text-white'
        }
      default:
        return {
          bgColor: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-800',
          icon: Clock,
          title: 'Trial Ending Soon',
          message: `Your trial expires in ${daysRemaining} days. Consider subscribing to continue.`,
          buttonText: 'View Plans',
          buttonVariant: 'outline' as const,
          buttonClass: 'border-yellow-600 text-yellow-600 hover:bg-yellow-50'
        }
    }
  }

  const config = getBannerConfig()
  const Icon = config.icon

  return (
    <Card className={`${config.bgColor} border-2 shadow-lg mb-4`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Icon className={`h-5 w-5 ${config.textColor} mt-0.5`} />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className={`font-semibold ${config.textColor}`}>
                  {config.title}
                </h3>
                <Badge variant="outline" className={`${config.textColor} border-current`}>
                  {daysRemaining === 0 ? 'Expired' : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left`}
                </Badge>
              </div>
              <p className={`text-sm ${config.textColor} mb-3`}>
                {config.message}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleSubscribe}
                  variant={config.buttonVariant}
                  size="sm"
                  className={config.buttonClass}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  {config.buttonText}
                </Button>
                {bannerType !== 'expired' && (
                  <Button
                    onClick={handleDismiss}
                    variant="ghost"
                    size="sm"
                    className={`${config.textColor} hover:bg-current hover:bg-opacity-10`}
                  >
                    Dismiss
                  </Button>
                )}
              </div>
            </div>
          </div>
          {bannerType !== 'expired' && (
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className={`${config.textColor} hover:bg-current hover:bg-opacity-10 p-1`}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
