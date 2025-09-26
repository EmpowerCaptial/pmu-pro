"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, User, X, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Service, getServices } from '@/lib/services-api'
import { useDemoAuth } from '@/hooks/use-demo-auth'

export default function POSPage() {
  const router = useRouter()
  const { currentUser, isAuthenticated } = useDemoAuth()
  const [isMobileView, setIsMobileView] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [showClientSelection, setShowClientSelection] = useState(false)
  const [cart, setCart] = useState<any[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  
  // POS is now active - no longer coming soon
  const isComingSoon = false
  
  // Sample appointments
  const appointments = [
  {
    id: 1,
    clientName: 'Sarah Johnson',
    phone: '(555) 123-4567',
    email: 'sarah.j@email.com',
    service: 'Eyebrow Microblading',
    duration: '2 hours',
    price: 350.00,
    }
  ]
  
  // Load services from API
  useEffect(() => {
    if (isAuthenticated && currentUser?.email) {
      loadServices()
    }
  }, [isAuthenticated, currentUser])

  const loadServices = async () => {
    if (!currentUser?.email) return
    
    setLoading(true)
    try {
      const userServices = await getServices(currentUser.email)
      // Filter only active services for POS
      setServices(userServices.filter(service => service.isActive))
    } catch (error) {
      console.error('Error loading services:', error)
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleServiceInCart = (service: Service) => {
    const existingItemIndex = cart.findIndex(item => item.serviceId === service.id)
    
    if (existingItemIndex >= 0) {
      // Remove service from cart
      setCart(cart.filter((_, index) => index !== existingItemIndex))
    } else {
      // Add service to cart
      const cartItem = {
        id: `service-${service.id}`,
        name: service.name,
        price: service.defaultPrice,
        quantity: 1,
        serviceId: service.id
      }
      setCart([...cart, cartItem])
    }
  }

  const isServiceInCart = (serviceId: string) => {
    return cart.some(item => item.serviceId === serviceId)
  }

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.price, 0)
  }

  const handleCheckout = () => {
    if (cart.length === 0) return
    
    // Encode cart data for URL
    const cartData = encodeURIComponent(JSON.stringify(cart))
    router.push(`/checkout?cart=${cartData}`)
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-lavender mx-auto mb-3 sm:mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading services...</p>
        </div>
      </div>
    )
  }

  // Show not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 text-sm sm:text-base">Please log in to access the POS system.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile POS Interface */}
      {isMobileView ? (
        <div className="min-h-screen bg-gray-50">
          {/* Client Information Section */}
          <div className="bg-white p-3 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-3 sm:gap-4">
              <div 
                className="flex-1 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors w-full sm:w-auto"
                onClick={() => setShowClientSelection(true)}
              >
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                  {selectedAppointment ? selectedAppointment.clientName : 'Select Client'}
                </h1>
                {selectedAppointment && (
                  <>
                    <p className="text-gray-600 mb-1 text-sm sm:text-base">{selectedAppointment.email}</p>
                    <p className="text-gray-600 text-sm sm:text-base">{selectedAppointment.phone}</p>
                  </>
                )}
                {!selectedAppointment && (
                  <p className="text-gray-500 text-xs sm:text-sm">Tap to select a client</p>
                )}
              </div>
              
              {/* Checkout Button */}
              <Button 
                className="bg-lavender hover:bg-lavender-600 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg font-semibold w-full sm:w-auto"
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                <span className="hidden sm:inline">Checkout - ${getCartTotal().toFixed(2)}</span>
                <span className="sm:hidden">Checkout ${getCartTotal().toFixed(2)}</span>
              </Button>
            </div>
            
            {/* Selected Services */}
            {cart.length > 0 && (
              <div className="mt-3 sm:mt-4">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Service</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm sm:text-base">
                  {cart.map((item) => (
                    <li key={item.id}>{item.name}</li>
                  ))}
                </ul>
              </div>
            )}
      </div>

          {/* Service Selection Grid */}
          <div className="p-3 sm:p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {services.map((service) => {
                const isSelected = isServiceInCart(service.id)
                return (
                  <div key={service.id} className="relative">
                    <button
                      className={`w-full aspect-square rounded-lg border-2 transition-colors relative overflow-hidden ${
                        isSelected 
                          ? 'bg-lavender border-lavender' 
                          : 'bg-white border-gray-200 hover:border-lavender'
                      }`}
                      onClick={() => toggleServiceInCart(service)}
                    >
                      {service.imageUrl && service.isCustomImage ? (
                        <img 
                          src={service.imageUrl} 
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-500 text-xs text-center px-1 sm:px-2">{service.name}</span>
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-white text-lavender rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-bold">
                          ✓
                        </div>
                      )}
                    </button>
                    <p className="text-xs sm:text-sm text-center mt-1 sm:mt-2 font-medium text-gray-700 truncate">
                      {service.name}
                    </p>
                      </div>
                )
              })}
                </div>
          </div>
                    </div>
                  ) : (
        /* Desktop View */
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
              
              {/* Left Column - Client & Services */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Client Information */}
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-base sm:text-lg">
                      <span>Client Information</span>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowClientSelection(true)}
                        className="text-xs sm:text-sm w-full sm:w-auto"
                      >
                        <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Select Client
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    {selectedAppointment ? (
                      <div className="space-y-1 sm:space-y-2">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{selectedAppointment.clientName}</h3>
                        <p className="text-gray-600 text-sm sm:text-base">{selectedAppointment.email}</p>
                        <p className="text-gray-600 text-sm sm:text-base">{selectedAppointment.phone}</p>
                    </div>
                    ) : (
                      <p className="text-gray-500 text-sm sm:text-base">No client selected</p>
                    )}
                  </CardContent>
                </Card>

                {/* Service Selection */}
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Select Services</CardTitle>
                    <CardDescription className="text-sm sm:text-base">Click on services to add them to the cart</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {services.map((service) => {
                        const isSelected = isServiceInCart(service.id)
                        return (
                          <button
                            key={service.id}
                            className={`p-3 sm:p-4 rounded-lg border-2 transition-colors text-left ${
                              isSelected 
                                ? 'bg-lavender border-lavender text-white' 
                                : 'bg-white border-gray-200 hover:border-lavender'
                            }`}
                            onClick={() => toggleServiceInCart(service)}
                          >
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              {service.imageUrl && service.isCustomImage ? (
                                <img 
                                  src={service.imageUrl} 
                                  alt={service.name}
                                  className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded flex items-center justify-center">
                                  <span className="text-gray-500 text-xs text-center">{service.name.charAt(0)}</span>
                                </div>
                              )}
                              <div className="flex-1">
                                <h4 className="font-medium text-xs sm:text-sm truncate">{service.name}</h4>
                                <p className="text-xs opacity-75">${service.defaultPrice}</p>
                              </div>
                              {isSelected && (
                                <div className="text-white text-base sm:text-lg">✓</div>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
              </CardContent>
            </Card>
          </div>

              {/* Right Column - Cart & Checkout */}
              <div className="space-y-6">
                
                {/* Cart Summary */}
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Order Summary</CardTitle>
            </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    {cart.length === 0 ? (
                      <p className="text-gray-500 text-center py-6 sm:py-8 text-sm sm:text-base">No services selected</p>
                    ) : (
              <div className="space-y-2 sm:space-y-3">
                        {cart.map((item) => (
                          <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                            <div>
                              <p className="font-medium text-xs sm:text-sm truncate">{item.name}</p>
                </div>
                            <p className="font-semibold text-sm sm:text-base">${item.price}</p>
                </div>
                        ))}
                        <div className="pt-2 sm:pt-3 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-base sm:text-lg font-semibold">Total:</span>
                            <span className="text-lg sm:text-xl font-bold text-lavender">${getCartTotal().toFixed(2)}</span>
                </div>
                </div>
              </div>
                    )}
                  </CardContent>
                </Card>

                {/* Checkout Button */}
                <Button 
                  className="w-full bg-lavender hover:bg-lavender-600 text-white py-3 sm:py-4 text-sm sm:text-lg font-semibold"
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                >
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Process Payment - ${getCartTotal().toFixed(2)}</span>
                  <span className="sm:hidden">Pay ${getCartTotal().toFixed(2)}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Selection Modal */}
      {showClientSelection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-3 sm:p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100 p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-lavender" />
                Select Client
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Choose a client for this transaction
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {/* Add New Client Button */}
              <Button 
                className="w-full mb-3 sm:mb-4 bg-lavender hover:bg-lavender-600 text-white text-sm sm:text-base"
                onClick={() => {
                  setShowClientSelection(false)
                  router.push('/clients/new')
                }}
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Add New Client
              </Button>
              
              <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                {appointments.map((appointment) => (
                  <button
                    key={appointment.id}
                    className="w-full p-3 sm:p-4 text-left border border-gray-200 rounded-lg hover:border-lavender hover:bg-lavender/5 transition-colors"
                    onClick={() => {
                      setSelectedAppointment(appointment)
                      setShowClientSelection(false)
                    }}
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{appointment.clientName}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{appointment.email}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{appointment.phone}</p>
                  </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  className="w-full border-gray-200 hover:border-gray-300 text-sm sm:text-base"
                  onClick={() => setShowClientSelection(false)}
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}