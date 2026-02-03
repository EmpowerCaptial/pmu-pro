"use client";

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Save, X, Plus, Upload, Image as ImageIcon, X as XIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useFileUpload } from '@/hooks/use-file-upload';
import { useDemoAuth } from '@/hooks/use-demo-auth';

interface ProcedureFormProps {
  clientId: string;
  clientName: string;
  onSave: (procedure: any) => void;
  onCancel: () => void;
  initialData?: any;
  isEditing?: boolean;
}

const PROCEDURE_TYPES = [
  'Microblading',
  'Powder Brows',
  'Combo Brows',
  'Lip Blush',
  'Lip Liner',
  'Eyeliner',
  'Lash Enhancement',
  'Areola Restoration',
  'Scalp Micropigmentation',
  'Other'
];

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
];

const NEEDLE_CONFIGURATIONS = [
  '18U Microblade',
  '25U Microblade',
  '1RL 0.30mm',
  '3RL 0.25mm',
  '5RL 0.25mm',
  '7RL 0.25mm',
  '9RL 0.25mm',
  '1RS 0.25mm',
  '3RS 0.25mm',
  '5RS 0.25mm',
  '7RS 0.25mm',
  '9RS 0.25mm',
  'Other'
];

const SKIN_DEPTHS = [
  '0.1-0.2mm',
  '0.2-0.3mm',
  '0.3-0.4mm',
  '0.4-0.5mm',
  '0.5-0.6mm'
];

const TECHNIQUES = [
  'Hair stroke technique',
  'Powder technique',
  'Combo technique',
  'Ombre technique',
  'Machine work',
  'Hand tool work'
];

export default function ProcedureForm({
  clientId,
  clientName,
  onSave,
  onCancel,
  initialData,
  isEditing = false
}: ProcedureFormProps) {
  const { currentUser } = useDemoAuth()
  const [formData, setFormData] = useState({
    procedureType: initialData?.procedureType || '',
    voltage: initialData?.voltage || '',
    needleConfiguration: initialData?.needleConfiguration || '',
    needleSize: initialData?.needleSize || '',
    pigmentBrand: initialData?.pigmentBrand || '',
    customPigmentBrand: initialData?.customPigmentBrand || '',
    pigmentColor: initialData?.pigmentColor || '',
    lotNumber: initialData?.lotNumber || '',
    depth: initialData?.depth || '',
    technique: initialData?.technique || '',
    duration: initialData?.duration || '',
    areaTreated: initialData?.areaTreated || '',
    notes: initialData?.notes || '',
    procedureDate: initialData?.procedureDate ? new Date(initialData.procedureDate) : new Date(),
    followUpDate: initialData?.followUpDate ? new Date(initialData.followUpDate) : null,
    touchUpScheduled: initialData?.touchUpScheduled || false,
    touchUpDate: initialData?.touchUpDate ? new Date(initialData.touchUpDate) : null,
    isCompleted: initialData?.isCompleted || false,
    beforePhotos: initialData?.beforePhotos || [],
    afterPhotos: initialData?.afterPhotos || [],
    healingProgress: initialData?.healingProgress || ''
  });

  const [showProcedureDate, setShowProcedureDate] = useState(false);
  const [showFollowUpDate, setShowFollowUpDate] = useState(false);
  const [showTouchUpDate, setShowTouchUpDate] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const procedureData = {
        clientId,
        procedureType: formData.procedureType,
        voltage: formData.voltage ? parseFloat(formData.voltage) : null,
        needleConfiguration: formData.needleConfiguration,
        needleSize: formData.needleSize,
        pigmentBrand: formData.pigmentBrand === 'Other' ? formData.customPigmentBrand : formData.pigmentBrand,
        pigmentColor: formData.pigmentColor,
        lotNumber: formData.lotNumber,
        depth: formData.depth,
        technique: formData.technique,
        duration: formData.duration ? parseInt(formData.duration) : null,
        areaTreated: formData.areaTreated,
        notes: formData.notes,
        procedureDate: formData.procedureDate.toISOString(),
        followUpDate: formData.followUpDate?.toISOString() || null,
        touchUpScheduled: formData.touchUpScheduled,
        touchUpDate: formData.touchUpDate?.toISOString() || null,
        isCompleted: formData.isCompleted,
        beforePhotos: formData.beforePhotos,
        afterPhotos: formData.afterPhotos,
        healingProgress: formData.healingProgress
      };

      onSave(procedureData);
    } catch (error) {
      console.error('Error saving procedure:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-ink flex items-center gap-2">
          <Plus className="h-6 w-6 text-lavender" />
          {isEditing ? 'Edit Procedure' : 'Add New Procedure'}
        </CardTitle>
        <p className="text-muted-text">
          {isEditing ? 'Update procedure details for' : 'Add procedure details for'} <strong>{clientName}</strong>
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="procedureType">Procedure Type *</Label>
              <Select
                value={formData.procedureType}
                onValueChange={(value) => handleInputChange('procedureType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select procedure type" />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-white border border-gray-200 shadow-lg">
                  {PROCEDURE_TYPES.map((type) => (
                    <SelectItem key={type} value={type} className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="areaTreated">Area Treated</Label>
              <Input
                id="areaTreated"
                value={formData.areaTreated}
                onChange={(e) => handleInputChange('areaTreated', e.target.value)}
                placeholder="e.g., Eyebrows, Lips, Eyes"
              />
            </div>
          </div>

          {/* Equipment & Materials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="voltage">Voltage</Label>
              <Input
                id="voltage"
                type="number"
                step="0.1"
                value={formData.voltage}
                onChange={(e) => handleInputChange('voltage', e.target.value)}
                placeholder="e.g., 7.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="needleConfiguration">Needle Configuration</Label>
              <Select
                value={formData.needleConfiguration}
                onValueChange={(value) => handleInputChange('needleConfiguration', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select needle config" />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-white border border-gray-200 shadow-lg">
                  {NEEDLE_CONFIGURATIONS.map((config) => (
                    <SelectItem key={config} value={config} className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">
                      {config}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="needleSize">Needle Size</Label>
              <Input
                id="needleSize"
                value={formData.needleSize}
                onChange={(e) => handleInputChange('needleSize', e.target.value)}
                placeholder="e.g., 0.18mm"
              />
            </div>
          </div>

          {/* Pigment Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pigmentBrand">Pigment Brand</Label>
              <Select
                value={formData.pigmentBrand}
                onValueChange={(value) => handleInputChange('pigmentBrand', value)}
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
              {formData.pigmentBrand === 'Other' && (
                <Input
                  placeholder="Enter custom brand name"
                  value={formData.customPigmentBrand || ''}
                  onChange={(e) => handleInputChange('customPigmentBrand', e.target.value)}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pigmentColor">Pigment Color</Label>
              <Input
                id="pigmentColor"
                value={formData.pigmentColor}
                onChange={(e) => handleInputChange('pigmentColor', e.target.value)}
                placeholder="e.g., Warm Brown"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lotNumber">Lot Number</Label>
              <Input
                id="lotNumber"
                value={formData.lotNumber}
                onChange={(e) => handleInputChange('lotNumber', e.target.value)}
                placeholder="e.g., MB-2024-001"
              />
            </div>
          </div>

          {/* Technique & Depth */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="depth">Depth</Label>
              <Select
                value={formData.depth}
                onValueChange={(value) => handleInputChange('depth', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select depth" />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-white border border-gray-200 shadow-lg">
                  {SKIN_DEPTHS.map((depth) => (
                    <SelectItem key={depth} value={depth} className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">
                      {depth}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="technique">Technique</Label>
              <Select
                value={formData.technique}
                onValueChange={(value) => handleInputChange('technique', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select technique" />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-white border border-gray-200 shadow-lg">
                  {TECHNIQUES.map((technique) => (
                    <SelectItem key={technique} value={technique} className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">
                      {technique}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="e.g., 120"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Procedure Date *</Label>
              <Popover open={showProcedureDate} onOpenChange={setShowProcedureDate}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.procedureDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.procedureDate ? format(formData.procedureDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.procedureDate}
                    onSelect={(date) => {
                      if (date) {
                        handleInputChange('procedureDate', date);
                        setShowProcedureDate(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Follow-up Date</Label>
              <Popover open={showFollowUpDate} onOpenChange={setShowFollowUpDate}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.followUpDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.followUpDate ? format(formData.followUpDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.followUpDate || undefined}
                    onSelect={(date) => {
                      if (date) {
                        handleInputChange('followUpDate', date);
                        setShowFollowUpDate(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Touch-up Date</Label>
              <Popover open={showTouchUpDate} onOpenChange={setShowTouchUpDate}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.touchUpDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.touchUpDate ? format(formData.touchUpDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.touchUpDate || undefined}
                    onSelect={(date) => {
                      if (date) {
                        handleInputChange('touchUpDate', date);
                        setShowTouchUpDate(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Status Switches */}
          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="isCompleted"
                checked={formData.isCompleted}
                onCheckedChange={(checked) => handleInputChange('isCompleted', checked)}
              />
              <Label htmlFor="isCompleted">Procedure Completed</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="touchUpScheduled"
                checked={formData.touchUpScheduled}
                onCheckedChange={(checked) => handleInputChange('touchUpScheduled', checked)}
              />
              <Label htmlFor="touchUpScheduled">Touch-up Scheduled</Label>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Procedure Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Detailed notes about the procedure, client's response, any complications, etc."
              rows={4}
            />
          </div>

          {/* Healing Progress */}
          <div className="space-y-2">
            <Label htmlFor="healingProgress">Healing Progress</Label>
            <Textarea
              id="healingProgress"
              value={formData.healingProgress}
              onChange={(e) => handleInputChange('healingProgress', e.target.value)}
              placeholder="Notes about healing progress, follow-up observations, etc."
              rows={3}
            />
          </div>

          {/* Before Photos */}
          <div className="space-y-2">
            <Label>Before Photos</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.beforePhotos.map((photo: string, index: number) => (
                <div key={index} className="relative group">
                  <img src={photo} alt={`Before ${index + 1}`} className="w-full h-32 object-cover rounded-lg border" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      const newPhotos = formData.beforePhotos.filter((_: string, i: number) => i !== index)
                      handleInputChange('beforePhotos', newPhotos)
                    }}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center h-32 cursor-pointer hover:border-lavender transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="before-photo-upload"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    
                    try {
                      const uploadFormData = new FormData()
                      uploadFormData.append('file', file)
                      uploadFormData.append('fileType', `client-photo:${clientId}`)
                      
                      const response = await fetch('/api/file-uploads', {
                        method: 'POST',
                        headers: {
                          'x-user-email': currentUser?.email || ''
                        },
                        body: uploadFormData
                      })
                      
                      if (response.ok) {
                        const result = await response.json()
                        const newPhotos = [...formData.beforePhotos, result.fileUpload.fileUrl]
                        handleInputChange('beforePhotos', newPhotos)
                      } else {
                        alert('Failed to upload photo')
                      }
                    } catch (error) {
                      console.error('Error uploading photo:', error)
                      alert('Failed to upload photo')
                    }
                  }}
                />
                <label htmlFor="before-photo-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                  <Upload className="h-6 w-6 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500">Add Photo</span>
                </label>
              </div>
            </div>
          </div>

          {/* After Photos */}
          <div className="space-y-2">
            <Label>After Photos</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.afterPhotos.map((photo: string, index: number) => (
                <div key={index} className="relative group">
                  <img src={photo} alt={`After ${index + 1}`} className="w-full h-32 object-cover rounded-lg border" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      const newPhotos = formData.afterPhotos.filter((_: string, i: number) => i !== index)
                      handleInputChange('afterPhotos', newPhotos)
                    }}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center h-32 cursor-pointer hover:border-lavender transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="after-photo-upload"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    
                    try {
                      const uploadFormData = new FormData()
                      uploadFormData.append('file', file)
                      uploadFormData.append('fileType', `client-photo:${clientId}`)
                      
                      const response = await fetch('/api/file-uploads', {
                        method: 'POST',
                        headers: {
                          'x-user-email': currentUser?.email || ''
                        },
                        body: uploadFormData
                      })
                      
                      if (response.ok) {
                        const result = await response.json()
                        const newPhotos = [...formData.afterPhotos, result.fileUpload.fileUrl]
                        handleInputChange('afterPhotos', newPhotos)
                      } else {
                        alert('Failed to upload photo')
                      }
                    } catch (error) {
                      console.error('Error uploading photo:', error)
                      alert('Failed to upload photo')
                    }
                  }}
                />
                <label htmlFor="after-photo-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                  <Upload className="h-6 w-6 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500">Add Photo</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="bg-lavender hover:bg-lavender-600 text-white"
              disabled={loading || !formData.procedureType}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : isEditing ? 'Update Procedure' : 'Save Procedure'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
