"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Edit, 
  Save, 
  X, 
  ShoppingCart, 
  DollarSign,
  Clock,
  Palette,
  Eye,
  Plus,
  Minus,
  CheckCircle
} from 'lucide-react'
import { PMU_SERVICES, getServiceById, calculateServicePrice } from '@/lib/services'
import { useRouter } from 'next/navigation'

interface ServiceSelection {
  serviceId: string
  quantity: number
  customPrice?: number
}

interface EditableService {
  id: string
  name: string
  basePrice: number
  duration: number
  category: string
  description: string
  isEditing: boolean
  tempPrice: number
}

export default function ServiceManagement() {
  const [services, setServices] = useState<EditableService[]>([])
  const [selectedServices, setSelectedServices] = useState<ServiceSelection[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showSelectedOnly, setShowSelectedOnly] = useState(false)
  const router = useRouter()

  // Initialize services from the services library
  useEffect(() => {
    const initialServices = PMU_SERVICES.map(service => ({
      ...service,
      isEditing: false,
      tempPrice: service.basePrice
    }))
    setServices(initialServices)
  }, [])

  // Filter services based on search and category
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
    const matchesSelection = !showSelectedOnly || selectedServices.some(s => s.serviceId === service.id)
    
    return matchesSearch && matchesCategory && matchesSelection
  })

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(services.map(s => s.category)))]

  // Handle service selection
  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServices(prev => {
      const existing = prev.find(s => s.serviceId === serviceId)
      if (existing) {
        return prev.filter(s => s.serviceId !== serviceId)
      } else {
        const service = services.find(s => s.id === serviceId)
        return [...prev, {
          serviceId,
          quantity: 1,
          customPrice: service?.basePrice
        }]
      }
    })
  }

  // Update service quantity
  const updateServiceQuantity = (serviceId: string, quantity: number) => {
    if (quantity < 1) return
    
    setSelectedServices(prev => 
      prev.map(s => s.serviceId === serviceId ? { ...s, quantity } : s)
    )
  }

  // Update custom price
  const updateCustomPrice = (serviceId: string, price: number) => {
    setSelectedServices(prev => 
      prev.map(s => s.serviceId === serviceId ? { ...s, customPrice: price } : s)
    )
  }

  // Toggle edit mode for a service
  const toggleEditMode = (serviceId: string) => {
    setServices(prev => 
      prev.map(s => s.id === serviceId ? { ...s, isEditing: !s.isEditing } : s)
    )
  }

  // Save edited price
  const savePriceEdit = (serviceId: string) => {
    setServices(prev => 
      prev.map(s => {
        if (s.id === serviceId) {
          return { ...s, basePrice: s.tempPrice, isEditing: false }
        }
        return s
      })
    )
  }

  // Cancel price edit
  const cancelPriceEdit = (serviceId: string) => {
    setServices(prev => 
      prev.map(s => {
        if (s.id === serviceId) {
          return { ...s, tempPrice: s.basePrice, isEditing: false }
        }
        return s
      })
    )
  }

  // Calculate total for selected services
  const calculateTotal = () => {
    return selectedServices.reduce((total, selection) => {
      const price = selection.customPrice || 0
      return total + (price * selection.quantity)
    }, 0)
  }

  // Get selected services details
  const getSelectedServicesDetails = () => {
    return selectedServices.map(selection => {
      const service = services.find(s => s.id === selection.serviceId)
      return {
        ...selection,
        serviceName: service?.name || '',
        basePrice: service?.basePrice || 0,
        duration: service?.duration || 0,
        category: service?.category || ''
      }
    })
  }

  // Proceed to checkout
  const proceedToCheckout = () => {
    if (selectedServices.length === 0) return
    
    const checkoutData = {
      services: getSelectedServicesDetails(),
      totalAmount: calculateTotal(),
      totalDuration: getSelectedServicesDetails().reduce((sum, s) => sum + (s.duration * s.quantity), 0)
    }
    
    // Store checkout data in localStorage for the checkout page
    localStorage.setItem('pmu_pro_multi_service_checkout', JSON.stringify(checkoutData))
    
    // Navigate to checkout with service selection
    router.push('/checkout?multi=true')
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim()
    }
    return `${mins}m`
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-lavender/20 bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-lavender-700 flex items-center justify-center gap-3">
            <Palette className="h-8 w-8" />
            Service Management & Selection
          </CardTitle>
          <CardDescription className="text-lg">
            View all PMU services, edit prices, and select multiple services for checkout
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card className="border-lavender/20 bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-0">
              <Label htmlFor="search" className="sr-only">Search services</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex-shrink-0">
              <Label htmlFor="category" className="sr-only">Filter by category</Label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lavender"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Show Selected Only Toggle */}
            <div className="flex-shrink-0">
              <Button
                variant={showSelectedOnly ? "default" : "outline"}
                onClick={() => setShowSelectedOnly(!showSelectedOnly)}
                className={showSelectedOnly ? "bg-lavender text-white" : "border-lavender text-lavender"}
                size="sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showSelectedOnly ? 'Show All' : 'Selected Only'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <Card className="border-lavender/20 bg-lavender/5">
          <CardHeader>
            <CardTitle className="text-lavender-700 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Selected Services ({selectedServices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getSelectedServicesDetails().map((service) => (
                <div key={service.serviceId} className="flex items-center justify-between p-3 bg-white rounded-lg border border-lavender/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{service.serviceName}</h4>
                      <p className="text-sm text-gray-600">
                        {formatDuration(service.duration)} • {service.category}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateServiceQuantity(service.serviceId, service.quantity - 1)}
                        disabled={service.quantity <= 1}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{service.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateServiceQuantity(service.serviceId, service.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Custom Price Input */}
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`price-${service.serviceId}`} className="text-sm text-gray-600">Price:</Label>
                      <Input
                        id={`price-${service.serviceId}`}
                        type="number"
                        value={service.customPrice || service.basePrice}
                        onChange={(e) => updateCustomPrice(service.serviceId, parseFloat(e.target.value) || 0)}
                        className="w-24 h-8 text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    {/* Total for this service */}
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {formatCurrency((service.customPrice || service.basePrice) * service.quantity)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(service.customPrice || service.basePrice)} each
                      </div>
                    </div>
                    
                    {/* Remove Service */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleServiceSelection(service.serviceId)}
                      className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {/* Total and Checkout */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-lavender/30">
                <div>
                  <h4 className="font-medium text-gray-900">Total</h4>
                  <p className="text-sm text-gray-600">
                    {getSelectedServicesDetails().reduce((sum, s) => sum + (s.duration * s.quantity), 0)} total duration
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-lavender-700">
                    {formatCurrency(calculateTotal())}
                  </div>
                  <Button
                    onClick={proceedToCheckout}
                    className="bg-lavender hover:bg-lavender-600 text-white mt-2"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Proceed to Checkout
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => {
          const isSelected = selectedServices.some(s => s.serviceId === service.id)
          const selectedService = selectedServices.find(s => s.serviceId === service.id)
          
          return (
            <Card 
              key={service.id} 
              className={`border-lavender/20 bg-white transition-all duration-200 hover:shadow-lg ${
                isSelected ? 'ring-2 ring-lavender shadow-lg' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                      {service.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 mb-2">
                      {service.description}
                    </CardDescription>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(service.duration)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Palette className="h-4 w-4" />
                        {service.category}
                      </span>
                    </div>
                  </div>
                  
                  {/* Edit Price Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleEditMode(service.id)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Price Display/Edit */}
                <div className="mb-4">
                  {service.isEditing ? (
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`edit-price-${service.id}`} className="text-sm font-medium text-gray-700">
                        Price:
                      </Label>
                      <Input
                        id={`edit-price-${service.id}`}
                        type="number"
                        value={service.tempPrice}
                        onChange={(e) => setServices(prev => 
                          prev.map(s => s.id === service.id ? { ...s, tempPrice: parseFloat(e.target.value) || 0 } : s)
                        )}
                        className="flex-1 h-8 text-sm"
                        min="0"
                        step="0.01"
                      />
                      <Button
                        size="sm"
                        onClick={() => savePriceEdit(service.id)}
                        className="h-8 px-2 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancelPriceEdit(service.id)}
                        className="h-8 px-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-lavender-700">
                      {formatCurrency(service.basePrice)}
                    </div>
                  )}
                </div>
                
                {/* Service Selection */}
                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => toggleServiceSelection(service.id)}
                    variant={isSelected ? "default" : "outline"}
                    className={`w-full ${
                      isSelected 
                        ? 'bg-lavender hover:bg-lavender-600 text-white' 
                        : 'border-lavender text-lavender hover:bg-lavender/5'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Selected
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Selection
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Quantity and Custom Price (if selected) */}
                {isSelected && selectedService && (
                  <div className="mt-3 p-3 bg-lavender/5 rounded-lg border border-lavender/20">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium text-gray-700">Quantity:</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateServiceQuantity(service.id, selectedService.quantity - 1)}
                          disabled={selectedService.quantity <= 1}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{selectedService.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateServiceQuantity(service.id, selectedService.quantity + 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium text-gray-700">Custom Price:</Label>
                      <Input
                        type="number"
                        value={selectedService.customPrice || service.basePrice}
                        onChange={(e) => updateCustomPrice(service.id, parseFloat(e.target.value) || 0)}
                        className="flex-1 h-7 text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div className="mt-2 text-right">
                      <div className="text-sm text-gray-600">
                        Total: {formatCurrency((selectedService.customPrice || service.basePrice) * selectedService.quantity)}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* No Services Found */}
      {filteredServices.length === 0 && (
        <Card className="border-lavender/20 bg-white">
          <CardContent className="p-8 text-center">
            <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No services found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search terms or category filter.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
