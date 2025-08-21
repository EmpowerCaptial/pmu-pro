"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  CreditCard, 
  User, 
  ShoppingCart,
  Home,
  ArrowLeft,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

export default function CheckoutDemoPage() {
  const [currentStep, setCurrentStep] = useState<'services' | 'client' | 'payment' | 'complete'>('services')
  const [selectedService, setSelectedService] = useState('')
  const [selectedClient, setSelectedClient] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [gratuity, setGratuity] = useState('0')

  const services = [
    { id: 'microblading', name: 'Microblading', price: 450, description: 'Natural-looking eyebrow enhancement' },
    { id: 'powder-brows', name: 'Powder Brows', price: 400, description: 'Soft, powdered eyebrow technique' },
    { id: 'lip-blush', name: 'Lip Blush', price: 350, description: 'Natural lip color enhancement' },
    { id: 'eyeliner', name: 'Eyeliner', price: 300, description: 'Permanent eyeliner application' }
  ]

  const clients = [
    { id: 'client1', name: 'Sarah Johnson', email: 'sarah@example.com', state: 'Missouri' },
    { id: 'client2', name: 'Mike Chen', email: 'mike@example.com', state: 'Illinois' },
    { id: 'client3', name: 'Emily Davis', email: 'emily@example.com', state: 'Kansas' }
  ]

  const gratuityOptions = [
    { value: '0', label: 'No Gratuity' },
    { value: '0.15', label: '15% - Good Service' },
    { value: '0.18', label: '18% - Great Service' },
    { value: '0.20', label: '20% - Excellent Service' },
    { value: '0.25', label: '25% - Outstanding Service' }
  ]

  const getSelectedService = () => services.find(s => s.id === selectedService)
  const getSelectedClient = () => clients.find(c => c.id === selectedClient)
  
  const getTaxRate = (state: string) => {
    const rates: Record<string, number> = {
      'Missouri': 0.04225,
      'Illinois': 0.0625,
      'Kansas': 0.065,
      'default': 0.08
    }
    return rates[state] || rates.default
  }

  const calculateTotal = () => {
    const service = getSelectedService()
    const client = getSelectedClient()
    if (!service || !client) return 0

    const price = customPrice ? parseFloat(customPrice) : service.price
    const taxRate = getTaxRate(client.state)
    const gratuityRate = parseFloat(gratuity)
    
    const tax = price * taxRate
    const gratuityAmount = price * gratuityRate
    const total = price + tax + gratuityAmount
    
    return {
      price,
      tax,
      gratuityAmount,
      total: Math.round(total * 100) / 100
    }
  }

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId)
    setCurrentStep('client')
  }

  const handleClientSelect = (clientId: string) => {
    setSelectedClient(clientId)
    setCurrentStep('payment')
  }

  const handlePayment = () => {
    setCurrentStep('complete')
  }

  const resetCheckout = () => {
    setCurrentStep('services')
    setSelectedService('')
    setSelectedClient('')
    setCustomPrice('')
    setGratuity('0')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-beige/10">
      {/* Header */}
      <div className="bg-white border-b border-lavender/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-lavender hover:bg-lavender/5">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Service Checkout Demo</h1>
                <p className="text-gray-600">Test the complete checkout workflow</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setCurrentStep('services')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentStep === 'services'
                  ? 'bg-lavender text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🎯 Select Service
            </button>
            <button
              onClick={() => setCurrentStep('client')}
              disabled={!selectedService}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentStep === 'client'
                  ? 'bg-lavender text-white shadow-sm'
                  : selectedService
                  ? 'text-gray-600 hover:text-gray-800'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              👤 Choose Client
            </button>
            <button
              onClick={() => setCurrentStep('payment')}
              disabled={!selectedService || !selectedClient}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentStep === 'payment'
                  ? 'bg-lavender text-white shadow-sm'
                  : selectedService && selectedClient
                  ? 'text-gray-600 hover:text-gray-800'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              💳 Payment
            </button>
            <button
              onClick={() => setCurrentStep('complete')}
              disabled={!selectedService || !selectedClient}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentStep === 'complete'
                  ? 'bg-lavender text-white shadow-sm'
                  : selectedService && selectedClient
                  ? 'text-gray-600 hover:text-gray-800'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              ✅ Complete
            </button>
          </div>
        </div>

        {/* Services Step */}
        {currentStep === 'services' && (
          <Card className="border-lavender/20 bg-white">
            <CardHeader>
              <CardTitle className="text-lavender-700">Select a Service</CardTitle>
              <CardDescription>
                Choose the PMU service you want to provide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <Card 
                    key={service.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow border-lavender/20"
                    onClick={() => handleServiceSelect(service.id)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                      <div className="text-2xl font-bold text-lavender">${service.price}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Client Selection Step */}
        {currentStep === 'client' && selectedService && (
          <Card className="border-lavender/20 bg-white">
            <CardHeader>
              <CardTitle className="text-lavender-700">Choose a Client</CardTitle>
              <CardDescription>
                Select the client for this service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="p-4 border rounded-lg cursor-pointer hover:border-lavender/30 hover:bg-lavender/5 transition-colors"
                    onClick={() => handleClientSelect(client.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{client.name}</h3>
                        <p className="text-gray-600 text-sm">{client.email}</p>
                        <p className="text-gray-500 text-xs">State: {client.state}</p>
                      </div>
                      <div className="w-6 h-6 border-2 border-lavender rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-lavender rounded-full"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Step */}
        {currentStep === 'payment' && selectedService && selectedClient && (
          <Card className="border-lavender/20 bg-white">
            <CardHeader>
              <CardTitle className="text-lavender-700">Payment Details</CardTitle>
              <CardDescription>
                Review service details and customize pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Service Summary */}
                <div className="bg-lavender/5 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Service Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Service:</span>
                      <p className="font-medium">{getSelectedService()?.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Client:</span>
                      <p className="font-medium">{getSelectedClient()?.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Base Price:</span>
                      <p className="font-medium">${getSelectedService()?.price}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">State:</span>
                      <p className="font-medium">{getSelectedClient()?.state}</p>
                    </div>
                  </div>
                </div>

                {/* Customization */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="custom-price">Custom Price (Optional)</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-gray-500">$</span>
                      <Input
                        id="custom-price"
                        type="number"
                        placeholder={getSelectedService()?.price.toString()}
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Gratuity</Label>
                    <Select value={gratuity} onValueChange={setGratuity}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select gratuity" />
                      </SelectTrigger>
                      <SelectContent>
                        {gratuityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Price Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Service Price:</span>
                      <span>${calculateTotal().price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({(getTaxRate(getSelectedClient()?.state || '') * 100).toFixed(2)}%):</span>
                      <span>${calculateTotal().tax.toFixed(2)}</span>
                    </div>
                    {calculateTotal().gratuityAmount > 0 && (
                      <div className="flex justify-between">
                        <span>Gratuity:</span>
                        <span>${calculateTotal().gratuityAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-lavender">${calculateTotal().total}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('client')}
                  >
                    Back to Client Selection
                  </Button>
                  
                  <Button
                    onClick={handlePayment}
                    className="bg-lavender hover:bg-lavender-600 text-white flex-1"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Proceed to Payment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completion Step */}
        {currentStep === 'complete' && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Checkout Complete!
              </CardTitle>
              <CardDescription>
                Your service checkout has been completed successfully
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Transaction Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Service:</span>
                      <p className="font-medium">{getSelectedService()?.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Client:</span>
                      <p className="font-medium">{getSelectedClient()?.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Amount:</span>
                      <p className="font-medium text-green-600">${calculateTotal().total}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <p className="font-medium text-green-600">Completed</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">Next Steps</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Client will receive confirmation email</li>
                    <li>• Schedule appointment with client</li>
                    <li>• Prepare for service delivery</li>
                    <li>• Follow up with aftercare instructions</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={resetCheckout}
                    className="flex-1"
                  >
                    Start New Checkout
                  </Button>
                  
                  <Link href="/dashboard" className="flex-1">
                    <Button className="bg-lavender hover:bg-lavender-600 text-white w-full">
                      <Home className="h-4 w-4 mr-2" />
                      Return to Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
