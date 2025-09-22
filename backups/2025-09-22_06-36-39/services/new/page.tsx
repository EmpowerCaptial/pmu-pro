"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'
import { serviceStorage } from '@/lib/service-storage'

export default function NewServicePage() {
  const router = useRouter()
  const [service, setService] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 60,
    category: 'Eyebrows'
  })

  const categories = ['Eyebrows', 'Lips', 'Eyes', 'Face', 'Other']

  const handleSave = () => {
    if (!service.name || !service.description || service.price <= 0) return

    // Save to service storage
    serviceStorage.addService({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category,
      isActive: true
    })

    // Redirect back to services
    router.push('/services')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-ink">Add New Service</h1>
            <p className="text-muted">Create a new PMU service for your practice</p>
          </div>
        </div>

        {/* Service Form */}
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={service.name}
                  onChange={(e) => setService({ ...service, name: e.target.value })}
                  placeholder="e.g., Eyebrow Microblading"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={service.category}
                  onChange={(e) => setService({ ...service, category: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={service.description}
                onChange={(e) => setService({ ...service, description: e.target.value })}
                placeholder="Describe the service, what it includes, and any important details..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={service.price}
                  onChange={(e) => setService({ ...service, price: Number(e.target.value) })}
                  placeholder="350"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={service.duration}
                  onChange={(e) => setService({ ...service, duration: Number(e.target.value) })}
                  placeholder="120"
                  min="15"
                  step="15"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleSave}
                className="bg-lavender hover:bg-lavender-600 text-white flex-1"
                disabled={!service.name || !service.description || service.price <= 0}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Service
              </Button>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        {service.name && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-3">{service.description}</p>
                <div className="flex gap-4 text-sm">
                  <span className="font-medium">${service.price}</span>
                  <span>{service.duration} minutes</span>
                  <span className="bg-lavender/20 text-lavender px-2 py-1 rounded">
                    {service.category}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
