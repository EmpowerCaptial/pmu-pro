"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Upload, FileText, Trash2, Edit, Download, Eye, Plus, X, PenTool, Send, CheckCircle, AlertCircle, Mail } from 'lucide-react'
import { SmartPDFSignatureViewer } from '@/components/documents/smart-pdf-signature-viewer'

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

const DOCUMENT_CATEGORIES = [
  'Consent Form',
  'Medical History',
  'Intake Form',
  'Treatment Plan',
  'Aftercare Instructions',
  'Liability Waiver',
  'Other'
]

interface PDFSignatureManagerProps {
  clientId?: string
  onDocumentsChange?: (documents: PDFDocument[]) => void
  documents?: PDFDocument[]
}

export function PDFSignatureManager({ clientId, onDocumentsChange, documents = [] }: PDFSignatureManagerProps) {
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<PDFDocument | null>(null)
  const [showSignatureViewer, setShowSignatureViewer] = useState(false)
  const [showSignatureSetup, setShowSignatureSetup] = useState(false)
  const [signatureSetupStep, setSignatureSetupStep] = useState<'review' | 'configure' | 'send'>('review')
  const [signatureFields, setSignatureFields] = useState<any[]>([])
  const [clientEmail, setClientEmail] = useState('')
  const [signatureMessage, setSignatureMessage] = useState('')
  const [isSendingSignature, setIsSendingSignature] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [newDocument, setNewDocument] = useState({
    title: '',
    description: '',
    category: 'Consent Form', // Set a default value instead of empty string
    state: '',
    isRequired: false,
    tags: [] as string[],
    file: null as File | null
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file')
        return
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB')
        return
      }
      setNewDocument(prev => ({ ...prev, file }))
      setError(null)
    } else {
      setNewDocument(prev => ({ ...prev, file: null }))
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDocument.file || !newDocument.title || !newDocument.category) {
      setError('Please fill in all required fields and select a PDF file')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      // Simulate file upload with progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Create new document object
      const newDoc: PDFDocument = {
        id: `doc_${Date.now()}`,
        title: newDocument.title,
        description: newDocument.description,
        category: newDocument.category,
        filename: newDocument.file.name,
        fileUrl: URL.createObjectURL(newDocument.file), // In production, this would be a real URL
        fileSize: newDocument.file.size,
        isRequired: newDocument.isRequired,
        state: newDocument.state || undefined,
        tags: newDocument.tags,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Artist', // In production, this would be the actual user
        clientId: clientId,
        needsSignature: true, // Default to true for uploaded documents
        signatureStatus: 'pending'
      }

      // Add to documents list
      const updatedDocuments = [newDoc, ...documents]
      onDocumentsChange?.(updatedDocuments)

      // Reset form
      setNewDocument({
        title: '',
        description: '',
        category: 'Consent Form', // Set a default value instead of empty string
        state: '',
        isRequired: false,
        tags: [],
        file: null
      })
      setShowUploadForm(false)
      setSuccess('PDF document uploaded successfully!')

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)

    } catch (err) {
      setError('Failed to upload document. Please try again.')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = (documentId: string) => {
    const updatedDocuments = documents.filter(doc => doc.id !== documentId)
    onDocumentsChange?.(updatedDocuments)
    setSuccess('Document deleted successfully!')
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleSignatureRequest = (document: PDFDocument) => {
    setSelectedDocument(document)
    setShowSignatureSetup(true)
    setSignatureSetupStep('review')
    // Reset form data
    setClientEmail('')
    setSignatureMessage('')
    setSignatureFields([])
  }

  const handleDocumentSigned = (signedPdfBuffer: Buffer | Uint8Array) => {
    if (selectedDocument) {
      // Update document status
      const updatedDocuments = documents.map(doc => 
        doc.id === selectedDocument.id 
          ? { ...doc, signatureStatus: 'signed' as const }
          : doc
      )
      onDocumentsChange?.(updatedDocuments)
      setShowSignatureViewer(false)
      setSelectedDocument(null)
      setSuccess('Document signed successfully!')
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  const handleSignatureFieldsDetected = (fields: any[]) => {
    setSignatureFields(fields)
    setSignatureSetupStep('configure')
  }

  const handleSendSignatureRequest = async () => {
    if (!clientEmail) {
      setError('Please enter the client email address')
      return
    }

    setIsSendingSignature(true)
    setError(null)

    try {
      // Send real signature request via API
      const response = await fetch('/api/signature-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientEmail,
          documentTitle: selectedDocument?.title || 'Document',
          documentUrl: selectedDocument?.fileUrl || '',
          artistName: 'PMU Artist', // In production, get from user context
          personalMessage: signatureMessage
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send signature request')
      }

      const result = await response.json()

      // Update document status
      const updatedDocuments = documents.map(doc =>
        doc.id === selectedDocument?.id
          ? { ...doc, signatureStatus: 'pending' as const }
          : doc
      )
      onDocumentsChange?.(updatedDocuments)

      setShowSignatureSetup(false)
      setSelectedDocument(null)
      setSuccess(`Signature request sent to ${clientEmail}! The client will receive an email with a link to sign the document.`)
      setTimeout(() => setSuccess(null), 5000)

    } catch (err) {
      console.error('Error sending signature request:', err)
      setError(err instanceof Error ? err.message : 'Failed to send signature request. Please try again.')
    } finally {
      setIsSendingSignature(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed': return 'bg-green-500'
      case 'pending': return 'bg-lavender-500'
      case 'not_required': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'signed': return 'Signed'
      case 'pending': return 'Pending Signature'
      case 'not_required': return 'No Signature Required'
      default: return 'Unknown'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Digital Signature Management</h2>
          <p className="text-gray-600">Upload PDFs and request client signatures</p>
        </div>
        <Button onClick={() => setShowUploadForm(true)} className="flex items-center gap-2 bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-white">
          <Upload className="h-4 w-4" />
          Upload PDF
        </Button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <Card>
          <CardHeader>
            <CardTitle>Upload PDF for Signature</CardTitle>
            <CardDescription>Upload a PDF document that needs client signature</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Document Title *</Label>
                  <Input
                    id="title"
                    value={newDocument.title}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Consent Form, Medical History"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={newDocument.category} onValueChange={(value) => setNewDocument(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="bg-white border-lavender/30 focus:border-lavender">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-lavender/30">
                      {DOCUMENT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category} className="hover:bg-lavender/10 focus:bg-lavender/10">{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newDocument.description}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the document"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="file">PDF File *</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Maximum file size: 10MB</p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isRequired"
                  checked={newDocument.isRequired}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, isRequired: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="isRequired">This document requires client signature</Label>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={isUploading} className="bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-white">
                  {isUploading ? 'Uploading...' : 'Upload Document'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowUploadForm(false)}
                  disabled={isUploading}
                  className="border-lavender/30 text-lavender-700 hover:bg-lavender/10"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Documents List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Uploaded Documents</h3>
        {documents.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h4>
              <p className="text-gray-600 mb-4">Upload your first PDF document to get started</p>
              <Button onClick={() => setShowUploadForm(true)} className="bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-white">
                <Upload className="h-4 w-4 mr-2" />
                Upload First Document
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {documents.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-lavender-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-lavender-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{document.title}</h4>
                        <p className="text-sm text-gray-600">{document.description}</p>
                                                 <div className="flex items-center space-x-2 mt-1">
                           <Badge variant="outline" className="text-xs border-lavender/30 text-lavender-700 bg-lavender/10">{document.category}</Badge>
                           <Badge 
                             variant="outline" 
                             className={`text-xs ${getStatusColor(document.signatureStatus)}`}
                           >
                             {getStatusText(document.signatureStatus)}
                           </Badge>
                         </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                                             {document.needsSignature && document.signatureStatus === 'pending' && (
                         <Button
                           size="sm"
                           onClick={() => handleSignatureRequest(document)}
                           className="flex items-center gap-2 bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-white"
                         >
                           <PenTool className="h-3 w-3" />
                           Request Signature
                         </Button>
                       )}
                                             <Button size="sm" variant="outline" className="border-lavender/30 text-lavender-700 hover:bg-lavender/10">
                         <Eye className="h-3 w-3" />
                       </Button>
                       <Button size="sm" variant="outline" className="border-lavender/30 text-lavender-700 hover:bg-lavender/10">
                         <Download className="h-3 w-3" />
                       </Button>
                       <Button 
                         size="sm" 
                         variant="outline" 
                         onClick={() => handleDelete(document.id)}
                         className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                       >
                         <Trash2 className="h-3 w-3" />
                       </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Signature Setup Modal */}
      {showSignatureSetup && selectedDocument && (
        <Dialog open={showSignatureSetup} onOpenChange={setShowSignatureSetup}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader className="bg-gray-50 border-b border-gray-200 p-6">
              <DialogTitle className="text-xl font-semibold text-gray-900">Request Client Signature</DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                Step-by-step process to request signature for: {selectedDocument.title}
              </DialogDescription>
            </DialogHeader>
            
            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${signatureSetupStep === 'review' ? 'bg-lavender text-white' : 'bg-gray-200 text-gray-600'}`}>
                  1
                </div>
                <div className={`h-1 w-8 ${signatureSetupStep === 'review' ? 'bg-lavender' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${signatureSetupStep === 'configure' ? 'bg-lavender text-white' : 'bg-gray-200 text-gray-600'}`}>
                  2
                </div>
                <div className={`h-1 w-8 ${signatureSetupStep === 'configure' ? 'bg-lavender' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${signatureSetupStep === 'send' ? 'bg-lavender text-white' : 'bg-gray-200 text-gray-600'}`}>
                  3
                </div>
              </div>
            </div>

            {/* Step 1: Review PDF */}
            {signatureSetupStep === 'review' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Step 1: Review Your PDF</h4>
                  <p className="text-blue-800 text-sm">
                    First, let's review your PDF document. The system will automatically detect signature fields 
                    and areas where signatures are typically needed. You can then customize these locations.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <SmartPDFSignatureViewer
                    pdfUrl={selectedDocument.fileUrl}
                    templateType="consent-form"
                    clientId={clientId || 'demo-client'}
                    onSignatureFieldsDetected={handleSignatureFieldsDetected}
                    isReviewMode={true}
                  />
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => setSignatureSetupStep('configure')}
                    className="bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-white"
                  >
                    Continue to Step 2
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Configure Signature Request */}
            {signatureSetupStep === 'configure' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Step 2: Configure Signature Request</h4>
                  <p className="text-green-800 text-sm">
                    Great! We found {signatureFields.length} signature field(s) in your document. 
                    Now let's set up the signature request details.
                  </p>
                </div>

                {/* Form Fields Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h5 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Client Information
                  </h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="clientEmail" className="text-gray-700 font-medium">Client Email Address *</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="client@example.com"
                        required
                        className="mt-2 bg-white border-gray-300 focus:border-lavender focus:ring-lavender"
                      />
                      {clientEmail && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-700 font-medium">✓ Email entered: {clientEmail}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="signatureMessage" className="text-gray-700 font-medium">Personal Message (Optional)</Label>
                      <Textarea
                        id="signatureMessage"
                        value={signatureMessage}
                        onChange={(e) => setSignatureMessage(e.target.value)}
                        placeholder="Add a personal message for your client..."
                        rows={3}
                        className="mt-2 bg-white border-gray-300 focus:border-lavender focus:ring-lavender"
                      />
                    </div>
                  </div>
                </div>

                {/* Signature Fields Section */}
                <div className="bg-lavender-50 border border-lavender-200 rounded-lg p-4">
                  <h5 className="font-medium text-lavender-900 mb-3 flex items-center gap-2">
                    <PenTool className="h-4 w-4" />
                    Signature Fields Detected
                  </h5>
                  <div className="bg-white border border-lavender-300 rounded-lg p-4">
                    <div className="space-y-2">
                      {signatureFields.length > 0 ? (
                        signatureFields.map((field, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-gray-700 font-medium">{field.name || `Signature Field ${index + 1}`}</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-gray-700">No signature fields detected. The client will be able to add signatures manually.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button 
                    onClick={() => setSignatureSetupStep('review')}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 font-medium"
                  >
                    ← Back to Step 1
                  </Button>
                  <Button 
                    onClick={() => setSignatureSetupStep('send')}
                    disabled={!clientEmail.trim()}
                    className="bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-white font-medium"
                  >
                    Continue to Step 3 {clientEmail ? '(Ready)' : '(Need Email)'}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Send Signature Request */}
            {signatureSetupStep === 'send' && (
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">Step 3: Send Signature Request</h4>
                  <p className="text-purple-800 text-sm">
                    Review your signature request details and send it to your client. 
                    They will receive an email with a secure link to sign the document.
                  </p>
                </div>

                {/* Document Details */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Document Details
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Document Title:</span>
                      <span className="font-medium">{selectedDocument.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{selectedDocument.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Signature Fields:</span>
                      <span className="font-medium">{signatureFields.length} field(s)</span>
                    </div>
                  </div>
                </div>

                {/* Client Email - Highlighted Section */}
                <div className="bg-lavender-50 border border-lavender-200 rounded-lg p-4">
                  <h5 className="font-medium text-lavender-900 mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Client Email Address
                  </h5>
                  <div className="bg-white border border-lavender-300 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lavender-700 font-medium">{clientEmail}</span>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">✓ Email Ready</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-lavender-700 mt-2">
                    This email will receive the signature request link
                  </p>
                </div>

                {/* Personal Message (if provided) */}
                {signatureMessage && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                      <PenTool className="h-4 w-4" />
                      Personal Message
                    </h5>
                    <div className="bg-white border border-blue-300 rounded-lg p-3">
                      <p className="text-blue-700 font-medium">{signatureMessage}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button 
                    onClick={() => setSignatureSetupStep('configure')}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 font-medium"
                  >
                    ← Back to Step 2
                  </Button>
                  <Button 
                    onClick={handleSendSignatureRequest}
                    disabled={isSendingSignature}
                    className="bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-white font-medium"
                  >
                    {isSendingSignature ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Signature Request
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
