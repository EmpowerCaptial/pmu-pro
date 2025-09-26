"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  Smartphone, 
  DollarSign, 
  CheckCircle, 
  Settings,
  ExternalLink,
  Copy,
  QrCode,
  Shield,
  Zap
} from 'lucide-react'

interface PaymentMethod {
  id: string
  name: string
  type: 'digital' | 'card' | 'bank' | 'bnpl'
  description: string
  icon: string
  isEnabled: boolean
  setupRequired: boolean
  fees: string
  processingTime: string
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    type: 'card',
    description: 'Accept credit cards, debit cards, and digital wallets',
    icon: '💳',
    isEnabled: false,
    setupRequired: true,
    fees: '2.9% + 30¢ per transaction',
    processingTime: 'Instant (with Stripe Connect) or 2-7 business days'
  },
  {
    id: 'affirm',
    name: 'Affirm',
    type: 'bnpl',
    description: 'Pay over time with Affirm financing',
    icon: '🛒',
    isEnabled: false,
    setupRequired: true,
    fees: '2.9% + 30¢ per transaction',
    processingTime: 'Instant'
  },
  {
    id: 'afterpay',
    name: 'Afterpay',
    type: 'bnpl',
    description: 'Buy now, pay later with Afterpay',
    icon: '💳',
    isEnabled: false,
    setupRequired: true,
    fees: '2.9% + 30¢ per transaction',
    processingTime: 'Instant'
  },
  {
    id: 'klarna',
    name: 'Klarna',
    type: 'bnpl',
    description: 'Pay in 4 interest-free installments',
    icon: '🛍️',
    isEnabled: false,
    setupRequired: true,
    fees: '2.9% + 30¢ per transaction',
    processingTime: 'Instant'
  },
  {
    id: 'venmo',
    name: 'Venmo',
    type: 'digital',
    description: 'Accept payments through Venmo app',
    icon: '📱',
    isEnabled: false,
    setupRequired: false,
    fees: 'Free for personal accounts',
    processingTime: 'Instant'
  },
  {
    id: 'cashapp',
    name: 'Cash App',
    type: 'digital',
    description: 'Accept payments through Cash App',
    icon: '💰',
    isEnabled: false,
    setupRequired: false,
    fees: 'Free for personal accounts',
    processingTime: 'Instant'
  },
  {
    id: 'zelle',
    name: 'Zelle',
    type: 'bank',
    description: 'Bank-to-bank transfers',
    icon: '🏦',
    isEnabled: false,
    setupRequired: false,
    fees: 'Free',
    processingTime: 'Instant'
  },
  {
    id: 'cash',
    name: 'Cash',
    type: 'digital',
    description: 'Accept cash payments',
    icon: '💵',
    isEnabled: false,
    setupRequired: false,
    fees: 'No fees',
    processingTime: 'Instant'
  }
]

export default function BillingPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(PAYMENT_METHODS)
  const [stripeConfig, setStripeConfig] = useState({
    publishableKey: '',
    webhookSecret: '',
    isConnected: false
  })

  const handleTogglePaymentMethod = (id: string) => {
    setPaymentMethods(prev => 
      prev.map(method => 
        method.id === id 
          ? { ...method, isEnabled: !method.isEnabled }
          : method
      )
    )
  }

  const handleSetupPaymentMethod = (id: string) => {
    if (id === 'stripe') {
      // Redirect to Stripe Connect setup
      window.open('/stripe-connect', '_blank')
    } else if (['affirm', 'afterpay', 'klarna'].includes(id)) {
      // For BNPL methods, they're automatically available through Stripe
      alert(`${id.charAt(0).toUpperCase() + id.slice(1)} is automatically available through Stripe once enabled in your Stripe dashboard.`)
    } else {
      alert(`${id.charAt(0).toUpperCase() + id.slice(1)} setup instructions will be available soon.`)
    }
  }

  const handleStripeSetup = () => {
    // Redirect to real Stripe Connect setup page
    window.location.href = '/stripe-connect'
  }


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const getStatusBadge = (method: PaymentMethod) => {
    if (method.isEnabled) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>
    } else if (method.setupRequired) {
      return <Badge className="bg-yellow-100 text-yellow-800">Setup Required</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Available</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 p-3 sm:p-4 pb-16 sm:pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-1 sm:mb-2">Payment Processing</h1>
            <p className="text-sm sm:text-base text-muted">Set up payment methods to accept payments from your clients</p>
          </div>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/settings'}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
            Settings
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                {paymentMethods.filter(m => m.isEnabled).length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Active Payment Methods</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
                {paymentMethods.filter(m => m.type === 'digital').length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Digital Payment Options</div>
            </CardContent>
          </Card>
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">
                {paymentMethods.filter(m => m.fees.includes('Free')).length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Free Payment Methods</div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {paymentMethods.map((method) => (
            <Card key={method.id} className={`${method.isEnabled ? 'ring-2 ring-green-200' : ''}`}>
              <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="text-xl sm:text-2xl">{method.icon}</div>
                    <div>
                      <CardTitle className="text-base sm:text-lg">{method.name}</CardTitle>
                      <p className="text-xs sm:text-sm text-gray-600">{method.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={method.isEnabled}
                    onCheckedChange={() => handleTogglePaymentMethod(method.id)}
                  />
                </div>
                <div className="flex justify-between items-center">
                  {getStatusBadge(method)}
                  <span className="text-xs text-gray-500">{method.type}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                  <span>{method.fees}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                  <span>{method.processingTime}</span>
                </div>
                
                {method.setupRequired && !method.isEnabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetupPaymentMethod(method.id)}
                    className="w-full text-xs sm:text-sm"
                  >
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Setup Required
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Links Section */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <QrCode className="h-4 w-4 sm:h-5 sm:w-5" />
              Payment Links & QR Codes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="venmo-link" className="text-sm sm:text-base">Venmo Link</Label>
                <div className="flex gap-2">
                  <Input
                    id="venmo-link"
                    placeholder="@your-venmo-username"
                    className="force-white-bg force-gray-border force-dark-text text-xs sm:text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard('@your-venmo-username')}
                    className="px-2 sm:px-3"
                  >
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cashapp-link" className="text-sm sm:text-base">Cash App Link</Label>
                <div className="flex gap-2">
                  <Input
                    id="cashapp-link"
                    placeholder="$your-cashapp-username"
                    className="force-white-bg force-gray-border force-dark-text text-xs sm:text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard('$your-cashapp-username')}
                    className="px-2 sm:px-3"
                  >
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-start gap-2 sm:gap-3">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1 text-sm sm:text-base">Payment Security</h4>
                  <p className="text-xs sm:text-sm text-blue-800">
                    All payment methods are secure and encrypted. We recommend using multiple payment options 
                    to give your clients flexibility and convenience.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration Status */}
        <Card>
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              Integration Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm sm:text-base">Stripe Connect</div>
                    <div className="text-xs sm:text-sm text-gray-600">Credit card processing with instant payouts</div>
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 text-xs sm:text-sm">Setup Required</Badge>
              </div>
              
              <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm sm:text-base">Digital Payments</div>
                    <div className="text-xs sm:text-sm text-gray-600">Venmo, Cash App, Zelle</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm">Ready to Use</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}