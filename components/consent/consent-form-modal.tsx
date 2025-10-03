"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Send, Mail, MessageSquare, FileText, X, CheckCircle } from "lucide-react"
import { getTemplateNames } from "@/lib/data/consent-form-templates"
import { useDemoAuth } from "@/hooks/use-demo-auth"

interface ConsentFormModalProps {
  isOpen: boolean
  onClose: () => void
  clientId?: string
  clientName?: string
}

const formTemplates = getTemplateNames()

export function ConsentFormModal({ isOpen, onClose, clientId, clientName }: ConsentFormModalProps) {
  const { currentUser } = useDemoAuth()
  const [selectedForm, setSelectedForm] = useState("")
  const [sendMethod, setSendMethod] = useState<"email" | "sms">("email")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [customMessage, setCustomMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSend = async () => {
    if (!selectedForm) {
      alert("Please select a form template")
      return
    }

    if (sendMethod === "email" && !email) {
      alert("Please enter an email address")
      return
    }

    if (sendMethod === "sms" && !phone) {
      alert("Please enter a phone number")
      return
    }

    setIsSending(true)

    try {
      // Generate unique token
      const token = generateToken()
      
      // Create consent form record
      const formData = {
        id: `form_${Date.now()}`,
        clientId: clientId || "new-client",
        clientName: clientName || "New Client",
        artistEmail: currentUser?.email || 'artist@example.com',
        formType: selectedForm,
        sendMethod,
        contactInfo: sendMethod === "email" ? email : phone,
        customMessage,
        token,
        createdAt: new Date(),
        sentAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: "sent",
        reminderSent: false
      }

      // Store form data in API for client access
      try {
        const response = await fetch(`/api/consent-forms/${clientId || "new-client"}/${token}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        })

        if (!response.ok) {
          console.error('Failed to store form data:', await response.text())
          // Don't fail the entire process if API storage fails
          console.log('Continuing with localStorage storage...')
        } else {
          console.log('Form data stored successfully in API')
        }
      } catch (storeError) {
        console.error('Error storing form data:', storeError)
        // Don't fail the entire process if API storage fails
        console.log('Continuing with localStorage storage...')
      }

      // Also save to localStorage for admin view
      const existingForms = JSON.parse(localStorage.getItem("consent-forms") || "[]")
      existingForms.push(formData)
      localStorage.setItem("consent-forms", JSON.stringify(existingForms))

      // Send real email if email method selected
      if (sendMethod === "email") {
        try {
          const formLink = `https://thepmuguide.com/forms/${clientId || "new-client"}/${token}`
          
          // Call API endpoint to send email
          const response = await fetch('/api/send-consent-form', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: email,
              formType: selectedForm,
              formLink,
              customMessage,
              clientName
            })
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to send email')
          }
          
          console.log("✅ Real email sent successfully to:", email)
        } catch (emailError) {
          console.error("❌ Email sending failed:", emailError)
          alert("Form saved but email failed to send. Please check the email address and try again.")
        }
      }

      setIsSent(true)
      alert("Consent form sent successfully!")
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSent(false)
        onClose()
        resetForm()
      }, 3000)

    } catch (error) {
      alert("Failed to send consent form. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const generateToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }



  const resetForm = () => {
    setSelectedForm("")
    setSendMethod("email")
    setEmail("")
    setPhone("")
    setCustomMessage("")
    setIsSent(false)
  }

  const getFormLink = () => {
    if (!selectedForm) return ""
    const token = generateToken()
    return `https://thepmuguide.com/forms/${clientId || "new"}/${token}`
  }

  if (isSent) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center space-y-4 py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Form Sent Successfully!</h3>
            <p className="text-gray-600">
              Your consent form has been sent to the client. They will receive a secure link to complete the form.
            </p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 font-mono break-all">
                {getFormLink()}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-2 border-lavender/30 shadow-xl">
        <DialogHeader className="bg-gradient-to-r from-lavender/10 to-purple/10 p-4 rounded-t-lg border-b border-lavender/20">
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <FileText className="h-5 w-5 text-purple-600" />
            Send Consent Form
          </DialogTitle>
          <DialogDescription className="text-gray-700">
            Select a form template and send it to your client via email or SMS
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 p-4">
          {/* Form Template Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900">Select Form Template</Label>
            <Select value={selectedForm} onValueChange={setSelectedForm}>
              <SelectTrigger className="w-full bg-white border-2 border-lavender/200 hover:border-lavender/300 focus:border-lavender/500">
                <SelectValue placeholder="Choose a form template" className="text-gray-700" />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-lavender/200 shadow-lg">
                {formTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id} className="hover:bg-lavender/10 focus:bg-lavender/20">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{template.name}</span>
                      <span className="text-xs text-gray-600">{template.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Send Method Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900">Send Method</Label>
            <div className="flex gap-3">
              <Button
                variant={sendMethod === "email" ? "default" : "outline"}
                onClick={() => setSendMethod("email")}
                className={`flex-1 ${
                  sendMethod === "email" 
                    ? "bg-lavender hover:bg-lavender/90 text-white" 
                    : "bg-white border-2 border-lavender/200 text-lavender hover:bg-lavender/10"
                }`}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                variant={sendMethod === "sms" ? "default" : "outline"}
                onClick={() => setSendMethod("sms")}
                className={`flex-1 ${
                  sendMethod === "sms" 
                    ? "bg-lavender hover:bg-lavender/90 text-white" 
                    : "bg-white border-2 border-lavender/200 text-lavender hover:bg-lavender/10"
                }`}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                SMS
              </Button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900">
              {sendMethod === "email" ? "Email Address" : "Phone Number"}
            </Label>
            {sendMethod === "email" ? (
              <Input
                type="email"
                placeholder="client@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border-2 border-lavender/200 focus:border-lavender/500 text-gray-900 placeholder:text-gray-500"
              />
            ) : (
              <Input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border-2 border-lavender/200 focus:border-lavender/500 text-gray-900 placeholder:text-gray-500"
              />
            )}
          </div>

          {/* Custom Message */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-900">Custom Message (Optional)</Label>
            <Textarea
              placeholder="Add a personal message to include with the form..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full min-h-[100px] bg-white border-2 border-lavender/200 focus:border-lavender/500 text-gray-900 placeholder:text-gray-500"
            />
          </div>

          {/* Preview */}
          {selectedForm && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-900">Form Preview</Label>
              <Card className="bg-gradient-to-r from-lavender/5 to-purple/5 border-2 border-lavender/200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {formTemplates.find(t => t.id === selectedForm)?.name}
                      </h4>
                      <p className="text-sm text-gray-700">
                        {formTemplates.find(t => t.id === selectedForm)?.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-lavender/300 text-lavender-700 bg-lavender/10">
                      {sendMethod.toUpperCase()}
                    </Badge>
                  </div>
                  {customMessage && (
                    <div className="mt-3 p-3 bg-white rounded-lg border-l-4 border-lavender shadow-sm">
                      <p className="text-sm text-gray-800">{customMessage}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-white border-2 border-lavender/200 text-lavender hover:bg-lavender/10 hover:border-lavender/300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={!selectedForm || isSending}
              className="flex-1 bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-700 hover:to-lavender-800 text-white shadow-lg"
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Form
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
