"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Sparkles, 
  Clock, 
  DollarSign, 
  Star, 
  ArrowRight,
  Calendar,
  Heart,
  Zap,
  Award,
  TrendingUp
} from 'lucide-react'
import { clientPortalContentService, type PortalService } from '@/lib/client-portal-content-service'

interface ServiceShowcaseProps {
  onServiceSelect?: (service: PortalService) => void
  clientProgress?: {
    completedServices: string[]
    nextRecommended?: string
    points: number
  }
}

export function ServiceShowcase({ onServiceSelect, clientProgress }: ServiceShowcaseProps) {
  const [selectedService, setSelectedService] = useState<PortalService | null>(null)
  const [services, setServices] = useState<PortalService[]>([])

  useEffect(() => {
    // Load services from the portal content service
    const portalServices = clientPortalContentService.getServices()
    console.log('ServiceShowcase: Loaded services:', portalServices)
    setServices(portalServices)
  }, [])

  // Only show services if they exist from admin portal
  const displayServices = services

  const handleServiceClick = (service: PortalService) => {
    setSelectedService(service)
    onServiceSelect?.(service)
  }

  const getServiceImage = (service: PortalService) => {
    console.log('ServiceShowcase: getServiceImage called for service:', service.name)
    console.log('ServiceShowcase: service.image:', service.image)
    console.log('ServiceShowcase: image starts with data:image:', service.image?.startsWith('data:image'))
    
    // If service has an uploaded image, use it
    if (service.image && service.image.startsWith('data:image')) {
      console.log('ServiceShowcase: Using uploaded image for', service.name)
      return service.image
    }
    
    console.log('ServiceShowcase: No uploaded image, using gradient for', service.name)
    
    // Otherwise use gradient based on service name or category
    const gradients: Record<string, string> = {
      microblading: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'lip-blush': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      eyeliner: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      touchup: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'color-correction': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'ombre-brows': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'eyebrows': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'lips': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'other': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    }
    
    // Try to match by service name first, then category
    const serviceName = service.name.toLowerCase()
    const category = service.category.toLowerCase()
    
    for (const [key, gradient] of Object.entries(gradients)) {
      if (serviceName.includes(key) || category.includes(key)) {
        console.log('ServiceShowcase: Using gradient', key, 'for', service.name)
        return gradient
      }
    }
    
    console.log('ServiceShowcase: Using default gradient for', service.name)
    return gradients.eyebrows // default fallback
  }

  const isCompleted = (serviceId: string) => {
    return clientProgress?.completedServices?.includes(serviceId)
  }

  const isRecommended = (serviceId: string) => {
    return clientProgress?.nextRecommended === serviceId
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-lavender">
          <Sparkles className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Explore Our Services</h2>
          <Sparkles className="h-6 w-6" />
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover our range of permanent makeup services designed to enhance your natural beauty. 
          Each service is tailored to your unique features and preferences.
        </p>
      </div>

      {/* Service Grid */}
      {displayServices.length > 0 ? (
        <div className="relative">
          {/* Scroll Indicators */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-lavender rounded-full"></div>
              <span className="text-sm text-gray-600">Swipe to explore services</span>
            </div>
            <div className="flex gap-1">
              {displayServices.map((_, index) => (
                <div key={index} className="w-2 h-2 bg-gray-300 rounded-full"></div>
              ))}
            </div>
          </div>
          
          <div 
            className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory" 
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayServices.map((service) => (
              <div
                key={service.id}
                className="relative group flex-shrink-0 w-80 snap-start"
              >
                <Card 
                  className={`
                    relative overflow-hidden cursor-pointer transition-all duration-300 h-full
                    hover:transform -translate-y-2 shadow-xl shadow-lg
                    ${isCompleted(service.id) ? 'ring-2 ring-green-500' : ''}
                    ${isRecommended(service.id) ? 'ring-2 ring-lavender animate-pulse' : ''}
                  `}
                  onClick={() => handleServiceClick(service)}
                >
                  {/* Service Image */}
                  <div 
                    className="h-48 relative overflow-hidden"
                    style={{ background: getServiceImage(service) }}
                  >
                    {/* Show uploaded image if available */}
                    {(() => {
                      console.log('ServiceShowcase: Rendering image for', service.name)
                      console.log('ServiceShowcase: service.image exists:', !!service.image)
                      console.log('ServiceShowcase: service.image starts with data:image:', service.image?.startsWith('data:image'))
                      return null
                    })()}
                    {service.image && service.image.startsWith('data:image') && (
                      <img 
                        src={service.image} 
                        alt={service.name}
                        className="w-full h-full object-cover"
                        onLoad={() => console.log('ServiceShowcase: Image loaded successfully for', service.name)}
                        onError={(e) => console.error('ServiceShowcase: Image failed to load for', service.name, e)}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {service.isSpecial && (
                        <Badge className="bg-orange-500 text-white">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Special
                        </Badge>
                      )}
                    </div>

                    {/* Completion Badge */}
                    {isCompleted(service.id) && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-green-500 text-white">
                          <Award className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      </div>
                    )}

                    {/* Recommended Badge */}
                    {isRecommended(service.id) && (
                      <div className="absolute bottom-3 right-3">
                        <Badge className="bg-lavender text-white">
                          <Heart className="h-3 w-3 mr-1" />
                          Recommended
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Service Content */}
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">2-3 hours</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="font-semibold text-gray-900">
                            ${service.price}
                            {service.isSpecial && service.specialPrice && (
                              <span className="text-orange-600 ml-1">${service.specialPrice}</span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {service.category}
                        </Badge>
                        <Button size="sm" className="bg-lavender hover:bg-lavender/90">
                          Book Now
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Services Available</h3>
          <p className="text-gray-600 mb-4">
            Services will appear here once they are added by the administrator.
          </p>
          <p className="text-sm text-gray-500">
            Please check back later or contact us for more information.
          </p>
        </div>
      )}

      {/* Service Details Modal */}
      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="max-w-2xl">
          {selectedService && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedService.name}</DialogTitle>
                <DialogDescription>
                  {selectedService.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Service Image */}
                <div 
                  className="h-48 rounded-lg overflow-hidden"
                  style={{ background: getServiceImage(selectedService) }}
                >
                  {selectedService.image && (
                    <img 
                      src={selectedService.image} 
                      alt={selectedService.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Service Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <span>Duration: 2-3 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                    <span>Price: ${selectedService.price}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-gray-500" />
                    <span>Category: {selectedService.category}</span>
                  </div>
                  {selectedService.isSpecial && selectedService.specialPrice && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-orange-500" />
                      <span>Special Price: ${selectedService.specialPrice}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    className="flex-1 bg-lavender hover:bg-lavender/90"
                    onClick={() => {
                      // Handle booking
                      setSelectedService(null)
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Heart className="h-4 w-4 mr-2" />
                    Add to Wishlist
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
