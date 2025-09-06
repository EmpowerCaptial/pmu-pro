"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react"
import { ArtistApplicationService, type ArtistApplication } from "@/lib/artist-application-service"

interface ConditionalTrialBannerProps {
  userEmail: string
  onDismiss?: () => void
}

export function ConditionalTrialBanner({ userEmail, onDismiss }: ConditionalTrialBannerProps) {
  const [trialStatus, setTrialStatus] = useState<{
    hasAccess: boolean
    daysRemaining: number
    status: string
    issues?: string[]
    needsAction: boolean
  } | null>(null)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const loadTrialStatus = () => {
      const status = ArtistApplicationService.getTrialStatus(userEmail)
      setTrialStatus(status)
    }

    loadTrialStatus()
    
    // Check if banner was dismissed
    const dismissed = localStorage.getItem(`trial_banner_dismissed_${userEmail}`)
    setIsDismissed(dismissed === 'true')
    
    // Update every minute
    const interval = setInterval(loadTrialStatus, 60000)
    return () => clearInterval(interval)
  }, [userEmail])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem(`trial_banner_dismissed_${userEmail}`, 'true')
    onDismiss?.()
  }

  // Don't show if dismissed or no trial status
  if (isDismissed || !trialStatus) return null

  // Don't show if user has full access and no issues
  if (trialStatus.hasAccess && !trialStatus.needsAction) return null

  // Show different banners based on status
  if (!trialStatus.hasAccess) {
    return (
      <Alert className="border-red-200 bg-red-50 mb-4">
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-red-800 font-medium">Trial Access Suspended</span>
            <span className="text-red-600">
              {trialStatus.status === 'rejected' 
                ? 'Application was not approved. Please contact support.'
                : 'Please complete your application to continue your trial.'
              }
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => window.location.href = '/artist-signup'}
            >
              Complete Application
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleDismiss}
              className="text-red-600 hover:text-red-700"
            >
              <XCircle className="h-3 w-3" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (trialStatus.needsAction) {
    return (
      <Alert className="border-orange-200 bg-orange-50 mb-4">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-orange-800 font-medium">Application Review Required</span>
            <span className="text-orange-600">
              {trialStatus.daysRemaining} days left in trial. Please address the following:
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => window.location.href = '/artist-signup'}
            >
              Update Application
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleDismiss}
              className="text-orange-600 hover:text-orange-700"
            >
              <XCircle className="h-3 w-3" />
            </Button>
          </div>
        </AlertDescription>
        {trialStatus.issues && trialStatus.issues.length > 0 && (
          <div className="mt-2 ml-6">
            <ul className="text-sm text-orange-700 space-y-1">
              {trialStatus.issues.map((issue, index) => (
                <li key={index} className="flex items-center space-x-1">
                  <span>•</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Alert>
    )
  }

  if (trialStatus.status === 'pending') {
    return (
      <Alert className="border-blue-200 bg-blue-50 mb-4">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-blue-800 font-medium">Application Under Review</span>
            <span className="text-blue-600">
              Your application is being reviewed. Full access continues during review.
            </span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {trialStatus.daysRemaining} days left
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleDismiss}
              className="text-blue-600 hover:text-blue-700"
            >
              <XCircle className="h-3 w-3" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}


