"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertTriangle, Crown, X } from "lucide-react"
import { TrialService, type TrialUser } from "@/lib/trial-service"

interface TrialBannerProps {
  onUpgrade?: () => void
  onDismiss?: () => void
}

export function TrialBanner({ onUpgrade, onDismiss }: TrialBannerProps) {
  const [trialUser, setTrialUser] = useState<TrialUser | null>(null)
  const [daysRemaining, setDaysRemaining] = useState(0)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const loadTrialData = () => {
      const user = TrialService.getTrialUser()
      const remaining = TrialService.getTrialDaysRemaining()
      
      setTrialUser(user)
      setDaysRemaining(remaining)
    }

    loadTrialData()
    
    // Check if banner was dismissed
    const dismissed = localStorage.getItem('trial_banner_dismissed')
    setIsDismissed(dismissed === 'true')
    
    // Update every minute
    const interval = setInterval(loadTrialData, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem('trial_banner_dismissed', 'true')
    onDismiss?.()
  }

  const handleUpgrade = () => {
    onUpgrade?.()
  }

  // Don't show if dismissed, no trial user, or already upgraded
  if (isDismissed || !trialUser || trialUser.plan) return null

  const isExpired = TrialService.isTrialExpired()
  const isActive = trialUser.isActive && !isExpired

  // Show different banners based on trial status
  if (isExpired) {
    return (
      <Alert className="border-red-200 bg-red-50 mb-4">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-red-800 font-medium">Your trial has expired</span>
            <span className="text-red-600">Upgrade now to keep your data and continue using PMU Pro.</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleUpgrade}
            >
              <Crown className="h-3 w-3 mr-1" />
              Upgrade Now
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleDismiss}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (isActive) {
    // Show different urgency based on days remaining
    if (daysRemaining <= 3) {
      return (
        <Alert className="border-orange-200 bg-orange-50 mb-4">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-orange-800 font-medium">Trial ending soon!</span>
              <span className="text-orange-600">Only {daysRemaining} days left. Upgrade to keep your data.</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                className="bg-orange-600 hover:bg-orange-700 text-white"
                onClick={handleUpgrade}
              >
                <Crown className="h-3 w-3 mr-1" />
                Upgrade Now
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleDismiss}
                className="text-orange-600 hover:text-orange-700"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )
    }

    if (daysRemaining <= 7) {
      return (
        <Alert className="border-yellow-200 bg-yellow-50 mb-4">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-800 font-medium">Trial ending in {daysRemaining} days</span>
              <span className="text-yellow-600">Upgrade now to continue using PMU Pro.</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                onClick={handleUpgrade}
              >
                <Crown className="h-3 w-3 mr-1" />
                Upgrade
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleDismiss}
                className="text-yellow-600 hover:text-yellow-700"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )
    }

    // General trial banner
    return (
      <Alert className="border-lavender/30 bg-lavender/5 mb-4">
        <Clock className="h-4 w-4 text-lavender" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-lavender/20 text-lavender">
              Free Trial
            </Badge>
            <span className="text-lavender-700">{daysRemaining} days remaining</span>
            <span className="text-gray-600">Enjoy full access to all PMU Pro features</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              className="bg-lavender hover:bg-lavender-600 text-white"
              onClick={handleUpgrade}
            >
              <Crown className="h-3 w-3 mr-1" />
              Upgrade
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleDismiss}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}


