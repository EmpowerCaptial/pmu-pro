"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Eye, Mail, Home, Upload, FileText, Plus, X, Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { useState, useRef } from "react"
import { useDemoAuth } from "@/hooks/use-demo-auth"
import { NavBar } from "@/components/ui/navbar"

interface PDFDocument {
  id: string
  title: string
  description: string
  category: string
  filename: string
  fileUrl: string
  fileSize: number
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

export default function StandardDocumentsPage() {
  const { currentUser } = useDemoAuth()
  const [uploadedDocuments, setUploadedDocuments] = useState<PDFDocument[]>([])
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [newDocument, setNewDocument] = useState({
    title: '',
    description: '',
    category: '',
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
    setError(null)

    try {
      // Create new document object
      const newDoc: PDFDocument = {
        id: `doc_${Date.now()}`,
        title: newDocument.title,
        description: newDocument.description,
        category: newDocument.category,
        filename: newDocument.file.name,
        fileUrl: URL.createObjectURL(newDocument.file),
        fileSize: newDocument.file.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser?.name || 'Artist'
      }

      // Add to documents list
      const updatedDocuments = [newDoc, ...uploadedDocuments]
      setUploadedDocuments(updatedDocuments)

      // Save to localStorage for persistence
      localStorage.setItem(`documents_${currentUser?.email}`, JSON.stringify(updatedDocuments))

      // Reset form
      setNewDocument({
        title: '',
        description: '',
        category: '',
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
    }
  }

  const handleDelete = (documentId: string) => {
    const updatedDocuments = uploadedDocuments.filter(doc => doc.id !== documentId)
    setUploadedDocuments(updatedDocuments)
    localStorage.setItem(`documents_${currentUser?.email}`, JSON.stringify(updatedDocuments))
    setSuccess('Document deleted successfully!')
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleDownload = (doc: PDFDocument) => {
    const link = document.createElement("a")
    link.href = doc.fileUrl
    link.download = doc.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleView = (doc: PDFDocument) => {
    window.open(doc.fileUrl, '_blank')
  }

  const handleSendEmail = (doc: PDFDocument) => {
    const subject = encodeURIComponent(`${doc.title} - PMU Pro`)
    const body = encodeURIComponent(
      `Please find the attached ${doc.title} document. If you have any questions, please contact our studio.`,
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const getFilteredDocuments = () => {
    if (selectedCategory === 'all') {
      return uploadedDocuments
    }
    return uploadedDocuments.filter(doc => doc.category === selectedCategory)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Load saved documents on component mount
  useState(() => {
    if (currentUser) {
      const savedDocuments = localStorage.getItem(`documents_${currentUser.email}`)
      if (savedDocuments) {
        try {
          setUploadedDocuments(JSON.parse(savedDocuments))
        } catch (error) {
          console.error('Error loading saved documents:', error)
        }
      }
    }
  })

  return (
    <div className="min-h-screen bg-white relative">
      {/* Watermark Logo */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img
          src="/images/pmu-guide-logo-transparent.png"
          alt="PMU Guide Watermark"
          className="w-[60%] max-w-2xl h-auto opacity-[0.15] object-contain"
        />
      </div>

      <div className="relative z-10">
        <NavBar />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-ink mb-2">My Documents</h1>
              <p className="text-ink/70">
                Upload and manage your own PDF documents for viewing and printing
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="bg-lavender hover:bg-lavender-600 text-white"
              >
                {showUploadForm ? (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    View Documents
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload PDF
                  </>
                )}
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" className="border-lavender text-lavender hover:bg-lavender/5 bg-transparent p-2">
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Upload Form */}
          {showUploadForm && (
            <Card className="border-lavender/30 bg-gradient-to-br from-lavender/5 to-beige/10 mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lavender-700">Upload New PDF Document</CardTitle>
                    <CardDescription>Add a new PDF document to your collection</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowUploadForm(false)
                      setNewDocument({
                        title: '',
                        description: '',
                        category: '',
                        file: null
                      })
                      setError(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
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
                        placeholder="e.g., Client Consent Form"
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

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newDocument.description}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of this document..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="pdf-file">PDF File *</Label>
                    <div className="mt-2">
                      <Input
                        ref={fileInputRef}
                        id="pdf-file"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Only PDF files are accepted. Max size: 10MB
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
                      {success}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={isUploading}
                      className="bg-lavender hover:bg-lavender-600 text-white"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowUploadForm(false)
                        setNewDocument({
                          title: '',
                          description: '',
                          category: '',
                          file: null
                        })
                        setError(null)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Category Filter */}
          {uploadedDocuments.length > 0 && (
            <div className="mb-6">
              <Card className="bg-lavender/5 border-lavender/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label htmlFor="category-filter" className="text-sm font-medium text-lavender-700">
                        📁 Filter by Category
                      </Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                          <SelectItem value="all">All Categories</SelectItem>
                          {DOCUMENT_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Documents Grid */}
          {getFilteredDocuments().length === 0 ? (
            <Card className="bg-white border-lavender/20 shadow-lg">
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Documents Yet</h3>
                <p className="text-gray-500 mb-6">
                  Upload your first PDF document to get started. You can upload consent forms, 
                  aftercare instructions, or any other documents you need for your practice.
                </p>
                <Button
                  onClick={() => setShowUploadForm(true)}
                  className="bg-lavender hover:bg-lavender-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Your First Document
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredDocuments().map((doc) => (
                <Card
                  key={doc.id}
                  className="bg-white border-lavender/20 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-lavender/10 rounded-lg flex items-center justify-center text-lavender">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-ink leading-tight">{doc.title}</CardTitle>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-ink/70 mt-2">{doc.description}</CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{doc.category}</Badge>
                      <span className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-lavender/30 text-lavender hover:bg-lavender/5 bg-transparent"
                        onClick={() => handleView(doc)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-lavender hover:bg-lavender-600 text-white"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-lavender/30 text-lavender hover:bg-lavender/5 bg-transparent"
                        onClick={() => handleSendEmail(doc)}
                      >
                        <Mail className="h-4 w-4" />
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
                    <div className="text-xs text-gray-500 mt-2">
                      Uploaded {new Date(doc.uploadedAt).toLocaleDateString()} by {doc.uploadedBy}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}