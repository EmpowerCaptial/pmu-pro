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
  Search
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
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-ink mb-2">Services Management</h1>
            <p className="text-muted">Manage your PMU services, pricing, and procedures</p>
          </div>
          <Button 
            onClick={() => setIsAddingNew(true)}
            className="bg-lavender hover:bg-lavender-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 force-white-bg force-gray-border force-dark-text"
          />
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className={`${!service.isActive ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(service.category)}>
                      {service.category}
                    </Badge>
                    <Switch
                      checked={service.isActive}
                      onCheckedChange={() => handleToggleStatus(service.id)}
                    />
                  </div>
                </div>
                {service.description && (
                  <p className="text-sm text-gray-600">{service.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{service.defaultDuration} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span>${service.defaultPrice}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingService(service)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No services found</h3>
            <p className="text-gray-500">Try adjusting your search or add a new service.</p>
          </div>
        )}
      </div>
    </div>
  )
}