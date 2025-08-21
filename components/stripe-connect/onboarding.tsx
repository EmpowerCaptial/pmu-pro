"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  User, 
  Building, 
  Globe,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
  Loader2
} from 'lucide-react'
import { 
  StripeConnectAccount,
  getStripeConnectAccountByArtistId,
  createStripeConnectAccount,
  getAccountStatusColor,
  getAccountStatusIcon,
  getAccountStatusText
} from '@/lib/stripe-connect'

interface StripeConnectOnboardingProps {
  artistId: string
  artistName: string
  artistEmail: string
  onAccountCreated?: (account: StripeConnectAccount) => void
}

export default function StripeConnectOnboarding({ 
  artistId, 
  artistName, 
  artistEmail,
  onAccountCreated 
}: StripeConnectOnboardingProps) {
  const [existingAccount, setExistingAccount] = useState<StripeConnectAccount | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [onboardingData, setOnboardingData] = useState({
    businessType: 'individual',
    country: 'US',
    currency: 'usd'
  })
  const [accountLink, setAccountLink] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if artist already has a Stripe Connect account
    const account = getStripeConnectAccountByArtistId(artistId)
    if (account) {
      setExistingAccount(account)
    }
  }, [artistId])

  const handleCreateAccount = async () => {
    setIsCreating(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/connect/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artistId,
          artistName,
          artistEmail,
          businessType: onboardingData.businessType,
          country: onboardingData.country,
          currency: onboardingData.currency
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Create local account record
        const newAccount = createStripeConnectAccount({
          artistId,
          stripeAccountId: result.accountId,
          status: result.account.status,
          businessType: onboardingData.businessType as 'individual' | 'company',
          chargesEnabled: result.account.chargesEnabled,
          payoutsEnabled: result.account.payoutsEnabled,
          detailsSubmitted: result.account.detailsSubmitted,
          requirements: result.account.requirements,
          payoutSchedule: 'automatic',
          payoutDelay: 7
        })

        setExistingAccount(newAccount)
        setAccountLink(result.accountLink)
        
        if (onAccountCreated) {
          onAccountCreated(newAccount)
        }
      } else {
        setError(result.error || 'Failed to create Stripe Connect account')
      }
    } catch (error) {
      console.error('Error creating Stripe Connect account:', error)
      setError('Failed to create account. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCompleteOnboarding = () => {
    if (accountLink) {
      window.open(accountLink, '_blank')
    }
  }

  const getCountryName = (code: string) => {
    const countries: Record<string, string> = {
      'US': 'United States',
      'CA': 'Canada',
      'GB': 'United Kingdom',
      'AU': 'Australia',
      'DE': 'Germany',
      'FR': 'France',
      'JP': 'Japan'
    }
    return countries[code] || code
  }

  if (existingAccount) {
    return (
      <Card className="border-lavender/20 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lavender-700">
            <CreditCard className="h-5 w-5" />
            Stripe Connect Account
          </CardTitle>
          <CardDescription>
            Your payment processing account is set up and ready
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Account Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Account Status:</span>
              <Badge className={getAccountStatusColor(existingAccount.status)}>
                {getAccountStatusIcon(existingAccount.status)} {existingAccount.status}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600">
              {getAccountStatusText(existingAccount.status)}
            </p>

            {/* Account Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Account ID:</span>
                <p className="font-mono text-xs">{existingAccount.stripeAccountId}</p>
              </div>
              <div>
                <span className="text-gray-600">Business Type:</span>
                <p className="capitalize">{existingAccount.businessType}</p>
              </div>
              <div>
                <span className="text-gray-600">Charges Enabled:</span>
                <p>{existingAccount.chargesEnabled ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <span className="text-gray-600">Payouts Enabled:</span>
                <p>{existingAccount.payoutsEnabled ? 'Yes' : 'No'}</p>
              </div>
            </div>

            {/* Requirements */}
            {existingAccount.requirements.currentlyDue.length > 0 && (
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">Action Required</h4>
                <p className="text-sm text-yellow-700">
                  Complete the following requirements to enable payouts:
                </p>
                <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                  {existingAccount.requirements.currentlyDue.map((requirement, index) => (
                    <li key={index}>• {requirement}</li>
                  ))}
                </ul>
                <Button
                  onClick={handleCompleteOnboarding}
                  className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white"
                  size="sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Complete Requirements
                </Button>
              </div>
            )}

            {/* Ready for Payouts */}
            {existingAccount.status === 'active' && existingAccount.payoutsEnabled && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    Ready to Receive Payouts!
                  </span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Your account is fully verified and ready to receive payments from clients.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-lavender/20 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lavender-700">
          <CreditCard className="h-5 w-5" />
          Set Up Stripe Connect Account
        </CardTitle>
        <CardDescription>
          Connect your bank account to receive payments directly from clients
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Benefits */}
          <div className="bg-lavender/5 p-4 rounded-lg border border-lavender/20">
            <h4 className="font-medium text-lavender-700 mb-2">Why Set Up Stripe Connect?</h4>
            <ul className="text-sm text-lavender-700 space-y-1">
              <li>• Receive payments directly to your bank account</li>
              <li>• Professional payment processing for your business</li>
              <li>• Automatic tax reporting and compliance</li>
              <li>• Secure and reliable payment infrastructure</li>
              <li>• Competitive processing fees</li>
            </ul>
          </div>

          {/* Onboarding Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="business-type">Business Type</Label>
              <Select 
                value={onboardingData.businessType} 
                onValueChange={(value) => setOnboardingData(prev => ({ ...prev, businessType: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">
                    <User className="h-4 w-4 mr-2" />
                    Individual/Sole Proprietor
                  </SelectItem>
                  <SelectItem value="company">
                    <Building className="h-4 w-4 mr-2" />
                    Company/Corporation
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Select 
                value={onboardingData.country} 
                onValueChange={(value) => setOnboardingData(prev => ({ ...prev, country: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">
                    <Globe className="h-4 w-4 mr-2" />
                    United States
                  </SelectItem>
                  <SelectItem value="CA">
                    <Globe className="h-4 w-4 mr-2" />
                    Canada
                  </SelectItem>
                  <SelectItem value="GB">
                    <Globe className="h-4 w-4 mr-2" />
                    United Kingdom
                  </SelectItem>
                  <SelectItem value="AU">
                    <Globe className="h-4 w-4 mr-2" />
                    Australia
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={onboardingData.currency} 
                onValueChange={(value) => setOnboardingData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD - US Dollar</SelectItem>
                  <SelectItem value="cad">CAD - Canadian Dollar</SelectItem>
                  <SelectItem value="gbp">GBP - British Pound</SelectItem>
                  <SelectItem value="eur">EUR - Euro</SelectItem>
                  <SelectItem value="aud">AUD - Australian Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={handleCreateAccount}
            disabled={isCreating}
            className="w-full bg-lavender hover:bg-lavender-600 text-white"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Create Stripe Connect Account
              </>
            )}
          </Button>

          {/* Information */}
          <div className="text-xs text-gray-500 text-center">
            <p>
              By creating a Stripe Connect account, you agree to Stripe's{' '}
              <a href="https://stripe.com/connect-account/legal" target="_blank" rel="noopener noreferrer" className="text-lavender hover:underline">
                terms of service
              </a>
              {' '}and PMU Pro's platform agreement.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
