"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  DollarSign, 
  User, 
  Mail, 
  Phone,
  Star,
  Camera,
  Palette,
  Eye,
  ChevronLeft,
  ChevronRight,
  Globe
} from 'lucide-react'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ArtistProfile {
  id: string
  name: string
  email: string
  handle: string
  avatar?: string
  bio?: string
  studioName?: string
  phone?: string
  website?: string
  instagram?: string
  address?: any
  businessHours?: any
  specialties: string[]
  experience?: string
  rating: number
  reviewCount: number
}

interface PortfolioItem {
  id: string
  type: "eyebrows" | "lips" | "eyeliner"
  title: string
  description: string
  beforeImage: string
  afterImage: string
  date: string
  isPublic: boolean
}

interface Service {
  id: string
  name: string
  description?: string
  defaultDuration: number
  defaultPrice: number
  category: 'eyebrows' | 'lips' | 'eyeliner' | 'consultation' | 'touch-up' | 'other'
  isActive: boolean
  imageUrl?: string
}

interface UnifiedBookingPageProps {
  artistHandle: string
}

export function UnifiedBookingPage({ artistHandle }: UnifiedBookingPageProps) {
  const [artist, setArtist] = useState<ArtistProfile | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [activeTab, setActiveTab] = useState('portfolio')

  // Load artist data, portfolio, and services
  useEffect(() => {
    const loadArtistData = async () => {
      try {
        const response = await fetch(`/api/artist/${artistHandle}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch artist data: ${response.statusText}`)
        }

        const data = await response.json()
        let artistData = data.artist

        // Load profile data from localStorage (client-side only)
        if (typeof window !== 'undefined' && artistData.email) {
          try {
            // Load profile photo
            const profilePhoto = localStorage.getItem(`profile_photo_${artistData.email}`)
            if (profilePhoto) {
              artistData.avatar = profilePhoto
            }

            // Load profile data
            const profileJson = localStorage.getItem(`profile_${artistData.email}`)
            if (profileJson) {
              const profileData = JSON.parse(profileJson)
              artistData = {
                ...artistData,
                bio: profileData.bio || artistData.bio,
                studioName: profileData.studioName || artistData.studioName,
                phone: profileData.phone || artistData.phone,
                website: profileData.website || artistData.website,
                instagram: profileData.instagram || artistData.instagram,
                address: profileData.address || artistData.address,
                businessHours: profileData.businessHours || artistData.businessHours,
                specialties: profileData.specialties || artistData.specialties,
                experience: profileData.experience || artistData.experience
              }
            }

            // Load portfolio data
            const portfolioJson = localStorage.getItem(`portfolio_${artistData.email}`)
            if (portfolioJson) {
              const portfolioData = JSON.parse(portfolioJson)
              // Filter for public items only
              const publicPortfolio = portfolioData.filter((item: any) => item.isPublic)
              setPortfolio(publicPortfolio)
            }
          } catch (localStorageError) {
            console.error('Error loading profile data from localStorage:', localStorageError)
          }
        }

        setArtist(artistData)
        setServices(data.services)

      } catch (error) {
        console.error('Error loading artist data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadArtistData()
  }, [artistHandle])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender mx-auto mb-4"></div>
          <p className="text-gray-600">Loading artist profile...</p>
        </div>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Artist Not Found</h1>
          <p className="text-gray-600">The artist you're looking for doesn't exist or isn't available.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5">
      <div className="container mx-auto px-4 py-8">
        {/* Artist Header */}
        <Card className="mb-6 sm:mb-8 bg-white/90 backdrop-blur-sm border-lavender/20 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              {/* Artist Avatar */}
              <div className="relative flex-shrink-0">
                {artist.avatar ? (
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-lavender/30"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-lavender to-purple-500 flex items-center justify-center text-white font-semibold text-xl sm:text-2xl">
                    {artist.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>

              {/* Artist Info */}
              <div className="flex-1 text-center sm:text-left min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 break-words">{artist.name}</h1>
                {artist.studioName && (
                  <h2 className="text-lg sm:text-xl text-lavender font-semibold mb-2 break-words">{artist.studioName}</h2>
                )}
                <p className="text-sm sm:text-base text-gray-600 mb-3 break-words">{artist.bio}</p>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                  <div className="flex items-center justify-center sm:justify-start gap-1">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 fill-current" />
                    <span className="font-semibold text-sm sm:text-base">{artist.rating}</span>
                    <span className="text-gray-600 text-sm sm:text-base">({artist.reviewCount} reviews)</span>
                  </div>
                  {artist.experience && (
                    <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                      {artist.experience} experience
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 mb-3 text-xs sm:text-sm text-gray-600">
                  {artist.phone && (
                    <div className="flex items-center justify-center sm:justify-start gap-1">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="break-all">{artist.phone}</span>
                    </div>
                  )}
                  {artist.website && (
                    <div className="flex items-center justify-center sm:justify-start gap-1">
                      <Globe className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <a href={artist.website} target="_blank" rel="noopener noreferrer" className="text-lavender hover:underline break-all">
                        Website
                      </a>
                    </div>
                  )}
                  {artist.instagram && (
                    <div className="flex items-center justify-center sm:justify-start gap-1">
                      <Camera className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <a href={`https://instagram.com/${artist.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-lavender hover:underline break-all">
                        {artist.instagram}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 sm:gap-2 justify-center sm:justify-start">
                  {artist.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="bg-lavender/20 text-lavender text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Book Now Button */}
              <div className="text-center w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="bg-lavender hover:bg-lavender-600 text-white px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold w-full sm:w-auto"
                  onClick={() => setActiveTab('booking')}
                >
                  Book Appointment
                </Button>
                <p className="text-xs sm:text-sm text-gray-600 mt-2">Available for bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 bg-white/90 backdrop-blur-sm border-lavender/20 h-auto">
            <TabsTrigger value="portfolio" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm">
              <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Portfolio</span>
              <span className="sm:hidden">Work</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm">
              <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Services & Pricing</span>
              <span className="sm:hidden">Services</span>
            </TabsTrigger>
            <TabsTrigger value="booking" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 px-1 sm:px-2 text-xs sm:text-sm">
              <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Book Now</span>
              <span className="sm:hidden">Book</span>
            </TabsTrigger>
          </TabsList>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {portfolio.map((item) => (
                <Card key={item.id} className="bg-white/90 backdrop-blur-sm border-lavender/20 shadow-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="bg-lavender/20 text-lavender font-bold text-xs">
                        {item.type.toUpperCase()}
                      </Badge>
                    </div>
                    <CardTitle className="text-base sm:text-lg font-serif break-words">{item.title}</CardTitle>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">{item.description}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1 sm:space-y-2">
                        <p className="text-xs font-semibold text-gray-500">BEFORE</p>
                        <img
                          src={item.beforeImage}
                          alt="Before"
                          className="w-full h-20 sm:h-24 object-cover rounded-md border"
                        />
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <p className="text-xs font-semibold text-gray-500">AFTER</p>
                        <img
                          src={item.afterImage}
                          alt="After"
                          className="w-full h-20 sm:h-24 object-cover rounded-md border"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {services.map((service) => (
                <Card key={service.id} className="bg-white/90 backdrop-blur-sm border-lavender/20 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="break-words">{service.name}</span>
                      <Badge variant="secondary" className="bg-lavender/20 text-lavender text-xs self-start sm:self-auto">
                        {service.category.toUpperCase()}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600 break-words">{service.description}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3 sm:gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{Math.round(service.defaultDuration / 60)}h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="font-semibold text-base sm:text-lg text-gray-900">${service.defaultPrice}</span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => {
                          setSelectedService(service)
                          setActiveTab('booking')
                        }}
                        className="bg-lavender hover:bg-lavender-600 text-white w-full sm:w-auto"
                      >
                        Book This Service
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Booking Tab */}
          <TabsContent value="booking">
            <Card className="bg-white/90 backdrop-blur-sm border-lavender/20 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-lavender" />
                  Book Your Appointment
                </CardTitle>
                {selectedService && (
                  <p className="text-sm sm:text-base text-gray-600 break-words">
                    Selected: <span className="font-semibold">{selectedService.name}</span> - ${selectedService.defaultPrice}
                  </p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <BookingForm 
                  artist={artist}
                  selectedService={selectedService}
                  services={services}
                  onBackToServices={() => setActiveTab('services')}
                  onSelectService={(service) => setSelectedService(service)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface BookingFormProps {
  artist: ArtistProfile
  selectedService: Service | null
  services: Service[]
  onBackToServices: () => void
  onSelectService: (service: Service) => void
}

function BookingForm({ artist, selectedService, services, onBackToServices, onSelectService }: BookingFormProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    service: selectedService?.id || '',
    date: '',
    time: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate required fields
    if (!formData.clientName || !formData.clientEmail || !formData.service || !formData.date || !formData.time) {
      setError('Please fill in all required fields')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.clientEmail)) {
      setError('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)

    try {
      // Get service details
      const service = services.find(s => s.id === formData.service)
      if (!service) {
        throw new Error('Service not found')
      }

      // Create appointment
      const appointmentResponse = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': artist.email
        },
        body: JSON.stringify({
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone,
          service: service.name,
          date: formData.date,
          time: formData.time,
          duration: service.defaultDuration,
          price: service.defaultPrice,
          deposit: Math.round(service.defaultPrice * 0.3), // 30% deposit
          status: 'pending_deposit',
          notes: formData.notes
        })
      })

      if (!appointmentResponse.ok) {
        const errorData = await appointmentResponse.json()
        throw new Error(errorData.error || 'Failed to create appointment')
      }

      const appointmentData = await appointmentResponse.json()
      
      // Create Stripe checkout session directly for deposit payment
      const checkoutResponse = await fetch('/api/stripe/create-deposit-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          depositId: appointmentData.appointment.id, // Use appointment ID as deposit ID for now
          amount: Math.round(service.defaultPrice * 0.3),
          currency: 'USD',
          clientName: formData.clientName,
          successUrl: `${window.location.origin}/booking/confirmation?appointment=${appointmentData.appointment.id}`,
          cancelUrl: `${window.location.origin}/book/${artist.handle}?tab=booking`
        })
      })

      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json()
        throw new Error(errorData.error || 'Failed to create payment session')
      }

      const checkoutData = await checkoutResponse.json()

      // Redirect to Stripe checkout
      if (checkoutData.url) {
        window.location.href = checkoutData.url
      } else {
        // Fallback: show success message
        alert(`Appointment created successfully! Please contact ${artist.name} to complete your deposit payment.`)
        setFormData({
          clientName: '',
          clientEmail: '',
          clientPhone: '',
          service: '',
          date: '',
          time: '',
          notes: ''
        })
      }

    } catch (error) {
      console.error('Booking error:', error)
      setError(error instanceof Error ? error.message : 'Failed to create appointment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Service Selection */}
      <div className="space-y-2">
        <Label htmlFor="service">Service *</Label>
        <Select value={formData.service} onValueChange={(value) => {
          handleInputChange('service', value)
          const service = services.find(s => s.id === value)
          if (service) onSelectService(service)
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            {services.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.name} - ${service.defaultPrice} ({Math.round(service.defaultDuration / 60)}h)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Client Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientName">Full Name *</Label>
          <Input
            id="clientName"
            type="text"
            value={formData.clientName}
            onChange={(e) => handleInputChange('clientName', e.target.value)}
            placeholder="Your full name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientEmail">Email *</Label>
          <Input
            id="clientEmail"
            type="email"
            value={formData.clientEmail}
            onChange={(e) => handleInputChange('clientEmail', e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clientPhone">Phone Number</Label>
        <Input
          id="clientPhone"
          type="tel"
          value={formData.clientPhone}
          onChange={(e) => handleInputChange('clientPhone', e.target.value)}
          placeholder="(555) 123-4567"
        />
      </div>

      {/* Appointment Date and Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Preferred Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Preferred Time *</Label>
          <Select value={formData.time} onValueChange={(value) => handleInputChange('time', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => {
                const hour = 9 + i // 9 AM to 8 PM
                return (
                  <SelectItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                    {hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Any specific requests or information..."
          rows={3}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Service Summary */}
      {selectedService && (
        <div className="bg-lavender/10 border border-lavender/20 rounded-md p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Service Summary</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">Service:</span> {selectedService.name}</p>
            <p><span className="font-medium">Duration:</span> {Math.round(selectedService.defaultDuration / 60)} hours</p>
            <p><span className="font-medium">Total Price:</span> ${selectedService.defaultPrice}</p>
            <p><span className="font-medium">Deposit Required:</span> ${Math.round(selectedService.defaultPrice * 0.3)} (30%)</p>
            <p className="text-xs text-gray-500 mt-2">* A deposit is required to secure your appointment</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBackToServices}
          className="w-full sm:w-auto"
        >
          Back to Services
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !formData.clientName || !formData.clientEmail || !formData.service || !formData.date || !formData.time}
          className="bg-lavender hover:bg-lavender-600 text-white w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating Appointment...
            </>
          ) : (
            'Book Appointment & Pay Deposit'
          )}
        </Button>
      </div>
    </form>
  )
}
