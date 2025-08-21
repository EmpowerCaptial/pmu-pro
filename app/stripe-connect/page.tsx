"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CreditCard, 
  DollarSign, 
  Settings, 
  Home,
  Shield,
  TrendingUp,
  Users,
  FileText,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import StripeConnectOnboarding from '@/components/stripe-connect/onboarding'
import PayoutDashboard from '@/components/stripe-connect/payout-dashboard'
import { 
  StripeConnectAccount,
  getStripeConnectAccountByArtistId,
  initializeStripeConnectData
} from '@/lib/stripe-connect'

export default function StripeConnectPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [artistAccount, setArtistAccount] = useState<StripeConnectAccount | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Mock artist data - in real app, this would come from authentication
  const mockArtist = {
    id: 'artist_001',
    name: 'Sarah Johnson',
    email: 'sarah@pmupro.com',
    businessName: 'Sarah\'s PMU Studio'
  }

  useEffect(() => {
    // Initialize mock data
    initializeStripeConnectData()
    
    // Check if artist has existing account
    const account = getStripeConnectAccountByArtistId(mockArtist.id)
    setArtistAccount(account)
    setIsLoading(false)
  }, [])

  const handleAccountCreated = (account: StripeConnectAccount) => {
    setArtistAccount(account)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Stripe Connect...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-lavender" />
                <h1 className="text-xl font-semibold text-gray-900">Stripe Connect</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Secure Payment Processing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Stripe Connect, {mockArtist.name}!
          </h2>
          <p className="text-gray-600">
            Set up your payment processing account to receive payments directly from clients
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-lavender data-[state=active]:text-white"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="payouts" 
              className="data-[state=active]:bg-lavender data-[state=active]:text-white"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Payouts
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-lavender data-[state=active]:text-white"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Account Status */}
            {artistAccount ? (
              <Card className="border-lavender/20 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lavender-700">
                    <CheckCircle className="h-5 w-5" />
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h3 className="font-medium text-green-800">Account Active</h3>
                      <p className="text-sm text-green-600">Ready to receive payments</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-medium text-blue-800">Payouts Enabled</h3>
                      <p className="text-sm text-blue-600">Money flows to your bank</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <h3 className="font-medium text-purple-800">Secure & Compliant</h3>
                      <p className="text-sm text-purple-600">PCI DSS compliant</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-lavender/20 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lavender-700">
                    <AlertTriangle className="h-5 w-5" />
                    Account Setup Required
                  </CardTitle>
                  <CardDescription>
                    Complete your Stripe Connect account setup to start receiving payments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Set Up Your Payment Account
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Connect your bank account to receive payments directly from clients
                    </p>
                    <Button
                      onClick={() => setActiveTab('onboarding')}
                      className="bg-lavender hover:bg-lavender-600 text-white"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Start Setup
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="border-lavender/20 bg-white">
              <CardHeader>
                <CardTitle className="text-lavender-700">Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and shortcuts for your Stripe Connect account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex-col border-lavender/20 hover:bg-lavender/5"
                    onClick={() => setActiveTab('payouts')}
                  >
                    <DollarSign className="h-6 w-6 text-lavender mb-2" />
                    <span className="text-sm">View Payouts</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-24 flex-col border-lavender/20 hover:bg-lavender/5"
                    onClick={() => window.open('/checkout', '_blank')}
                  >
                    <Users className="h-6 w-6 text-lavender mb-2" />
                    <span className="text-sm">Checkout Client</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-24 flex-col border-lavender/20 hover:bg-lavender/5"
                    onClick={() => window.open('/clients', '_blank')}
                  >
                    <FileText className="h-6 w-6 text-lavender mb-2" />
                    <span className="text-sm">Manage Clients</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-24 flex-col border-lavender/20 hover:bg-lavender/5"
                    onClick={() => setActiveTab('settings')}
                  >
                    <Settings className="h-6 w-6 text-lavender mb-2" />
                    <span className="text-sm">Account Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="border-lavender/20 bg-lavender/5">
              <CardHeader>
                <CardTitle className="text-lavender-700">Why Stripe Connect?</CardTitle>
                <CardDescription>
                  Professional payment processing designed for your business
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-lavender-700">For Artists</h4>
                    <ul className="text-sm text-lavender-600 space-y-1">
                      <li>• Direct bank deposits</li>
                      <li>• Professional payment processing</li>
                      <li>• Automatic tax reporting</li>
                      <li>• Competitive processing fees</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-lavender-700">For Clients</h4>
                    <ul className="text-sm text-lavender-600 space-y-1">
                      <li>• Secure payment processing</li>
                      <li>• Multiple payment methods</li>
                      <li>• Professional checkout experience</li>
                      <li>• Receipt and confirmation emails</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts" className="space-y-6">
            {artistAccount ? (
              <PayoutDashboard artistId={mockArtist.id} />
            ) : (
              <Card className="border-lavender/20 bg-white">
                <CardContent className="p-6 text-center">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Account Required
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Set up your Stripe Connect account to view payout information
                  </p>
                  <Button
                    onClick={() => setActiveTab('onboarding')}
                    className="bg-lavender hover:bg-lavender-600 text-white"
                  >
                    Set Up Account
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {artistAccount ? (
              <Card className="border-lavender/20 bg-white">
                <CardHeader>
                  <CardTitle className="text-lavender-700">Account Settings</CardTitle>
                  <CardDescription>
                    Manage your Stripe Connect account preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Account Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Account ID:</span>
                          <p className="font-mono text-xs">{artistAccount.stripeAccountId}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Business Type:</span>
                          <p className="capitalize">{artistAccount.businessType}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <p className="capitalize">{artistAccount.status}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Payout Schedule:</span>
                          <p className="capitalize">{artistAccount.payoutSchedule}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Payout Preferences</h4>
                      <p className="text-sm text-gray-600">
                        Payouts are currently set to {artistAccount.payoutSchedule} with a {artistAccount.payoutDelay}-day delay.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-lavender/20 bg-white">
                <CardContent className="p-6 text-center">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Account Required
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Set up your Stripe Connect account to access settings
                  </p>
                  <Button
                    onClick={() => setActiveTab('onboarding')}
                    className="bg-lavender hover:bg-lavender-600 text-white"
                  >
                    Set Up Account
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Onboarding Tab (Hidden from main tabs but accessible) */}
          <TabsContent value="onboarding" className="space-y-6">
            <StripeConnectOnboarding
              artistId={mockArtist.id}
              artistName={mockArtist.name}
              artistEmail={mockArtist.email}
              onAccountCreated={handleAccountCreated}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
