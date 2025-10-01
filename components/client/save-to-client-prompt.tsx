"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { User, FileText, Plus, Save, X } from "lucide-react"

export interface ToolResult {
  type: 'intake' | 'consent' | 'skin-analysis' | 'color-correction' | 'procell-analysis'
  data: any
  timestamp: string
  toolName: string
}

interface SaveToClientPromptProps {
  toolResult: ToolResult
  onSave: (clientId: string, result: ToolResult) => void
  onSkip: () => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function SaveToClientPrompt({ toolResult, onSave, onSkip, isOpen, onOpenChange }: SaveToClientPromptProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [showNewClientForm, setShowNewClientForm] = useState(false)
  const [newClientData, setNewClientData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    emergencyContact: "",
    medicalHistory: "",
    allergies: "",
    skinType: "",
    notes: ""
  })

  // Mock client data - replace with actual API call
  const mockClients = [
    { id: "1", name: "Sarah Johnson", email: "sarah@example.com", phone: "(555) 123-4567" },
    { id: "2", name: "Mike Chen", email: "mike@example.com", phone: "(555) 234-5678" },
    { id: "3", name: "Emily Davis", email: "emily@example.com", phone: "(555) 345-6789" }
  ]

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSaveToExistingClient = () => {
    if (selectedClientId) {
      onSave(selectedClientId, toolResult)
      onOpenChange(false)
    }
  }

  const handleCreateNewClient = async () => {
    try {
      // Create new client via API
      // Get user email from localStorage or context
      const userEmail = localStorage.getItem('userEmail') || ''
      
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': userEmail
        },
        body: JSON.stringify(newClientData)
      })

      if (response.ok) {
        const newClient = await response.json()
        // Save tool result to new client
        onSave(newClient.id, toolResult)
        onOpenChange(false)
        setShowNewClientForm(false)
        setNewClientData({
          name: "", email: "", phone: "", dateOfBirth: "", 
          emergencyContact: "", medicalHistory: "", allergies: "", 
          skinType: "", notes: ""
        })
      }
    } catch (error) {
      console.error('Error creating client:', error)
    }
  }

  const getToolIcon = (type: string) => {
    switch (type) {
      case 'intake': return <FileText className="h-5 w-5" />
      case 'consent': return <FileText className="h-5 w-5" />
      case 'skin-analysis': return <User className="h-5 w-5" />
      case 'color-correction': return <User className="h-5 w-5" />
      case 'procell-analysis': return <User className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
    }
  }

  const getToolColor = (type: string) => {
    switch (type) {
      case 'intake': return 'bg-blue-100 text-blue-800'
      case 'consent': return 'bg-green-100 text-green-800'
      case 'skin-analysis': return 'bg-purple-100 text-purple-800'
      case 'color-correction': return 'bg-orange-100 text-orange-800'
      case 'procell-analysis': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-blue-600" />
            Save to Client File
          </DialogTitle>
          <DialogDescription>
            Save your {toolResult.toolName} results to a client file for future reference and comprehensive client management.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tool Result Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                {getToolIcon(toolResult.type)}
                <Badge className={getToolColor(toolResult.type)}>
                  {toolResult.toolName}
                </Badge>
                <span className="text-gray-500">
                  {new Date(toolResult.timestamp).toLocaleDateString()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                Results ready to save: {Object.keys(toolResult.data).length} data points
              </div>
            </CardContent>
          </Card>

          {/* Client Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Select Client</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewClientForm(!showNewClientForm)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Client
              </Button>
            </div>

            {!showNewClientForm ? (
              <>
                <Input
                  placeholder="Search clients by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedClientId === client.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedClientId(client.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-gray-600">{client.email}</div>
                          <div className="text-sm text-gray-500">{client.phone}</div>
                        </div>
                        {selectedClientId === client.id && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            Selected
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* New Client Form */
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">New Client Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={newClientData.name}
                        onChange={(e) => setNewClientData({...newClientData, name: e.target.value})}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newClientData.email}
                        onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                        placeholder="Enter email"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newClientData.phone}
                        onChange={(e) => setNewClientData({...newClientData, phone: e.target.value})}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={newClientData.dateOfBirth}
                        onChange={(e) => setNewClientData({...newClientData, dateOfBirth: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      value={newClientData.emergencyContact}
                      onChange={(e) => setNewClientData({...newClientData, emergencyContact: e.target.value})}
                      placeholder="Emergency contact name and phone"
                    />
                  </div>

                  <div>
                    <Label htmlFor="medicalHistory">Medical History</Label>
                    <Textarea
                      id="medicalHistory"
                      value={newClientData.medicalHistory}
                      onChange={(e) => setNewClientData({...newClientData, medicalHistory: e.target.value})}
                      placeholder="Any relevant medical history, conditions, or medications"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="allergies">Allergies</Label>
                      <Input
                        id="allergies"
                        value={newClientData.allergies}
                        onChange={(e) => setNewClientData({...newClientData, allergies: e.target.value})}
                        placeholder="Known allergies"
                      />
                    </div>
                    <div>
                      <Label htmlFor="skinType">Skin Type</Label>
                      <Select
                        value={newClientData.skinType}
                        onValueChange={(value) => setNewClientData({...newClientData, skinType: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select skin type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fitzpatrick I">Fitzpatrick I - Very Fair</SelectItem>
                          <SelectItem value="Fitzpatrick II">Fitzpatrick II - Fair</SelectItem>
                          <SelectItem value="Fitzpatrick III">Fitzpatrick III - Medium</SelectItem>
                          <SelectItem value="Fitzpatrick IV">Fitzpatrick IV - Olive</SelectItem>
                          <SelectItem value="Fitzpatrick V">Fitzpatrick V - Dark</SelectItem>
                          <SelectItem value="Fitzpatrick VI">Fitzpatrick VI - Very Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={newClientData.notes}
                      onChange={(e) => setNewClientData({...newClientData, notes: e.target.value})}
                      placeholder="Any additional notes or observations"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onSkip}>
            <X className="h-4 w-4 mr-2" />
            Skip - Use Tool Only
          </Button>
          
          {showNewClientForm ? (
            <Button 
              onClick={handleCreateNewClient}
              disabled={!newClientData.name.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              Create Client & Save
            </Button>
          ) : (
            <Button 
              onClick={handleSaveToExistingClient}
              disabled={!selectedClientId}
            >
              <Save className="h-4 w-4 mr-2" />
              Save to Client File
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
