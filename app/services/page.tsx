"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  DollarSign, 
  BookOpen,
  Search
} from 'lucide-react'
import { serviceStorage, type PMUService } from '@/lib/service-storage'

export default function ServiceManagement() {
  const [services, setServices] = useState<PMUService[]>([])
  const [isAddingService, setIsAddingService] = useState(false)
  const [editingService, setEditingService] = useState<PMUService | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 60,
    category: 'Eyebrows'
  })

  const categories = ['Eyebrows', 'Lips', 'Eyes', 'Face', 'Other']

  useEffect(() => {
    // Load services from storage
    const allServices = serviceStorage.getAllServices()
    setServices(allServices)
  }, [])

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddService = () => {
    if (!newService.name || !newService.description) return

    const service = serviceStorage.addService({
      name: newService.name,
      description: newService.description,
      price: newService.price,
      duration: newService.duration,
      category: newService.category,
      isActive: true
    })

    setServices(serviceStorage.getAllServices())
    setNewService({
      name: '',
      description: '',
      price: 0,
      duration: 60,
      category: 'Eyebrows'
    })
    setIsAddingService(false)
  }

  const handleEditService = (service: PMUService) => {
    setEditingService(service)
    setNewService({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category
    })
    setIsAddingService(true)
  }

  const handleUpdateService = () => {
    if (!editingService || !newService.name || !newService.description) return

    serviceStorage.updateService(editingService.id, {
      name: newService.name,
      description: newService.description,
      price: newService.price,
      duration: newService.duration,
      category: newService.category
    })

    setServices(serviceStorage.getAllServices())
    setEditingService(null)
    setNewService({
      name: '',
      description: '',
      price: 0,
      duration: 60,
      category: 'Eyebrows'
    })
    setIsAddingService(false)
  }

  const handleDeleteService = (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      serviceStorage.deleteService(id)
      setServices(serviceStorage.getAllServices())
    }
  }

  const toggleServiceStatus = (id: string) => {
    serviceStorage.toggleServiceStatus(id)
    setServices(serviceStorage.getAllServices())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-ink mb-2">Service Management</h1>
            <p className="text-muted">Manage your PMU services, pricing, and procedures</p>
          </div>
          <Button
            onClick={() => setIsAddingService(true)}
            className="bg-lavender hover:bg-lavender-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Add/Edit Service Form */}
        {isAddingService && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editingService ? 'Edit Service' : 'Add New Service'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Service Name</Label>
                  <Input
                    id="name"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    placeholder="e.g., Eyebrow Microblading"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={newService.category}
                    onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  placeholder="Describe the service..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                    placeholder="350"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newService.duration}
                    onChange={(e) => setNewService({ ...newService, duration: Number(e.target.value) })}
                    placeholder="120"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={editingService ? handleUpdateService : handleAddService}
                  className="bg-lavender hover:bg-lavender-600 text-white"
                >
                  {editingService ? 'Update Service' : 'Add Service'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingService(false)
                    setEditingService(null)
                    setNewService({
                      name: '',
                      description: '',
                      price: 0,
                      duration: 60,
                      category: 'Eyebrows'
                    })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <Badge variant={service.isActive ? "default" : "secondary"} className="mt-2">
                      {service.category}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditService(service)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteService(service.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted text-sm mb-4">{service.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-semibold">${service.price}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>{service.duration} minutes</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => toggleServiceStatus(service.id)}
                >
                  {service.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No services found</h3>
            <p className="text-gray-500">Try adjusting your search or add a new service.</p>
          </div>
        )}
      </div>
    </div>
  )
}
