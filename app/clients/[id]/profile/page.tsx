"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { User, FileText, Syringe, AlertTriangle, Calendar, Phone, Mail, Heart, ArrowLeft, Users, Send } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { DocumentUpload } from '@/components/clients/document-upload'
import { ProcedureManager } from '@/components/clients/procedure-manager'
import { InsuranceManager } from '@/components/clients/insurance-manager'
import { SendConsentFormButton } from '@/components/consent/send-consent-form-button'
import { ClientConsentFormsTab } from '@/components/consent/client-consent-forms-tab'
import Link from 'next/link'
import { getClientById, type Client as ClientData, onClientsUpdate, type ClientDocument } from '@/lib/client-storage'

const getInitials = (name: string) => {
  return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()
}

interface Client {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  emergencyContact: string
  medicalHistory: string
  allergies: string
  skinType: string
  notes: string
  isActive: boolean
}

interface Document {
  id: string
  type: string
  filename: string
  fileUrl: string
  fileSize: number
  mimeType: string
  notes: string
  createdAt: string
}

interface Procedure {
  id: string
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
}

export default function ClientProfilePage() {
  const params = useParams()
  const clientId = params.id as string
  const [client, setClient] = useState<Client | null>(null)
  const [documents, setDocuments] = useState<ClientDocument[]>([])
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [actualClientData, setActualClientData] = useState<ClientData | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadClientData = () => {
      console.log('Loading client data for ID:', clientId)
      
      // Load actual client data from storage
      const actualClient = getClientById(clientId)
      console.log('Found actual client:', actualClient)
      
      if (actualClient) {
        // Store the actual client data for use with managers
        setActualClientData(actualClient)
        
        // Load documents from actual client data
        setDocuments(actualClient.documents || [])
        
        // Convert storage client data to profile format
        const profileClient: Client = {
          id: actualClient.id,
          name: actualClient.name,
          email: actualClient.email,
          phone: actualClient.phone,
          dateOfBirth: actualClient.dateOfBirth || 'Not provided',
          emergencyContact: actualClient.emergencyContact || 'Not provided',
          medicalHistory: actualClient.medicalConditions?.length > 0 
            ? actualClient.medicalConditions.join(', ') 
            : 'No known medical conditions',
          allergies: actualClient.allergies?.length > 0 
            ? actualClient.allergies.join(', ') 
            : 'None reported',
          skinType: 'Type III', // Default for now
          notes: actualClient.notes || 'No additional notes',
          isActive: true
        }
        
        console.log('Setting profile client:', profileClient)
        setClient(profileClient)
      } else {
        console.error('No client found with ID:', clientId)
        setClient(null)
      }
      
      setLoading(false)
    }

    // Initial load
    loadClientData()

    // Subscribe to client updates
    const unsubscribe = onClientsUpdate((updatedClients) => {
      console.log('Clients updated, reloading client data...')
      const updatedClient = updatedClients.find(c => c.id === clientId)
      if (updatedClient) {
        console.log('Found updated client:', updatedClient)
        loadClientData()
      }
    })

    return unsubscribe
  }, [clientId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lavender mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading client profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
              <h2 className="text-xl font-semibold text-red-800 mb-2">Client Not Found</h2>
              <p className="text-red-600 mb-4">
                Could not find client with ID: <code className="bg-red-100 px-2 py-1 rounded">{clientId}</code>
              </p>
              <Link href="/clients">
                <Button variant="outline">
                  Back to Client List
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 pb-20 sm:pb-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {(actualClientData as any)?.avatar ? (
                <img
                  src={(actualClientData as any).avatar}
                  alt={client.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-lavender"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-lavender to-purple-500 flex items-center justify-center text-white font-semibold text-xl">
                  {getInitials(client.name)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{client.name}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span>Client ID: {client.id}</span>
                <Badge variant={client.isActive ? "default" : "secondary"}>
                  {client.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <SendConsentFormButton
              clientId={clientId}
              clientName={client.name}
              variant="default"
              size="default"
            />
            <Link href="/clients">
              <Button variant="outline" className="gap-2 bg-lavender/10 border-lavender/30 text-lavender-700 hover:bg-lavender/20">
                <ArrowLeft className="h-4 w-4" />
                Return to Client Database
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="gap-2 bg-green/10 border-green/30 text-green-700 hover:bg-green/20">
                <Users className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="procedures">Procedures</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Email</Label>
                      <a 
                        href={`mailto:${client.email}`}
                        className="text-sm text-lavender hover:text-lavender-600 hover:underline transition-colors"
                      >
                        {client.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Phone</Label>
                      <a 
                        href={`tel:${client.phone}`}
                        className="text-sm text-lavender hover:text-lavender-600 hover:underline transition-colors"
                      >
                        {client.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Date of Birth</Label>
                      <p className="text-sm">{client.dateOfBirth}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Skin Type</Label>
                      <p className="text-sm">{client.skinType}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Notes</Label>
                  <p className="text-sm">{client.notes}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-lavender/10 rounded-lg">
                    <div className="text-2xl font-bold text-lavender">{documents.length}</div>
                    <div className="text-sm text-gray-600">Documents</div>
                  </div>
                  <div className="text-center p-4 bg-green/10 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{procedures.length}</div>
                    <div className="text-sm text-gray-600">Procedures</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <DocumentUpload 
            clientId={clientId}
            documents={documents}
            onDocumentsUpdate={() => {
              // Reload client data when documents are updated
              const actualClient = getClientById(clientId)
              if (actualClient) {
                setActualClientData(actualClient)
                setDocuments(actualClient.documents || [])
              }
            }}
          />
        </TabsContent>

        <TabsContent value="procedures">
          <ProcedureManager 
            clientId={clientId}
            procedures={procedures}
            onProceduresChange={setProcedures}
          />
        </TabsContent>

        <TabsContent value="medical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Medical Information
              </CardTitle>
              <CardDescription>
                Client medical history and health information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Emergency Contact</Label>
                  <p className="text-sm">{client.emergencyContact}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Skin Type</Label>
                  <p className="text-sm">{client.skinType}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Medical History</Label>
                <p className="text-sm">{client.medicalHistory}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Allergies</Label>
                <p className="text-sm">{client.allergies}</p>
              </div>
            </CardContent>
          </Card>

          {/* Insurance Information */}
          <InsuranceManager
            clientId={clientId}
            insurance={actualClientData?.insurance || []}
            onInsuranceUpdate={() => {
              // Reload client data when insurance is updated
              const actualClient = getClientById(clientId)
              if (actualClient) {
                setActualClientData(actualClient)
                // Trigger page refresh to show updated data
                window.location.reload()
              }
            }}
          />
        </TabsContent>

        <TabsContent value="forms" className="space-y-6">
          <ClientConsentFormsTab 
            clientId={clientId}
            clientName={client.name}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
