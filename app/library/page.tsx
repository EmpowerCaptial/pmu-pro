"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Search, Download, FileText, BookOpen, Shield, FileCheck, Clipboard, AlertTriangle, Mail, UploadCloud, UserCircle } from 'lucide-react'
import { getAllPDFResources, PDFResource } from '@/lib/pdf-generator'
import Link from 'next/link'
import { NavBar } from '@/components/ui/navbar'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { upload } from '@vercel/blob/client'

const RESOURCE_PREFIX = 'resource-library'
const MAX_UPLOAD_BYTES = 150 * 1024 * 1024
const MAX_UPLOAD_MB = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))

interface UploadedResource {
  id: string
  title: string
  url: string
  fileType: string
  fileSize: number
  category: string
  uploadedAt: string
  uploadedBy: string
}

interface LibraryResource {
  id: string
  title: string
  category: string
  description?: string
  source: 'static' | 'uploaded'
  staticResource?: PDFResource
  url?: string
  fileType?: string
  fileSize?: number
  uploadedAt?: string
  uploadedBy?: string
}

export default function LibraryPage() {
  const { currentUser } = useDemoAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [uploadedResources, setUploadedResources] = useState<UploadedResource[]>([])
  const [isLoadingUploads, setIsLoadingUploads] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadCategory, setUploadCategory] = useState('general')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [resourceError, setResourceError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null)
  const [deletingResourceId, setDeletingResourceId] = useState<string | null>(null)
  
  const staticPdfResources = useMemo(() => getAllPDFResources(), [])
  const staticResources: LibraryResource[] = useMemo(() => (
    staticPdfResources.map((resource) => ({
      id: `static-${resource.id}`,
      title: resource.title,
      category: resource.category,
      description: resource.content[0],
      source: 'static',
      staticResource: resource
    }))
  ), [staticPdfResources])

  const fetchUploadedResources = async () => {
    try {
      setResourceError(null)
      const response = await fetch('/api/resource-library')
      if (!response.ok) {
        throw new Error('Failed to load resource library')
      }
      const data = await response.json()
      setUploadedResources(data.resources || [])
    } catch (error) {
      console.error('Error loading resource library:', error)
      setResourceError('Unable to load admin uploaded resources at the moment.')
    }
  }

  useEffect(() => {
    fetchUploadedResources()
  }, [])

  // Prepare user object for NavBar
  const user = currentUser ? {
    name: currentUser.name,
    email: currentUser.email,
    initials: currentUser.name?.split(' ').map(n => n[0]).join('') || currentUser.email.charAt(0).toUpperCase(),
    avatar: currentUser.avatar
  } : {
    name: "PMU Artist",
    email: "user@pmupro.com",
    initials: "PA",
  }

  const combinedResources: LibraryResource[] = useMemo(() => {
    const uploadedLibrary = uploadedResources.map<LibraryResource>((resource) => ({
      id: resource.id,
      title: resource.title,
      category: resource.category || 'general',
      description: `${resource.fileType?.replace('application/', '').toUpperCase()} • Uploaded by ${resource.uploadedBy}`,
      source: 'uploaded',
      url: resource.url,
      fileType: resource.fileType,
      fileSize: resource.fileSize,
      uploadedAt: resource.uploadedAt,
      uploadedBy: resource.uploadedBy
    }))

    return [...staticResources, ...uploadedLibrary]
  }, [staticResources, uploadedResources])

  const dynamicCategorySet = useMemo(() => {
    const baseCategories = ['licensing', 'establishment', 'regulations', 'renewal', 'inspection', 'consent', 'general']
    const uploadedCategories = uploadedResources.map((resource) => resource.category?.toLowerCase() || 'general')
    return Array.from(new Set(['all', ...baseCategories, ...uploadedCategories]))
  }, [uploadedResources])

  const filteredResources = combinedResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.uploadedBy?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

    const matchesTab = activeTab === 'all' || resource.category === activeTab

    return matchesSearch && matchesTab
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'licensing': return <FileCheck className="h-5 w-5" />
      case 'establishment': return <Shield className="h-5 w-5" />
      case 'regulations': return <BookOpen className="h-5 w-5" />
      case 'renewal': return <Clipboard className="h-5 w-5" />
      case 'inspection': return <AlertTriangle className="h-5 w-5" />
      case 'consent': return <FileText className="h-5 w-5" />
      case 'general': return <BookOpen className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'licensing': return 'bg-blue-100 text-blue-800'
      case 'establishment': return 'bg-green-100 text-green-800'
      case 'regulations': return 'bg-purple-100 text-purple-800'
      case 'renewal': return 'bg-orange-100 text-orange-800'
      case 'inspection': return 'bg-red-100 text-red-800'
      case 'consent': return 'bg-indigo-100 text-indigo-800'
      case 'general': return 'bg-slate-100 text-slate-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'licensing': return 'Licensing'
      case 'establishment': return 'Establishment'
      case 'regulations': return 'Regulations'
      case 'renewal': return 'Renewal'
      case 'inspection': return 'Inspection'
      case 'consent': return 'Consent Forms'
      case 'general': return 'General Resources'
      default: return 'All Documents'
    }
  }

  const formatFileSize = (size?: number) => {
    if (!size) return '—'
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const handleDownload = async (resource: LibraryResource) => {
    try {
      if (resource.source === 'uploaded' && resource.url) {
        window.open(resource.url, '_blank', 'noopener,noreferrer')
        return
      }

      if (resource.source === 'static' && resource.staticResource) {
        const pdfResource = resource.staticResource
        // Placeholder export until PDF generation is wired in
        const content = generatePDFPreview(pdfResource)
        const blob = new Blob([content], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${pdfResource.title.replace(/\s+/g, '_')}.txt`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    }
  }

  const handleDeleteResource = async (resource: LibraryResource) => {
    if (!canManageResources) return
    if (resource.source !== 'uploaded') return

    if (!currentUser?.email) {
      setDeleteError('You must be signed in to delete resources.')
      return
    }

    const confirmation = window.prompt(`Type DELETE to remove "${resource.title}" from the library.`)
    if ((confirmation || '').toUpperCase() !== 'DELETE') {
      return
    }

    setDeleteError(null)
    setDeleteSuccess(null)
    setDeletingResourceId(resource.id)

    try {
      const response = await fetch(`/api/resource-library/${resource.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': currentUser.email
        }
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Failed to delete resource')
      }

      setDeleteSuccess(`Removed "${resource.title}" from the library.`)
      await fetchUploadedResources()
    } catch (error) {
      console.error('Failed to delete resource:', error)
      const message = error instanceof Error ? error.message : 'Failed to delete resource'
      setDeleteError(message)
    } finally {
      setDeletingResourceId(null)
    }
  }

  const generatePDFPreview = (resource: PDFResource): string => {
    let content = `${resource.title}\n`
    content += `${'='.repeat(resource.title.length)}\n\n`
    content += `Category: ${resource.category}\n\n`
    
    resource.sections.forEach((section, index) => {
      content += `${index + 1}. ${section.title}\n`
      content += `${'-'.repeat(section.title.length + 3)}\n`
      
      if (section.subsections) {
        section.subsections.forEach((subsection, subIndex) => {
          content += `  ${index + 1}.${subIndex + 1} ${subsection.title}\n`
          content += `     ${Array.isArray(subsection.content) ? subsection.content.join(', ') : subsection.content}\n\n`
        })
      }
    })
    
    return content
  }

  const canManageResources = (() => {
    if (!currentUser?.role) return false
    const role = currentUser.role.toLowerCase()
    return ['owner', 'director', 'manager', 'hr'].includes(role)
  })()

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setUploadError(null)
    setUploadSuccess(null)

    if (!currentUser?.email) {
      setUploadError('You must be signed in to upload resources.')
      return
    }

    if (!uploadFile) {
      setUploadError('Please select a PDF to upload.')
      return
    }

    if (uploadFile.type !== 'application/pdf') {
      setUploadError('Only PDF files are allowed.')
      return
    }

    if (uploadFile.size > MAX_UPLOAD_BYTES) {
      setUploadError(`This PDF is ${formatFileSize(uploadFile.size)}. Please keep uploads at or below ${MAX_UPLOAD_MB} MB.`)
      return
    }

    const normalizedTitle = (uploadTitle || uploadFile.name.replace(/\.pdf$/i, '')).trim() || 'Training Resource'
    const safeSegment = normalizedTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    const fileName = `${safeSegment || 'resource'}-${Date.now()}.pdf`
    const userIdentifier = currentUser.id || currentUser.email.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'user'
    const pathname = `${RESOURCE_PREFIX}/${userIdentifier}/${fileName}`

    const clientPayload = JSON.stringify({
      title: normalizedTitle,
      category: uploadCategory,
      fileSize: uploadFile.size,
      originalFilename: uploadFile.name
    })

    setIsLoadingUploads(true)
    setUploadProgress(0)
    try {
      await upload(pathname, uploadFile, {
        access: 'public',
        contentType: 'application/pdf',
        handleUploadUrl: '/api/resource-library',
        headers: {
          'x-user-email': currentUser.email
        },
        clientPayload,
        multipart: uploadFile.size > 15 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => setUploadProgress(Math.round(percentage))
      })

      setUploadSuccess('Resource uploaded successfully.')
      setUploadFile(null)
      setUploadTitle('')
      setUploadCategory('general')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      await fetchUploadedResources()
    } catch (error) {
      console.error('Upload error:', error)
      const message = error instanceof Error ? error.message : 'Failed to upload resource'
      const lower = message.toLowerCase()
      if (message.includes('413') || lower.includes('size') || lower.includes('too large')) {
        setUploadError(`This PDF is too large. Please keep files at or below ${MAX_UPLOAD_MB} MB.`)
      } else if (lower.includes('access denied') || lower.includes('token')) {
        setUploadError(`Upload blocked. The file might exceed the ${MAX_UPLOAD_MB} MB limit or the session expired—please try again or split the PDF into smaller sections.`)
      } else {
        setUploadError(message)
      }
    } finally {
      setIsLoadingUploads(false)
      setUploadProgress(null)
    }
  }

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setUploadFile(null)
      setUploadProgress(null)
      return
    }
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are allowed.')
      event.target.value = ''
      return
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError(`This PDF is ${formatFileSize(file.size)}. Please choose a file at or below ${MAX_UPLOAD_MB} MB.`)
      event.target.value = ''
      setUploadFile(null)
      setUploadProgress(null)
      return
    }
    setUploadError(null)
    setUploadFile(file)
    setUploadProgress(null)
    if (!uploadTitle) {
      setUploadTitle(file.name.replace(/\.pdf$/i, ''))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <NavBar currentPath="/library" user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Resource Library</h1>
          <p className="text-lg text-muted-foreground">
            Official Missouri Board documents and professional resources for PMU artists
          </p>
        </div>

        {/* Return to Dashboard */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="outline" className="mb-4">
              ← Return to Dashboard
            </Button>
          </Link>
        </div>

        {/* Search and Category Dropdown */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lavender h-4 w-4" />
              <Input
                placeholder="Search documents by title, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-lavender/30 focus:border-lavender"
              />
            </div>
            
            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full sm:w-48 px-4 py-2 border border-lavender/30 rounded-md bg-white focus:border-lavender focus:outline-none text-sm font-medium text-foreground shadow-sm"
              >
                {dynamicCategorySet.map((category) => (
                  <option key={category} value={category}>
                    {getCategoryName(category)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {canManageResources && (
          <Card id="upload-resources" className="mb-8 border-lavender/40 shadow-md bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <UploadCloud className="h-5 w-5 text-lavender" />
                Upload Resource to Library
              </CardTitle>
              <CardDescription>
                Add training materials, compliance documents, or studio policies for students and staff to access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="resource-title">Document Title</Label>
                    <Input
                      id="resource-title"
                      placeholder="e.g., Universal Beauty Academy Student Handbook"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="border-lavender/40 focus:border-lavender"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resource-category">Category</Label>
                    <select
                      id="resource-category"
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-lavender/30 rounded-md bg-white focus:border-lavender focus:outline-none text-sm text-foreground shadow-sm"
                    >
                      <option value="general">General Resources</option>
                      <option value="licensing">Licensing</option>
                      <option value="establishment">Establishment</option>
                      <option value="regulations">Regulations</option>
                      <option value="renewal">Renewal</option>
                      <option value="inspection">Inspection</option>
                      <option value="consent">Consent</option>
                      <option value="training">Training</option>
                      <option value="forms">Forms</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>PDF Document</Label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileSelection}
                      className="border-dashed border-2 border-lavender/40 bg-white focus:border-lavender"
                    />
                    <Button type="submit" disabled={isLoadingUploads} className="sm:w-48">
                      {isLoadingUploads ? 'Uploading…' : 'Upload PDF'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload PDF files up to {MAX_UPLOAD_MB} MB. Students and staff will see them immediately in the library list.
                  </p>
                  {uploadProgress !== null && (
                    <div className="text-xs text-lavender font-medium">
                      Uploading… {uploadProgress}%
                    </div>
                  )}
                </div>

                {(uploadError || uploadSuccess) && (
                  <Alert variant={uploadError ? 'destructive' : 'default'}>
                    <AlertTitle>{uploadError ? 'Upload failed' : 'Upload complete'}</AlertTitle>
                    <AlertDescription>
                      {uploadError || uploadSuccess}
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </CardContent>
          </Card>
        )}

        {resourceError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Resource library unavailable</AlertTitle>
            <AlertDescription>{resourceError}</AlertDescription>
          </Alert>
        )}

        {/* Results Count */}
        <div className="text-sm text-gray-600 mb-4">
          Showing {filteredResources.length} of {combinedResources.length} documents
        </div>

        {/* Document Grid */}
        {deleteSuccess && (
          <Alert className="mb-4 border-green-200 bg-green-50 text-green-700">
            <AlertTitle>Resource removed</AlertTitle>
            <AlertDescription>{deleteSuccess}</AlertDescription>
          </Alert>
        )}

        {deleteError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Unable to delete resource</AlertTitle>
            <AlertDescription>{deleteError}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(resource.category)}
                    <Badge className={getCategoryColor(resource.category)}>
                      {getCategoryName(resource.category)}
                    </Badge>
                  </div>
                  {resource.source === 'uploaded' && (
                    <Badge variant="outline" className="text-xs border-lavender/50 text-lavender">
                      Uploaded
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{resource.title}</CardTitle>
                <CardDescription className="text-sm">
                  {resource.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {resource.source === 'static' && resource.staticResource && (
                    <div className="text-xs text-gray-500">
                      <p><strong>Category:</strong> {resource.category}</p>
                      <p><strong>Sections:</strong> {resource.staticResource.sections.length}</p>
                    </div>
                  )}

                  {resource.source === 'uploaded' && (
                    <div className="text-xs text-gray-500 space-y-1">
                      <p className="flex items-center gap-1"><UserCircle className="h-3 w-3" /><span><strong>Uploaded by:</strong> {resource.uploadedBy}</span></p>
                      <p><strong>Uploaded:</strong> {formatDate(resource.uploadedAt)}</p>
                      <p><strong>File size:</strong> {formatFileSize(resource.fileSize)}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleDownload(resource)}
                      size="sm" 
                      className="flex-1"
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    {resource.source === 'uploaded' && canManageResources && (
                      <Button
                        onClick={() => handleDeleteResource(resource)}
                        size="sm"
                        variant="destructive"
                        disabled={deletingResourceId === resource.id}
                      >
                        {deletingResourceId === resource.id ? 'Deleting…' : 'Delete'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No documents found' : 'No documents available'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms or selecting a different category'
                  : 'Documents will be available here once added to the system'
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Need Official Missouri Board Documents?
              </h3>
              <p className="text-blue-700 mb-4">
                For the most current official forms and applications, visit the Missouri Board of Tattoo, Branding and Piercing website.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  variant="outline" 
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  onClick={() => window.open('https://health.mo.gov/living/healthcondiseases/communicable/tattoo/', '_blank')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Visit Missouri Board Website
                </Button>
                <Button 
                  variant="outline" 
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  onClick={() => window.location.href = 'mailto:admin@thepmuguide.com?subject=Missouri Board Documents Request'}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Us
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
