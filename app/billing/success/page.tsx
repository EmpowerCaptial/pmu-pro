"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { TrialSubscriptionBridge } from '@/lib/trial-subscription-bridge'

export default function BillingSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isTrialUpgrade, setIsTrialUpgrade] = useState(false)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (sessionId) {
      // Check if this was a trial upgrade
      const trialUser = TrialSubscriptionBridge.getTrialUserData()
      if (trialUser && !trialUser.plan) {
        setIsTrialUpgrade(true)
        // Clear trial data after successful subscription
        TrialSubscriptionBridge.clearTrialData()
      }
      
      setIsLoading(false)
    } else {
      // No session ID, redirect to dashboard
      router.push('/dashboard')
    }
  }, [searchParams, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-beige/20 to-ivory flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {isTrialUpgrade ? 'Trial Upgraded Successfully!' : 'Subscription Activated!'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              {isTrialUpgrade 
                ? 'Your trial has been successfully upgraded to a paid subscription. You now have full access to all PMU Pro features.'
                : 'Your subscription is now active. Welcome to PMU Pro!'
              }
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800 font-medium">
                  {isTrialUpgrade ? 'Trial Upgraded' : 'Subscription Active'}
                </span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                {isTrialUpgrade 
                  ? 'No interruption in service - your data is preserved'
                  : 'All features are now unlocked'
                }
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gradient-to-r from-lavender to-lavender-600 text-white hover:shadow-lg transition-all duration-300"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                {isTrialUpgrade 
                  ? 'Your trial data has been preserved and is now part of your paid subscription'
                  : 'You can manage your subscription in the billing section'
                }
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">What's next:</p>
              <div className="space-y-1">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Access all premium features</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Unlimited client management</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Priority support</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}