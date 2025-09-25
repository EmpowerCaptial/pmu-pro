"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CreditCard, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink,
  Loader2,
  Shield,
  DollarSign,
  Clock,
  Users,
  Crown,
  Star
} from "lucide-react"
import { NavBar } from "@/components/ui/navbar"
import { getFeeDisplayInfo } from "@/lib/platform-fee-config"

interface StripeAccount {
  id: string
  status: 'pending' | 'active' | 'restricted' | 'disabled'
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
  requirements: any[]
  accountLink?: string
}

export default function StripeConnectPage() {
  const [stripeAccount, setStripeAccount] = useState<StripeAccount | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>('starter') // Default to starter

  useEffect(() => {
    checkStripeConnection()
    // In a real app, you'd get the user's subscription plan from auth/database
    // For now, we'll simulate different plans
    detectSubscriptionPlan()
  }, [])

  const detectSubscriptionPlan = () => {
    // In a real app, this would come from user authentication/subscription data
    // For demo purposes, we'll check localStorage or use a default
    const userPlan = localStorage.getItem('userSubscriptionPlan') || 'starter'
    setSubscriptionPlan(userPlan)
  }

  const checkStripeConnection = async () => {
    try {
      const response = await fetch('/api/stripe/connect/account-status')
      if (response.ok) {
        const data = await response.json()
        setStripeAccount(data.account)
        setIsConnected(data.account?.status === 'active')
      }
    } catch (err) {
      console.log('No existing Stripe account found')
    }
  }

  const handleStripeConnect = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/stripe/connect/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artistId: 'current-user', // This would come from auth
          artistName: 'PMU Artist',
          artistEmail: 'artist@pmupro.com',
          businessType: 'individual',
          country: 'US',
          currency: 'usd'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create Stripe account')
      }

      const data = await response.json()
      
      if (data.accountLink) {
        // Redirect to Stripe Connect onboarding
        window.location.href = data.accountLink
      } else {
        setError('No account link received from Stripe')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'restricted':
        return <Badge className="bg-red-100 text-red-800">Restricted</Badge>
      case 'disabled':
        return <Badge className="bg-gray-100 text-gray-800">Disabled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Not Connected</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <NavBar currentPath="/stripe-connect" />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 bg-lavender rounded-full flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-serif">Stripe Connect Setup</h1>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Connect your Stripe account to start accepting payments from clients and receive direct payouts
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Subscription Plan Selector (for testing) */}
          <Card className="border-lavender/30">
            <CardHeader>
              <CardTitle className="text-sm">Current Subscription Plan</CardTitle>
              <CardDescription>Select your plan to see applicable fees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={subscriptionPlan === 'starter' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSubscriptionPlan('starter')}
                  className={subscriptionPlan === 'starter' ? 'bg-lavender text-white' : ''}
                >
                  Starter
                </Button>
                <Button
                  variant={subscriptionPlan === 'professional' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSubscriptionPlan('professional')}
                  className={subscriptionPlan === 'professional' ? 'bg-green-600 text-white' : ''}
                >
                  <Crown className="h-3 w-3 mr-1" />
                  Professional
                </Button>
                <Button
                  variant={subscriptionPlan === 'studio' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSubscriptionPlan('studio')}
                  className={subscriptionPlan === 'studio' ? 'bg-purple-600 text-white' : ''}
                >
                  <Star className="h-3 w-3 mr-1" />
                  Studio
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Current Status */}
          {stripeAccount && (
            <Card className="border-lavender/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-lavender" />
                  Account Status
                </CardTitle>
                <CardDescription>
                  Your Stripe Connect account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status</span>
                  {getStatusBadge(stripeAccount.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Charges Enabled</span>
                  <Badge className={stripeAccount.chargesEnabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {stripeAccount.chargesEnabled ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Payouts Enabled</span>
                  <Badge className={stripeAccount.payoutsEnabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {stripeAccount.payoutsEnabled ? "Yes" : "No"}
                  </Badge>
                </div>
                {stripeAccount.requirements && stripeAccount.requirements.length > 0 && (
                  <div>
                    <span className="font-medium">Requirements</span>
                    <ul className="mt-2 space-y-1">
                      {stripeAccount.requirements.map((req, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          • {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Setup Instructions */}
          <Card className="border-lavender/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-lavender" />
                How Stripe Connect Works
              </CardTitle>
              <CardDescription>
                Understand the payment flow and benefits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-lavender/5 rounded-lg">
                  <div className="w-8 h-8 bg-lavender rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-sm">Client Pays</h4>
                  <p className="text-xs text-muted-foreground">Client completes checkout for your services</p>
                </div>
                <div className="text-center p-4 bg-lavender/5 rounded-lg">
                  <div className="w-8 h-8 bg-lavender rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-sm">Secure Processing</h4>
                  <p className="text-xs text-muted-foreground">Stripe processes payment securely</p>
                </div>
                <div className="text-center p-4 bg-lavender/5 rounded-lg">
                  <div className="w-8 h-8 bg-lavender rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-sm">Direct Payout</h4>
                  <p className="text-xs text-muted-foreground">Money goes directly to your bank account</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="border-lavender/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Benefits of Stripe Connect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Direct bank deposits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Professional payment processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Automatic tax reporting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Fraud protection</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">PCI DSS compliance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Multiple payment methods</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Real-time analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">24/7 support</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Button */}
          <div className="text-center">
            {isConnected ? (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Your Stripe account is connected and ready to accept payments!
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-lavender hover:bg-lavender/90 text-white"
                >
                  Go to Dashboard
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleStripeConnect}
                disabled={isLoading}
                className="bg-lavender hover:bg-lavender/90 text-white gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4" />
                    Set Up Stripe Connect
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Fee Information */}
          <Card className="border-lavender/30">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                Fee Structure
                {subscriptionPlan === 'professional' && (
                  <Badge className="bg-green-100 text-green-800">
                    <Crown className="h-3 w-3 mr-1" />
                    Professional
                  </Badge>
                )}
                {subscriptionPlan === 'studio' && (
                  <Badge className="bg-purple-100 text-purple-800">
                    <Star className="h-3 w-3 mr-1" />
                    Studio
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Stripe Processing Fee:</span>
                  <span>2.9% + $0.30 per transaction</span>
                </div>
                <div className="flex justify-between">
                  <span>PMU Pro Platform Fee:</span>
                  <span className={subscriptionPlan === 'professional' || subscriptionPlan === 'studio' ? 'text-green-600 font-semibold' : ''}>
                    {getFeeDisplayInfo(subscriptionPlan).platformFee}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Your Net Receipt:</span>
                  <span className={subscriptionPlan === 'professional' || subscriptionPlan === 'studio' ? 'text-green-600' : ''}>
                    {getFeeDisplayInfo(subscriptionPlan).netReceipt}
                  </span>
                </div>
                {(subscriptionPlan === 'professional' || subscriptionPlan === 'studio') && (
                  <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-green-800 text-xs">
                      <CheckCircle className="h-3 w-3" />
                      <span className="font-medium">Platform fees waived for {subscriptionPlan === 'professional' ? 'Professional' : 'Studio'} subscribers!</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
