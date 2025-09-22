"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoAuth } from '@/hooks/use-demo-auth';
import ClientList, { Client } from '../../src/components/client/ClientList';
import MessageForm from '../../src/components/client/MessageForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  Calendar,
  MessageSquare,
  Eye,
  Edit,
  Trash2,
  User,
  Phone,
  Mail,
  Heart,
  Shield
} from 'lucide-react';

export default function ClientsPage() {
  const router = useRouter();
  const { currentUser, isLoading: authLoading, isAuthenticated } = useDemoAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientDetailOpen, setIsClientDetailOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);

  // Form state for adding/editing clients
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    emergencyContact: '',
    medicalHistory: '',
    allergies: '',
    skinType: '',
    notes: ''
  });

  // Fetch clients from API
  const fetchClients = async () => {
    try {
      setLoading(true);
      console.log('=== FETCH DEBUG ===');
      console.log('Current user:', currentUser);
      console.log('Current user email:', currentUser?.email);
      console.log('Is authenticated:', isAuthenticated);
      console.log('Auth loading:', authLoading);
      console.log('Headers being sent:', {
        'Accept': 'application/json',
        'x-user-email': currentUser?.email || '',
      });
      console.log('==================');
      
      const response = await fetch('/api/clients', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'x-user-email': currentUser?.email || '',
        },
      });
      
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error:', errorText);
        throw new Error('Failed to fetch clients');
      }
      const data = await response.json();
      setClients(data.clients || []);
    } catch (err) {
      console.error('Fetch clients error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('=== AUTH DEBUG ===');
    console.log('Auth loading:', authLoading);
    console.log('Is authenticated:', isAuthenticated);
    console.log('Current user:', currentUser);
    console.log('Current user email:', currentUser?.email);
    console.log('LocalStorage demoUser:', localStorage.getItem('demoUser'));
    console.log('LocalStorage userType:', localStorage.getItem('userType'));
    console.log('==================');
    
    // Only run if auth is loaded
    if (!authLoading) {
      if (isAuthenticated && currentUser?.email) {
        console.log('User is authenticated with email, fetching clients');
        fetchClients();
      } else {
        console.log('User is not authenticated or missing email, redirecting to login');
        router.push('/auth/login');
      }
    } else {
      console.log('Auth not loaded yet');
    }
  }, [authLoading, isAuthenticated, currentUser, router]);

  // Handle form submission for adding client
  const handleAddClient = async () => {
    try {
          const response = await fetch('/api/clients', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'x-user-email': currentUser?.email || '',
            },
            body: JSON.stringify(formData),
          });

      if (!response.ok) {
        throw new Error('Failed to create client');
      }

      await fetchClients(); // Refresh the list
      setIsAddDialogOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client');
    }
  };

  // Handle form submission for editing client
  const handleEditClient = async () => {
    if (!selectedClient) return;

    try {
          const response = await fetch(`/api/clients/${selectedClient.id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'x-user-email': currentUser?.email || '',
            },
            body: JSON.stringify(formData),
          });

      if (!response.ok) {
        throw new Error('Failed to update client');
      }

      await fetchClients(); // Refresh the list
      setIsEditDialogOpen(false);
      setSelectedClient(null);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update client');
    }
  };

  // Handle deleting client
  const handleDeleteClient = async (client: Client) => {
    if (!confirm(`Are you sure you want to delete ${client.name}?`)) return;

    try {
          const response = await fetch(`/api/clients/${client.id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'x-user-email': currentUser?.email || '',
            },
          });

      if (!response.ok) {
        throw new Error('Failed to delete client');
      }

      await fetchClients(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete client');
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      emergencyContact: '',
      medicalHistory: '',
      allergies: '',
      skinType: '',
      notes: ''
    });
  };

  // Handle opening edit dialog
  const handleEditClientClick = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      dateOfBirth: client.dateOfBirth || '',
      emergencyContact: client.emergencyContact || '',
      medicalHistory: client.medicalHistory || '',
      allergies: client.allergies || '',
      skinType: client.skinType || '',
      notes: client.notes || ''
    });
    setIsEditDialogOpen(true);
  };

  // Handle sending message to client
  const handleSendMessage = async (client: Client, messageType?: string, message?: string) => {
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: client.id,
          messageType: messageType || 'custom',
          message: message || ''
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();
      alert(`Message sent successfully to ${client.name}!`);
      setIsMessageDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  // Handle booking appointment for client
  const handleBookAppointment = (client: Client) => {
    // Navigate to booking page with client pre-selected
    router.push(`/booking?clientId=${client.id}&clientName=${encodeURIComponent(client.name)}`);
  };

  // Handle viewing client details
  const handleViewClientDetails = (client: Client) => {
    router.push(`/clients/${client.id}`)
  }

      if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ivory via-white to-beige">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-lavender mx-auto mb-4" />
          <p className="text-muted-text">Loading clients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ivory via-white to-beige">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-text mb-4">{error}</p>
            <Button onClick={fetchClients} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-white to-beige">
      {/* Client List Component */}
      <ClientList
        clients={clients}
        onClientSelect={handleViewClientDetails}
        onAddClient={() => setIsAddDialogOpen(true)}
        onEditClient={handleEditClientClick}
        onDeleteClient={handleDeleteClient}
        onSendMessage={handleSendMessage}
        onBookAppointment={handleBookAppointment}
      />

      {/* Add Client Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter client's full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="client@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="Emergency contact info"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skinType">Skin Type (Fitzpatrick)</Label>
              <Select value={formData.skinType} onValueChange={(value) => setFormData({ ...formData, skinType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select skin type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Type 1">Type 1 - Very Fair</SelectItem>
                  <SelectItem value="Type 2">Type 2 - Fair</SelectItem>
                  <SelectItem value="Type 3">Type 3 - Medium</SelectItem>
                  <SelectItem value="Type 4">Type 4 - Olive</SelectItem>
                  <SelectItem value="Type 5">Type 5 - Brown</SelectItem>
                  <SelectItem value="Type 6">Type 6 - Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="medicalHistory">Medical History</Label>
            <Textarea
              id="medicalHistory"
              value={formData.medicalHistory}
              onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              placeholder="Any relevant medical conditions or history"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea
              id="allergies"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder="Known allergies or sensitivities"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about the client"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddClient}
              disabled={!formData.name}
              className="bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          {/* Same form as Add Client Dialog */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter client's full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="client@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dateOfBirth">Date of Birth</Label>
              <Input
                id="edit-dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-emergencyContact">Emergency Contact</Label>
              <Input
                id="edit-emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="Emergency contact info"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-skinType">Skin Type (Fitzpatrick)</Label>
              <Select value={formData.skinType} onValueChange={(value) => setFormData({ ...formData, skinType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select skin type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Type 1">Type 1 - Very Fair</SelectItem>
                  <SelectItem value="Type 2">Type 2 - Fair</SelectItem>
                  <SelectItem value="Type 3">Type 3 - Medium</SelectItem>
                  <SelectItem value="Type 4">Type 4 - Olive</SelectItem>
                  <SelectItem value="Type 5">Type 5 - Brown</SelectItem>
                  <SelectItem value="Type 6">Type 6 - Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-medicalHistory">Medical History</Label>
            <Textarea
              id="edit-medicalHistory"
              value={formData.medicalHistory}
              onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              placeholder="Any relevant medical conditions or history"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-allergies">Allergies</Label>
            <Textarea
              id="edit-allergies"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder="Known allergies or sensitivities"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about the client"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditClient}
              disabled={!formData.name}
              className="bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Client Details Dialog */}
      <Dialog open={isClientDetailOpen} onOpenChange={setIsClientDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-lavender" />
              {selectedClient?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-text">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-lavender" />
                    <span>{selectedClient.email || 'Not provided'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-text">Phone</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-lavender" />
                    <span>{selectedClient.phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-text">Date of Birth</Label>
                  <span>{selectedClient.dateOfBirth || 'Not provided'}</span>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-text">Skin Type</Label>
                  <span>{selectedClient.skinType || 'Not assessed'}</span>
                </div>
              </div>

              {selectedClient.emergencyContact && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-text">Emergency Contact</Label>
                  <span>{selectedClient.emergencyContact}</span>
                </div>
              )}

              {selectedClient.medicalHistory && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-text">Medical History</Label>
                  <p className="text-sm bg-lavender/5 p-3 rounded-lg">{selectedClient.medicalHistory}</p>
                </div>
              )}

              {selectedClient.allergies && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-text">Allergies</Label>
                  <p className="text-sm bg-red-50 p-3 rounded-lg border border-red-200">{selectedClient.allergies}</p>
                </div>
              )}

              {selectedClient.notes && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-text">Notes</Label>
                  <p className="text-sm bg-beige/50 p-3 rounded-lg">{selectedClient.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsClientDetailOpen(false);
                    handleEditClientClick(selectedClient);
                  }}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Client
                </Button>
                <Button 
                  onClick={() => {
                    setIsClientDetailOpen(false);
                    handleBookAppointment(selectedClient);
                  }}
                  className="flex-1 bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsClientDetailOpen(false);
                    handleSendMessage(selectedClient);
                  }}
                  className="flex-1"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to {selectedClient?.name}</DialogTitle>
          </DialogHeader>
          <MessageForm 
            client={selectedClient}
            onSend={handleSendMessage}
            onCancel={() => setIsMessageDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
