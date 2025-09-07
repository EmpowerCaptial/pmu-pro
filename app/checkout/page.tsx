"use client"

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  CreditCard, 
  ArrowLeft, 
  CheckCircle, 
  DollarSign,
  Smartphone,
  Wallet,
  Receipt,
  User,
  Calendar,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get cart data from URL params or localStorage
  const [cart, setCart] = useState(() => {
    const cartData = searchParams.get('cart')
    return cartData ? JSON.parse(decodeURIComponent(cartData)) : []
  })
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [tipAmount, setTipAmount] = useState(0)
  const [customTip, setCustomTip] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Sample client data (in real app, this would come from the selected client)
  const client = {
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 123-4567'
  }

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
    { id: 'cash', name: 'Cash', icon: DollarSign, color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' },
    { id: 'venmo', name: 'Venmo', icon: Smartphone, color: 'bg-purple-500', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
    { id: 'paypal', name: 'PayPal', icon: Wallet, color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' },
    { id: 'zelle', name: 'Zelle', icon: Smartphone, color: 'bg-indigo-500', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700' }
  ]

  const subtotal = cart.reduce((sum: number, item: any) => sum + (item.price || 0), 0)
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax + tipAmount

  const processPayment = async () => {
    setIsProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsProcessing(false)
    setPaymentSuccess(true)
    
    // In real app, this would integrate with Stripe, Square, etc.
    console.log('Payment processed:', {
      method: selectedPaymentMethod,
      amount: total,
      items: cart
    })
  }

  const handleTipChange = (percent: number) => {
    setTipAmount(subtotal * (percent / 100))
    setCustomTip('')
  }

  const handleCustomTip = () => {
    const custom = parseFloat(customTip) || 0
    setTipAmount(custom)
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white">
          <CardHeader className="text-center border-b border-gray-100">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Payment Successful!</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Transaction completed successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 text-center space-y-4">
            <div className="space-y-2">
              <p className="text-gray-700">
                <strong>Amount:</strong> ${total.toFixed(2)}
              </p>
              <p className="text-gray-700">
                <strong>Method:</strong> {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
              </p>
              <p className="text-gray-700">
                <strong>Client:</strong> {client.name}
              </p>
            </div>
            
            <div className="pt-4 space-y-3">
              <Button 
                className="w-full bg-lavender hover:bg-lavender-600 text-white"
                onClick={() => router.push('/pos')}
              >
                <Receipt className="h-4 w-4 mr-2" />
                New Transaction
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-gray-200 hover:border-gray-300"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.back()}
                className="border-gray-200 hover:border-gray-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
                <p className="text-sm text-gray-500">Complete your transaction</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-lavender text-white px-3 py-1">
                <Receipt className="h-3 w-3 mr-1" />
                POS Transaction
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client & Items Breakdown */}
          <div className="space-y-6">
            {/* Client Information */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-lavender" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{client.name}</h3>
                    <p className="text-gray-600">{client.email}</p>
                    <p className="text-gray-600">{client.phone}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>Today's Appointment</span>
                    <Clock className="h-4 w-4 ml-2" />
                    <span>2:00 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items Breakdown */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-lavender" />
                  Service Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {cart.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-lavender rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                          {item.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          {item.quantity && item.quantity > 1 && (
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">${item.price?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (8%):</span>
                    <span className="font-semibold text-gray-900">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tip:</span>
                    <span className="font-semibold text-gray-900">${tipAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-lavender">${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Processing */}
          <div className="space-y-6">
            {/* Tip Options */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-900">Add Tip</CardTitle>
                <CardDescription>Select a tip amount for the service</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[15, 18, 20].map((percent) => (
                      <Button
                        key={percent}
                        variant="outline"
                        size="sm"
                        onClick={() => handleTipChange(percent)}
                        className="border-gray-200 hover:border-lavender hover:bg-lavender/5"
                      >
                        {percent}%
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Custom tip amount"
                      value={customTip}
                      onChange={(e) => setCustomTip(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:border-lavender focus:ring-lavender/20"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCustomTip}
                      className="border-gray-200 hover:border-lavender hover:bg-lavender/5"
                    >
                      Set
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-900">Payment Method</CardTitle>
                <CardDescription>Choose how the client will pay</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <Button
                      key={method.id}
                      variant={selectedPaymentMethod === method.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`h-16 flex flex-col items-center gap-2 ${
                        selectedPaymentMethod === method.id 
                          ? 'bg-lavender hover:bg-lavender-600 text-white' 
                          : `${method.bgColor} ${method.textColor} border-gray-200 hover:border-lavender`
                      }`}
                    >
                      <method.icon className="h-5 w-5" />
                      <span className="text-xs font-medium">{method.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Process Payment */}
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-6">
                <Button 
                  size="lg" 
                  className="w-full bg-lavender hover:bg-lavender-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-14 text-lg font-semibold"
                  onClick={processPayment}
                  disabled={!selectedPaymentMethod || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Process Payment - ${total.toFixed(2)}
                    </>
                  )}
                </Button>
                
                {selectedPaymentMethod && (
                  <p className="text-sm text-gray-600 text-center mt-3">
                    Payment will be processed via {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
