"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RiskPill } from "@/components/ui/risk-pill"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Edit, Phone, Mail, Calendar, FileText, Camera, Plus, Download, MessageSquare, Save, X, User, Shield, Heart, Eye, Palette, Clock, AlertTriangle, Upload, Trash2, Send } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { type Client, type ClientAnalysis, updateClient, deleteClient, onClientsUpdate } from "@/lib/client-storage"
import { DocumentUpload } from "./document-upload"
import { InsuranceManager } from "./insurance-manager"
import { ClientPortalService } from "@/lib/client-portal-service"

interface ClientDetailsProps {
  client: Client
}

export function ClientDetails({ client }: ClientDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [currentClient, setCurrentClient] = useState<Client>(client)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<Client>>({})
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [deleteError, setDeleteError] = useState("")

  const router = useRouter()

  // Listen for client updates
  useEffect(() => {
    const unsubscribe = onClientsUpdate((clients) => {
      const updatedClient = clients.find(c => c.id === client.id)
      if (updatedClient) {
        setCurrentClient(updatedClient)
      }
    })

    return unsubscribe
  }, [client.id])

  const handleEdit = () => {
    setEditData(currentClient)
    setIsEditing(true)
  }

  const handleSave = () => {
    if (updateClient(client.id, editData)) {
      setIsEditing(false)
      setEditData({})
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData({})
  }

  const handleDelete = () => {
    if (deleteConfirmation === currentClient.name) {
      deleteClient(client.id)
      setIsDeleteDialogOpen(false)
      setDeleteConfirmation("")
      setDeleteError("")
      router.push('/clients')
    } else {
      setDeleteError("Client name does not match. Please type the exact client name to confirm deletion.")
    }
  }

  const handleRefresh = () => {
    // This will trigger a re-render with the latest data
    window.location.reload()
  }

  const handleSendPortalAccess = () => {
    const portalService = ClientPortalService.getInstance()
    
    // Convert regular Client to EnhancedClientProfile
    const enhancedClient = {
      id: currentClient.id,
      firstName: currentClient.name.split(' ')[0] || currentClient.name,
      lastName: currentClient.name.split(' ').slice(1).join(' ') || '',
      email: currentClient.email || '',
      phone: currentClient.phone || '',
      createdAt: new Date(currentClient.createdAt),
      updatedAt: new Date(currentClient.updatedAt),
      pipeline: {
        id: `pipeline_${currentClient.id}`,
        clientId: currentClient.id,
        stage: 'lead' as const,
        probability: 0.5,
        estimatedValue: 500,
        nextAction: 'Schedule consultation',
        followUpDate: null,
        notes: [],
        createdAt: new Date(currentClient.createdAt),
        updatedAt: new Date(currentClient.updatedAt)
      },
      preferences: {
        preferredContact: 'email' as const,
        preferredTime: 'morning' as const,
        communicationFrequency: 'weekly' as const,
        specialRequirements: [],
        allergies: currentClient.allergies || [],
        medicalConditions: currentClient.medicalConditions || []
      },
      skinHistory: [],
      procedureHistory: [],
      aftercareStatus: {
        complianceScore: 0,
        lastCheckIn: new Date(),
        healingProgress: 0,
        issues: [],
        nextFollowUp: new Date(),
        completed: false
      },
      communicationHistory: [],
      financialHistory: [],
      notes: currentClient.notes ? [currentClient.notes] : [],
      tags: [],
      status: 'active' as const
    }
    
    const portalUser = portalService.createPortalAccess(enhancedClient)
    const portalLink = portalService.generatePortalAccessLink(currentClient.id)
    alert(`Portal access link for ${currentClient.name}:\n\n${window.location.origin}${portalLink}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getRiskColor = (result?: string) => {
    switch (result) {
      case 'safe': return 'bg-green-100 text-green-800'
      case 'precaution': return 'bg-yellow-100 text-yellow-800'
      case 'not_recommended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderEditableField = (label: string, value: string | undefined, field: keyof Client, type: 'text' | 'textarea' = 'text') => {
    if (isEditing) {
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{label}</Label>
          {type === 'textarea' ? (
            <Textarea
              value={editData[field] as string || value || ''}
              onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
              className="min-h-[80px]"
            />
          ) : (
            <Input
              value={editData[field] as string || value || ''}
              onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
            />
          )}
        </div>
      )
    }
    return (
      <div>
        <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
        <p className="text-sm">{value || 'Not specified'}</p>
      </div>
    )
  }

  const renderEditableArray = (label: string, values: string[] | undefined, field: keyof Client) => {
    if (isEditing) {
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium">{label}</Label>
          <Textarea
            value={editData[field] as string[] || values || []}
            onChange={(e) => setEditData({ ...editData, [field]: e.target.value.split(',').map(s => s.trim()) })}
            placeholder="Enter values separated by commas"
            className="min-h-[80px]"
          />
        </div>
      )
    }
    return (
      <div>
        <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
        <p className="text-sm">{values && values.length > 0 ? values.join(', ') : 'None'}</p>
      </div>
    )
  }

  const renderEditableBoolean = (label: string, value: boolean | undefined, field: keyof Client) => {
    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={field}
            checked={editData[field] as boolean || value || false}
            onCheckedChange={(checked) => setEditData({ ...editData, [field]: checked })}
          />
          <Label htmlFor={field} className="text-sm font-medium">{label}</Label>
        </div>
      )
    }
    return (
      <div className="flex items-center space-x-2">
        <div className={`w-4 h-4 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300'}`}></div>
        <span className="text-sm">{value ? 'Yes' : 'No'}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Debug Section */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-blue-800">Debug: Current Client Data</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="text-xs"
          >
            Refresh Page
          </Button>
        </div>
        <div className="text-xs text-blue-700 space-y-1">
          <p><strong>ID:</strong> {currentClient.id}</p>
          <p><strong>Name:</strong> {currentClient.name}</p>
          <p><strong>Email:</strong> {currentClient.email}</p>
          <p><strong>Created:</strong> {new Date(currentClient.createdAt).toLocaleString()}</p>
          <p><strong>Updated:</strong> {new Date(currentClient.updatedAt).toLocaleString()}</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{currentClient.name}</h1>
          <p className="text-gray-600 mt-1">{currentClient.email} • {currentClient.phone}</p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleEdit}>
                <Edit className="h-4 w-4" />
                Edit Client
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 text-red-600 border-red-200 hover:bg-red-50" 
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete Client
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 text-lavender border-lavender hover:bg-lavender/10" 
                onClick={handleSendPortalAccess}
              >
                <Send className="h-4 w-4" />
                Send Portal Access
              </Button>
            </>
          )}
          <Link href={`/analyze/${currentClient.id}`}>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Analysis
            </Button>
          </Link>
        </div>
      </div>

      {/* Client Info Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{currentClient.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{currentClient.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Last Visit</p>
                <p className="font-medium">{currentClient.lastVisit ? formatDate(currentClient.lastVisit) : 'No visits yet'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Risk Level</p>
                <RiskPill risk={currentClient.lastResult || 'safe'} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="procedures">Procedures</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderEditableField("Full Name", currentClient.name, "name")}
                {renderEditableField("Email", currentClient.email, "email")}
                {renderEditableField("Phone", currentClient.phone, "phone")}
                {renderEditableField("Date of Birth", currentClient.dateOfBirth, "dateOfBirth")}
                {renderEditableField("Emergency Contact", currentClient.emergencyContact, "emergencyContact")}
                {renderEditableField("Emergency Phone", currentClient.emergencyPhone, "emergencyPhone")}
              </CardContent>
            </Card>

            {/* PMU Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  PMU Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderEditableField("Desired Service", currentClient.desiredService, "desiredService")}
                {renderEditableField("Desired Color", currentClient.desiredColor, "desiredColor")}
                {renderEditableField("Sun Exposure", currentClient.sunExposure, "sunExposure")}
                {renderEditableField("Skincare Routine", currentClient.skincareRoutine, "skincareRoutine")}
                {renderEditableField("Exercise Habits", currentClient.exerciseHabits, "exerciseHabits")}
                {renderEditableField("Smoking Status", currentClient.smokingStatus, "smokingStatus")}
              </CardContent>
            </Card>
          </div>

          {/* Client Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Client Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderEditableField("Notes", currentClient.notes, "notes", "textarea")}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical Tab */}
        <TabsContent value="medical" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Medical History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Medical History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderEditableArray("Medical Conditions", currentClient.medicalConditions, "medicalConditions")}
                {renderEditableArray("Medications", currentClient.medications, "medications")}
                {renderEditableArray("Allergies", currentClient.allergies, "allergies")}
                {renderEditableArray("Skin Conditions", currentClient.skinConditions, "skinConditions")}
                {renderEditableBoolean("Previous PMU", currentClient.previousPMU, "previousPMU")}
                {renderEditableField("Previous PMU Details", currentClient.previousPMUDetails, "previousPMUDetails", "textarea")}
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Risk Level:</span>
                  <RiskPill risk={currentClient.lastResult || 'safe'} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Analyses:</span>
                  <Badge variant="outline">{currentClient.totalAnalyses}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Updated:</span>
                  <span className="text-sm text-muted-foreground">{formatDate(currentClient.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insurance Information */}
          <InsuranceManager 
            clientId={currentClient.id}
            insurance={currentClient.insurance}
            onInsuranceUpdate={handleRefresh}
          />

          {/* Analysis History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Analysis History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentClient.analyses.length > 0 ? (
                currentClient.analyses.map((analysis) => (
                  <div key={analysis.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="capitalize">{analysis.type}</Badge>
                      <span className="text-sm text-muted-foreground">{formatDate(analysis.date)}</span>
                    </div>
                    {analysis.fitzpatrick && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">Fitzpatrick: {analysis.fitzpatrick}</span>
                        {analysis.undertone && <span className="text-sm">• {analysis.undertone} undertone</span>}
                        {analysis.confidence && <span className="text-sm">• {Math.round(analysis.confidence * 100)}% confidence</span>}
                      </div>
                    )}
                    {analysis.notes && <p className="text-sm text-muted-foreground">{analysis.notes}</p>}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No analyses performed yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Procedures Tab */}
        <TabsContent value="procedures" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Procedure History</h3>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Procedure
            </Button>
          </div>
          
          {currentClient.procedures.length > 0 ? (
            <div className="space-y-4">
              {currentClient.procedures.map((procedure) => (
                <Card key={procedure.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="capitalize">{procedure.status}</Badge>
                          <span className="text-sm text-muted-foreground">{formatDate(procedure.date)}</span>
                        </div>
                        <h4 className="font-medium">{procedure.type}</h4>
                        <p className="text-sm text-muted-foreground">{procedure.description}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="font-medium">Cost: ${procedure.cost}</span>
                          {procedure.notes && <span>Notes: {procedure.notes}</span>}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <FileText className="h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Procedures Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Procedures will appear here once they are added to the client's profile.</p>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Procedure
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Client Documents</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Consent Forms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Consent Forms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Photo Consent</span>
                  <Badge variant="outline" className={currentClient.photoConsent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {currentClient.photoConsent ? 'Signed' : 'Not Signed'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Medical Release</span>
                  <Badge variant="outline" className={currentClient.medicalRelease ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {currentClient.medicalRelease ? 'Signed' : 'Not Signed'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Liability Waiver</span>
                  <Badge variant="outline" className={currentClient.liabilityWaiver ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {currentClient.liabilityWaiver ? 'Signed' : 'Not Signed'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Aftercare Agreement</span>
                  <Badge variant="outline" className={currentClient.aftercareAgreement ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {currentClient.aftercareAgreement ? 'Signed' : 'Not Signed'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Document Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Document Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentUpload 
                  clientId={currentClient.id}
                  documents={currentClient.documents}
                  onDocumentsUpdate={handleRefresh}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Client Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-red-600 font-semibold">Delete Client Profile</DialogTitle>
            <DialogDescription className="text-gray-700">
              This action cannot be undone. This will permanently delete <strong>{currentClient.name}</strong>'s profile and all associated data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
            <div className="space-y-2">
              <Label htmlFor="delete-confirmation" className="text-gray-800 font-medium">
                To confirm deletion, please type the client's full name: <strong className="text-red-600">{currentClient.name}</strong>
              </Label>
              <Input
                id="delete-confirmation"
                value={deleteConfirmation}
                onChange={(e) => {
                  setDeleteConfirmation(e.target.value)
                  setDeleteError("")
                }}
                placeholder="Type the client's full name"
                className={`${deleteError ? "border-red-500 bg-red-50" : "border-gray-300 bg-white"} focus:ring-2 focus:ring-red-500`}
              />
              {deleteError && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">{deleteError}</p>
              )}
            </div>
          </div>

          <DialogFooter className="bg-gray-50 p-4 -mx-6 -mb-6 rounded-b-lg">
            <Button variant="outline" onClick={() => {
              setIsDeleteDialogOpen(false)
              setDeleteConfirmation("")
              setDeleteError("")
            }} className="bg-white hover:bg-gray-50">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteConfirmation !== currentClient.name}
              className="bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500"
            >
              Delete Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
