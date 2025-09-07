"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, User, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function POSPage() {
  const router = useRouter()
  const [isMobileView, setIsMobileView] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [showClientSelection, setShowClientSelection] = useState(false)
  const [cart, setCart] = useState<any[]>([])
  const [serviceQuantities, setServiceQuantities] = useState<{[key: number]: number}>({})
  
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

  // Sample services
  const services = [
    { id: 1, name: 'Eyebrow Microblading', price: 350, image: '/api/placeholder/200/200' },
    { id: 2, name: 'Lip Blush', price: 280, image: '/api/placeholder/200/200' },
    { id: 3, name: 'Eyeliner', price: 200, image: '/api/placeholder/200/200' },
    { id: 4, name: 'Eyebrow Powder', price: 300, image: '/api/placeholder/200/200' },
    { id: 5, name: 'Lip Liner', price: 250, image: '/api/placeholder/200/200' },
    { id: 6, name: 'Touch Up', price: 150, image: '/api/placeholder/200/200' },
    { id: 7, name: 'Consultation', price: 50, image: '/api/placeholder/200/200' },
    { id: 8, name: 'Color Correction', price: 200, image: '/api/placeholder/200/200' },
    { id: 9, name: 'Removal', price: 300, image: '/api/placeholder/200/200' }
  ]

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const addServiceToCart = (service: any) => {
    const quantity = serviceQuantities[service.id] || 1
    const cartItem = {
      id: `service-${service.id}`,
      name: service.name,
      price: service.price * quantity,
      quantity: quantity,
      serviceId: service.id
    }
    setCart([...cart, cartItem])
  }

  const updateServiceQuantity = (serviceId: number, quantity: number) => {
    setServiceQuantities(prev => ({
      ...prev,
      [serviceId]: Math.max(0, quantity)
    }))
  }

  const getServiceQuantity = (serviceId: number) => {
    return serviceQuantities[serviceId] || 0
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

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile POS Interface */}
      {isMobileView ? (
        <div className="min-h-screen bg-gray-50">
          {/* Client Information Section */}
          <div 
            className="bg-white p-6 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setShowClientSelection(true)}
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {selectedAppointment ? selectedAppointment.clientName : 'Select Client'}
            </h1>
            {selectedAppointment && (
              <>
                <p className="text-gray-600 mb-1">{selectedAppointment.email}</p>
                <p className="text-gray-600 mb-4">{selectedAppointment.phone}</p>
                
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Service</h2>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>{selectedAppointment.service}</li>
                    <li>Duration: {selectedAppointment.duration}</li>
                    <li>Price: ${selectedAppointment.price}</li>
                  </ul>
                </div>
              </>
            )}
            {!selectedAppointment && (
              <p className="text-gray-500 text-sm">Tap to select a client</p>
            )}
          </div>

          {/* Service Selection Grid */}
          <div className="p-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              {services.map((service) => {
                const quantity = getServiceQuantity(service.id)
                return (
                  <div key={service.id} className="relative">
                    <button
                      className="w-full aspect-square bg-white rounded-lg border-2 border-gray-200 hover:border-lavender transition-colors relative overflow-hidden"
                      onClick={() => {
                        if (quantity === 0) {
                          updateServiceQuantity(service.id, 1)
                        } else {
                          addServiceToCart(service)
                        }
                      }}
                      onTouchStart={(e) => {
                        if (quantity > 0) {
                          e.preventDefault()
                          // Simple quantity adjustment for mobile
                          if (quantity > 1) {
                            updateServiceQuantity(service.id, quantity - 1)
                          } else {
                            updateServiceQuantity(service.id, 0)
                            setCart(cart.filter(item => item.serviceId !== service.id))
                          }
                        }
                      }}
                    >
                      <img 
                        src={service.image} 
                        alt={service.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
                            <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                              <rect width="200" height="200" fill="#f3f4f6"/>
                              <text x="100" y="100" text-anchor="middle" dy=".3em" font-family="Arial" font-size="12" fill="#6b7280">${service.name}</text>
                            </svg>
                          `)}`
                        }}
                      />
                      {quantity > 0 && (
                        <div className="absolute top-2 right-2 bg-lavender text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {quantity}
                        </div>
                      )}
                    </button>
                    <p className="text-xs text-center mt-2 font-medium text-gray-700">
                      {service.name}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Checkout Button */}
            <Button 
              className="w-full bg-lavender hover:bg-lavender-600 text-white py-4 text-lg font-semibold"
              onClick={handleCheckout}
              disabled={cart.length === 0}
            >
              Checkout - ${getCartTotal().toFixed(2)}
            </Button>
          </div>
        </div>
      ) : (
        /* Desktop View */
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Point of Sale - Desktop View</h1>
            <p className="text-gray-600">Desktop interface coming soon...</p>
          </div>
        </div>
      )}

      {/* Client Selection Modal */}
      {showClientSelection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-lavender" />
                Select Client
              </CardTitle>
              <CardDescription>
                Choose a client for this transaction
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {appointments.map((appointment) => (
                  <button
                    key={appointment.id}
                    className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-lavender hover:bg-lavender/5 transition-colors"
                    onClick={() => {
                      setSelectedAppointment(appointment)
                      setShowClientSelection(false)
                    }}
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900">{appointment.clientName}</h3>
                      <p className="text-sm text-gray-600">{appointment.email}</p>
                      <p className="text-sm text-gray-600">{appointment.phone}</p>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  className="w-full border-gray-200 hover:border-gray-300"
                  onClick={() => setShowClientSelection(false)}
                >
                  <X className="h-4 w-4 mr-2" />
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