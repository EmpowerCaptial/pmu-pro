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
  Camera, 
  ChevronLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  Palette,
  Syringe,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Eye
} from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'

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
  const [activeTab, setActiveTab] = useState('overview')

  const clientId = params.id as string

  useEffect(() => {
    if (isAuthenticated && currentUser?.email && clientId) {
      loadClientData()
    }
  }, [isAuthenticated, currentUser, clientId])

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
      }
    } catch (error) {
      console.error('Error loading client data:', error)
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
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5">
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
          onClick={() => router.push(`/clients/${clientId}/edit`)}
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
                      <span>{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{client.phone}</span>
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

        {/* Coming Soon Message */}
        <Card>
          <CardContent className="text-center py-12">
            <Stethoscope className="h-16 w-16 text-lavender mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Full Profile Coming Soon</h3>
            <p className="text-gray-600 mb-6">
              We're building comprehensive client profiles with procedure details, consent forms, and appointment history.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-4 bg-lavender/10 rounded-lg">
                <Syringe className="h-8 w-8 text-lavender mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900">Procedure Details</h4>
                <p className="text-sm text-gray-600">Pigment colors, needle configs, techniques</p>
              </div>
              <div className="p-4 bg-lavender/10 rounded-lg">
                <FileText className="h-8 w-8 text-lavender mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900">Consent Forms</h4>
                <p className="text-sm text-gray-600">Digital consent with signatures</p>
              </div>
              <div className="p-4 bg-lavender/10 rounded-lg">
                <Calendar className="h-8 w-8 text-lavender mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900">Appointment History</h4>
                <p className="text-sm text-gray-600">Complete treatment timeline</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}