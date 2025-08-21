"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react'

interface PaymentVerificationProps {
  userId: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface PaymentStatus {
  hasAccess: boolean
  subscriptionStatus: string
  message?: string
  isLoading: boolean
}

export function PaymentVerification({ userId, children, fallback }: PaymentVerificationProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    hasAccess: false,
    subscriptionStatus: 'unknown',
    isLoading: true
  })
  const router = useRouter()

  useEffect(() => {
    checkPaymentStatus()
  }, [userId])

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        const result = await response.json()
        setPaymentStatus({
          hasAccess: result.hasAccess,
          subscriptionStatus: result.subscriptionStatus,
          message: result.message,
          isLoading: false
        })

        // If no access and redirect is specified, redirect to billing
        if (!result.hasAccess && result.redirectTo) {
          router.push(result.redirectTo)
        }
      } else {
        setPaymentStatus({
          hasAccess: false,
          subscriptionStatus: 'error',
          message: 'Error checking payment status',
          isLoading: false
        })
      }
    } catch (error) {
      setPaymentStatus({
        hasAccess: false,
        subscriptionStatus: 'error',
        message: 'Network error checking payment status',
        isLoading: false
      })
    }
  }

  const handleGoToBilling = () => {
    router.push('/billing')
  }

  const handleRefresh = () => {
    setPaymentStatus(prev => ({ ...prev, isLoading: true }))
    checkPaymentStatus()
  }

  if (paymentStatus.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Verifying payment status...</span>
        </div>
      </div>
    )
  }

  if (paymentStatus.hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  // Payment required screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-lavender/30 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-lavender/10 rounded-full flex items-center justify-center mb-4">
            <CreditCard className="h-8 w-8 text-lavender" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Payment Required
          </CardTitle>
          <CardDescription className="text-gray-600">
            Complete your subscription to access PMU Pro
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert className="border-lavender/30 bg-lavender/5">
            <AlertTriangle className="h-4 w-4 text-lavender" />
            <AlertDescription>
              {paymentStatus.message || 'Active subscription required to access PMU Pro'}
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>License verification completed</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span>Payment required to continue</span>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Button 
              onClick={handleGoToBilling} 
              className="w-full bg-lavender hover:bg-lavender-600"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Complete Payment
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="w-full"
            >
              <Loader2 className="mr-2 h-4 w-4" />
              Refresh Status
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500 pt-4">
            <p>Having trouble? Contact support for assistance.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for checking payment status
export function usePaymentVerification(userId: string) {
  const [status, setStatus] = useState<PaymentStatus>({
    hasAccess: false,
    subscriptionStatus: 'unknown',
    isLoading: true
  })

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        })

        if (response.ok) {
          const result = await response.json()
          setStatus({
            hasAccess: result.hasAccess,
            subscriptionStatus: result.subscriptionStatus,
            message: result.message,
            isLoading: false
          })
        }
      } catch (error) {
        setStatus({
          hasAccess: false,
          subscriptionStatus: 'error',
          message: 'Error checking payment status',
          isLoading: false
        })
      }
    }

    if (userId) {
      checkStatus()
    }
  }, [userId])

  return status
}
