"use client"

import { DocumentViewer } from "@/components/consent/document-viewer"
import { PDFSignatureManager } from "@/components/artist/pdf-signature-manager"
import { NavBar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, FileText, PenTool } from "lucide-react"
import Link from "next/link"
import { useDemoAuth } from "@/hooks/use-demo-auth"
import { getClients, Client } from "@/lib/client-storage"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PDFDocument {
  id: string
  title: string
  description: string
  category: string
  filename: string
  fileUrl: string
  fileSize: number
  isRequired: boolean
  state?: string
  tags: string[]
  uploadedAt: string
  uploadedBy: string
  clientId?: string
  needsSignature: boolean
  signatureStatus: 'pending' | 'signed' | 'not_required'
}

interface ClientDocumentsPageProps {
  params: {
    id: string
  }
}

export default function ClientDocumentsPage({ params }: ClientDocumentsPageProps) {
  const { currentUser } = useDemoAuth()
  const [activeTab, setActiveTab] = useState("consent-forms")
  const [uploadedDocuments, setUploadedDocuments] = useState<PDFDocument[]>([])
  
  // Get client data
  const [client, setClient] = useState<Client | undefined>(undefined)
  
  useEffect(() => {
    const loadClient = async () => {
      const clients = await getClients(currentUser?.email)
      const foundClient = clients.find(c => c.id === params.id)
      setClient(foundClient)
    }
    loadClient()
  }, [params.id, currentUser?.email])
  
  // Fallback user if not authenticated
  const user = currentUser ? {
    name: currentUser.name,
    email: currentUser.email,
    initials: currentUser.name?.split(' ').map(n => n[0]).join('') || currentUser.email.charAt(0).toUpperCase()
  } : {
    name: "PMU Artist",
    email: "user@pmupro.com",
    initials: "PA",
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
        <NavBar currentPath="/clients" user={user} />
        <main className="container mx-auto px-4 py-8 relative z-10">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Client Not Found</h1>
            <p className="text-gray-600 mb-6">The client you're looking for doesn't exist.</p>
            <Link href="/clients">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Clients
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <NavBar currentPath="/clients" user={user} />
      <main className="container mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/clients">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Clients
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
                <p className="text-gray-600">Consent Forms & Digital Signatures</p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Viewer */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="consent-forms" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Consent Forms
            </TabsTrigger>
            <TabsTrigger value="pdf-signatures" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Signatures
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="consent-forms" className="mt-6">
            <DocumentViewer clientId={params.id} />
          </TabsContent>
          
          <TabsContent value="pdf-signatures" className="mt-6">
            <PDFSignatureManager 
              clientId={params.id}
              documents={uploadedDocuments}
              onDocumentsChange={setUploadedDocuments}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
