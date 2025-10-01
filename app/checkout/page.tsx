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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

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
  const [showNextAppointmentDialog, setShowNextAppointmentDialog] = useState(false)
  const [selectedWeeks, setSelectedWeeks] = useState<number | null>(null)
  
  // Discount and split payment states
  const [discountType, setDiscountType] = useState<'percentage' | 'dollar'>('percentage')
  const [discountValue, setDiscountValue] = useState('')
  const [discountAmount, setDiscountAmount] = useState(0)
  const [splitPaymentEnabled, setSplitPaymentEnabled] = useState(false)
  const [splitAmount, setSplitAmount] = useState('')
  const [splitMethod, setSplitMethod] = useState('')
  const [taxesEnabled, setTaxesEnabled] = useState(true)

  // Get client data from URL params or use default
  const [client, setClient] = useState(() => {
    const clientName = searchParams.get('clientName')
    const clientEmail = searchParams.get('clientEmail') 
    const clientPhone = searchParams.get('clientPhone')
    
    return {
      name: clientName || 'Guest Client',
      email: clientEmail || '',
      phone: clientPhone || ''
    }
  })

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
    { id: 'affirm', name: 'Affirm', icon: CreditCard, color: 'bg-purple-500', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
    { id: 'afterpay', name: 'Afterpay', icon: CreditCard, color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' },
    { id: 'klarna', name: 'Klarna', icon: CreditCard, color: 'bg-pink-500', bgColor: 'bg-pink-50', textColor: 'text-pink-700' },
    { id: 'cash', name: 'Cash', icon: DollarSign, color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' },
    { id: 'venmo', name: 'Venmo', icon: Smartphone, color: 'bg-purple-500', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
    { id: 'zelle', name: 'Zelle', icon: Smartphone, color: 'bg-indigo-500', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700' }
  ]

  const subtotal = cart.reduce((sum: number, item: any) => sum + (item.price || 0), 0)
  const tax = taxesEnabled ? subtotal * 0.08 : 0 // 8% tax when enabled
  const total = subtotal + tax + tipAmount - discountAmount

  const processPayment = async () => {
    setIsProcessing(true)
    
    try {
      // Handle BNPL payments through Stripe
      if (['affirm', 'afterpay', 'klarna'].includes(selectedPaymentMethod)) {
        // Create Stripe checkout session for BNPL
        const response = await fetch('/api/stripe/create-bnpl-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: total,
            currency: 'usd',
            paymentMethod: selectedPaymentMethod,
            clientName: client.name,
            clientEmail: client.email,
            items: cart,
            successUrl: `${window.location.origin}/checkout/success`,
            cancelUrl: `${window.location.origin}/checkout`
          }),
        })

        const data = await response.json()
        
        if (data.success && data.url) {
          // Redirect to Stripe checkout for BNPL
          window.location.href = data.url
          return
        } else {
          throw new Error(data.error || 'Failed to create BNPL checkout')
        }
      }
      
      // Simulate other payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsProcessing(false)
      setPaymentSuccess(true)
      setShowNextAppointmentDialog(true)
      
      console.log('Payment processed:', {
        method: selectedPaymentMethod,
        amount: total,
        items: cart
      })
    } catch (error) {
      console.error('Payment processing error:', error)
      setIsProcessing(false)
      // Handle error - could show error message to user
    }
  }

  const handleTipChange = (percent: number) => {
    setTipAmount(subtotal * (percent / 100))
    setCustomTip('')
  }

  const handleCustomTip = () => {
    const custom = parseFloat(customTip) || 0
    setTipAmount(custom)
  }

  const handleDiscountChange = () => {
    const value = parseFloat(discountValue) || 0
    if (discountType === 'percentage') {
      setDiscountAmount(subtotal * (value / 100))
    } else {
      setDiscountAmount(Math.min(value, subtotal)) // Can't discount more than subtotal
    }
  }

  const clearDiscount = () => {
    setDiscountValue('')
    setDiscountAmount(0)
  }

  const handleScheduleNextAppointment = (weeks: number) => {
    setSelectedWeeks(weeks)
    const nextDate = new Date()
    nextDate.setDate(nextDate.getDate() + (weeks * 7))
    const formattedDate = nextDate.toISOString().split('T')[0]
    
    // Navigate to booking page with pre-selected date and client
    router.push(`/booking?date=${formattedDate}&clientName=${encodeURIComponent(client.name)}&clientEmail=${encodeURIComponent(client.email)}&clientPhone=${encodeURIComponent(client.phone)}`)
  }

  const handleScheduleLater = () => {
    setShowNextAppointmentDialog(false)
    // Client can schedule later
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
                className="w-full bg-gradient-to-r from-teal-500 to-lavender hover:from-teal-600 hover:to-lavender-600 text-white shadow-lg"
                onClick={() => setShowNextAppointmentDialog(true)}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Next Appointment
              </Button>
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

        {/* Schedule Next Appointment Dialog */}
        {showNextAppointmentDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <Card className="w-full max-w-md border-0 shadow-2xl bg-white">
              <CardHeader className="text-center border-b border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-lavender/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-teal-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">Schedule Follow-up Appointment?</CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Book {client.name}'s next visit now
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-center text-gray-600 mb-4">
                  When would you like to schedule the next appointment?
                </p>
                
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    onClick={() => handleScheduleNextAppointment(2)}
                    className="flex flex-col items-center gap-2 h-24 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 border border-blue-200"
                  >
                    <Clock className="h-6 w-6" />
                    <span className="font-bold">2 Weeks</span>
                  </Button>
                  <Button
                    onClick={() => handleScheduleNextAppointment(4)}
                    className="flex flex-col items-center gap-2 h-24 bg-gradient-to-br from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 text-teal-700 border border-teal-200"
                  >
                    <Clock className="h-6 w-6" />
                    <span className="font-bold">4 Weeks</span>
                  </Button>
                  <Button
                    onClick={() => handleScheduleNextAppointment(6)}
                    className="flex flex-col items-center gap-2 h-24 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-700 border border-purple-200"
                  >
                    <Clock className="h-6 w-6" />
                    <span className="font-bold">6 Weeks</span>
                  </Button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={handleScheduleLater}
                    className="w-full border-gray-300 hover:bg-gray-50"
                  >
                    Schedule Later
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
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
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span className="font-semibold">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {/* Taxes Toggle */}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={taxesEnabled}
                        onCheckedChange={setTaxesEnabled}
                        className="data-[state=checked]:bg-lavender data-[state=unchecked]:bg-gray-300"
                      />
                      <Label className="text-sm text-gray-600">Include Taxes</Label>
                    </div>
                    <span className="text-xs text-gray-500">8%</span>
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

            {/* Discount Section */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-900">Apply Discount</CardTitle>
                <CardDescription>Add a percentage or dollar amount discount</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Discount Type Selection */}
                  <div className="flex gap-2">
                    <Button
                      variant={discountType === 'percentage' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDiscountType('percentage')}
                      className={discountType === 'percentage' ? 'bg-lavender hover:bg-lavender-600 text-white' : 'border-gray-200 hover:border-lavender'}
                    >
                      Percentage
                    </Button>
                    <Button
                      variant={discountType === 'dollar' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDiscountType('dollar')}
                      className={discountType === 'dollar' ? 'bg-lavender hover:bg-lavender-600 text-white' : 'border-gray-200 hover:border-lavender'}
                    >
                      Dollar Amount
                    </Button>
                  </div>
                  
                  {/* Discount Input */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder={discountType === 'percentage' ? 'Enter percentage (e.g., 10)' : 'Enter dollar amount (e.g., 25)'}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-lavender focus:ring-lavender/20"
                        min="0"
                        max={discountType === 'percentage' ? 100 : subtotal}
                        step={discountType === 'percentage' ? 1 : 0.01}
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleDiscountChange}
                      className="border-gray-200 hover:border-lavender hover:bg-lavender/5"
                    >
                      Apply
                    </Button>
                    {discountAmount > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={clearDiscount}
                        className="border-red-200 hover:border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  
                  {/* Discount Preview */}
                  {discountAmount > 0 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-700">
                        <strong>Discount Applied:</strong> -${discountAmount.toFixed(2)}
                        {discountType === 'percentage' && (
                          <span> ({discountValue}% of subtotal)</span>
                        )}
                      </p>
                    </div>
                  )}
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

            {/* Split Payment Section */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                  <span>Split Payment</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSplitPaymentEnabled(!splitPaymentEnabled)}
                    className={splitPaymentEnabled ? 'bg-lavender hover:bg-lavender-600 text-white border-lavender' : 'border-gray-200 hover:border-lavender'}
                  >
                    {splitPaymentEnabled ? 'Enabled' : 'Enable'}
                  </Button>
                </CardTitle>
                <CardDescription>Allow client to split payment between multiple methods</CardDescription>
              </CardHeader>
              {splitPaymentEnabled && (
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Split Amount ($)
                        </label>
                        <input
                          type="number"
                          placeholder="Enter split amount"
                          value={splitAmount}
                          onChange={(e) => setSplitAmount(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-lavender focus:ring-lavender/20"
                          min="0.01"
                          max={total}
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Split Method
                        </label>
                        <select
                          value={splitMethod}
                          onChange={(e) => setSplitMethod(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-lavender focus:ring-lavender/20"
                        >
                          <option value="">Select method</option>
                          {paymentMethods.map((method) => (
                            <option key={method.id} value={method.id}>
                              {method.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {splitAmount && splitMethod && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-700">
                          <strong>Split Payment:</strong> ${parseFloat(splitAmount).toFixed(2)} via {paymentMethods.find(m => m.id === splitMethod)?.name}
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          <strong>Remaining:</strong> ${(total - parseFloat(splitAmount)).toFixed(2)} via {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Process Payment - Sticky Button */}
            <div className="sticky bottom-4 z-[60]">
              <Card className="border-0 shadow-xl bg-white">
                <CardContent className="p-6">
                  <Button 
                    size="lg" 
                    className="w-full bg-lavender hover:bg-lavender-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-16 text-xl font-bold"
                    onClick={processPayment}
                    disabled={!selectedPaymentMethod || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-6 w-6 mr-3" />
                        Process Payment - ${total.toFixed(2)}
                      </>
                    )}
                  </Button>
                  
                  {selectedPaymentMethod && (
                    <p className="text-sm text-gray-600 text-center mt-3">
                      Payment will be processed via {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                      {splitPaymentEnabled && splitAmount && splitMethod && (
                        <span className="block mt-1">
                          Split: ${parseFloat(splitAmount).toFixed(2)} via {paymentMethods.find(m => m.id === splitMethod)?.name}
                        </span>
                      )}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
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
