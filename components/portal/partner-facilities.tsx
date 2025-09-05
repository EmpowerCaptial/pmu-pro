"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Building2, 
  Stethoscope, 
  Heart, 
  Leaf, 
  Star, 
  MapPin, 
  Phone, 
  Calendar,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  DollarSign
} from 'lucide-react'
import { clientPortalContentService, type PortalFacility } from '@/lib/client-portal-content-service'

interface PartnerFacilitiesProps {
  onBookConsultation?: (facility: PortalFacility) => void
}

export function PartnerFacilities({ onBookConsultation }: PartnerFacilitiesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedFacility, setSelectedFacility] = useState<PortalFacility | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [facilities, setFacilities] = useState<PortalFacility[]>([])

  useEffect(() => {
    // Load facilities from the portal content service
    const portalFacilities = clientPortalContentService.getFacilities()
    console.log('PartnerFacilities: Loaded facilities:', portalFacilities)
    setFacilities(portalFacilities)
  }, [])

  // Add a refresh mechanism to check for new data
  useEffect(() => {
    const checkForUpdates = () => {
      const portalFacilities = clientPortalContentService.getFacilities()
      if (portalFacilities.length !== facilities.length) {
        console.log('PartnerFacilities: Detected new facilities, updating...')
        setFacilities(portalFacilities)
      }
    }

    // Check for updates every 5 seconds
    const interval = setInterval(checkForUpdates, 5000)
    return () => clearInterval(interval)
  }, [facilities.length])

  // Only show facilities if they exist from admin portal
  const displayFacilities = facilities

  const categories = [
    {
      id: 'cosmetic-dermatology',
      name: 'Cosmetic Dermatology',
      icon: <Stethoscope className="h-6 w-6" />,
      description: 'Advanced skin treatments and anti-aging procedures',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'plastic-surgery',
      name: 'Plastic Surgery',
      icon: <Heart className="h-6 w-6" />,
      description: 'Surgical and non-surgical cosmetic procedures',
      color: 'from-pink-500 to-pink-600'
    },
    {
      id: 'wellness-integrative',
      name: 'Wellness & Integrative Medicine',
      icon: <Leaf className="h-6 w-6" />,
      description: 'Holistic health and wellness approaches',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'cosmetic-dentistry',
      name: 'Cosmetic Dentistry',
      icon: <Sparkles className="h-6 w-6" />,
      description: 'Smile transformations and dental aesthetics',
      color: 'from-purple-500 to-purple-600'
    }
  ]

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId)
  }

  const handleFacilityClick = (facility: PortalFacility) => {
    setSelectedFacility(facility)
    setCurrentImageIndex(0)
  }

  const handleBookConsultation = () => {
    if (selectedFacility && onBookConsultation) {
      onBookConsultation(selectedFacility)
    }
    setSelectedFacility(null)
  }

  const getMockImage = (index: number) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ]
    return gradients[index % gradients.length]
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Partner Medical Facilities</h2>
        <p className="text-gray-600 text-lg">
          Connect with our trusted network of medical professionals
        </p>
      </div>

      {/* Category Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`p-6 rounded-xl text-center transition-all duration-300 hover:scale-105 ${
              selectedCategory === category.id 
                ? 'bg-gradient-to-r ' + category.color + ' text-white shadow-lg' 
                : 'bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className={`p-3 rounded-full ${
                selectedCategory === category.id ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {category.icon}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{category.name}</h3>
                <p className={`text-xs mt-1 ${
                  selectedCategory === category.id ? 'text-white/80' : 'text-gray-500'
                }`}>
                  {category.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Facilities Display */}
      {selectedCategory && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              {categories.find(c => c.id === selectedCategory)?.name} Facilities
            </h3>
            <Button 
              variant="outline" 
              onClick={() => setSelectedCategory(null)}
              className="text-sm"
            >
              View All Categories
            </Button>
          </div>

          {displayFacilities
            .filter(facility => facility.specialty.toLowerCase().includes(selectedCategory.replace('-', ' ')))
            .length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayFacilities
                .filter(facility => facility.specialty.toLowerCase().includes(selectedCategory.replace('-', ' ')))
                .map((facility) => (
                  <Card key={facility.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <div 
                      className="h-48 rounded-t-lg relative overflow-hidden"
                      style={{ background: getMockImage(parseInt(facility.id.replace(/\D/g, '') || '0')) }}
                    >
                      {facility.image && (
                        <img 
                          src={facility.image} 
                          alt={facility.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <Badge className="absolute top-3 right-3 bg-white/90 text-gray-800">
                        {facility.rating} ★
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-lg mb-2">{facility.name}</h4>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{facility.description}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{facility.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{facility.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span>Consultation: {facility.consultationFee}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{facility.availableSlots} slots available</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full mt-4"
                        onClick={() => handleFacilityClick(facility)}
                      >
                        View Details
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Facilities Available</h3>
              <p className="text-gray-600 mb-4">
                Partner facilities will appear here once they are added by the administrator.
              </p>
              <p className="text-sm text-gray-500">
                Please check back later or contact us for more information.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Facility Details Modal */}
      <Dialog open={!!selectedFacility} onOpenChange={() => setSelectedFacility(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedFacility && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedFacility.name}</DialogTitle>
                <DialogDescription>
                  {selectedFacility.specialty} • {selectedFacility.location}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Image Gallery */}
                <div className="relative h-64 rounded-lg overflow-hidden">
                  <div 
                    className="w-full h-full"
                    style={{ background: getMockImage(parseInt(selectedFacility.id.replace(/\D/g, '') || '0')) }}
                  >
                    {selectedFacility.image && (
                      <img 
                        src={selectedFacility.image} 
                        alt={selectedFacility.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>

                {/* Facility Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-lg mb-3">About</h4>
                    <p className="text-gray-600 mb-4">{selectedFacility.description}</p>
                    
                    <h5 className="font-semibold mb-2">Services Offered</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedFacility.services.map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <span>{selectedFacility.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <span>{selectedFacility.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span>{selectedFacility.rating} out of 5 stars</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-gray-500" />
                      <span>Consultation Fee: {selectedFacility.consultationFee}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <span>{selectedFacility.availableSlots} appointment slots available</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    className="flex-1"
                    onClick={handleBookConsultation}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Consultation
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Facility
                  </Button>
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4" />
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
