"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Upload, Download, Eye, Trash2, FileText, ChevronDown, ChevronRight, X } from 'lucide-react'

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

const DOCUMENT_TYPES = [
  { value: 'ID_DOCUMENT', label: 'ID Document', icon: '🆔' },
  { value: 'CONSENT_FORM', label: 'Consent Form', icon: '📋' },
  { value: 'WAIVER', label: 'Waiver', icon: '📜' },
  { value: 'INTAKE_FORM', label: 'Intake Form', icon: '📝' },
  { value: 'CONTRAINDICATION_FORM', label: 'Contraindication Form', icon: '⚠️' },
  { value: 'ANALYSIS_REPORT', label: 'Analysis Report', icon: '📊' },
  { value: 'PHOTO', label: 'Photo', icon: '📸' },
  { value: 'OTHER', label: 'Other', icon: '📁' }
]

interface DocumentManagerProps {
  clientId: string
  documents: Document[]
  onDocumentsChange: (documents: Document[]) => void
}

export function DocumentManager({ clientId, documents, onDocumentsChange }: DocumentManagerProps) {
  const [newDocument, setNewDocument] = useState({
    type: '',
    notes: '',
    file: null as File | null
  })
  const [expandedDocument, setExpandedDocument] = useState<string | null>(null)

  const handleDocumentUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDocument.file || !newDocument.type) return

    try {
      // In a real app, you'd upload to your server/storage
      console.log('Uploading document:', newDocument)
      
      // Mock successful upload
      const newDoc: Document = {
        id: `doc${Date.now()}`,
        type: newDocument.type,
        filename: newDocument.file.name,
        fileUrl: URL.createObjectURL(newDocument.file),
        fileSize: newDocument.file.size,
        mimeType: newDocument.file.type,
        notes: newDocument.notes,
        createdAt: new Date().toISOString()
      }

      const updatedDocuments = [newDoc, ...documents]
      onDocumentsChange(updatedDocuments)
      setNewDocument({ type: '', notes: '', file: null })
      
      // Reset file input
      const fileInput = document.getElementById('document-file') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (error) {
      console.error('Error uploading document:', error)
    }
  }

  const handleDocumentDelete = (documentId: string) => {
    const updatedDocuments = documents.filter(doc => doc.id !== documentId)
    onDocumentsChange(updatedDocuments)
    // Close expanded view if deleted document was expanded
    if (expandedDocument === documentId) {
      setExpandedDocument(null)
    }
  }

  const toggleDocumentExpansion = (documentId: string) => {
    setExpandedDocument(expandedDocument === documentId ? null : documentId)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getDocumentTypeIcon = (type: string) => {
    const docType = DOCUMENT_TYPES.find(dt => dt.value === type)
    return docType ? docType.icon : '📄'
  }

  const getDocumentTypeLabel = (type: string) => {
    const docType = DOCUMENT_TYPES.find(dt => dt.value === type)
    return docType ? docType.label : type.replace('_', ' ')
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
    if (mimeType.includes('text')) return '📄'
    return '📁'
  }

  const handlePreview = (doc: Document) => {
    if (doc.mimeType.startsWith('image/')) {
      // For images, open in new tab
      window.open(doc.fileUrl, '_blank')
    } else if (doc.mimeType.includes('pdf')) {
      // For PDFs, open in new tab
      window.open(doc.fileUrl, '_blank')
    } else {
      // For other files, trigger download
      const link = document.createElement('a')
      link.href = doc.fileUrl
      link.download = doc.filename
      link.click()
    }
  }

  const handleDownload = (doc: Document) => {
    const link = document.createElement('a')
    link.href = doc.fileUrl
    link.download = doc.filename
    link.click()
  }

  return (
    <div className="space-y-6">
      {/* Upload New Document */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New Document
          </CardTitle>
          <CardDescription>
            Upload ID documents, consent forms, waivers, intake forms, and other client documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDocumentUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="document-type">Document Type *</Label>
                <Select value={newDocument.type} onValueChange={(value) => setNewDocument(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          {type.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="document-file">File *</Label>
                <div className="space-y-2">
                  <Input
                    id="document-file"
                    type="file"
                    onChange={(e) => setNewDocument(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                    required
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  />
                  {newDocument.type === 'ID_DOCUMENT' && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // In a real app, this would open camera
                          const input = document.getElementById('document-file') as HTMLInputElement
                          if (input) {
                            input.click()
                          }
                        }}
                        className="text-sm"
                      >
                        📷 Take Photo
                      </Button>
                      <span className="text-xs text-gray-500 self-center">
                        Camera access for ID verification
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Supported: PDF, Word, Images, Text files
                  </p>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="document-notes">Notes</Label>
              <Textarea
                id="document-notes"
                placeholder="Add notes about this document (optional)..."
                value={newDocument.notes}
                onChange={(e) => setNewDocument(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
            <Button type="submit" className="bg-lavender hover:bg-lavender-600" disabled={!newDocument.file || !newDocument.type}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents ({documents.length})
          </CardTitle>
          <CardDescription>
            All uploaded documents for this client. Click on a document to view actions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No documents uploaded yet</p>
              <p className="text-sm">Upload the first document using the form above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="border rounded-lg overflow-hidden">
                  {/* Document Header - Clickable */}
                  <div 
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => toggleDocumentExpansion(doc.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getDocumentTypeIcon(doc.type)}</span>
                      <div>
                        <p className="font-medium">{doc.filename}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {getDocumentTypeLabel(doc.type)}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {formatFileSize(doc.fileSize)}
                          </span>
                          <span className="text-sm text-gray-600">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {doc.notes && (
                          <p className="text-sm text-gray-500 mt-1">{doc.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        Click to {expandedDocument === doc.id ? 'collapse' : 'expand'}
                      </span>
                      {expandedDocument === doc.id ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Document Actions */}
                  {expandedDocument === doc.id && (
                    <div className="border-t bg-gray-50 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Document Actions</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedDocument(null)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handlePreview(doc)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Preview
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDownload(doc)}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                          onClick={() => handleDocumentDelete(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>

                      {/* File Information */}
                      <div className="mt-4 p-3 bg-white rounded border">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">File Type:</span>
                            <p className="text-gray-600">{getFileIcon(doc.mimeType)} {doc.mimeType}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Size:</span>
                            <p className="text-gray-600">{formatFileSize(doc.fileSize)}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Uploaded:</span>
                            <p className="text-gray-600">{new Date(doc.createdAt).toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Document ID:</span>
                            <p className="text-gray-600 font-mono text-xs">{doc.id}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
