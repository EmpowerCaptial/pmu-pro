"use client"

import { useState } from "react"
import { NavBar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function EditClientPage({ params }: { params: { id: string } }) {
  const [client, setClient] = useState({
    id: params.id,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+1-555-0123",
    notes: "First-time PMU client, interested in microblading",
    address: "123 Main St, Los Angeles, CA",
    emergencyContact: "John Johnson - (555) 456-7890",
  })

  const handleSave = () => {
    // Save client data
    const existingClients = JSON.parse(localStorage.getItem("pmu_clients") || "[]")
    const updatedClients = existingClients.map((c: any) => (c.id === client.id ? { ...c, ...client } : c))
    localStorage.setItem("pmu_clients", JSON.stringify(updatedClients))
    alert("Client information updated successfully!")
    window.location.href = "/clients"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <NavBar currentPath="/clients" user={{ name: "Demo Artist", email: "demo@pmupro.com", initials: "DA" }} />

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
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={client.address}
                  onChange={(e) => setClient({ ...client, address: e.target.value })}
                />
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
