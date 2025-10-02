"use client"

import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { getFormTemplate } from "@/lib/data/consent-form-templates"
import { ConsentForm, ConsentFormData } from "@/types/consent-forms"
import { SignaturePad } from "@/components/consent/signature-pad"
import { useFileUpload } from "@/hooks/use-file-upload"
import { FormRecovery } from "@/components/forms/form-recovery"

interface FormFieldData {
  [key: string]: string | boolean | string[]
}

export default function ClientConsentFormPage() {
  const params = useParams()
  const clientId = params.clientId as string
  const token = params.token as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [consentForm, setConsentForm] = useState<ConsentForm | null>(null)
  const [formTemplate, setFormTemplate] = useState<any>(null)

  const initialFormData: FormFieldData = {}

  // Simple form data state without auto-save for client forms
  const [formData, setFormData] = useState<FormFieldData>(initialFormData)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  const updateFormData = (updates: Partial<FormFieldData> | ((prev: FormFieldData) => FormFieldData)) => {
    setFormData(prev => {
      const newData = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates }
      setHasUnsavedChanges(true)
      return newData as FormFieldData
    })
  }
  
  const clearDraft = async () => {
    setFormData(initialFormData)
    setHasUnsavedChanges(false)
  }

  const { uploadFile, isUploading: isUploadingFile } = useFileUpload({
    fileType: 'signature',
    clientId,
    onSuccess: (file) => {
      updateFormData({ signatureImage: file.fileUrl })
    },
    onError: (error) => console.error('File upload error:', error)
  })

  useEffect(() => {
    loadFormData()
  }, [clientId, token])

  const loadFormData = async () => {
    try {
      setIsLoading(true)
      
      // Get localStorage data to pass to API
      const localStorageData = typeof window !== 'undefined' ? localStorage.getItem("consent-forms") : null
      
      // Load consent form data from API
      const response = await fetch(`/api/consent-forms/${clientId}/${token}`, {
        headers: {
          ...(localStorageData && { 'x-local-storage-data': localStorageData })
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Form not found or has expired")
        setIsLoading(false)
        return
      }
      
      const { form } = await response.json()
      
      if (form.status === "completed") {
        setIsSubmitted(true)
        setIsLoading(false)
        return
      }
      
      setConsentForm(form)
      
      // Load form template
      const template = getFormTemplate(form.formType as any)
      if (template) {
        setFormTemplate(template)
        
        // Initialize form data with empty values
        const initialData: FormFieldData = {}
        template.fields.forEach(field => {
          if (field.type === "checkbox") {
            initialData[field.id] = false
          } else if (field.type === "radio") {
            initialData[field.id] = ""
          } else {
            initialData[field.id] = ""
          }
        })
        // Update the auto-save form data
        updateFormData(initialData)
      }
      
      setIsLoading(false)
    } catch (error) {
      console.error("Error loading form:", error)
      setError("Failed to load form")
      setIsLoading(false)
    }
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    updateFormData({ [fieldId]: value })
  }

  const validateForm = (): boolean => {
    if (!formTemplate) return false
    
    for (const field of formTemplate.fields) {
      if (field.required) {
        const value = formData[field.id]
        
        if (field.type === "checkbox" && !value) {
          return false
        }
        
        if (field.type === "radio" && !value) {
          return false
        }
        
        if (field.type === "text" || field.type === "textarea" || field.type === "date" || field.type === "phone") {
          if (!value || value.toString().trim() === "") {
            return false
          }
        }
        
        if (field.type === "signature" && !value) {
          return false
        }
      }
    }
    
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError("Please complete all required fields")
      return
    }
    
    if (!consentForm || !formTemplate) {
      setError("Form data is missing. Please refresh the page and try again.")
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Create form submission data with better error handling
      const submissionData: ConsentFormData = {
        clientSignature: formData.clientSignature as string || "",
        clientName: formData.clientName as string || "",
        clientEmail: formData.clientEmail as string || "",
        clientPhone: formData.clientPhone as string || "",
        dateOfBirth: formData.dateOfBirth as string || "",
        emergencyContact: formData.emergencyContact ? {
          name: formData.emergencyContact as string || "",
          relationship: formData.emergencyRelationship as string || "",
          phone: formData.emergencyPhone as string || ""
        } : undefined,
        medicalHistory: {
          allergies: formData.allergies === "Yes" ? (formData.allergyDetails as string || "").split(",").map(s => s.trim()).filter(s => s) : [],
          medications: formData.medications === "Yes" ? (formData.medicationDetails as string || "").split(",").map(s => s.trim()).filter(s => s) : [],
          conditions: formData.medicalConditions === "Yes" ? (formData.conditionDetails as string || "").split(",").map(s => s.trim()).filter(s => s) : [],
          surgeries: []
        },
        consentAcknowledged: true,
        photoConsent: formData.photoConsent as boolean || false,
        marketingConsent: formData.marketingConsent as boolean || false,
        submittedAt: new Date(),
        ipAddress: "client-side", // In production, get from server
        userAgent: navigator.userAgent
      }
      
      console.log("Submitting form data:", submissionData)
      
      // Submit form data to API
      const response = await fetch(`/api/consent-forms/${clientId}/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: submissionData,
          clientSignature: formData.clientSignature as string
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Form submission error:", errorData)
        throw new Error(errorData.error || `Failed to submit form (${response.status})`)
      }
      
      // Create completion notification
      const notification = {
        id: `completed-${consentForm.id}-${Date.now()}`,
        type: "form-signed",
        clientId: consentForm.clientId,
        clientName: consentForm.clientName,
        formType: consentForm.formType,
        message: `${formTemplate.name} completed successfully`,
        timestamp: new Date(),
        isRead: false,
        actionRequired: false,
        priority: "low"
      }
      
      const existingNotifications = JSON.parse(localStorage.getItem("consent-notifications") || "[]")
      existingNotifications.push(notification)
      localStorage.setItem("consent-notifications", JSON.stringify(existingNotifications))
      
      const result = await response.json()
      setPdfUrl(result.pdfUrl)
      setIsSubmitted(true)
      
      // Clear the draft after successful submission
      await clearDraft()
      
    } catch (error) {
      console.error("Error submitting form:", error)
      setError(error instanceof Error ? error.message : "Failed to submit form. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: any) => {
    const value = formData[field.id]
    
    switch (field.type) {
      case "text":
        return (
          <Input
            id={field.id}
            value={value as string}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.helpText}
            className="w-full bg-white border-2 border-lavender/200 focus:border-lavender/500 text-gray-900 placeholder:text-gray-500 shadow-sm"
          />
        )
        
      case "email":
        return (
          <Input
            id={field.id}
            type="email"
            value={value as string}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder="Enter your email address"
            className="w-full bg-white border-2 border-lavender/200 focus:border-lavender/500 text-gray-900 placeholder:text-gray-500 shadow-sm"
          />
        )
        
      case "phone":
        return (
          <Input
            id={field.id}
            type="tel"
            value={value as string}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder="Enter your phone number"
            className="w-full bg-white border-2 border-lavender/200 focus:border-lavender/500 text-gray-900 placeholder:text-gray-500 shadow-sm"
          />
        )
        
      case "date":
        return (
          <Input
            id={field.id}
            type="date"
            value={value as string}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className="w-full bg-white border-2 border-lavender/200 focus:border-lavender/500 text-gray-900 shadow-sm"
          />
        )
        
      case "textarea":
        return (
          <Textarea
            id={field.id}
            value={value as string}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.helpText}
            className="w-full min-h-[100px] bg-white border-2 border-lavender/200 focus:border-lavender/500 text-gray-900 placeholder:text-gray-500 shadow-sm"
          />
        )
        
      case "checkbox":
        return (
          <div className="flex items-center space-x-2 p-3 bg-lavender/5 rounded-lg border border-lavender/100">
            <Checkbox
              id={field.id}
              checked={value as boolean}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
              className="border-2 border-lavender/300 data-[state=checked]:bg-lavender data-[state=checked]:border-lavender"
            />
            <Label htmlFor={field.id} className="text-sm font-normal text-gray-900">
              {field.label}
            </Label>
          </div>
        )
        
      case "radio":
        return (
          <RadioGroup
            value={value as string}
            onValueChange={(val) => handleFieldChange(field.id, val)}
            className="space-y-2"
          >
            {field.options?.map((option: string) => (
              <div key={option} className="flex items-center space-x-2 p-3 bg-lavender/5 rounded-lg border border-lavender/100">
                <RadioGroupItem 
                  value={option} 
                  id={`${field.id}-${option}`} 
                  className="border-2 border-lavender/300 data-[state=checked]:bg-lavender data-[state=checked]:border-lavender"
                />
                <Label htmlFor={`${field.id}-${option}`} className="text-sm font-normal text-gray-900">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )
        
      case "signature":
        return (
          <SignaturePad
            onSignature={(signature) => handleFieldChange(field.id, signature)}
            value={value as string}
          />
        )
        
      default:
        return (
          <Input 
            value={value as string} 
            onChange={(e) => handleFieldChange(field.id, e.target.value)} 
            className="w-full bg-white border-2 border-lavender/200 focus:border-lavender/500 text-gray-900 shadow-sm"
          />
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-lavender-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-lavender mx-auto mb-4" />
          <p className="text-gray-600">Loading consent form...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-lavender-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Form Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-lavender-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-green-600">Form Submitted Successfully!</CardTitle>
            <CardDescription>
              Thank you for completing the consent form. Your artist has been notified.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              You can close this window. Your signed form has been saved to your profile.
            </p>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              ✅ Completed
            </Badge>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-lavender-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-green-600 text-2xl">Form Submitted Successfully!</CardTitle>
            <CardDescription className="text-lg">
              Thank you for completing your consent form. Your information has been securely recorded and your PMU artist has been notified.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {pdfUrl && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Download your completed form:</p>
                <Button 
                  asChild
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4 mr-2" />
                    Download PDF
                  </a>
                </Button>
              </div>
            )}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <p className="text-sm text-gray-600">
                <strong>What happens next:</strong>
              </p>
              <ul className="text-xs text-gray-500 space-y-1 text-left">
                <li>• Your PMU artist has been notified of your completed form</li>
                <li>• The form will appear in your client profile</li>
                <li>• You can download the PDF for your records</li>
                <li>• Your artist will review the form before your appointment</li>
              </ul>
              <p className="text-sm text-gray-500 mt-4">
                You can now close this window. Your form is safely stored in the system.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!formTemplate || !consentForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-lavender-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Form Not Found</CardTitle>
            <CardDescription>
              The requested consent form could not be found.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-lavender-50 to-blue-50 p-4 pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Card className="mb-6 border-0 bg-white/90 backdrop-blur-sm shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-lavender rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {formTemplate.name}
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              {formTemplate.description}
            </CardDescription>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                Client: {consentForm.clientName}
              </Badge>
              <Badge variant="outline" className="bg-purple-100 text-purple-800">
                {formTemplate.required ? "Required" : "Optional"}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Form */}
        <Card className="border-0 bg-white shadow-xl">
          <CardContent className="p-6">
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
              {formTemplate.fields
                .sort((a: any, b: any) => a.order - b.order)
                .map((field: any) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id} className="text-sm font-semibold text-gray-900">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    
                    {renderField(field)}
                    
                    {field.helpText && (
                      <p className="text-xs text-gray-600 bg-lavender/5 p-2 rounded border-l-2 border-lavender/20">
                        {field.helpText}
                      </p>
                    )}
                  </div>
                ))}
              
              <div className="pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={isSubmitting || !validateForm()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Consent Form"
                  )}
                </Button>
                
                {!validateForm() && (
                  <p className="text-sm text-red-600 text-center mt-2">
                    Please complete all required fields
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Form Recovery Component - Disabled for client forms */}
      {/* <FormRecovery
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={false}
        lastSaved={null}
        onSave={() => {}}
        onDiscard={clearDraft}
        formName="consent form"
        isSubmitting={isSubmitting}
      /> */}
    </div>
  )
}
