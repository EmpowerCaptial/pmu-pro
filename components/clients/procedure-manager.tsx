"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Syringe, Calendar, MapPin, Clock, Settings, Palette, DollarSign } from 'lucide-react'
import { serviceStorage, type PMUService } from '@/lib/service-storage'

interface Procedure {
  id: string
  serviceId?: string // Link to service from service management
  procedureType: string
  voltage: number
  needleConfiguration: string
  pigmentBrand: string
  pigmentColor: string
  lotNumber: string
  depth: string
  duration: number
  areaTreated: string
  procedureDate: string
  followUpDate: string
  isCompleted: boolean
  notes: string
  price?: number // Price from service
}

const PROCEDURE_TYPES = [
  'Microblading',
  'Powder Brows',
  'Combination Brows',
  'Eyeliner (Top)',
  'Eyeliner (Bottom)',
  'Eyeliner (Both)',
  'Lip Color',
  'Lip Contour',
  'Beauty Mark',
  'Scalp Micropigmentation',
  'Other'
]

const PIGMENT_BRANDS = [
  'Permablend',
  'Li Pigments',
  'Tina Davies',
  'Brow Daddy',
  'Everlasting',
  'PhiBrows',
  'World Famous Ink',
  'Inkredible',
  'Beauty Angels',
  'Fusion Ink',
  'Other'
]

interface ProcedureManagerProps {
  clientId: string
  procedures: Procedure[]
  onProceduresChange: (procedures: Procedure[]) => void
}

export function ProcedureManager({ clientId, procedures, onProceduresChange }: ProcedureManagerProps) {
  const [services, setServices] = useState<PMUService[]>([])
  const [selectedService, setSelectedService] = useState<PMUService | null>(null)
  const [newProcedure, setNewProcedure] = useState({
    serviceId: '',
    procedureType: '',
    voltage: '',
    needleConfiguration: '',
    pigmentBrand: '',
    customPigmentBrand: '',
    pigmentColor: '',
    lotNumber: '',
    depth: '',
    duration: '',
    areaTreated: '',
    procedureDate: '',
    followUpDate: '',
    notes: ''
  })

  useEffect(() => {
    // Load services from storage
    const activeServices = serviceStorage.getActiveServices()
    setServices(activeServices)
  }, [])

  const handleServiceSelect = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (service) {
      setSelectedService(service)
      setNewProcedure(prev => ({
        ...prev,
        serviceId: service.id,
        procedureType: service.name,
        duration: service.duration.toString(),
        areaTreated: service.category
      }))
    }
  }

  const handleProcedureSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // In a real app, you'd save to your API
      console.log('Creating procedure:', newProcedure)
      
      const newProc: Procedure = {
        id: `proc${Date.now()}`,
        serviceId: newProcedure.serviceId,
        procedureType: newProcedure.procedureType,
        voltage: parseFloat(newProcedure.voltage),
        needleConfiguration: newProcedure.needleConfiguration,
        pigmentBrand: newProcedure.pigmentBrand === 'Other' ? newProcedure.customPigmentBrand : newProcedure.pigmentBrand,
        pigmentColor: newProcedure.pigmentColor,
        lotNumber: newProcedure.lotNumber,
        depth: newProcedure.depth,
        duration: parseInt(newProcedure.duration),
        areaTreated: newProcedure.areaTreated,
        procedureDate: newProcedure.procedureDate,
        followUpDate: newProcedure.followUpDate,
        isCompleted: false,
        notes: newProcedure.notes,
        price: selectedService?.price
      }

      const updatedProcedures = [newProc, ...procedures]
      onProceduresChange(updatedProcedures)
      
      // Reset form
      setNewProcedure({
        serviceId: '',
        procedureType: '',
        voltage: '',
        needleConfiguration: '',
        pigmentBrand: '',
        customPigmentBrand: '',
        pigmentColor: '',
        lotNumber: '',
        depth: '',
        duration: '',
        areaTreated: '',
        procedureDate: '',
        followUpDate: '',
        notes: ''
      })
      setSelectedService(null)
    } catch (error) {
      console.error('Error creating procedure:', error)
    }
  }

  const toggleProcedureStatus = (procedureId: string) => {
    const updatedProcedures = procedures.map(proc => 
      proc.id === procedureId 
        ? { ...proc, isCompleted: !proc.isCompleted }
        : proc
    )
    onProceduresChange(updatedProcedures)
  }

  const deleteProcedure = (procedureId: string) => {
    const updatedProcedures = procedures.filter(proc => proc.id !== procedureId)
    onProceduresChange(updatedProcedures)
  }

  return (
    <div className="space-y-6">
      {/* Add New Procedure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Procedure
          </CardTitle>
          <CardDescription>
            Record a new PMU procedure with technical specifications and pigment details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProcedureSubmit} className="space-y-4">
            {/* Service Selection */}
            <div>
              <Label htmlFor="service-select">Select Service *</Label>
              <Select value={newProcedure.serviceId} onValueChange={handleServiceSelect}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue placeholder="Choose from your services" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 z-[100] shadow-lg">
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id} className="hover:bg-lavender/10 text-gray-900 focus:bg-lavender/10">
                      <div className="flex items-center justify-between w-full">
                        <span>{service.name}</span>
                        <span className="text-sm text-gray-500 ml-2">${service.price}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedService && (
                <div className="mt-2 p-3 bg-lavender/10 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{selectedService.name}</span>
                    <div className="flex items-center gap-4 text-gray-600">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        ${selectedService.price}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {selectedService.duration}m
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{selectedService.description}</p>
                </div>
              )}
            </div>

            {/* Basic Procedure Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="procedure-type">Procedure Type *</Label>
                <Input
                  id="procedure-type"
                  value={newProcedure.procedureType}
                  onChange={(e) => setNewProcedure(prev => ({ ...prev, procedureType: e.target.value }))}
                  placeholder="e.g., Eyebrow Microblading"
                  required
                />
              </div>
              <div>
                <Label htmlFor="procedure-date">Procedure Date *</Label>
                <Input
                  id="procedure-date"
                  type="date"
                  value={newProcedure.procedureDate}
                  onChange={(e) => setNewProcedure(prev => ({ ...prev, procedureDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="voltage">Voltage *</Label>
                <Input
                  id="voltage"
                  type="number"
                  step="0.1"
                  placeholder="7.5"
                  value={newProcedure.voltage}
                  onChange={(e) => setNewProcedure(prev => ({ ...prev, voltage: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="needle-config">Needle Configuration *</Label>
                <Input
                  id="needle-config"
                  placeholder="18 needles, 0.18mm"
                  value={newProcedure.needleConfiguration}
                  onChange={(e) => setNewProcedure(prev => ({ ...prev, needleConfiguration: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="depth">Depth</Label>
                <Input
                  id="depth"
                  placeholder="0.2-0.3mm"
                  value={newProcedure.depth}
                  onChange={(e) => setNewProcedure(prev => ({ ...prev, depth: e.target.value }))}
                />
              </div>
            </div>

            {/* Pigment Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="pigment-brand">Pigment Brand *</Label>
                <Select
                  value={newProcedure.pigmentBrand}
                  onValueChange={(value) => setNewProcedure(prev => ({ ...prev, pigmentBrand: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent className="z-[100] bg-white border border-gray-200 shadow-lg">
                    {PIGMENT_BRANDS.map((brand) => (
                      <SelectItem key={brand} value={brand} className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {newProcedure.pigmentBrand === 'Other' && (
                  <Input
                    placeholder="Enter custom brand name"
                    value={newProcedure.customPigmentBrand || ''}
                    onChange={(e) => setNewProcedure(prev => ({ ...prev, customPigmentBrand: e.target.value }))}
                    className="mt-2"
                  />
                )}
              </div>
              <div>
                <Label htmlFor="pigment-color">Pigment Color *</Label>
                <Input
                  id="pigment-color"
                  placeholder="Medium Brown"
                  value={newProcedure.pigmentColor}
                  onChange={(e) => setNewProcedure(prev => ({ ...prev, pigmentColor: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lot-number">Lot Number *</Label>
                <Input
                  id="lot-number"
                  placeholder="MB-2024-001"
                  value={newProcedure.lotNumber}
                  onChange={(e) => setNewProcedure(prev => ({ ...prev, lotNumber: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="area-treated">Area Treated</Label>
                <Input
                  id="area-treated"
                  placeholder="Eyebrows"
                  value={newProcedure.areaTreated}
                  onChange={(e) => setNewProcedure(prev => ({ ...prev, areaTreated: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="120"
                  value={newProcedure.duration}
                  onChange={(e) => setNewProcedure(prev => ({ ...prev, duration: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="follow-up-date">Follow-up Date</Label>
              <Input
                id="follow-up-date"
                type="date"
                value={newProcedure.followUpDate}
                onChange={(e) => setNewProcedure(prev => ({ ...prev, followUpDate: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="procedure-notes">Notes</Label>
              <Textarea
                id="procedure-notes"
                placeholder="Add notes about the procedure, client response, technique used..."
                value={newProcedure.notes}
                onChange={(e) => setNewProcedure(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <Button type="submit" className="bg-lavender hover:bg-lavender-600" disabled={!newProcedure.procedureType || !newProcedure.procedureDate || !newProcedure.voltage || !newProcedure.needleConfiguration || !newProcedure.pigmentBrand || !newProcedure.pigmentColor || !newProcedure.lotNumber}>
              <Plus className="mr-2 h-4 w-4" />
              Add Procedure
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Procedures List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Syringe className="h-5 w-5" />
            Procedures ({procedures.length})
          </CardTitle>
          <CardDescription>
            All recorded procedures for this client
          </CardDescription>
        </CardHeader>
        <CardContent>
          {procedures.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Syringe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No procedures recorded yet</p>
              <p className="text-sm">Add the first procedure using the form above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {procedures.map((proc) => (
                <Card key={proc.id} className="border-lavender/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{proc.procedureType}</CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(proc.procedureDate).toLocaleDateString()}
                          </span>
                          {proc.areaTreated && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {proc.areaTreated}
                            </span>
                          )}
                          {proc.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {proc.duration} min
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={proc.isCompleted ? "default" : "secondary"}>
                          {proc.isCompleted ? 'Completed' : 'Scheduled'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleProcedureStatus(proc.id)}
                        >
                          {proc.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="text-gray-600">Voltage</Label>
                        <p className="font-medium">{proc.voltage}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Needle Config</Label>
                        <p className="font-medium">{proc.needleConfiguration}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Pigment</Label>
                        <p className="font-medium">{proc.pigmentBrand} - {proc.pigmentColor}</p>
                      </div>
                      <div>
                        <Label className="text-gray-600">Lot #</Label>
                        <p className="font-medium">{proc.lotNumber}</p>
                      </div>
                    </div>
                    {proc.price && (
                      <div className="flex items-center gap-2 text-green-600 font-semibold">
                        <DollarSign className="w-4 h-4" />
                        <span>${proc.price}</span>
                      </div>
                    )}
                    {proc.depth && (
                      <div>
                        <Label className="text-gray-600">Depth</Label>
                        <p className="font-medium">{proc.depth}</p>
                      </div>
                    )}
                    {proc.notes && (
                      <div>
                        <Label className="text-gray-600">Notes</Label>
                        <p className="text-sm">{proc.notes}</p>
                      </div>
                    )}
                    {proc.followUpDate && (
                      <div className="pt-3 border-t">
                        <Label className="text-gray-600">Follow-up Date</Label>
                        <p className="font-medium">{new Date(proc.followUpDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    <div className="pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteProcedure(proc.id)}
                      >
                        Delete Procedure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
