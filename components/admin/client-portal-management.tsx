"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Upload, 
  Image, 
  DollarSign, 
  Star, 
  Building2, 
  Settings, 
  Save, 
  Plus,
  Trash2,
  Edit,
  Eye,
  Calendar,
  MapPin,
  Phone
} from 'lucide-react'
import { clientPortalContentService, type PortalService, type PortalFacility, type PortalSpecialOffer } from '@/lib/client-portal-content-service'

interface Service {
  id: string
  name: string
  description: string
  price: number
  image: string
  isSpecial: boolean
  specialPrice?: number
  specialEndDate?: string
  category: string
}

interface PartnerFacility {
  id: string
  name: string
  specialty: string
  image: string
  rating: number
  location: string
  phone: string
  description: string
  services: string[]
  consultationFee: string
  availableSlots: number
  isActive: boolean
}

interface SpecialOffer {
  id: string
  title: string
  description: string
  discount: number
  startDate: string
  endDate: string
  image: string
  isActive: boolean
  applicableServices: string[]
}

export function ClientPortalManagement() {
  const [activeTab, setActiveTab] = useState('services')
  const [selectedService, setSelectedService] = useState<PortalService | null>(null)
  const [selectedFacility, setSelectedFacility] = useState<PortalFacility | null>(null)
  const [selectedSpecial, setSelectedSpecial] = useState<PortalSpecialOffer | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  
  // Add state to force re-renders
  const [refreshKey, setRefreshKey] = useState(0)

  // Get data from the service - use refreshKey to force re-renders
  const services = clientPortalContentService.getServices()
  const facilities = clientPortalContentService.getFacilities()
  const specials = clientPortalContentService.getSpecialOffers()

  // Force re-render when refreshKey changes
  useEffect(() => {
    // This will trigger a re-render when refreshKey changes
  }, [refreshKey])

  const handleImageUpload = (file: File, type: 'service' | 'facility' | 'special') => {
    // Handle image upload logic here
    console.log('Uploading image:', file.name, 'for type:', type)
    
    // Convert file to base64 for persistence
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      
      // Update the appropriate selected item based on type
      if (type === 'service' && selectedService) {
        setSelectedService({ ...selectedService, image: imageUrl })
      } else if (type === 'facility' && selectedFacility) {
        setSelectedFacility({ ...selectedFacility, image: imageUrl })
      } else if (type === 'special' && selectedSpecial) {
        setSelectedSpecial({ ...selectedSpecial, image: imageUrl })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSaveService = (service: PortalService) => {
    console.log('Admin: Saving service:', service)
    if (isEditing && selectedService) {
      const result = clientPortalContentService.updateService(selectedService.id, service)
      console.log('Admin: Update result:', result)
    } else {
      const result = clientPortalContentService.addService(service)
      console.log('Admin: Add result:', result)
    }
    setSelectedService(null)
    setIsEditing(false)
    // Force re-render by updating state instead of page reload
    setRefreshKey(prev => prev + 1)
  }

  const handleSaveFacility = (facility: PortalFacility) => {
    if (isEditing && selectedFacility) {
      clientPortalContentService.updateFacility(selectedFacility.id, facility)
    } else {
      clientPortalContentService.addFacility(facility)
    }
    setSelectedFacility(null)
    setIsEditing(false)
    // Force re-render by updating state instead of page reload
    setRefreshKey(prev => prev + 1)
  }

  const handleSaveSpecial = (special: PortalSpecialOffer) => {
    if (isEditing && selectedSpecial) {
      clientPortalContentService.updateSpecialOffer(selectedSpecial.id, special)
    } else {
      clientPortalContentService.addSpecialOffer(special)
    }
    setSelectedSpecial(null)
    setIsEditing(false)
    // Force re-render by updating state instead of page reload
    setRefreshKey(prev => prev + 1)
  }

  const handleDeleteService = (serviceId: string) => {
    clientPortalContentService.deleteService(serviceId)
    // Force re-render by updating state instead of page reload
    setRefreshKey(prev => prev + 1)
  }

  const handleDeleteFacility = (facilityId: string) => {
    clientPortalContentService.deleteFacility(facilityId)
    // Force re-render by updating state instead of page reload
    setRefreshKey(prev => prev + 1)
  }

  const handleDeleteSpecial = (specialId: string) => {
    clientPortalContentService.deleteSpecialOffer(specialId)
    // Force re-render by updating state instead of page reload
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Portal Management</h1>
          <p className="text-gray-600">Manage services, partner facilities, and special offers</p>
        </div>
        <Button 
          variant="outline" 
          className="text-sm"
          onClick={() => window.open('/client-portal/test', '_blank')}
        >
          <Eye className="h-3 w-3 mr-1" />
          Preview Portal
        </Button>
        <Button 
          variant="outline" 
          className="text-sm"
          onClick={() => {
            clientPortalContentService.debugStorage()
            console.log('Current facilities:', clientPortalContentService.getFacilities())
          }}
        >
          Debug Storage
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="facilities">Partner Facilities</TabsTrigger>
          <TabsTrigger value="specials">Special Offers</TabsTrigger>
          <TabsTrigger value="settings">Portal Settings</TabsTrigger>
        </TabsList>

        {/* Services Management */}
        <TabsContent value="services" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Service Management</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={() => { setSelectedService(null); setIsEditing(false) }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-white border-2 border-gray-200 shadow-xl">
                <DialogHeader>
                  <DialogTitle>{isEditing ? 'Edit Service' : 'Add New Service'}</DialogTitle>
                  <DialogDescription>
                    Configure service details, pricing, and special offers
                  </DialogDescription>
                </DialogHeader>
                <ServiceForm 
                  service={selectedService}
                  onSave={handleSaveService}
                  onImageUpload={(file) => handleImageUpload(file, 'service')}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id} className="relative">
                <div className="h-48 bg-gradient-to-br from-lavender to-purple-500 rounded-t-lg relative">
                  {service.image && (
                    <img 
                      src={service.image} 
                      alt={service.name}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  )}
                  {service.isSpecial && (
                    <Badge className="absolute top-3 right-3 bg-red-500">
                      Special
                    </Badge>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setSelectedService(service); setIsEditing(true) }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      {service.isSpecial ? (
                        <div className="flex items-center gap-2">
                          <span className="text-red-600 font-semibold">${service.specialPrice}</span>
                          <span className="text-gray-400 line-through text-sm">${service.price}</span>
                        </div>
                      ) : (
                        <span className="font-semibold">${service.price}</span>
                      )}
                    </div>
                    <Badge variant="outline">{service.category}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Partner Facilities Management */}
        <TabsContent value="facilities" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Partner Facilities</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={() => { setSelectedFacility(null); setIsEditing(false) }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Facility
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-white border-2 border-gray-200 shadow-xl">
                <DialogHeader>
                  <DialogTitle>{isEditing ? 'Edit Facility' : 'Add New Facility'}</DialogTitle>
                  <DialogDescription>
                    Add partner medical facilities and their services
                  </DialogDescription>
                </DialogHeader>
                <FacilityForm 
                  facility={selectedFacility}
                  onSave={handleSaveFacility}
                  onImageUpload={(file) => handleImageUpload(file, 'facility')}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((facility) => (
              <Card key={facility.id} className="relative">
                <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 rounded-t-lg relative">
                  {facility.image && (
                    <img 
                      src={facility.image} 
                      alt={facility.name}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  )}
                  <Badge className={`absolute top-3 right-3 ${facility.isActive ? 'bg-green-500' : 'bg-gray-500'}`}>
                    {facility.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{facility.name}</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setSelectedFacility(facility); setIsEditing(true) }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600"
                        onClick={() => handleDeleteFacility(facility.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{facility.description}</p>
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
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{facility.rating}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span>Consultation: {facility.consultationFee}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Special Offers Management */}
        <TabsContent value="specials" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Special Offers</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={() => { setSelectedSpecial(null); setIsEditing(false) }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Special Offer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-white border-2 border-gray-200 shadow-xl">
                <DialogHeader>
                  <DialogTitle>{isEditing ? 'Edit Special Offer' : 'Add New Special Offer'}</DialogTitle>
                  <DialogDescription>
                    Create promotional offers and discounts
                  </DialogDescription>
                </DialogHeader>
                <SpecialOfferForm 
                  special={selectedSpecial}
                  onSave={handleSaveSpecial}
                  onImageUpload={(file) => handleImageUpload(file, 'special')}
                  services={services}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specials.map((special) => (
              <Card key={special.id} className="relative">
                <div className="h-48 bg-gradient-to-br from-red-500 to-pink-500 rounded-t-lg relative">
                  {special.image && (
                    <img 
                      src={special.image} 
                      alt={special.title}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  )}
                  <Badge className={`absolute top-3 right-3 ${special.isActive ? 'bg-green-500' : 'bg-gray-500'}`}>
                    {special.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{special.title}</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setSelectedSpecial(special); setIsEditing(true) }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600"
                        onClick={() => handleDeleteSpecial(special.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{special.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-red-500" />
                      <span className="font-semibold">{special.discount}% OFF</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{special.startDate} - {special.endDate}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {special.applicableServices.map((service) => (
                        <Badge key={service} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Portal Settings */}
        <TabsContent value="settings" className="space-y-6">
          <h2 className="text-xl font-semibold">Portal Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="portal-title">Portal Title</Label>
                  <Input id="portal-title" defaultValue="PMU Client Portal" />
                </div>
                <div>
                  <Label htmlFor="welcome-message">Welcome Message</Label>
                  <Textarea 
                    id="welcome-message" 
                    defaultValue="Welcome to your personalized PMU experience"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input id="contact-email" defaultValue="support@thepmuguide.com" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Image Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Recommended Image Sizes</Label>
                  <div className="text-sm text-gray-600 space-y-1 mt-2">
                    <p>• Service Images: 600px × 400px</p>
                    <p>• Facility Images: 800px × 600px</p>
                    <p>• Special Offer Images: 600px × 400px</p>
                    <p>• Avatar Images: 300px × 300px</p>
                  </div>
                </div>
                <div>
                  <Label>Image Upload Guidelines</Label>
                  <div className="text-sm text-gray-600 space-y-1 mt-2">
                    <p>• Format: JPG or WebP</p>
                    <p>• Max Size: 200KB per image</p>
                    <p>• Quality: 85-90% compression</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Form Components
function ServiceForm({ service, onSave, onImageUpload }: { 
  service: PortalService | null, 
  onSave: (service: PortalService) => void,
  onImageUpload: (file: File) => void 
}) {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    price: service?.price || 0,
    category: service?.category || '',
    isSpecial: service?.isSpecial || false,
    specialPrice: service?.specialPrice || 0,
    specialEndDate: service?.specialEndDate || '',
    image: service?.image || ''
  })

  // Update form data when service changes (for editing)
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        price: service.price || 0,
        category: service.category || '',
        isSpecial: service.isSpecial || false,
        specialPrice: service.specialPrice || 0,
        specialEndDate: service.specialEndDate || '',
        image: service.image || ''
      })
    }
  }, [service])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Convert file to base64 for persistence
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        console.log('ServiceForm: Image uploaded, updating form data with:', imageUrl)
        setFormData({ ...formData, image: imageUrl })
        // Also call the parent's image upload handler
        onImageUpload(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('ServiceForm: Form submitted with data:', formData)
    onSave(formData as PortalService)
  }

  console.log('ServiceForm: Rendering form with data:', formData)

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="service-name">Service Name</Label>
          <Input 
            id="service-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="bg-white border-gray-300"
          />
        </div>
        <div>
          <Label htmlFor="service-category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger className="bg-white border-gray-300">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Eyebrows">Eyebrows</SelectItem>
              <SelectItem value="Lips">Lips</SelectItem>
              <SelectItem value="Eyeliner">Eyeliner</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="service-description">Description</Label>
        <Textarea 
          id="service-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          className="bg-white border-gray-300"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="service-price">Regular Price ($)</Label>
          <Input 
            id="service-price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            required
            className="bg-white border-gray-300"
          />
        </div>
        <div>
          <Label htmlFor="service-image">Image Upload</Label>
          <div className="flex items-center gap-2">
            <Input 
              id="service-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="bg-white border-gray-300"
            />
            <Button type="button" variant="outline" size="sm" className="bg-white border-gray-300">
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          {formData.image && (
            <div className="mt-2">
              <img 
                src={formData.image} 
                alt="Preview" 
                className="w-32 h-24 object-cover rounded border"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white p-3 rounded border">
        <input 
          type="checkbox" 
          id="is-special"
          checked={formData.isSpecial}
          onChange={(e) => setFormData({ ...formData, isSpecial: e.target.checked })}
          className="w-4 h-4"
        />
        <Label htmlFor="is-special" className="font-medium">Mark as Special Offer</Label>
      </div>

      {formData.isSpecial && (
        <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded border">
          <div>
            <Label htmlFor="special-price">Special Price ($)</Label>
            <Input 
              id="special-price"
              type="number"
              value={formData.specialPrice}
              onChange={(e) => setFormData({ ...formData, specialPrice: Number(e.target.value) })}
              className="bg-white border-gray-300"
            />
          </div>
          <div>
            <Label htmlFor="special-end-date">End Date</Label>
            <Input 
              id="special-end-date"
              type="date"
              value={formData.specialEndDate}
              onChange={(e) => setFormData({ ...formData, specialEndDate: e.target.value })}
              className="bg-white border-gray-300"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" className="bg-white border-gray-300">
          Cancel
        </Button>
        <Button type="submit" className="bg-lavender hover:bg-lavender/90 text-white">
          Save Service
        </Button>
      </div>
    </form>
  )
}

function FacilityForm({ facility, onSave, onImageUpload }: { 
  facility: PortalFacility | null, 
  onSave: (facility: PortalFacility) => void,
  onImageUpload: (file: File) => void 
}) {
  const [formData, setFormData] = useState({
    name: facility?.name || '',
    specialty: facility?.specialty || '',
    description: facility?.description || '',
    location: facility?.location || '',
    phone: facility?.phone || '',
    consultationFee: facility?.consultationFee || '',
    rating: facility?.rating || 0,
    availableSlots: facility?.availableSlots || 0,
    services: facility?.services || [],
    isActive: facility?.isActive ?? true,
    image: facility?.image || ''
  })

  // Update form data when facility changes (for editing)
  useEffect(() => {
    if (facility) {
      setFormData({
        name: facility.name || '',
        specialty: facility.specialty || '',
        description: facility.description || '',
        location: facility.location || '',
        phone: facility.phone || '',
        consultationFee: facility.consultationFee || '',
        rating: facility.rating || 0,
        availableSlots: facility.availableSlots || 0,
        services: facility.services || [],
        isActive: facility.isActive ?? true,
        image: facility.image || ''
      })
    }
  }, [facility])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImageUpload(file)
      // Convert file to base64 for persistence
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setFormData({ ...formData, image: imageUrl })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData as PortalFacility)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="facility-name">Facility Name</Label>
          <Input 
            id="facility-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="bg-white border-gray-300"
          />
        </div>
        <div>
          <Label htmlFor="facility-specialty">Specialty</Label>
          <Select value={formData.specialty} onValueChange={(value) => setFormData({ ...formData, specialty: value })}>
            <SelectTrigger className="bg-white border-gray-300">
              <SelectValue placeholder="Select specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cosmetic Dermatology">Cosmetic Dermatology</SelectItem>
              <SelectItem value="Plastic Surgery">Plastic Surgery</SelectItem>
              <SelectItem value="Wellness & Integrative Medicine">Wellness & Integrative Medicine</SelectItem>
              <SelectItem value="Cosmetic Dentistry">Cosmetic Dentistry</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="facility-description">Description</Label>
        <Textarea 
          id="facility-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          className="bg-white border-gray-300"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="facility-location">Location</Label>
          <Input 
            id="facility-location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
            className="bg-white border-gray-300"
          />
        </div>
        <div>
          <Label htmlFor="facility-phone">Phone</Label>
          <Input 
            id="facility-phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            className="bg-white border-gray-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="facility-rating">Rating</Label>
          <Input 
            id="facility-rating"
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
            className="bg-white border-gray-300"
          />
        </div>
        <div>
          <Label htmlFor="facility-fee">Consultation Fee</Label>
          <Input 
            id="facility-fee"
            value={formData.consultationFee}
            onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
            required
            className="bg-white border-gray-300"
          />
        </div>
        <div>
          <Label htmlFor="facility-slots">Available Slots</Label>
          <Input 
            id="facility-slots"
            type="number"
            value={formData.availableSlots}
            onChange={(e) => setFormData({ ...formData, availableSlots: Number(e.target.value) })}
            className="bg-white border-gray-300"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="facility-image">Facility Image</Label>
        <div className="flex items-center gap-2">
          <Input 
            id="facility-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="bg-white border-gray-300"
          />
          <Button type="button" variant="outline" size="sm" className="bg-white border-gray-300">
            <Upload className="h-4 w-4" />
          </Button>
        </div>
        {formData.image && (
          <div className="mt-2">
            <img 
              src={formData.image} 
              alt="Preview" 
              className="w-32 h-24 object-cover rounded border"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 bg-white p-3 rounded border">
        <input 
          type="checkbox" 
          id="is-active"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="w-4 h-4"
        />
        <Label htmlFor="is-active" className="font-medium">Active Facility</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" className="bg-white border-gray-300">
          Cancel
        </Button>
        <Button type="submit" className="bg-lavender hover:bg-lavender/90 text-white">
          Save Facility
        </Button>
      </div>
    </form>
  )
}

function SpecialOfferForm({ special, onSave, onImageUpload, services }: { 
  special: PortalSpecialOffer | null, 
  onSave: (special: PortalSpecialOffer) => void,
  onImageUpload: (file: File) => void,
  services: PortalService[]
}) {
  const [formData, setFormData] = useState({
    title: special?.title || '',
    description: special?.description || '',
    discount: special?.discount || 0,
    startDate: special?.startDate || '',
    endDate: special?.endDate || '',
    isActive: special?.isActive ?? true,
    applicableServices: special?.applicableServices || [],
    image: special?.image || ''
  })

  // Update form data when special changes (for editing)
  useEffect(() => {
    if (special) {
      setFormData({
        title: special.title || '',
        description: special.description || '',
        discount: special.discount || 0,
        startDate: special.startDate || '',
        endDate: special.endDate || '',
        isActive: special.isActive ?? true,
        applicableServices: special.applicableServices || [],
        image: special.image || ''
      })
    }
  }, [special])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onImageUpload(file)
      // Convert file to base64 for persistence
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setFormData({ ...formData, image: imageUrl })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData as PortalSpecialOffer)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-lg">
      <div>
        <Label htmlFor="special-title">Offer Title</Label>
        <Input 
          id="special-title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="bg-white border-gray-300"
        />
      </div>

      <div>
        <Label htmlFor="special-description">Description</Label>
        <Textarea 
          id="special-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          className="bg-white border-gray-300"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="special-discount">Discount (%)</Label>
          <Input 
            id="special-discount"
            type="number"
            min="0"
            max="100"
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
            required
            className="bg-white border-gray-300"
          />
        </div>
        <div>
          <Label htmlFor="special-start-date">Start Date</Label>
          <Input 
            id="special-start-date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
            className="bg-white border-gray-300"
          />
        </div>
        <div>
          <Label htmlFor="special-end-date">End Date</Label>
          <Input 
            id="special-end-date"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
            className="bg-white border-gray-300"
          />
        </div>
      </div>

      <div className="bg-white p-4 rounded border">
        <Label>Applicable Services</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {services.map((service) => (
            <div key={service.id} className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id={`service-${service.id}`}
                checked={formData.applicableServices.includes(service.name)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({ 
                      ...formData, 
                      applicableServices: [...formData.applicableServices, service.name] 
                    })
                  } else {
                    setFormData({ 
                      ...formData, 
                      applicableServices: formData.applicableServices.filter(s => s !== service.name) 
                    })
                  }
                }}
                className="w-4 h-4"
              />
              <Label htmlFor={`service-${service.id}`} className="text-sm">{service.name}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="special-image">Promotional Image</Label>
        <div className="flex items-center gap-2">
          <Input 
            id="special-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="bg-white border-gray-300"
          />
          <Button type="button" variant="outline" size="sm" className="bg-white border-gray-300">
            <Upload className="h-4 w-4" />
          </Button>
        </div>
        {formData.image && (
          <div className="mt-2">
            <img 
              src={formData.image} 
              alt="Preview" 
              className="w-32 h-24 object-cover rounded border"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 bg-white p-3 rounded border">
        <input 
          type="checkbox" 
          id="is-active-special"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="w-4 h-4"
        />
        <Label htmlFor="is-active-special" className="font-medium">Active Offer</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" className="bg-white border-gray-300">
          Cancel
        </Button>
        <Button type="submit" className="bg-lavender hover:bg-lavender/90 text-white">
          Save Special Offer
        </Button>
      </div>
    </form>
  )
}
