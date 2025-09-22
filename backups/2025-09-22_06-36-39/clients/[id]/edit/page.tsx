"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/ui/navbar"
import { useDemoAuth } from "@/hooks/use-demo-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { getClientById, updateClient, type Client as ClientData } from "@/lib/client-storage"

export default function EditClientPage({ params }: { params: { id: string } }) {
  const { currentUser, isAuthenticated } = useDemoAuth()
  const [client, setClient] = useState({
    id: params.id,
    name: "",
    email: "",
    phone: "",
    notes: "",
    emergencyContact: "",
  })
  const [loading, setLoading] = useState(true)
  const [originalClient, setOriginalClient] = useState<ClientData | null>(null)

  useEffect(() => {
    const loadClientData = () => {
      console.log('Loading client data for editing, ID:', params.id)
      
      // Load actual client data from storage
      const actualClient = getClientById(params.id)
      console.log('Found actual client for editing:', actualClient)
      
      if (actualClient) {
        setOriginalClient(actualClient)
        setClient({
          id: actualClient.id,
          name: actualClient.name || "",
          email: actualClient.email || "",
          phone: actualClient.phone || "",
          notes: actualClient.notes || "",
          emergencyContact: actualClient.emergencyContact || "",
        })
      } else {
        console.error('No client found for editing with ID:', params.id)
      }
      
      setLoading(false)
    }

    loadClientData()
  }, [params.id])

  const handleSave = () => {
    if (!originalClient) {
      alert("Error: Original client data not found!")
      return
    }

    try {
      // Update the client with new data
      const updatedClient = {
        ...originalClient,
        name: client.name,
        email: client.email,
        phone: client.phone,
        notes: client.notes,
        emergencyContact: client.emergencyContact,
        updatedAt: new Date().toISOString()
      }

      const success = updateClient(params.id, updatedClient)
      
      if (success) {
        alert("Client information updated successfully!")
        window.location.href = "/clients"
      } else {
        alert("Error updating client. Please try again.")
      }
    } catch (error) {
      console.error('Error saving client:', error)
      alert("Error saving client data. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lavender mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading client data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!originalClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
              <h2 className="text-xl font-semibold text-red-800 mb-2">Client Not Found</h2>
              <p className="text-red-600 mb-4">
                Could not find client with ID: <code className="bg-red-100 px-2 py-1 rounded">{params.id}</code>
              </p>
              <Link href="/clients">
                <Button variant="outline">
                  Back to Client List
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <NavBar 
        currentPath="/clients" 
        user={currentUser ? {
          name: currentUser.name,
          email: currentUser.email,
          initials: currentUser.name?.split(' ').map(n => n[0]).join('') || currentUser.email.charAt(0).toUpperCase()
        } : undefined} 
      />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/clients">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <ArrowLeft className="h-4 w-4" />
                Back to Clients
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Edit Client</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={client.name}
                    onChange={(e) => setClient({ ...client, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={client.email}
                    onChange={(e) => setClient({ ...client, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={client.phone}
                    onChange={(e) => setClient({ ...client, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="emergency">Emergency Contact</Label>
                  <Input
                    id="emergency"
                    value={client.emergencyContact}
                    onChange={(e) => setClient({ ...client, emergencyContact: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={client.notes}
                  onChange={(e) => setClient({ ...client, notes: e.target.value })}
                  rows={4}
                />
              </div>

              <Button onClick={handleSave} className="w-full gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
