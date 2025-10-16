"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, Save, FileText, User, Calendar } from "lucide-react"
import Link from "next/link"
import { useDemoAuth } from "@/hooks/use-demo-auth"
import { useAutoSave } from "@/hooks/use-auto-save"
import { useFileUpload } from "@/hooks/use-file-upload"
import { FormRecovery } from "@/components/forms/form-recovery"
import { NavBar } from "@/components/ui/navbar"

interface ClientData {
  fullName: string
  dateOfBirth: string
  address: string
  phone: string
  email: string
  emergencyContact: string
  emergencyPhone: string
  occupation: string
  medicalHistory: string[]
  allergies: string
  medications: string
  photoConsent: boolean
  procedureConsent: boolean
  idDocument?: File
  idDocumentUrl?: string
  signatureImage?: string
}

export default function ClientIntakePage() {
  const { currentUser } = useDemoAuth()
  
  const initialData: ClientData = {
    fullName: "",
    dateOfBirth: "",
    address: "",
    phone: "",
    email: "",
    emergencyContact: "",
    emergencyPhone: "",
    occupation: "",
    medicalHistory: [],
    allergies: "",
    medications: "",
    photoConsent: false,
    procedureConsent: false,
  }

  const {
    formData: clientData,
    updateFormData,
    saveForm,
    clearDraft,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    error: saveError
  } = useAutoSave(initialData, {
    formType: 'client_intake',
    onSave: (data) => console.log('Client intake auto-saved:', data),
    onError: (error) => console.error('Auto-save error:', error)
  })

  const { uploadFile, isUploading: isUploadingFile } = useFileUpload({
    fileType: 'id_document',
    onSuccess: (file) => {
      updateFormData({ idDocumentUrl: file.fileUrl })
    },
    onError: (error) => console.error('File upload error:', error)
  })

  const [idUpload, setIdUpload] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const medicalConditions = [
    "Diabetes",
    "Epilepsy/Seizures",
    "Skin Disorders (eczema, psoriasis, etc.)",
    "Heart Conditions",
    "Blood Disorders",
    "Keloid Scarring",
    "Pregnancy or Nursing",
    "Previous Permanent Makeup/Tattoos",
  ]

  const handleInputChange = (field: keyof ClientData, value: string | boolean | string[]) => {
    updateFormData({ [field]: value })
  }

  const handleMedicalHistoryChange = (condition: string, checked: boolean) => {
    const updated = checked
      ? [...clientData.medicalHistory, condition]
      : clientData.medicalHistory.filter((c) => c !== condition)
    handleInputChange("medicalHistory", updated)
  }

  const handleIdUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIdUpload(file)
      await uploadFile(file)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Save form as complete
      const success = await saveForm(clientData, true)
      
      if (success) {
        alert("Client intake completed successfully!")
        // Clear draft after successful submission
        await clearDraft()
        setIdUpload(null)
      } else {
        alert("Failed to submit form. Please try again.")
      }
    } catch (error) {
      console.error("Intake submission error:", error)
      alert("Error submitting intake. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 to-white p-6">
      {/* Watermark Logo */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="opacity-[0.08] max-w-2xl w-full">
          <img src="/images/pmu-guide-logo.png" alt="PMU Guide Logo" className="w-full h-auto object-contain" />
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        <NavBar 
          currentPath="/client-intake"
          user={currentUser ? {
            name: currentUser.name,
            email: currentUser.email,
            initials: currentUser.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U',
            avatar: currentUser.avatar
          } : undefined} 
        />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-serif">Client Intake System</h1>
            <p className="text-gray-600 mt-2">Complete client information and document management</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="border-lavender text-lavender hover:bg-lavender/10 bg-transparent">
              Return to Dashboard
            </Button>
          </Link>
        </div>

        {/* Client Information */}
        <Card className="border-lavender/30 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-lavender" />
              Client Information
            </CardTitle>
            <CardDescription>Basic client demographics and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={clientData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Enter full legal name"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={clientData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={clientData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={clientData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="client@example.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={clientData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Street address, city, state, zip"
                rows={2}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={clientData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  placeholder="Emergency contact name"
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                <Input
                  id="emergencyPhone"
                  value={clientData.emergencyPhone}
                  onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                  placeholder="Emergency contact phone"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ID Document Upload */}
        <Card className="border-lavender/30 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-lavender" />
              Identification Document
            </CardTitle>
            <CardDescription>Upload a clear photo of government-issued ID for verification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-lavender/30 rounded-lg p-6 text-center">
              <input type="file" id="idUpload" accept="image/*,.pdf" onChange={handleIdUpload} className="hidden" />
              <label htmlFor="idUpload" className="cursor-pointer">
                <Upload className="h-12 w-12 text-lavender mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700">
                  {idUpload ? idUpload.name : "Click to upload ID document"}
                </p>
                <p className="text-sm text-gray-500 mt-2">Accepted formats: JPG, PNG, PDF (max 10MB)</p>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Medical History */}
        <Card className="border-lavender/30 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-lavender" />
              Medical History Checklist
            </CardTitle>
            <CardDescription>Check all conditions that apply to the client</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              {medicalConditions.map((condition) => (
                <div key={condition} className="flex items-center space-x-2">
                  <Checkbox
                    id={condition}
                    checked={clientData.medicalHistory.includes(condition)}
                    onCheckedChange={(checked) => handleMedicalHistoryChange(condition, checked as boolean)}
                  />
                  <Label htmlFor={condition} className="text-sm">
                    {condition}
                  </Label>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="allergies">Allergies (please specify)</Label>
                <Input
                  id="allergies"
                  value={clientData.allergies}
                  onChange={(e) => handleInputChange("allergies", e.target.value)}
                  placeholder="List any known allergies (inks, metals, latex, etc.)"
                />
              </div>
              <div>
                <Label htmlFor="medications">Current Medications</Label>
                <Textarea
                  id="medications"
                  value={clientData.medications}
                  onChange={(e) => handleInputChange("medications", e.target.value)}
                  placeholder="List all current medications and supplements"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consent Forms */}
        <Card className="border-lavender/30 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Consent & Acknowledgment</CardTitle>
            <CardDescription>Required consents and liability waivers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="procedureConsent"
                checked={clientData.procedureConsent}
                onCheckedChange={(checked) => handleInputChange("procedureConsent", checked as boolean)}
              />
              <Label htmlFor="procedureConsent" className="text-sm leading-relaxed">
                I understand that permanent makeup is a form of tattooing and acknowledge all inherent risks including
                infection, allergic reaction, scarring, and dissatisfaction with results. I release and hold harmless
                the artist and PMU-GUIDE from any liability.
              </Label>
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="photoConsent"
                checked={clientData.photoConsent}
                onCheckedChange={(checked) => handleInputChange("photoConsent", checked as boolean)}
              />
              <Label htmlFor="photoConsent" className="text-sm leading-relaxed">
                I consent to photographs/videos being taken before, during, and after my procedure(s) for documentation,
                educational, and promotional purposes by PMU-GUIDE.
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !clientData.fullName || !clientData.procedureConsent}
            className="bg-lavender hover:bg-lavender-600 text-white px-8"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save Client Intake"}
          </Button>
        </div>
      </div>

      {/* Form Recovery Component */}
      <FormRecovery
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        lastSaved={lastSaved}
        onSave={() => saveForm(clientData, false)}
        onDiscard={clearDraft}
        formName="client intake form"
      />
    </div>
  )
}
