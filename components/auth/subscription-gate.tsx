"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, Lock, Clock, AlertTriangle } from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'

interface SubscriptionGateProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function SubscriptionGate({ children, fallback }: SubscriptionGateProps) {
  const { currentUser } = useDemoAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    const checkAccess = async () => {
      if (!currentUser) {
        setIsChecking(false)
        return
      }

      // Check if user has active subscription
      const hasActiveSubscription = (currentUser as any)?.hasActiveSubscription
      const selectedPlan = (currentUser as any)?.selectedPlan
      const subscriptionStatus = (currentUser as any)?.subscriptionStatus

      // Allow access if:
      // 1. User has active subscription
      // 2. User is admin/staff
      // 3. User has trial status (active or expired)
      if (hasActiveSubscription || 
          currentUser.role === 'admin' || 
          currentUser.role === 'staff' ||
          subscriptionStatus === 'trial') {
        setHasAccess(true)
      } else {
        setHasAccess(false)
      }

      setIsChecking(false)
    }

    checkAccess()
  }, [currentUser])

  const handleSubscribe = () => {
    router.push('/pricing')
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender"></div>
      </div>
    )
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-beige/20 to-ivory flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Subscription Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Your trial has expired. Subscribe to continue using PMU Pro and access all features.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800 font-medium">
                    Access Restricted
                  </span>
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  All features are locked until you subscribe
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleSubscribe}
                className="w-full bg-gradient-to-r from-lavender to-lavender-600 text-white hover:shadow-lg transition-all duration-300"
              >
                <Crown className="h-4 w-4 mr-2" />
                Subscribe Now
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Choose from Starter, Professional, or Studio plans
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">What you'll get with a subscription:</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Full client management</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">AI contraindication analysis</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Booking and scheduling</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Payment processing</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
