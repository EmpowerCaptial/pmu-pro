"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { RiskPill } from "@/components/ui/risk-pill"
import { EmptyState } from "@/components/ui/empty-state"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Users, Eye, Calendar, Phone, Mail } from "lucide-react"
import Link from "next/link"

// Mock data - in real app this would come from API/database
const mockClients = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+1-555-0123",
    lastVisit: "2024-01-15",
    totalAnalyses: 3,
    lastResult: "safe" as const,
    notes: "First-time PMU client, interested in microblading",
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    name: "Maria Garcia",
    email: "maria@example.com",
    phone: "+1-555-0124",
    lastVisit: "2024-01-12",
    totalAnalyses: 5,
    lastResult: "precaution" as const,
    notes: "Returning client for lip blush touch-up",
    createdAt: "2023-12-15",
  },
  {
    id: "3",
    name: "Emma Wilson",
    email: "emma@example.com",
    phone: "+1-555-0125",
    lastVisit: "2024-01-08",
    totalAnalyses: 2,
    lastResult: "safe" as const,
    notes: "Interested in eyebrow enhancement",
    createdAt: "2024-01-05",
  },
]

export function ClientList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [clients] = useState(mockClients)

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (clients.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-8 w-8" />}
        title="No clients yet"
        description="Start building your client base by adding your first PMU consultation."
        action={{
          label: "Add First Client",
          onClick: () => {
            // Navigate to new client page
            window.location.href = "/clients/new"
          },
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{clients.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">
                  {clients.filter((c) => new Date(c.createdAt) > new Date("2024-01-01")).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Analyses</p>
                <p className="text-2xl font-bold">{clients.reduce((sum, c) => sum + c.totalAnalyses, 0)}</p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client List */}
      <div className="space-y-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {client.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div>
                      <h3 className="text-lg font-semibold">{client.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{client.totalAnalyses} analyses</Badge>
                      <RiskPill risk={client.lastResult} />
                      <span className="text-xs text-muted-foreground">
                        Last visit: {new Date(client.lastVisit).toLocaleDateString()}
                      </span>
                    </div>
                    {client.notes && <p className="text-sm text-muted-foreground max-w-md">{client.notes}</p>}
                  </div>
                </div>
                <Link href={`/clients/${client.id}`}>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && searchQuery && (
        <EmptyState
          icon={<Search className="h-8 w-8" />}
          title="No clients found"
          description={`No clients match "${searchQuery}". Try adjusting your search terms.`}
        />
      )}
    </div>
  )
}
