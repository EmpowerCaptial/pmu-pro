"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  Calendar,
  Send,
  FileImage,
  File
} from 'lucide-react'
import { 
  ArtistApplication, 
  getAllApplications, 
  updateApplicationStatus, 
  addApplicationResponse,
  getApprovalStats,
  searchApplications,
  filterApplicationsByStatus,
  getStatusColor,
  getStatusIcon,
  formatFileSize,
  getDocumentTypes,
  getResponseTypes
} from '@/lib/account-approval'

interface ApplicationReviewProps {
  currentStaffMember: any
}

export default function ApplicationReview({ currentStaffMember }: ApplicationReviewProps) {
  const [applications, setApplications] = useState<ArtistApplication[]>([])
  const [selectedApplication, setSelectedApplication] = useState<ArtistApplication | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ArtistApplication['status']>('all')
  const [stats, setStats] = useState(getApprovalStats())
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [responseData, setResponseData] = useState<{
    type: 'request_info' | 'approval' | 'denial' | 'general'
    message: string
    requiresResponse: boolean
  }>({
    type: 'request_info',
    message: '',
    requiresResponse: false
  })

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = () => {
    const allApps = getAllApplications()
    setApplications(allApps)
    setStats(getApprovalStats())
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const results = searchApplications(query)
      setApplications(results)
    } else {
      const allApps = getAllApplications()
      setApplications(allApps)
    }
  }

  const handleStatusFilter = (status: 'all' | ArtistApplication['status']) => {
    setStatusFilter(status)
    if (status === 'all') {
      const allApps = getAllApplications()
      setApplications(allApps)
    } else {
      const filtered = filterApplicationsByStatus(status)
      setApplications(filtered)
    }
  }

  const handleStatusUpdate = (applicationId: string, newStatus: ArtistApplication['status'], notes?: string) => {
    const updated = updateApplicationStatus(applicationId, newStatus, currentStaffMember.username, notes)
    if (updated) {
      loadApplications()
      if (selectedApplication?.id === applicationId) {
        setSelectedApplication(updated)
      }
    }
  }

  const handleResponseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedApplication) return

    const response = addApplicationResponse(selectedApplication.id, {
      ...responseData,
      sentBy: currentStaffMember.username
    })

    if (response) {
      loadApplications()
      setShowResponseForm(false)
      setResponseData({ type: 'request_info', message: '', requiresResponse: false })
      
      // Update status to needs_info if requesting more information
      if (responseData.type === 'request_info') {
        handleStatusUpdate(selectedApplication.id, 'needs_info')
      }
    }
  }

  const openDocument = (url: string, filename: string) => {
    // In a real app, this would open the document viewer
    window.open(url, '_blank')
  }

  const getDocumentIcon = (mimeType: string) => {
    if (mimeType.includes('image')) return <FileImage className="h-4 w-4" />
    if (mimeType.includes('pdf')) return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total</p>
                <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Approved</p>
                <p className="text-2xl font-bold text-green-800">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Needs Info</p>
                <p className="text-2xl font-bold text-orange-800">{stats.needsInfo}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search applications by name, email, or business..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(value: any) => handleStatusFilter(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
            <SelectItem value="needs_info">Needs Info</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications List and Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle>Applications ({applications.length})</CardTitle>
            <CardDescription>Review and manage artist applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedApplication?.id === app.id 
                      ? 'border-lavender bg-lavender/5' 
                      : 'border-gray-200 hover:border-lavender/50'
                  }`}
                  onClick={() => setSelectedApplication(app)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{app.artistName}</h4>
                    <Badge className={getStatusColor(app.status)}>
                      {getStatusIcon(app.status)} {app.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {app.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      Submitted: {app.submittedAt.toLocaleDateString()}
                    </p>
                    {app.businessName && (
                      <p className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {app.businessName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Application Detail View */}
        {selectedApplication ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedApplication.artistName}</CardTitle>
                  <CardDescription>
                    Application ID: {selectedApplication.id}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(selectedApplication.status)}>
                  {getStatusIcon(selectedApplication.status)} {selectedApplication.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="responses">Responses</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Personal Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Name:</strong> {selectedApplication.artistName}</p>
                        <p><strong>Email:</strong> {selectedApplication.email}</p>
                        <p><strong>Phone:</strong> {selectedApplication.phone}</p>
                        {selectedApplication.businessName && (
                          <p><strong>Business:</strong> {selectedApplication.businessName}</p>
                        )}
                        {selectedApplication.businessAddress && (
                          <p><strong>Address:</strong> {selectedApplication.businessAddress}</p>
                        )}
                        {selectedApplication.licenseNumber && (
                          <p><strong>License:</strong> {selectedApplication.licenseNumber}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Professional Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Experience:</strong> {selectedApplication.experience}</p>
                        <p><strong>Specialties:</strong></p>
                        <div className="flex flex-wrap gap-1">
                          {selectedApplication.specialties.map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                        <p><strong>Submitted:</strong> {selectedApplication.submittedAt ? new Date(selectedApplication.submittedAt).toLocaleDateString() : 'Unknown'}</p>
                        {selectedApplication.reviewedAt && (
                          <p><strong>Reviewed:</strong> {new Date(selectedApplication.reviewedAt).toLocaleDateString()}</p>
                        )}
                        {selectedApplication.reviewedBy && (
                          <p><strong>Reviewed By:</strong> {selectedApplication.reviewedBy}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {selectedApplication.notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Review Notes</h4>
                      <p className="text-sm bg-gray-50 p-3 rounded border">{selectedApplication.notes}</p>
                    </div>
                  )}
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-4">
                  <h4 className="font-semibold">Submitted Documents ({selectedApplication.documents.length})</h4>
                  <div className="space-y-3">
                    {selectedApplication.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getDocumentIcon(doc.mimeType)}
                          <div>
                            <p className="font-medium">{doc.originalName}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.type} • {formatFileSize(doc.size)} • {doc.uploadedAt.toLocaleDateString()}
                            </p>
                            {doc.description && (
                              <p className="text-xs text-muted-foreground">{doc.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDocument(doc.url, doc.originalName)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(doc.url, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Responses Tab */}
                <TabsContent value="responses" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Communication History</h4>
                    <Button
                      size="sm"
                      onClick={() => setShowResponseForm(true)}
                      className="bg-lavender hover:bg-lavender/90"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Send Response
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedApplication.responses.map((response) => (
                      <div key={response.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{response.type.replace('_', ' ')}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {response.sentAt.toLocaleDateString()} by {response.sentBy}
                          </span>
                        </div>
                        <p className="text-sm">{response.message}</p>
                        {response.requiresResponse && (
                          <p className="text-xs text-orange-600 mt-1">Requires response from applicant</p>
                        )}
                      </div>
                    ))}
                    
                    {selectedApplication.responses.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No responses sent yet. Send the first response to this applicant.
                      </p>
                    )}
                  </div>
                </TabsContent>

                {/* Actions Tab */}
                <TabsContent value="actions" className="space-y-4">
                  <h4 className="font-semibold">Application Actions</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleStatusUpdate(selectedApplication.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={selectedApplication.status === 'approved'}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    
                    <Button
                      onClick={() => handleStatusUpdate(selectedApplication.id, 'denied')}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={selectedApplication.status === 'denied'}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Deny
                    </Button>
                    
                    <Button
                      onClick={() => handleStatusUpdate(selectedApplication.id, 'needs_info')}
                      className="bg-orange-600 hover:bg-orange-700"
                      disabled={selectedApplication.status === 'needs_info'}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Request Info
                    </Button>
                    
                    <Button
                      onClick={() => setShowResponseForm(true)}
                      className="bg-lavender hover:bg-lavender/90"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h5 className="font-medium mb-2">Quick Response Templates</h5>
                    <div className="space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          setResponseData({
                            type: 'approval',
                            message: 'Congratulations! Your application has been approved. You now have full access to PMU Pro. Welcome to our community of professional artists!',
                            requiresResponse: false
                          })
                          setShowResponseForm(true)
                        }}
                      >
                        Approval Notice
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          setResponseData({
                            type: 'denial',
                            message: 'Thank you for your interest in PMU Pro. After careful review, we regret to inform you that your application has been denied at this time. We recommend gaining additional experience and building a more comprehensive portfolio before reapplying. You may reapply in 6 months.',
                            requiresResponse: false
                          })
                          setShowResponseForm(true)
                        }}
                      >
                        Denial Notice
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          setResponseData({
                            type: 'request_info',
                            message: 'Thank you for your application. We need additional information to complete your review. Please provide the requested documents and we will continue processing your application.',
                            requiresResponse: true
                          })
                          setShowResponseForm(true)
                        }}
                      >
                        Request More Information
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex items-center justify-center h-96">
            <div className="text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <p>Select an application to view details</p>
            </div>
          </Card>
        )}
      </div>

      {/* Response Form Modal */}
      {showResponseForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Send Response to {selectedApplication?.artistName}</CardTitle>
              <CardDescription>
                Send a message to the applicant regarding their application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResponseSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Response Type</label>
                  <Select
                    value={responseData.type}
                    onValueChange={(value) => setResponseData({...responseData, type: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getResponseTypes().map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <Textarea
                    value={responseData.message}
                    onChange={(e) => setResponseData({...responseData, message: e.target.value})}
                    placeholder="Enter your message to the applicant..."
                    rows={6}
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="requiresResponse"
                    checked={responseData.requiresResponse}
                    onChange={(e) => setResponseData({...responseData, requiresResponse: e.target.checked})}
                  />
                  <label htmlFor="requiresResponse" className="text-sm">
                    This message requires a response from the applicant
                  </label>
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowResponseForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-lavender hover:bg-lavender/90">
                    <Send className="h-4 w-4 mr-2" />
                    Send Response
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
