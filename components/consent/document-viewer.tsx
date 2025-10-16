"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  History,
  Printer
} from "lucide-react"
import { useDemoAuth } from "@/hooks/use-demo-auth"

export function DocumentViewer({ clientId, highlightFormId }: { clientId?: string; highlightFormId?: string | null }) {
  const { currentUser } = useDemoAuth()
  const [forms, setForms] = useState<any[]>([])
  const [selectedForm, setSelectedForm] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // Load real consent forms data
  useEffect(() => {
    const loadForms = async () => {
      try {
        // Load from localStorage first
        const stored = localStorage.getItem("consent-forms")
        let localForms: any[] = []
        
        if (stored) {
          localForms = JSON.parse(stored)
        }
        
        // Then try to sync with server
        try {
          const response = await fetch('/api/consent-forms', {
            headers: {
              'x-user-email': currentUser?.email || ''
            }
          })
          if (response.ok) {
            const serverData = await response.json()
            if (serverData.forms && serverData.forms.length > 0) {
              // Merge server data with localStorage, prioritizing server data
              const serverForms = serverData.forms
              const mergedForms = localForms.filter(localForm => 
                !serverForms.some((serverForm: any) => serverForm.id === localForm.id)
              )
              const allForms = [...serverForms, ...mergedForms]
              setForms(allForms)
              
              // Update localStorage with merged data
              localStorage.setItem("consent-forms", JSON.stringify(allForms))
            } else {
              setForms(localForms)
            }
          } else {
            setForms(localForms)
          }
        } catch (serverError) {
          console.error("Error syncing with server:", serverError)
          setForms(localForms)
        }
        
        // Set initial selected form
        if (highlightFormId) {
          const highlightedForm = forms.find(form => form.id === highlightFormId)
          setSelectedForm(highlightedForm || null)
        } else if (forms.length > 0) {
          setSelectedForm(forms[0])
        }
        
      } catch (error) {
        console.error("Error loading forms:", error)
        setForms([])
      } finally {
        setLoading(false)
      }
    }

    loadForms()
  }, [highlightFormId])

  // Update selected form when forms change
  useEffect(() => {
    if (forms.length > 0 && !selectedForm) {
      if (highlightFormId) {
        const highlightedForm = forms.find(form => form.id === highlightFormId)
        setSelectedForm(highlightedForm || forms[0])
      } else {
        setSelectedForm(forms[0])
      }
    }
  }, [forms, highlightFormId, selectedForm])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [filters, setFilters] = useState({
    formType: "",
    status: "",
    startDate: "",
    endDate: ""
  })

  const handleFormSelect = (form: any) => {
    setSelectedForm(form)
  }

  const downloadPDF = (form: any) => {
    if (form.pdfUrl) {
      window.open(form.pdfUrl, '_blank')
    }
  }

  const printForm = (form: any) => {
    if (form.pdfUrl) {
      const printWindow = window.open(form.pdfUrl, '_blank')
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
        }
      }
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200' }
      case 'sent':
        return { label: 'Sent', icon: Clock, color: 'bg-blue-100 text-blue-800 border-blue-200' }
      case 'expired':
        return { label: 'Expired', icon: AlertCircle, color: 'bg-red-100 text-red-800 border-red-200' }
      default:
        return { label: status, icon: FileText, color: 'bg-gray-100 text-gray-800 border-gray-200' }
    }
  }

  const filteredForms = forms.filter(form => {
    // Filter by clientId if provided
    if (clientId && form.clientId !== clientId) {
      return false
    }
    
    const matchesSearch = form.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.formType.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = selectedType === 'all' || form.formType === selectedType
    const matchesStatus = selectedStatus === 'all' || form.status === selectedStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Consent Form Documents</h2>
          <p className="text-gray-600">View and manage signed consent forms</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span className="text-sm text-gray-600">Enterprise Security</span>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Client name or form type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="formType">Form Type</Label>
              <Select value={filters.formType} onValueChange={(value) => setFilters(prev => ({ ...prev, formType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="general-consent">General Consent</SelectItem>
                  <SelectItem value="medical-history">Medical History</SelectItem>
                  <SelectItem value="brows">Brows Consent</SelectItem>
                  <SelectItem value="lips">Lips Consent</SelectItem>
                  <SelectItem value="liner">Eyeliner Consent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forms List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Forms ({filteredForms.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredForms.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No forms found
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {filteredForms.map((form) => {
                    const statusConfig = getStatusConfig(form.status)
                    return (
                      <div
                        key={form.id}
                        className={`p-4 border-b cursor-pointer transition-colors ${
                          selectedForm?.id === form.id 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleFormSelect(form)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{form.clientName}</h4>
                            <p className="text-sm text-gray-600">{form.formType}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(form.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline" className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Form Details */}
        <div className="lg:col-span-2">
          {selectedForm ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedForm.clientName}</CardTitle>
                    <CardDescription>{selectedForm.formType}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadPDF(selectedForm)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => printForm(selectedForm)}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details" className="w-full">
                  <TabsList>
                    <TabsTrigger value="details">Form Details</TabsTrigger>
                    <TabsTrigger value="audit">Audit Trail</TabsTrigger>
                    <TabsTrigger value="pdf">PDF Preview</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Client Name</Label>
                        <p className="text-sm text-gray-600">{selectedForm.clientName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Form Type</Label>
                        <p className="text-sm text-gray-600">{selectedForm.formType}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge variant="outline" className={getStatusConfig(selectedForm.status).color}>
                          {getStatusConfig(selectedForm.status).label}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Created</Label>
                        <p className="text-sm text-gray-600">
                          {new Date(selectedForm.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {selectedForm.completedAt && (
                        <div>
                          <Label className="text-sm font-medium">Completed</Label>
                          <p className="text-sm text-gray-600">
                            {new Date(selectedForm.completedAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                      <div>
                        <Label className="text-sm font-medium">Expires</Label>
                        <p className="text-sm text-gray-600">
                          {new Date(selectedForm.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {selectedForm.formData && (
                      <div className="mt-6">
                        <h4 className="font-medium mb-2">Form Data</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                            {JSON.stringify(selectedForm.formData, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="audit" className="space-y-4">
                    <h4 className="font-medium">Audit Trail</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <History className="h-4 w-4 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Form viewed</p>
                          <p className="text-xs text-gray-500">
                            {new Date().toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">Artist viewed completed form</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <History className="h-4 w-4 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Form completed</p>
                          <p className="text-xs text-gray-500">
                            {selectedForm.completedAt ? new Date(selectedForm.completedAt).toLocaleString() : 'N/A'}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">Client completed and signed form</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <History className="h-4 w-4 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Form created</p>
                          <p className="text-xs text-gray-500">
                            {new Date(selectedForm.createdAt).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">Form sent to client</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pdf" className="space-y-4">
                    <h4 className="font-medium">PDF Preview</h4>
                    {selectedForm.pdfUrl ? (
                      <div className="border rounded-lg p-4">
                        <iframe
                          src={selectedForm.pdfUrl}
                          className="w-full h-96 border-0"
                          title="Form PDF"
                        />
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>PDF not available</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Form</h3>
                <p className="text-gray-600">Choose a form from the list to view its details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
