"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Download, 
  Eye, 
  Search,
  Filter,
  Calendar,
  User,
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react'
import { NavBar } from '@/components/ui/navbar'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import Link from 'next/link'

interface ConsentForm {
  id: string
  clientId: string
  clientName: string
  formType: string
  sendMethod: "email" | "sms"
  contactInfo: string
  customMessage?: string
  token: string
  expiresAt: Date
  status: "sent" | "completed" | "expired"
  completedAt?: Date
  formData?: any
  pdfUrl?: string
  createdAt: Date
  sentAt: Date
}

const formTypeLabels: Record<string, string> = {
  "general-consent": "General Consent",
  "medical-history": "Medical History",
  "brows": "Brows Consent",
  "lips": "Lips Consent",
  "liner": "Eyeliner Consent",
  "smp": "SMP Consent",
  "photo-release": "Photo Release",
  "aftercare": "Aftercare Instructions"
}

const statusConfig = {
  sent: { 
    label: "Sent", 
    icon: Clock, 
    color: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Waiting for client response"
  },
  completed: { 
    label: "Completed", 
    icon: CheckCircle, 
    color: "bg-green-100 text-green-800 border-green-200",
    description: "Form signed and returned"
  },
  expired: { 
    label: "Expired", 
    icon: AlertCircle, 
    color: "bg-red-100 text-red-800 border-red-200",
    description: "Form has expired"
  }
}

export default function ConsentFormsInbox() {
  const { currentUser } = useDemoAuth()
  const [consentForms, setConsentForms] = useState<ConsentForm[]>([])
  const [filteredForms, setFilteredForms] = useState<ConsentForm[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  // Load user avatar for NavBar
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined)
  
  useEffect(() => {
    const loadAvatar = async () => {
      if (currentUser?.email && typeof window !== 'undefined') {
        try {
          const response = await fetch('/api/profile', {
            headers: {
              'x-user-email': currentUser.email
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            if (data.profile?.avatar) {
              setUserAvatar(data.profile.avatar)
              return
            }
          }
          
          const avatar = localStorage.getItem(`profile_photo_${currentUser.email}`)
          setUserAvatar(avatar || undefined)
        } catch (error) {
          console.error('Error loading avatar:', error)
          const avatar = localStorage.getItem(`profile_photo_${currentUser.email}`)
          setUserAvatar(avatar || undefined)
        }
      }
    }

    loadAvatar()
  }, [currentUser?.email])

  useEffect(() => {
    loadConsentForms()
  }, [])

  useEffect(() => {
    filterForms()
  }, [consentForms, searchTerm, statusFilter, typeFilter])

  const loadConsentForms = async () => {
    try {
      // First try to load from localStorage
      const stored = localStorage.getItem("consent-forms")
      let forms: ConsentForm[] = []
      
      if (stored) {
        forms = JSON.parse(stored)
      }
      
      // Then try to sync with server data
      try {
        const response = await fetch('/api/consent-forms', {
          headers: {
            'x-user-email': currentUser?.email || ''
          }
        })
        
        if (response.ok) {
          const serverData = await response.json()
          if (serverData.forms && serverData.forms.length > 0) {
            // Merge server data with localStorage data, prioritizing server data
            const serverForms = serverData.forms
            const localForms = forms.filter(localForm => 
              !serverForms.some((serverForm: any) => serverForm.id === localForm.id)
            )
            forms = [...serverForms, ...localForms]
            
            // Update localStorage with merged data
            localStorage.setItem("consent-forms", JSON.stringify(forms))
          }
        }
      } catch (serverError) {
        console.error("Error syncing with server:", serverError)
        // Continue with localStorage data if server fails
      }
      
      // Sort by creation date (newest first)
      forms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setConsentForms(forms)
    } catch (error) {
      console.error("Error loading consent forms:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterForms = () => {
    let filtered = consentForms

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(form => 
        form.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.formType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.contactInfo.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(form => form.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(form => form.formType === typeFilter)
    }

    setFilteredForms(filtered)
  }

  const getStatusCounts = () => {
    return {
      total: consentForms.length,
      sent: consentForms.filter(f => f.status === 'sent').length,
      completed: consentForms.filter(f => f.status === 'completed').length,
      expired: consentForms.filter(f => f.status === 'expired').length
    }
  }

  const downloadPDF = (form: ConsentForm) => {
    if (form.pdfUrl) {
      window.open(form.pdfUrl, '_blank')
    }
  }

  const viewDocument = (form: ConsentForm) => {
    // Navigate to documents page with this form highlighted
    window.location.href = `/dashboard/documents?highlight=${form.id}`
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (date: Date | string) => {
    const now = new Date()
    const formDate = new Date(date)
    const diffInHours = Math.floor((now.getTime() - formDate.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return formatDate(date)
  }

  const statusCounts = getStatusCounts()

  const user = {
    name: currentUser?.name || "PMU Artist",
    email: currentUser?.email || "user@pmupro.com",
    avatar: userAvatar,
    initials: (currentUser?.name || "PMU Artist").split(' ').map(n => n[0]).join('').toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
        <NavBar currentPath="/consent-forms" user={user} />
        <main className="container mx-auto px-4 py-8 max-w-6xl relative z-10 pb-24 md:pb-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lavender mx-auto mb-4"></div>
              <p className="text-muted">Loading consent forms...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <NavBar currentPath="/consent-forms" user={user} />
      <main className="container mx-auto px-4 py-8 max-w-6xl relative z-10 pb-24 md:pb-4">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-ink mb-2">Consent Forms Inbox</h1>
              <p className="text-muted">Manage and track client consent forms</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => {
                  setLoading(true)
                  loadConsentForms()
                }}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </Button>
              <Link href="/dashboard/documents">
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  View Documents
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">Total Forms</p>
                  <p className="text-2xl font-bold text-ink">{statusCounts.total}</p>
                </div>
                <FileText className="h-8 w-8 text-lavender" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">Pending</p>
                  <p className="text-2xl font-bold text-ink">{statusCounts.sent}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">Completed</p>
                  <p className="text-2xl font-bold text-ink">{statusCounts.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">Expired</p>
                  <p className="text-2xl font-bold text-ink">{statusCounts.expired}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted h-4 w-4" />
                  <Input
                    placeholder="Search client, form type, contact..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="sent">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(formTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Forms List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Consent Forms ({filteredForms.length})
            </CardTitle>
            <CardDescription>
              {filteredForms.length === 0 
                ? "No consent forms found" 
                : `Showing ${filteredForms.length} of ${consentForms.length} forms`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredForms.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-ink mb-2">No consent forms found</h3>
                <p className="text-muted mb-4">
                  {consentForms.length === 0 
                    ? "You haven't sent any consent forms yet."
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
                {consentForms.length === 0 && (
                  <Link href="/dashboard">
                    <Button className="gap-2">
                      <FileText className="h-4 w-4" />
                      Send Your First Form
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredForms.map((form) => {
                  const status = statusConfig[form.status]
                  const StatusIcon = status.icon
                  
                  return (
                    <div
                      key={form.id}
                      className="p-4 bg-white rounded-lg border border-gray-200 hover:border-lavender/30 transition-all duration-200 overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`p-2 rounded-full flex-shrink-0 ${status.color}`}>
                            <StatusIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-semibold text-ink truncate max-w-[200px]">{form.clientName}</h3>
                              <Badge variant="outline" className={`${status.color} flex-shrink-0`}>
                                {status.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted mb-1 truncate">
                              {formTypeLabels[form.formType] || form.formType}
                            </p>
                            <p className="text-xs text-muted">
                              {status.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {form.status === 'completed' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadPDF(form)}
                                className="gap-1 flex-shrink-0"
                              >
                                <Download className="h-3 w-3" />
                                <span className="hidden sm:inline">PDF</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewDocument(form)}
                                className="gap-1 flex-shrink-0"
                              >
                                <Eye className="h-3 w-3" />
                                <span className="hidden sm:inline">View</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="flex items-center gap-1 truncate max-w-[150px]">
                            <User className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{form.clientName}</span>
                          </span>
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            {form.sendMethod === 'email' ? (
                              <Mail className="h-3 w-3 flex-shrink-0" />
                            ) : (
                              <Phone className="h-3 w-3 flex-shrink-0" />
                            )}
                            <span className="truncate">{form.contactInfo}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Calendar className="h-3 w-3" />
                          <span className="whitespace-nowrap">
                            {form.status === 'completed' && form.completedAt 
                              ? `Completed ${getTimeAgo(form.completedAt)}`
                              : `Sent ${getTimeAgo(form.sentAt)}`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
