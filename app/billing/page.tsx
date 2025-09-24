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
  type: 'digital' | 'card' | 'bank'
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
    id: 'paypal',
    name: 'PayPal',
    type: 'digital',
    description: 'Accept PayPal payments and credit cards',
    icon: '🅿️',
    isEnabled: false,
    setupRequired: true,
    fees: '2.9% + fixed fee',
    processingTime: 'Instant to 1 day'
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

  const handleStripeSetup = () => {
    // This would typically redirect to Stripe Connect setup
    alert('Redirecting to Stripe Connect setup...')
  }

  const handlePayPalSetup = () => {
    // This would typically redirect to PayPal setup
    alert('Redirecting to PayPal setup...')
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
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-ink mb-2">Payment Processing</h1>
            <p className="text-muted">Set up payment methods to accept payments from your clients</p>
          </div>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/settings'}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {paymentMethods.filter(m => m.isEnabled).length}
              </div>
              <div className="text-sm text-gray-600">Active Payment Methods</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {paymentMethods.filter(m => m.type === 'digital').length}
              </div>
              <div className="text-sm text-gray-600">Digital Payment Options</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {paymentMethods.filter(m => m.fees.includes('Free')).length}
              </div>
              <div className="text-sm text-gray-600">Free Payment Methods</div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {paymentMethods.map((method) => (
            <Card key={method.id} className={`${method.isEnabled ? 'ring-2 ring-green-200' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{method.icon}</div>
                    <div>
                      <CardTitle className="text-lg">{method.name}</CardTitle>
                      <p className="text-sm text-gray-600">{method.description}</p>
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
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span>{method.fees}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-gray-500" />
                  <span>{method.processingTime}</span>
                </div>
                
                {method.setupRequired && !method.isEnabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (method.id === 'stripe') handleStripeSetup()
                      else if (method.id === 'paypal') handlePayPalSetup()
                    }}
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Setup Required
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Links Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Payment Links & QR Codes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="venmo-link">Venmo Link</Label>
                <div className="flex gap-2">
                  <Input
                    id="venmo-link"
                    placeholder="@your-venmo-username"
                    className="force-white-bg force-gray-border force-dark-text"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard('@your-venmo-username')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cashapp-link">Cash App Link</Label>
                <div className="flex gap-2">
                  <Input
                    id="cashapp-link"
                    placeholder="$your-cashapp-username"
                    className="force-white-bg force-gray-border force-dark-text"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard('$your-cashapp-username')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Payment Security</h4>
                  <p className="text-sm text-blue-800">
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Integration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Stripe Connect</div>
                    <div className="text-sm text-gray-600">Credit card processing with instant payouts</div>
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Setup Required</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Digital Payments</div>
                    <div className="text-sm text-gray-600">Venmo, Cash App, Zelle</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Ready to Use</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}