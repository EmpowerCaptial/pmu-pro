"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock, Crown, X } from 'lucide-react'
import { ExpiredTrialHandler } from '@/lib/expired-trial-handler'

interface ExpiredTrialBannerProps {
  onUpgrade?: () => void
  onDismiss?: () => void
}

export function ExpiredTrialBanner({ onUpgrade, onDismiss }: ExpiredTrialBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [gracePeriodStatus, setGracePeriodStatus] = useState<{
    canSubscribe: boolean
    daysExpired: number
    daysRemaining: number
    message: string
  } | null>(null)

  useEffect(() => {
    // Check if banner was dismissed
    const dismissed = localStorage.getItem('expired_trial_banner_dismissed')
    setIsDismissed(dismissed === 'true')

    // Get grace period status
    const status = ExpiredTrialHandler.getGracePeriodStatus('')
    setGracePeriodStatus(status)
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('expired_trial_banner_dismissed', 'true')
    onDismiss?.()
  }

  const handleUpgrade = () => {
    onUpgrade?.()
  }

  // Don't show if dismissed or no grace period status
  if (isDismissed || !gracePeriodStatus) return null

  // Don't show if grace period has ended
  if (!gracePeriodStatus.canSubscribe) return null

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400 p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-sm font-semibold text-orange-800">
                Trial Expired - Grace Period Active
              </h3>
              <Badge variant="outline" className="text-orange-700 border-orange-300">
                <Clock className="h-3 w-3 mr-1" />
                {gracePeriodStatus.daysRemaining} days left
              </Badge>
            </div>
            <p className="text-sm text-orange-700 mb-3">
              {gracePeriodStatus.message}
            </p>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleUpgrade}
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                <Crown className="h-4 w-4 mr-2" />
                Subscribe Now
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-orange-600 hover:text-orange-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
