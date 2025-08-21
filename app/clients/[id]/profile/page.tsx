"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { User, FileText, Syringe, AlertTriangle, Calendar, Phone, Mail, Heart, ArrowLeft, Users } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { DocumentManager } from '@/components/clients/document-manager'
import { ProcedureManager } from '@/components/clients/procedure-manager'
import Link from 'next/link'

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
  const [documents, setDocuments] = useState<Document[]>([])
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // Mock client data for now
    setClient({
      id: clientId,
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+1234567890',
      dateOfBirth: '1990-05-15',
      emergencyContact: 'John Doe +1234567891',
      medicalHistory: 'No known medical conditions',
      allergies: 'None reported',
      skinType: 'Type III',
      notes: 'Prefers natural-looking brows',
      isActive: true
    })

    // Mock documents
    setDocuments([
      {
        id: 'doc1',
        type: 'CONSENT_FORM',
        filename: 'Consent_Form_Jane_Doe.pdf',
        fileUrl: '/sample-consent-form.pdf',
        fileSize: 245760,
        mimeType: 'application/pdf',
        notes: 'Signed consent form for microblading procedure',
        createdAt: '2024-08-01T00:00:00Z'
      },
      {
        id: 'doc2',
        type: 'INTAKE_FORM',
        filename: 'Intake_Form_Jane_Doe.pdf',
        fileUrl: '/sample-intake-form.pdf',
        fileSize: 189440,
        mimeType: 'application/pdf',
        notes: 'Completed intake form with medical history',
        createdAt: '2024-08-01T00:00:00Z'
      }
    ])

    // Mock procedures
    setProcedures([
      {
        id: 'proc1',
        procedureType: 'Microblading',
        voltage: 7.5,
        needleConfiguration: '18 needles, 0.18mm',
        pigmentBrand: 'Permablend',
        pigmentColor: 'Medium Brown',
        lotNumber: 'MB-2024-001',
        depth: '0.2-0.3mm',
        duration: 120,
        areaTreated: 'Eyebrows',
        procedureDate: '2024-08-15T00:00:00Z',
        followUpDate: '2024-09-15T00:00:00Z',
        isCompleted: true,
        notes: 'Client tolerated procedure well. Natural hair stroke technique applied.'
      }
    ])
  }, [clientId])

  if (!client) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{client.name}</h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span>Client ID: {client.id}</span>
              <Badge variant={client.isActive ? "default" : "secondary"}>
                {client.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="procedures">Procedures</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
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
                      <p className="text-sm">{client.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Phone</Label>
                      <p className="text-sm">{client.phone}</p>
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
          <DocumentManager 
            clientId={clientId}
            documents={documents}
            onDocumentsChange={setDocuments}
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Insurance Information
              </CardTitle>
              <CardDescription>
                Client insurance provider and coverage details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Insurance Provider</Label>
                  <p className="text-sm">Blue Cross Blue Shield</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Policy Number</Label>
                  <p className="text-sm">BCBS-123456789</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Group Number</Label>
                  <p className="text-sm">GRP-987654</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Coverage Type</Label>
                  <p className="text-sm">PPO</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Additional Notes</Label>
                <p className="text-sm">Coverage verified for cosmetic procedures. Prior authorization may be required.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
