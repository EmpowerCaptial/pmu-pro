"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, Eye, Clock, CheckCircle, AlertCircle, Send, PenTool, ExternalLink } from "lucide-react"
import { SendConsentFormButton } from "./send-consent-form-button"

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
}

interface ClientConsentFormsTabProps {
  clientId: string
  clientName: string
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
  sent: { label: "Sent", icon: Send, color: "bg-blue-100 text-blue-800 border-blue-200" },
  completed: { label: "Completed", icon: CheckCircle, color: "bg-green-100 text-green-800 border-green-200" },
  expired: { label: "Expired", icon: AlertCircle, color: "bg-red-100 text-red-800 border-red-200" }
}

export function ClientConsentFormsTab({ clientId, clientName }: ClientConsentFormsTabProps) {
  const [consentForms, setConsentForms] = useState<ConsentForm[]>([])
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    loadConsentForms()
  }, [clientId])

  const loadConsentForms = async () => {
    try {
      // Load from localStorage for now (admin view)
      const stored = localStorage.getItem("consent-forms")
      if (stored) {
        const allForms: ConsentForm[] = JSON.parse(stored)
        const clientForms = allForms.filter(form => form.clientId === clientId)
        
        // Update expired status
        const updatedForms = clientForms.map(form => {
          if (form.status === "sent" && new Date(form.expiresAt) < new Date()) {
            return { ...form, status: "expired" as const }
          }
          return form
        })
        
        setConsentForms(updatedForms)
      }
      
      // Also try to load from API for any server-stored forms
      try {
        // This would be a real API call in production
        // For now, we'll keep using localStorage but add API integration
        console.log('Loading forms for client:', clientId)
      } catch (apiError) {
        console.error('Error loading forms from API:', apiError)
      }
    } catch (error) {
      console.error("Error loading consent forms:", error)
    }
  }

  const getFilteredForms = () => {
    if (activeTab === "all") return consentForms
    return consentForms.filter(form => form.status === activeTab)
  }

  const handleFormSent = () => {
    loadConsentForms()
  }

  const downloadForm = (form: ConsentForm) => {
    if (form.pdfUrl) {
      window.open(form.pdfUrl, '_blank')
    } else {
      // Generate PDF on demand
      alert("Generating PDF...")
      // In real app, call API to generate PDF
    }
  }

  const resendForm = (form: ConsentForm) => {
    // In real app, regenerate token and resend
    alert("Resending form...")
  }

  const generateSignatureLink = (formType: string) => {
    const baseUrl = window.location.origin
    const signatureUrl = `${baseUrl}/documents/signature-demo?clientId=${clientId}&clientName=${encodeURIComponent(clientName)}&formType=${formType}`
    return signatureUrl
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Link copied to clipboard!")
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      alert("Link copied to clipboard!")
    })
  }

  const filteredForms = getFilteredForms()

  return (
    <div className="space-y-6">
      {/* Header with Send Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Consent Forms</h3>
          <p className="text-sm text-gray-600">
            Manage and track consent forms for {clientName}
          </p>
        </div>
        <SendConsentFormButton
          clientId={clientId}
          clientName={clientName}
          size="sm"
        />
      </div>

      {/* Digital Signature System */}
      <Card className="bg-gradient-to-r from-blue-5 to-indigo-5 border-2 border-blue-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <PenTool className="h-5 w-5" />
            Digital Signature System
          </CardTitle>
          <CardDescription className="text-blue-700">
            Generate secure signature links for {clientName} to sign documents digitally
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-blue-900">Consent Form</h4>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  onClick={() => {
                    const link = generateSignatureLink('consent-form')
                    copyToClipboard(link)
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Copy Link
                </Button>
                <Button 
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    const link = generateSignatureLink('consent-form')
                    window.open(link, '_blank')
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm text-blue-900">Medical History</h4>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  onClick={() => {
                    const link = generateSignatureLink('medical-history')
                    copyToClipboard(link)
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Copy Link
                </Button>
                <Button 
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    const link = generateSignatureLink('medical-history')
                    window.open(link, '_blank')
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm text-blue-900">Treatment Plan</h4>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  onClick={() => {
                    const link = generateSignatureLink('treatment-plan')
                    copyToClipboard(link)
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Copy Link
                </Button>
                <Button 
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    const link = generateSignatureLink('treatment-plan')
                    window.open(link, '_blank')
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>How it works:</strong> Copy the link and send it to {clientName}. They can sign the document digitally and download the completed PDF.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-white border-2 border-lavender/200 shadow-sm">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-lavender data-[state=active]:text-white hover:bg-lavender/10 text-gray-700"
          >
            All Forms
          </TabsTrigger>
          <TabsTrigger 
            value="sent" 
            className="data-[state=active]:bg-lavender data-[state=active]:text-white hover:bg-lavender/10 text-gray-700"
          >
            Sent
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="data-[state=active]:bg-lavender data-[state=active]:text-white hover:bg-lavender/10 text-gray-700"
          >
            Completed
          </TabsTrigger>
          <TabsTrigger 
            value="expired" 
            className="data-[state=active]:bg-lavender data-[state=active]:text-white hover:bg-lavender/10 text-gray-700"
          >
            Expired
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredForms.length === 0 ? (
            <Card className="bg-gradient-to-r from-lavender/5 to-purple/5 border-2 border-lavender/200 shadow-sm">
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-lavender mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No consent forms found
                </h3>
                <p className="text-gray-700 mb-4">
                  {activeTab === "all" 
                    ? "Send your first consent form to get started"
                    : `No ${activeTab} forms found`
                  }
                </p>
                {activeTab === "all" && (
                  <SendConsentFormButton
                    clientId={clientId}
                    clientName={clientName}
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredForms.map((form) => {
                const status = statusConfig[form.status]
                const StatusIcon = status.icon
                
                return (
                  <Card key={form.id} className="bg-white border-2 border-lavender/100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3 bg-gradient-to-r from-lavender/5 to-purple/5 rounded-t-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-base font-semibold text-gray-900">
                              {formTypeLabels[form.formType] || form.formType}
                            </CardTitle>
                            <Badge 
                              variant="outline" 
                              className={`${status.color} border-2`}
                            >
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>
                          <CardDescription className="text-sm text-gray-700">
                            Sent via {form.sendMethod} to {form.contactInfo}
                            {form.completedAt && (
                              <span className="ml-2">
                                • Completed {new Date(form.completedAt).toLocaleDateString()}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0 bg-white">
                      {form.customMessage && (
                        <div className="mb-3 p-3 bg-gradient-to-r from-lavender/10 to-purple/10 rounded-lg border-l-4 border-lavender shadow-sm">
                          <p className="text-sm text-gray-800">{form.customMessage}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        {form.status === "completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadForm(form)}
                            className="flex-1 bg-white border-2 border-lavender/200 text-lavender hover:bg-lavender/10 hover:border-lavender/300"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </Button>
                        )}
                        
                        {form.status === "sent" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resendForm(form)}
                            className="flex-1 bg-white border-2 border-lavender/200 text-lavender hover:bg-lavender/10 hover:border-lavender/300"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Resend
                          </Button>
                        )}
                        
                        {form.status === "expired" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resendForm(form)}
                            className="flex-1 bg-white border-2 border-lavender/200 text-lavender hover:bg-lavender/10 hover:border-lavender/300"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Send New
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/forms/${clientId}/${form.token}`, '_blank')}
                          className="text-lavender hover:bg-lavender/10"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
