"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Clock,
  DollarSign,
  Tag,
  Search,
  Upload,
  Image as ImageIcon,
  ChevronLeft,
  List,
  Menu
} from 'lucide-react'
import { 
  PMU_SERVICES, 
  Service, 
  getActiveServices, 
  getServiceById, 
  addService, 
  updateService, 
  toggleServiceStatus 
} from '@/lib/services-config'

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(PMU_SERVICES)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [newService, setNewService] = useState<Partial<Service>>({
    name: '',
    description: '',
    defaultDuration: 60,
    defaultPrice: 0,
    category: 'other',
    isActive: true
  })

  const categories: Service['category'][] = ['eyebrows', 'lips', 'eyeliner', 'consultation', 'touch-up', 'other']

  // Format duration for display
  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
    }
    return `${minutes}m`
  }

  // Get accent color for service category
  const getAccentColor = (category: Service['category']) => {
    switch (category) {
      case 'eyebrows': return '#8b5cf6'
      case 'lips': return '#ec4899'
      case 'eyeliner': return '#3b82f6'
      case 'consultation': return '#10b981'
      case 'touch-up': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  // Filter services based on search term
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSaveService = () => {
    if (editingService) {
      // Update existing service
      const updated = updateService(editingService.id, editingService)
      if (updated) {
        setServices([...PMU_SERVICES])
        setEditingService(null)
      }
    } else if (isAddingNew) {
      // Add new service
      if (newService.name) {
        addService(newService as Omit<Service, 'id'>)
        setServices([...PMU_SERVICES])
        setIsAddingNew(false)
        setNewService({
          name: '',
          description: '',
          defaultDuration: 60,
          defaultPrice: 0,
          category: 'other',
          isActive: true
        })
      }
    }
  }

  const handleCancel = () => {
    setEditingService(null)
    setIsAddingNew(false)
    setNewService({
      name: '',
      description: '',
      defaultDuration: 60,
      defaultPrice: 0,
      category: 'other',
      isActive: true
    })
  }

  const handleToggleStatus = (serviceId: string) => {
    toggleServiceStatus(serviceId)
    setServices([...PMU_SERVICES])
  }

  const getCategoryColor = (category: Service['category']) => {
    switch (category) {
      case 'eyebrows': return 'bg-purple-100 text-purple-800'
      case 'lips': return 'bg-pink-100 text-pink-800'
      case 'eyeliner': return 'bg-blue-100 text-blue-800'
      case 'consultation': return 'bg-green-100 text-green-800'
      case 'touch-up': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-neutral-800 text-white">
      {/* Header (App Bar) */}
      <div className="flex items-center justify-between h-14 px-4 bg-neutral-900 border-b border-white/10">
        {/* Left: Back button */}
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        {/* Center: Title */}
        <h1 className="text-lg font-semibold text-white">Services</h1>
        
        {/* Right: Two square icon buttons */}
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/10">
            <List className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-white hover:bg-white/10"
            onClick={() => setIsAddingNew(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search Services & Categories"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 rounded-full bg-neutral-700 border-neutral-600 text-white placeholder:text-gray-400"
          />
        </div>

        {/* Info Note */}
        <p className="text-sm text-gray-400 mb-6 px-2">
          Want services to appear on your booking site in a specific order? Tap, hold, and drag services to reorder them.
        </p>

        {/* Scrollable Services List */}
        <div className="space-y-4">
          {filteredServices.map((service) => {
            const meta = [
              formatDuration(service.defaultDuration),
              `$${service.defaultPrice}`,
              service.category
            ].filter(Boolean).join(' · ')

            return (
              <div 
                key={service.id}
                onClick={() => setEditingService(service)}
                className="relative flex items-center rounded-xl bg-neutral-900/60 border border-white/5 p-4 gap-3 cursor-pointer hover:bg-neutral-900/80 transition-colors"
              >
                {/* Left accent bar */}
                <span 
                  className="absolute left-0 top-0 h-full w-1 rounded-l-xl" 
                  style={{ backgroundColor: getAccentColor(service.category) }}
                />
                
                {/* Thumbnail */}
                <div className="h-20 w-20 rounded-md bg-neutral-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {service.imageUrl ? (
                    <img 
                      src={service.imageUrl} 
                      alt={service.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-semibold text-white truncate">{service.name}</div>
                  <div className="mt-1 text-sm text-neutral-400 truncate">{meta}</div>
                </div>

                {/* Drag handle */}
                <div className="ml-2 text-neutral-400 opacity-80">
                  <Menu className="h-5 w-5" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Add/Edit Service Modal */}
        {(isAddingNew || editingService) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md bg-white">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {isAddingNew ? 'Add New Service' : 'Edit Service'}
                  <Button variant="ghost" size="sm" onClick={handleCancel}>
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name *</Label>
                  <Input
                    id="name"
                    value={isAddingNew ? newService.name : editingService?.name || ''}
                    onChange={(e) => {
                      if (isAddingNew) {
                        setNewService({...newService, name: e.target.value})
                      } else if (editingService) {
                        setEditingService({...editingService, name: e.target.value})
                      }
                    }}
                    placeholder="Enter service name"
                    className="force-white-bg force-gray-border force-dark-text"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={isAddingNew ? newService.description : editingService?.description || ''}
                    onChange={(e) => {
                      if (isAddingNew) {
                        setNewService({...newService, description: e.target.value})
                      } else if (editingService) {
                        setEditingService({...editingService, description: e.target.value})
                      }
                    }}
                    placeholder="Service description"
                    className="force-white-bg force-gray-border force-dark-text"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Service Icon/Image</Label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                      {(isAddingNew ? newService.imageUrl : editingService?.imageUrl) ? (
                        <img 
                          src={isAddingNew ? newService.imageUrl : editingService?.imageUrl} 
                          alt="Service icon"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = (event) => {
                              const imageUrl = event.target?.result as string
                              if (isAddingNew) {
                                setNewService({...newService, imageUrl, isCustomImage: true})
                              } else if (editingService) {
                                setEditingService({...editingService, imageUrl, isCustomImage: true})
                              }
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                        className="force-white-bg force-gray-border force-dark-text"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Upload custom image for non-PMU services
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={isAddingNew ? newService.category : editingService?.category}
                    onValueChange={(value: Service['category']) => {
                      if (isAddingNew) {
                        setNewService({...newService, category: value})
                      } else if (editingService) {
                        setEditingService({...editingService, category: value})
                      }
                    }}
                  >
                    <SelectTrigger className="force-white-bg force-gray-border force-dark-text">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200">
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={isAddingNew ? newService.defaultDuration : editingService?.defaultDuration || 60}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 60
                        if (isAddingNew) {
                          setNewService({...newService, defaultDuration: value})
                        } else if (editingService) {
                          setEditingService({...editingService, defaultDuration: value})
                        }
                      }}
                      className="force-white-bg force-gray-border force-dark-text"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Default Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={isAddingNew ? newService.defaultPrice : editingService?.defaultPrice || 0}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        if (isAddingNew) {
                          setNewService({...newService, defaultPrice: value})
                        } else if (editingService) {
                          setEditingService({...editingService, defaultPrice: value})
                        }
                      }}
                      className="force-white-bg force-gray-border force-dark-text"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveService}
                    className="flex-1 bg-lavender hover:bg-lavender-600 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">No services found</h3>
            <p className="text-gray-400">Try adjusting your search or add a new service.</p>
          </div>
        )}
      </div>
    </div>
  )
}