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
import { Upload, FileText, Trash2, Edit, Download, Eye, Plus, X } from 'lucide-react'

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
}

const DOCUMENT_CATEGORIES = [
  'Legal',
  'Medical', 
  'Marketing',
  'State Compliance',
  'Consent Forms',
  'Aftercare',
  'Procedure Records',
  'Regulations',
  'Other'
]

const STATES = [
  'Missouri',
  'Illinois',
  'Kansas',
  'Arkansas',
  'Iowa',
  'Nebraska',
  'Oklahoma',
  'Texas',
  'National',
  'Other'
]

interface PDFUploadManagerProps {
  onDocumentsChange: (documents: PDFDocument[]) => void
  documents: PDFDocument[]
}

export function PDFUploadManager({ onDocumentsChange, documents }: PDFUploadManagerProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingDocument, setEditingDocument] = useState<PDFDocument | null>(null)
  const [showUploadForm, setShowUploadForm] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [newDocument, setNewDocument] = useState({
    title: '',
    description: '',
    category: '',
    state: '',
    isRequired: false,
    tags: [] as string[],
    file: null as File | null
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setNewDocument(prev => ({ ...prev, file }))
      setError(null)
    } else if (file) {
      setError('Please select a PDF file')
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
        uploadedBy: 'Admin User' // In production, this would be the actual user
      }

      // Add to documents list
      const updatedDocuments = [newDoc, ...documents]
      onDocumentsChange(updatedDocuments)

      // Reset form
      setNewDocument({
        title: '',
        description: '',
        category: '',
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
    onDocumentsChange(updatedDocuments)
    setSuccess('Document deleted successfully!')
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleEdit = (document: PDFDocument) => {
    setEditingDocument(document)
    setNewDocument({
      title: document.title,
      description: document.description,
      category: document.category,
      state: document.state || '',
      isRequired: document.isRequired,
      tags: document.tags,
      file: null
    })
    setShowUploadForm(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDocument) return

    const updatedDocuments = documents.map(doc => 
      doc.id === editingDocument.id 
        ? { 
            ...doc, 
            title: newDocument.title,
            description: newDocument.description,
            category: newDocument.category,
            state: newDocument.state || undefined,
            isRequired: newDocument.isRequired,
            tags: newDocument.tags
          }
        : doc
    )

    onDocumentsChange(updatedDocuments)
    setEditingDocument(null)
    setShowUploadForm(false)
    setSuccess('Document updated successfully!')
    setTimeout(() => setSuccess(null), 3000)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const addTag = (tag: string) => {
    if (tag.trim() && !newDocument.tags.includes(tag.trim())) {
      setNewDocument(prev => ({ ...prev, tags: [...prev.tags, tag.trim()] }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setNewDocument(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }))
  }

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      {showUploadForm && (
        <Card className="border-lavender/30 bg-gradient-to-br from-lavender/5 to-beige/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lavender-700">
                  {editingDocument ? 'Edit Document' : 'Upload New PDF Document'}
                </CardTitle>
                <CardDescription>
                  {editingDocument ? 'Update document information' : 'Add a new PDF form for artists to use'}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowUploadForm(false)
                  setEditingDocument(null)
                  setNewDocument({
                    title: '',
                    description: '',
                    category: '',
                    state: '',
                    isRequired: false,
                    tags: [],
                    file: null
                  })
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingDocument ? handleUpdate : handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Document Title *</Label>
                  <Input
                    id="title"
                    value={newDocument.title}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Missouri Adult Consent Form"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={newDocument.category} onValueChange={(value) => setNewDocument(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      {DOCUMENT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="state">State (Optional)</Label>
                  <Select value={newDocument.state} onValueChange={(value) => setNewDocument(prev => ({ ...prev, state: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      {STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="required"
                    checked={newDocument.isRequired}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, isRequired: e.target.checked }))}
                    className="rounded border-gray-300 text-lavender focus:ring-lavender"
                  />
                  <Label htmlFor="required">Required Document</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newDocument.description}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of what this document is for..."
                  rows={3}
                />
              </div>

              {!editingDocument && (
                <div>
                  <Label htmlFor="pdf-file">PDF File *</Label>
                  <div className="mt-2">
                    <Input
                      ref={fileInputRef}
                      id="pdf-file"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      required={!editingDocument}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Only PDF files are accepted. Max size: 10MB
                    </p>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="tags">Tags (Optional)</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      placeholder="Add a tag and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag(e.currentTarget.value)
                          e.currentTarget.value = ''
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.getElementById('tags') as HTMLInputElement
                        if (input.value.trim()) {
                          addTag(input.value.trim())
                          input.value = ''
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {newDocument.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newDocument.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {isUploading && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-lavender h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isUploading}
                  className="bg-lavender hover:bg-lavender-600 text-white"
                >
                  {editingDocument ? (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Document
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowUploadForm(false)
                    setEditingDocument(null)
                    setNewDocument({
                      title: '',
                      description: '',
                      category: '',
                      state: '',
                      isRequired: false,
                      tags: [],
                      file: null
                    })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Upload Button */}
      {!showUploadForm && (
        <div className="text-center">
          <Button
            onClick={() => setShowUploadForm(true)}
            className="bg-lavender hover:bg-lavender-600 text-white px-6 py-3"
          >
            <Plus className="h-5 w-5 mr-2" />
            Upload New PDF Document
          </Button>
        </div>
      )}

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            PDF Documents ({documents.length})
          </CardTitle>
          <CardDescription>
            Manage all uploaded PDF documents for artists
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No PDF documents uploaded yet</p>
              <p className="text-sm">Upload the first document using the button above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{doc.title}</h3>
                        {doc.isRequired && (
                          <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                            Required
                          </Badge>
                        )}
                        <Badge variant="outline">{doc.category}</Badge>
                        {doc.state && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {doc.state}
                          </Badge>
                        )}
                      </div>
                      
                      {doc.description && (
                        <p className="text-gray-600 mb-2">{doc.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span>📄 {doc.filename}</span>
                        <span>📏 {formatFileSize(doc.fileSize)}</span>
                        <span>📅 {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        <span>👤 {doc.uploadedBy}</span>
                      </div>
                      
                      {doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {doc.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(doc)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(doc.fileUrl, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = doc.fileUrl
                          link.download = doc.filename
                          link.click()
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
