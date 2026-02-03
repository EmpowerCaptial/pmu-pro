"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Calendar, 
  FileText, 
  ChevronLeft,
  Edit,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Eye,
  Plus,
  Clock,
  DollarSign
} from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ProcedureForm from '@/src/components/forms/ProcedureForm'
import AppointmentForm from '@/src/components/forms/AppointmentForm'
import ClientEditForm from '@/src/components/forms/ClientEditForm'

interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  dateOfBirth?: string
  emergencyContact?: string
  medicalHistory?: string
  allergies?: string
  skinType?: string
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function ClientProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { currentUser, isAuthenticated } = useDemoAuth()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showProcedureForm, setShowProcedureForm] = useState(false)
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [procedures, setProcedures] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])

  const clientId = params.id as string

  useEffect(() => {
    if (isAuthenticated && currentUser?.email && clientId) {
      loadClientData()
    }
  }, [isAuthenticated, currentUser?.email, clientId])

  const loadClientData = async () => {
    if (!currentUser?.email) return
    
    setLoading(true)
    try {
      // Load client details
      const clientResponse = await fetch(`/api/clients/${clientId}`, {
        headers: {
          'x-user-email': currentUser.email,
          'Accept': 'application/json'
        }
      })
      
      if (clientResponse.ok) {
        const clientData = await clientResponse.json()
        setClient(clientData.client)
        // Load procedures if they exist
        if (clientData.client?.procedures) {
          setProcedures(clientData.client.procedures)
        }
      } else {
        // If client not found via API, try to get from the clients list
        console.log('Client not found via API, trying to get from clients list')
        const clientsResponse = await fetch('/api/clients', {
          headers: {
            'x-user-email': currentUser.email,
            'Accept': 'application/json'
          }
        })
        
        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json()
          const foundClient = clientsData.clients?.find((c: any) => c.id === clientId)
          if (foundClient) {
            setClient(foundClient)
          } else {
            setError('Client not found or you do not have access to view this client.')
          }
        } else {
          setError('Client not found or you do not have access to view this client.')
        }
      }
    } catch (error) {
      console.error('Error loading client data:', error)
      setError('Failed to load client data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleSaveProcedure = async (procedureData: any) => {
    if (!currentUser?.email) {
      alert('You must be logged in to save procedures.')
      return
    }

    try {
      const response = await fetch('/api/procedures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify(procedureData)
      })

      if (response.ok) {
        const result = await response.json()
        setProcedures(prev => [result.procedure, ...prev])
        setShowProcedureForm(false)
        // Reload client data to get updated procedures
        loadClientData()
        // Show success message
        alert('Procedure saved successfully!')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        const errorMessage = errorData.error || 'Failed to save procedure'
        console.error('Error saving procedure:', errorMessage)
        alert(`Failed to save procedure: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error saving procedure:', error)
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please check your connection and try again.'
      alert(`Failed to save procedure: ${errorMessage}`)
    }
  }

  const handleSaveAppointment = async (appointmentData: any) => {
    if (!currentUser?.email) return

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify(appointmentData)
      })

      if (response.ok) {
        const result = await response.json()
        setAppointments(prev => [result.appointment, ...prev])
        setShowAppointmentForm(false)
        // Show success message
        alert('Appointment scheduled successfully!')
      } else {
        throw new Error('Failed to save appointment')
      }
    } catch (error) {
      console.error('Error saving appointment:', error)
      alert('Failed to save appointment. Please try again.')
    }
  }

  const handleSaveClientEdit = async (clientData: any) => {
    if (!currentUser?.email || !clientId) return

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify(clientData)
      })

      if (response.ok) {
        const result = await response.json()
        setClient(result.client)
        setShowEditForm(false)
        // Show success message
        alert('Client information updated successfully!')
      } else {
        throw new Error('Failed to update client')
      }
    } catch (error) {
      console.error('Error updating client:', error)
      alert('Failed to update client. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 flex items-center justify-center">
          <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lavender mx-auto mb-4"></div>
          <p className="text-gray-600">Loading client profile...</p>
          </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 flex items-center justify-center">
          <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Client Not Found</h2>
          <p className="text-gray-600 mb-4">The client you're looking for doesn't exist or you don't have access.</p>
          <Button onClick={() => router.back()} className="bg-lavender hover:bg-lavender-600 text-white">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 pb-20 sm:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-4 bg-white border-b border-gray-200 shadow-sm">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-700 hover:bg-gray-100"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <h1 className="text-lg font-semibold text-gray-900">Client Profile</h1>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-700 hover:bg-gray-100"
          onClick={() => setShowEditForm(true)}
        >
          <Edit className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4 max-w-6xl mx-auto">
        {/* Client Header Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-lavender to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {client.name.charAt(0).toUpperCase()}
              </div>

              {/* Client Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
                  <Badge className={client.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {client.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <a 
                        href={`mailto:${client.email}`}
                        className="text-lavender hover:text-lavender-600 hover:underline transition-colors"
                      >
                        {client.email}
                      </a>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <a 
                        href={`tel:${client.phone}`}
                        className="text-lavender hover:text-lavender-600 hover:underline transition-colors"
                      >
                        {client.phone}
                      </a>
                    </div>
                  )}
                  {client.dateOfBirth && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Born {formatDate(client.dateOfBirth)}</span>
                    </div>
                  )}
                  {client.emergencyContact && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>Emergency: {client.emergencyContact}</span>
                    </div>
                  )}
                </div>

                {client.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Notes:</strong> {client.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger value="overview" className="bg-blue-50 hover:bg-blue-100 data-[state=active]:bg-blue-200 data-[state=active]:text-blue-900">Overview</TabsTrigger>
            <TabsTrigger value="procedures" className="bg-green-50 hover:bg-green-100 data-[state=active]:bg-green-200 data-[state=active]:text-green-900">Procedures</TabsTrigger>
            <TabsTrigger value="appointments" className="bg-purple-50 hover:bg-purple-100 data-[state=active]:bg-purple-200 data-[state=active]:text-purple-900">Appointments</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Medical Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-lavender" />
                    Medical Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {client.medicalHistory && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Medical History</h4>
                      <p className="text-sm text-gray-600">{client.medicalHistory}</p>
                    </div>
                  )}
                  {client.allergies && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Allergies</h4>
                      <p className="text-sm text-gray-600">{client.allergies}</p>
                    </div>
                  )}
                  {client.skinType && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Skin Type</h4>
                      <p className="text-sm text-gray-600">{client.skinType}</p>
                    </div>
                  )}
                  {!client.medicalHistory && !client.allergies && !client.skinType && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No medical information on file</p>
                      <Button variant="outline" size="sm" className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Medical Info
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-lavender" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-lavender/10 rounded-lg">
                      <div className="text-2xl font-bold text-lavender">0</div>
                      <div className="text-sm text-gray-600">Procedures</div>
                    </div>
                    <div className="text-center p-4 bg-lavender/10 rounded-lg">
                      <div className="text-2xl font-bold text-lavender">0</div>
                      <div className="text-sm text-gray-600">Appointments</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Procedures Tab */}
          <TabsContent value="procedures" className="mt-6">
            {procedures.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-16 w-16 text-lavender mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Procedures Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start tracking procedures, pigment colors, needle configurations, and notes.
                  </p>
                  <Button 
                    className="bg-lavender hover:bg-lavender-600 text-white"
                    onClick={() => setShowProcedureForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Procedure
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Procedures ({procedures.length})</h3>
                  <Button 
                    className="bg-lavender hover:bg-lavender-600 text-white"
                    onClick={() => setShowProcedureForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Procedure
                  </Button>
                </div>
                <div className="grid gap-4">
                  {procedures.map((procedure: any) => (
                    <Card key={procedure.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{procedure.procedureType}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(procedure.procedureDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <Badge className={procedure.isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {procedure.isCompleted ? 'Completed' : 'In Progress'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          {procedure.pigmentBrand && (
                            <div>
                              <span className="text-gray-600">Pigment:</span>
                              <p className="font-medium">{procedure.pigmentBrand} {procedure.pigmentColor}</p>
                            </div>
                          )}
                          {procedure.needleConfiguration && (
                            <div>
                              <span className="text-gray-600">Needle:</span>
                              <p className="font-medium">{procedure.needleConfiguration}</p>
                            </div>
                          )}
                          {procedure.technique && (
                            <div>
                              <span className="text-gray-600">Technique:</span>
                              <p className="font-medium">{procedure.technique}</p>
                            </div>
                          )}
                          {procedure.duration && (
                            <div>
                              <span className="text-gray-600">Duration:</span>
                              <p className="font-medium">{procedure.duration} min</p>
                            </div>
                          )}
                        </div>

                        {/* Photo Display */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {procedure.beforePhotos && (
                            <div>
                              <Label className="text-sm font-medium text-gray-700 mb-2 block">Before Photos</Label>
                              <div className="flex flex-wrap gap-2">
                                {(() => {
                                  try {
                                    const photos = typeof procedure.beforePhotos === 'string' 
                                      ? JSON.parse(procedure.beforePhotos) 
                                      : procedure.beforePhotos
                                    return Array.isArray(photos) ? photos.map((url: string, idx: number) => (
                                      <img key={idx} src={url} alt={`Before ${idx + 1}`} className="w-20 h-20 object-cover rounded" />
                                    )) : null
                                  } catch {
                                    return <img src={procedure.beforePhotos} alt="Before" className="w-20 h-20 object-cover rounded" />
                                  }
                                })()}
                              </div>
                            </div>
                          )}
                          {procedure.afterPhotos && (
                            <div>
                              <Label className="text-sm font-medium text-gray-700 mb-2 block">After Photos</Label>
                              <div className="flex flex-wrap gap-2">
                                {(() => {
                                  try {
                                    const photos = typeof procedure.afterPhotos === 'string' 
                                      ? JSON.parse(procedure.afterPhotos) 
                                      : procedure.afterPhotos
                                    return Array.isArray(photos) ? photos.map((url: string, idx: number) => (
                                      <img key={idx} src={url} alt={`After ${idx + 1}`} className="w-20 h-20 object-cover rounded" />
                                    )) : null
                                  } catch {
                                    return <img src={procedure.afterPhotos} alt="After" className="w-20 h-20 object-cover rounded" />
                                  }
                                })()}
                              </div>
                            </div>
                          )}
                        </div>

                        {procedure.notes && (
                          <div className="mb-4">
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">Notes</Label>
                            <p className="text-sm text-gray-600">{procedure.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="mt-6">
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-16 w-16 text-lavender mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Appointments Yet</h3>
                <p className="text-gray-600 mb-6">
                  Schedule appointments and track the client's treatment journey.
                </p>
                <Button 
                  className="bg-lavender hover:bg-lavender-600 text-white"
                  onClick={() => setShowAppointmentForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Procedure Form Dialog */}
      <Dialog open={showProcedureForm} onOpenChange={setShowProcedureForm}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Procedure</DialogTitle>
          </DialogHeader>
          <div className="relative z-50">
            {client && (
              <ProcedureForm
                clientId={client.id}
                clientName={client.name}
                onSave={handleSaveProcedure}
                onCancel={() => setShowProcedureForm(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Appointment Form Dialog */}
      <Dialog open={showAppointmentForm} onOpenChange={setShowAppointmentForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
          </DialogHeader>
          {client && (
            <AppointmentForm
              clientId={client.id}
              clientName={client.name}
              onSave={handleSaveAppointment}
              onCancel={() => setShowAppointmentForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Client Form Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Client Profile</DialogTitle>
          </DialogHeader>
          {client && (
            <ClientEditForm
              client={client}
              onSave={handleSaveClientEdit}
              onCancel={() => setShowEditForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}