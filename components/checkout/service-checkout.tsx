"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/select'
import { 
  Search, 
  User, 
  CreditCard, 
  DollarSign, 
  Calculator,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Minus,
  ShoppingCart,
  Receipt,
  Calendar,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'
import { 
  PMUService, 
  SERVICE_CATEGORIES, 
  getServiceById,
  getActiveServices,
  searchServices
} from '@/lib/services'
import { 
  CheckoutFormData,
  CheckoutSession,
  createCheckoutSession,
  getTaxRateForState,
  calculateCheckoutTotals,
  formatCurrency,
  GRATUITY_OPTIONS
} from '@/lib/checkout'

interface Client {
  id: string
  name: string
  email: string
  phone: string
  state?: string
}

interface ServiceCheckoutProps {
  currentArtist: {
    id: string
    name: string
    email: string
  }
  onCheckoutComplete?: (session: CheckoutSession) => void
}

export default function ServiceCheckout({ currentArtist, onCheckoutComplete }: ServiceCheckoutProps) {
  const [activeTab, setActiveTab] = useState<'services' | 'checkout' | 'summary'>('services')
  const [selectedService, setSelectedService] = useState<PMUService | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [clientSearchQuery, setClientSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // Checkout form data
  const [checkoutData, setCheckoutData] = useState<CheckoutFormData>({
    clientId: '',
    serviceId: '',
    customPrice: undefined,
    gratuityPercentage: 0,
    notes: ''
  })
  
  // Client list (mock data - replace with actual API call)
  const [clients, setClients] = useState<Client[]>([
    {
      id: 'client_1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '(555) 123-4567',
      state: 'Missouri'
    },
    {
      id: 'client_2',
      name: 'Mike Chen',
      email: 'mike.chen@example.com',
      phone: '(555) 234-5678',
      state: 'Illinois'
    },
    {
      id: 'client_3',
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      phone: '(555) 345-6789',
      state: 'Kansas'
    }
  ])
  
  const [filteredClients, setFilteredClients] = useState<Client[]>(clients)
  const [filteredServices, setFilteredServices] = useState<PMUService[]>(getActiveServices())
  
  // Checkout session
  const [checkoutSession, setCheckoutSession] = useState<CheckoutSession | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Filter services based on search and category
    let services = getActiveServices()
    
    if (searchQuery.trim()) {
      services = searchServices(searchQuery)
    }
    
    if (selectedCategory !== 'all') {
      services = services.filter(service => service.category === selectedCategory)
    }
    
    setFilteredServices(services)
  }, [searchQuery, selectedCategory])

  useEffect(() => {
    // Filter clients based on search
    if (clientSearchQuery.trim()) {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
        client.phone.includes(clientSearchQuery)
      )
      setFilteredClients(filtered)
    } else {
      setFilteredClients(clients)
    }
  }, [clientSearchQuery, clients])

  const handleServiceSelect = (service: PMUService) => {
    setSelectedService(service)
    setCheckoutData(prev => ({ ...prev, serviceId: service.id }))
    setActiveTab('checkout')
  }

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client)
    setCheckoutData(prev => ({ ...prev, clientId: client.id }))
  }

  const handleCustomPriceChange = (value: string) => {
    const price = parseFloat(value)
    setCheckoutData(prev => ({ 
      ...prev, 
      customPrice: isNaN(price) ? undefined : price 
    }))
  }

  const handleGratuityChange = (percentage: number) => {
    setCheckoutData(prev => ({ ...prev, gratuityPercentage: percentage }))
  }

  const handleNotesChange = (notes: string) => {
    setCheckoutData(prev => ({ ...prev, notes }))
  }

  const getTaxRate = (): number => {
    if (!selectedClient?.state) return 0.08 // Default rate
    return getTaxRateForState(selectedClient.state)
  }

  const getCheckoutTotals = () => {
    if (!selectedService) return null
    
    const taxRate = getTaxRate()
    return calculateCheckoutTotals(
      selectedService.basePrice,
      checkoutData.customPrice,
      taxRate,
      checkoutData.gratuityPercentage
    )
  }

  const handleProceedToCheckout = () => {
    if (!selectedService || !selectedClient) return
    
    const totals = getCheckoutTotals()
    if (!totals) return
    
    const taxRate = getTaxRate()
    
    const session = createCheckoutSession(
      checkoutData,
      currentArtist.id,
      currentArtist.name,
      selectedClient.name,
      selectedClient.email,
      selectedService.name,
      selectedService.basePrice,
      taxRate
    )
    
    setCheckoutSession(session)
    setActiveTab('summary')
  }

  const handleStripeCheckout = async () => {
    if (!checkoutSession) return
    
    setIsProcessing(true)
    
    try {
      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkoutSessionId: checkoutSession.id,
          serviceId: checkoutSession.serviceId,
          serviceName: checkoutSession.serviceName,
          amount: checkoutSession.totalAmount,
          clientEmail: checkoutSession.clientEmail,
          clientName: checkoutSession.clientName,
          artistId: checkoutSession.artistId,
          artistName: checkoutSession.artistName,
          artistStripeAccountId: 'acct_mock123', // Mock Stripe Connect account ID
          metadata: {
            clientId: checkoutSession.clientId,
            serviceId: checkoutSession.serviceId,
            customPrice: checkoutSession.customPrice,
            gratuityPercentage: checkoutSession.gratuityPercentage,
            notes: checkoutSession.notes
          }
        }),
      })

      const result = await response.json()
      
      if (result.success && result.redirectUrl) {
        // Redirect to Stripe checkout
        window.location.href = result.redirectUrl
      } else {
        throw new Error(result.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to process checkout. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const resetCheckout = () => {
    setSelectedService(null)
    setSelectedClient(null)
    setCheckoutData({
      clientId: '',
      serviceId: '',
      customPrice: undefined,
      gratuityPercentage: 0,
      notes: ''
    })
    setCheckoutSession(null)
    setActiveTab('services')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-ink mb-2">Service Checkout</h2>
        <p className="text-ink/70">
          Select services, choose clients, and process payments with Stripe
        </p>
      </div>

      {/* Progress Tabs */}
      <div className="flex justify-center">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'services'
                ? 'bg-lavender text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🎯 Select Service
          </button>
          <button
            onClick={() => setActiveTab('checkout')}
            disabled={!selectedService}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'checkout'
                ? 'bg-lavender text-white shadow-sm'
                : selectedService
                ? 'text-gray-600 hover:text-gray-800'
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            👤 Choose Client
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            disabled={!selectedService || !selectedClient}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'summary'
                ? 'bg-lavender text-white shadow-sm'
                : selectedService && selectedClient
                ? 'text-gray-600 hover:text-gray-800'
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            💳 Checkout
          </button>
        </div>
      </div>

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {SERVICE_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Card 
                key={service.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 border-lavender/20"
                onClick={() => handleServiceSelect(service)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-ink">
                        {service.name}
                      </CardTitle>
                      <CardDescription className="text-ink/70 mt-2">
                        {service.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {service.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 text-sm text-ink/60">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {service.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {service.recoveryTime}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-lavender">
                      {formatCurrency(service.basePrice)}
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-lavender hover:bg-lavender-600 text-white"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Select Service
                    </Button>
                  </div>
                  
                  <div className="mt-3">
                    <h4 className="font-medium text-sm mb-2">Includes:</h4>
                    <ul className="text-xs text-ink/70 space-y-1">
                      {service.includes.slice(0, 3).map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {item}
                        </li>
                      ))}
                      {service.includes.length > 3 && (
                        <li className="text-xs text-ink/50">
                          +{service.includes.length - 3} more items
                        </li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Checkout Tab */}
      {activeTab === 'checkout' && selectedService && (
        <div className="space-y-6">
          {/* Selected Service Summary */}
          <Card className="bg-lavender/5 border-lavender/20">
            <CardHeader>
              <CardTitle className="text-lavender-700">Selected Service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selectedService.name}</h3>
                  <p className="text-sm text-gray-600">{selectedService.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-lavender">
                    {formatCurrency(selectedService.basePrice)}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveTab('services')}
                  >
                    Change Service
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Client</CardTitle>
              <CardDescription>
                Choose the client for this service or search for existing clients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Client Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients by name, email, or phone..."
                  value={clientSearchQuery}
                  onChange={(e) => setClientSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Client List */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedClient?.id === client.id
                        ? 'border-lavender bg-lavender/5'
                        : 'border-gray-200 hover:border-lavender/30 hover:bg-gray-50'
                    }`}
                    onClick={() => handleClientSelect(client)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-lavender/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-lavender" />
                        </div>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {client.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {client.phone}
                            </span>
                            {client.state && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {client.state}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {selectedClient?.id === client.id && (
                        <CheckCircle className="h-5 w-5 text-lavender" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* New Client Button */}
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add New Client
              </Button>
            </CardContent>
          </Card>

          {/* Service Customization */}
          <Card>
            <CardHeader>
              <CardTitle>Service Customization</CardTitle>
              <CardDescription>
                Customize pricing and add notes for this service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Custom Price */}
              <div>
                <Label htmlFor="custom-price">Custom Price (Optional)</Label>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-gray-500">$</span>
                  <Input
                    id="custom-price"
                    type="number"
                    placeholder={selectedService.basePrice.toString()}
                    value={checkoutData.customPrice || ''}
                    onChange={(e) => handleCustomPriceChange(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCheckoutData(prev => ({ ...prev, customPrice: undefined }))}
                  >
                    Reset
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use standard price: {formatCurrency(selectedService.basePrice)}
                </p>
              </div>

              {/* Gratuity Selection */}
              <div>
                <Label>Gratuity</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {GRATUITY_OPTIONS.map((option) => (
                    <Button
                      key={option.percentage}
                      variant={checkoutData.gratuityPercentage === option.percentage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleGratuityChange(option.percentage)}
                      className="justify-start"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Service Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any special instructions or notes for this service..."
                  value={checkoutData.notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Price Summary */}
          {selectedClient && (
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle>Price Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Service Price:</span>
                    <span>{formatCurrency(checkoutData.customPrice || selectedService.basePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({getTaxRate() * 100}%):</span>
                    <span>{formatCurrency((checkoutData.customPrice || selectedService.basePrice) * getTaxRate())}</span>
                  </div>
                  {checkoutData.gratuityPercentage > 0 && (
                    <div className="flex justify-between">
                      <span>Gratuity ({checkoutData.gratuityPercentage * 100}%):</span>
                      <span>{formatCurrency((checkoutData.customPrice || selectedService.basePrice) * checkoutData.gratuityPercentage)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-lavender">
                      {formatCurrency(getCheckoutTotals()?.totalAmount || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setActiveTab('services')}
            >
              Back to Services
            </Button>
            
            <Button
              onClick={handleProceedToCheckout}
              disabled={!selectedClient}
              className="bg-lavender hover:bg-lavender-600 text-white flex-1"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}

      {/* Summary Tab */}
      {activeTab === 'summary' && checkoutSession && (
        <div className="space-y-6">
          {/* Checkout Summary */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700">Checkout Summary</CardTitle>
              <CardDescription>
                Review your service and client details before payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Service Details */}
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Service Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Service:</span>
                    <p>{checkoutSession.serviceName}</p>
                  </div>
                  <div>
                    <span className="font-medium">Base Price:</span>
                    <p>{formatCurrency(checkoutSession.basePrice)}</p>
                  </div>
                  {checkoutSession.customPrice && (
                    <div>
                      <span className="font-medium">Custom Price:</span>
                      <p>{formatCurrency(checkoutSession.customPrice)}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Duration:</span>
                    <p>{selectedService?.duration}</p>
                  </div>
                </div>
              </div>

              {/* Client Details */}
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Client Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span>
                    <p>{checkoutSession.clientName}</p>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <p>{checkoutSession.clientEmail}</p>
                  </div>
                  <div>
                    <span className="font-medium">State:</span>
                    <p>{selectedClient?.state || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Tax Rate:</span>
                    <p>{(checkoutSession.taxRate * 100).toFixed(2)}%</p>
                  </div>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Payment Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Service Price:</span>
                    <span>{formatCurrency(checkoutSession.customPrice || checkoutSession.basePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatCurrency(checkoutSession.taxAmount)}</span>
                  </div>
                  {checkoutSession.gratuityAmount > 0 && (
                    <div className="flex justify-between">
                      <span>Gratuity:</span>
                      <span>{formatCurrency(checkoutSession.gratuityAmount)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-lavender">
                      {formatCurrency(checkoutSession.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {checkoutSession.notes && (
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Service Notes</h4>
                  <p className="text-sm text-gray-700">{checkoutSession.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setActiveTab('checkout')}
            >
              Back to Client Selection
            </Button>
            
            <Button
              onClick={handleStripeCheckout}
              disabled={isProcessing}
              className="bg-lavender hover:bg-lavender-600 text-white flex-1"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Payment
                </>
              )}
            </Button>
          </div>

          {/* Reset Button */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={resetCheckout}
              className="text-gray-500 hover:text-gray-700"
            >
              Start New Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
