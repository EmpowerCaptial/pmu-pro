"use client";

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Save, X, User, Phone, Mail, Calendar, AlertCircle, Heart, Shield } from 'lucide-react';

interface ClientEditFormProps {
  client: any;
  onSave: (clientData: any) => void;
  onCancel: () => void;
}

const SKIN_TYPES = [
  'Fitzpatrick Type I',
  'Fitzpatrick Type II',
  'Fitzpatrick Type III',
  'Fitzpatrick Type IV',
  'Fitzpatrick Type V',
  'Fitzpatrick Type VI',
  'Unknown'
];

export default function ClientEditForm({
  client,
  onSave,
  onCancel
}: ClientEditFormProps) {
  const [formData, setFormData] = useState({
    name: client.name || '',
    email: client.email || '',
    phone: client.phone || '',
    dateOfBirth: client.dateOfBirth || '',
    emergencyContact: client.emergencyContact || '',
    medicalHistory: client.medicalHistory || '',
    allergies: client.allergies || '',
    skinType: client.skinType || '',
    notes: client.notes || ''
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const clientData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
        emergencyContact: formData.emergencyContact,
        medicalHistory: formData.medicalHistory,
        allergies: formData.allergies,
        skinType: formData.skinType,
        notes: formData.notes
      };

      onSave(clientData);
    } catch (error) {
      console.error('Error saving client:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-ink flex items-center gap-2">
          <User className="h-6 w-6 text-lavender" />
          Edit Client Profile
        </CardTitle>
        <p className="text-muted-text">
          Update client information and medical details
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="client@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-2">
            <Label htmlFor="emergencyContact" className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              Emergency Contact
            </Label>
            <Input
              id="emergencyContact"
              value={formData.emergencyContact}
              onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              placeholder="Emergency contact name and phone number"
            />
          </div>

          {/* Medical Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="skinType" className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                Skin Type
              </Label>
              <Select
                value={formData.skinType}
                onValueChange={(value) => handleInputChange('skinType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select skin type" />
                </SelectTrigger>
                <SelectContent>
                  {SKIN_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                Allergies
              </Label>
              <Input
                id="allergies"
                value={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                placeholder="List any known allergies"
              />
            </div>
          </div>

          {/* Medical History */}
          <div className="space-y-2">
            <Label htmlFor="medicalHistory">Medical History</Label>
            <Textarea
              id="medicalHistory"
              value={formData.medicalHistory}
              onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
              placeholder="Any relevant medical history, conditions, or medications..."
              rows={4}
            />
          </div>

          {/* Artist Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Artist Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Personal notes about the client, preferences, special considerations..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="bg-lavender hover:bg-lavender-600 text-white"
              disabled={loading || !formData.name}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
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
