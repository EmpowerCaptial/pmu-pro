"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, User, Send } from "lucide-react"
import Link from "next/link"
import { addClient } from "@/lib/client-storage"
import { ClientPortalService } from "@/lib/client-portal-service"
import { useDemoAuth } from "@/hooks/use-demo-auth"

export function NewClientForm() {
  const { currentUser } = useDemoAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPortalOption, setShowPortalOption] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Create new client with storage system
        const newClient = await addClient({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        notes: formData.notes,
        totalAnalyses: 0,
        allergies: [],
        medicalConditions: [],
        medications: [],
        previousPMU: false,
        skinConditions: [],
        photoConsent: false,
        medicalRelease: false,
        liabilityWaiver: false,
        aftercareAgreement: false
      }, currentUser?.email)

      // If portal access is requested, generate and show the link
      if (showPortalOption && newClient) {
        const portalService = ClientPortalService.getInstance()
        
        // Convert regular Client to EnhancedClientProfile
        const enhancedClient = {
          id: newClient.id,
          firstName: newClient.name.split(' ')[0] || newClient.name,
          lastName: newClient.name.split(' ').slice(1).join(' ') || '',
          email: newClient.email || '',
          phone: newClient.phone || '',
          createdAt: new Date(newClient.createdAt),
          updatedAt: new Date(newClient.updatedAt),
          pipeline: {
            id: `pipeline_${newClient.id}`,
            clientId: newClient.id,
            stage: 'lead' as const,
            probability: 0.5,
            estimatedValue: 500,
            nextAction: 'Schedule consultation',
            followUpDate: null,
            notes: [],
            createdAt: new Date(newClient.createdAt),
            updatedAt: new Date(newClient.updatedAt)
          },
          preferences: {
            preferredContact: 'email' as const,
            preferredTime: 'morning' as const,
            communicationFrequency: 'weekly' as const,
            specialRequirements: [],
            allergies: newClient.allergies || [],
            medicalConditions: newClient.medicalConditions || []
          },
          skinHistory: [],
          procedureHistory: [],
          aftercareStatus: {
            complianceScore: 0,
            lastCheckIn: new Date(),
            healingProgress: 0,
            issues: [],
            nextFollowUp: new Date(),
            completed: false
          },
          communicationHistory: [],
          financialHistory: [],
          notes: newClient.notes ? [newClient.notes] : [],
          tags: [],
          status: 'active' as const
        }
        
        const portalUser = portalService.createPortalAccess(enhancedClient)
        const portalLink = portalService.generatePortalAccessLink(newClient.id)
        alert(`Client created successfully!\n\nPortal access link for ${newClient.name}:\n\n${window.location.origin}${portalLink}`)
      }

      // Redirect to client list
      router.push("/clients")
    } catch (error) {
      // Silent error handling
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/clients">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Clients
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-serif">Add New Client</h1>
          <p className="text-sm text-muted-foreground">Create a new client profile for PMU consultations</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Client Information
          </CardTitle>
          <CardDescription>Enter the basic information for your new client</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter client's full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="client@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1-555-0123"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any relevant notes about the client, their preferences, or consultation goals..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={4}
              />
            </div>

            {/* Portal Access Option */}
            <div className="flex items-center space-x-2 p-4 bg-lavender/10 border border-lavender/20 rounded-lg">
              <input
                type="checkbox"
                id="portal-access"
                checked={showPortalOption}
                onChange={(e) => setShowPortalOption(e.target.checked)}
                className="rounded border-gray-300 text-lavender focus:ring-lavender"
              />
              <Label htmlFor="portal-access" className="text-sm font-medium text-gray-700">
                Generate portal access link after creating client
              </Label>
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t">
              <Link href="/clients">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading || !formData.name} className="gap-2">
                <Save className="h-4 w-4" />
                {isLoading ? "Creating..." : "Create Client"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
