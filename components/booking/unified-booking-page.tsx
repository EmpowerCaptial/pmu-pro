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

interface ArtistProfile {
  id: string
  name: string
  email: string
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
        <Card className="mb-8 bg-white/90 backdrop-blur-sm border-lavender/20 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              {/* Artist Avatar */}
              <div className="relative">
                {artist.avatar ? (
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-lavender/30"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-lavender to-purple-500 flex items-center justify-center text-white font-semibold text-2xl">
                    {artist.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>

              {/* Artist Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{artist.name}</h1>
                {artist.studioName && (
                  <h2 className="text-xl text-lavender font-semibold mb-2">{artist.studioName}</h2>
                )}
                <p className="text-gray-600 mb-3">{artist.bio}</p>
                
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="font-semibold">{artist.rating}</span>
                    <span className="text-gray-600">({artist.reviewCount} reviews)</span>
                  </div>
                  {artist.experience && (
                    <div className="text-sm text-gray-600">
                      {artist.experience} experience
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-600">
                  {artist.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span>{artist.phone}</span>
                    </div>
                  )}
                  {artist.website && (
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      <a href={artist.website} target="_blank" rel="noopener noreferrer" className="text-lavender hover:underline">
                        Website
                      </a>
                    </div>
                  )}
                  {artist.instagram && (
                    <div className="flex items-center gap-1">
                      <Camera className="h-4 w-4" />
                      <a href={`https://instagram.com/${artist.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-lavender hover:underline">
                        {artist.instagram}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {artist.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="bg-lavender/20 text-lavender">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Book Now Button */}
              <div className="text-center">
                <Button 
                  size="lg" 
                  className="bg-lavender hover:bg-lavender-600 text-white px-8 py-3 text-lg font-semibold"
                  onClick={() => setActiveTab('booking')}
                >
                  Book Appointment
                </Button>
                <p className="text-sm text-gray-600 mt-2">Available for bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/90 backdrop-blur-sm border-lavender/20">
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Services & Pricing
            </TabsTrigger>
            <TabsTrigger value="booking" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Book Now
            </TabsTrigger>
          </TabsList>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio.map((item) => (
                <Card key={item.id} className="bg-white/90 backdrop-blur-sm border-lavender/20 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-lavender/20 text-lavender font-bold">
                        {item.type.toUpperCase()}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-serif">{item.title}</CardTitle>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500">BEFORE</p>
                        <img
                          src={item.beforeImage}
                          alt="Before"
                          className="w-full h-24 object-cover rounded-md border"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500">AFTER</p>
                        <img
                          src={item.afterImage}
                          alt="After"
                          className="w-full h-24 object-cover rounded-md border"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service) => (
                <Card key={service.id} className="bg-white/90 backdrop-blur-sm border-lavender/20 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{service.name}</span>
                      <Badge variant="secondary" className="bg-lavender/20 text-lavender">
                        {service.category.toUpperCase()}
                      </Badge>
                    </CardTitle>
                    <p className="text-gray-600">{service.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{Math.round(service.defaultDuration / 60)}h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold text-lg text-gray-900">${service.defaultPrice}</span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => {
                          setSelectedService(service)
                          setActiveTab('booking')
                        }}
                        className="bg-lavender hover:bg-lavender-600 text-white"
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-lavender" />
                  Book Your Appointment
                </CardTitle>
                {selectedService && (
                  <p className="text-gray-600">
                    Selected: <span className="font-semibold">{selectedService.name}</span> - ${selectedService.defaultPrice}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CalendarIcon className="h-16 w-16 text-lavender/50 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking System Coming Soon</h3>
                  <p className="text-gray-600 mb-6">
                    We're working on integrating the full booking system with calendar availability.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => setActiveTab('services')}>
                      Back to Services
                    </Button>
                    <Button className="bg-lavender hover:bg-lavender-600 text-white">
                      Contact {artist.name}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
