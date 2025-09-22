"use client";

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Save, X, Plus, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AppointmentFormProps {
  clientId: string;
  clientName: string;
  onSave: (appointment: any) => void;
  onCancel: () => void;
  initialData?: any;
  isEditing?: boolean;
}

const SERVICE_TYPES = [
  'Microblading',
  'Powder Brows',
  'Combo Brows',
  'Lip Blush',
  'Lip Liner',
  'Eyeliner',
  'Lash Enhancement',
  'Areola Restoration',
  'Scalp Micropigmentation',
  'Consultation',
  'Touch-up',
  'Other'
];

const APPOINTMENT_STATUSES = [
  'scheduled',
  'confirmed',
  'completed',
  'cancelled',
  'no-show'
];

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

const DURATION_OPTIONS = [
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 150, label: '2.5 hours' },
  { value: 180, label: '3 hours' }
];

export default function AppointmentForm({
  clientId,
  clientName,
  onSave,
  onCancel,
  initialData,
  isEditing = false
}: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    serviceType: initialData?.serviceType || '',
    duration: initialData?.duration || 120,
    startTime: initialData?.startTime ? new Date(initialData.startTime) : new Date(),
    endTime: initialData?.endTime ? new Date(initialData.endTime) : new Date(Date.now() + 2 * 60 * 60 * 1000),
    status: initialData?.status || 'scheduled',
    notes: initialData?.notes || '',
    price: initialData?.price || '',
    deposit: initialData?.deposit || ''
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(
    initialData?.startTime 
      ? format(new Date(initialData.startTime), 'HH:mm')
      : format(new Date(), 'HH:mm')
  );
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    const [hours, minutes] = time.split(':').map(Number);
    const newStartTime = new Date(formData.startTime);
    newStartTime.setHours(hours, minutes, 0, 0);
    
    const newEndTime = new Date(newStartTime);
    newEndTime.setMinutes(newEndTime.getMinutes() + formData.duration);
    
    setFormData(prev => ({
      ...prev,
      startTime: newStartTime,
      endTime: newEndTime
    }));
  };

  const handleDurationChange = (duration: number) => {
    const newEndTime = new Date(formData.startTime);
    newEndTime.setMinutes(newEndTime.getMinutes() + duration);
    
    setFormData(prev => ({
      ...prev,
      duration,
      endTime: newEndTime
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const newStartTime = new Date(date);
      newStartTime.setHours(hours, minutes, 0, 0);
      
      const newEndTime = new Date(newStartTime);
      newEndTime.setMinutes(newEndTime.getMinutes() + formData.duration);
      
      setFormData(prev => ({
        ...prev,
        startTime: newStartTime,
        endTime: newEndTime
      }));
      setShowDatePicker(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const appointmentData = {
        clientId,
        title: formData.title,
        serviceType: formData.serviceType,
        duration: formData.duration,
        startTime: formData.startTime.toISOString(),
        endTime: formData.endTime.toISOString(),
        status: formData.status,
        notes: formData.notes,
        price: formData.price ? parseFloat(formData.price) : 0,
        deposit: formData.deposit ? parseFloat(formData.deposit) : 0
      };

      onSave(appointmentData);
    } catch (error) {
      console.error('Error saving appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-ink flex items-center gap-2">
          <Calendar className="h-6 w-6 text-lavender" />
          {isEditing ? 'Edit Appointment' : 'Schedule New Appointment'}
        </CardTitle>
        <p className="text-muted-text">
          {isEditing ? 'Update appointment details for' : 'Schedule appointment for'} <strong>{clientName}</strong>
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Appointment Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Microblading Session"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type *</Label>
              <Select
                value={formData.serviceType}
                onValueChange={(value) => handleInputChange('serviceType', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startTime && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startTime ? format(formData.startTime, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startTime}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Start Time *</Label>
              <Select value={selectedTime} onValueChange={handleTimeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Duration *</Label>
              <Select
                value={formData.duration.toString()}
                onValueChange={(value) => handleDurationChange(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* End Time Display */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>
                <strong>End Time:</strong> {format(formData.endTime, "PPP 'at' HH:mm")}
              </span>
            </div>
          </div>

          {/* Status and Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Total Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit">Deposit ($)</Label>
              <Input
                id="deposit"
                type="number"
                step="0.01"
                value={formData.deposit}
                onChange={(e) => handleInputChange('deposit', e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any special instructions, client preferences, or additional notes..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="bg-lavender hover:bg-lavender-600 text-white"
              disabled={loading || !formData.title || !formData.serviceType}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : isEditing ? 'Update Appointment' : 'Schedule Appointment'}
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
