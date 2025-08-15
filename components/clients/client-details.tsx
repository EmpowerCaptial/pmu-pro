"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RiskPill } from "@/components/ui/risk-pill"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Phone, Mail, Calendar, FileText, Camera, Plus, Download, MessageSquare } from "lucide-react"
import Link from "next/link"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  notes?: string
  createdAt: string
}

interface ClientDetailsProps {
  client: Client
}

// Mock data for client history
const mockIntakes = [
  {
    id: "1",
    date: "2024-01-15",
    result: "safe" as const,
    conditions: ["none"],
    medications: ["none"],
    rationale: "No contraindications found. Client is suitable for PMU procedures.",
  },
  {
    id: "2",
    date: "2024-01-10",
    result: "precaution" as const,
    conditions: ["sensitive_skin"],
    medications: ["aspirin"],
    rationale: "Client takes aspirin and has sensitive skin. Recommend patch test.",
  },
]

const mockAnalyses = [
  {
    id: "1",
    date: "2024-01-15",
    fitzpatrick: 3,
    undertone: "neutral" as const,
    confidence: 0.92,
    recommendedPigments: ["Permablend Honey Magic", "Li Pigments Mocha"],
  },
  {
    id: "2",
    date: "2024-01-12",
    fitzpatrick: 3,
    undertone: "warm" as const,
    confidence: 0.88,
    recommendedPigments: ["Tina Davies Warm Brown", "Permablend Espresso"],
  },
]

export function ClientDetails({ client }: ClientDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/clients">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Clients
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {client.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold font-serif">{client.name}</h1>
              <p className="text-sm text-muted-foreground">
                Client since {new Date(client.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Edit className="h-4 w-4" />
            Edit Client
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Analysis
          </Button>
        </div>
      </div>

      {/* Client Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{client.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{client.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Last Visit</p>
                <p className="font-medium">Jan 15, 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="intakes">Intakes</TabsTrigger>
          <TabsTrigger value="analyses">Analyses</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Contraindication Screen</p>
                    <p className="text-sm text-muted-foreground">Jan 15, 2024</p>
                  </div>
                  <RiskPill risk="safe" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Skin Analysis</p>
                    <p className="text-sm text-muted-foreground">Jan 15, 2024</p>
                  </div>
                  <Badge variant="outline">Fitzpatrick III</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Previous Screen</p>
                    <p className="text-sm text-muted-foreground">Jan 10, 2024</p>
                  </div>
                  <RiskPill risk="precaution" />
                </div>
              </CardContent>
            </Card>

            {/* Client Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Client Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {client.notes ? (
                  <p className="text-sm">{client.notes}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No notes added yet.</p>
                )}
                <Button variant="outline" size="sm" className="mt-4 gap-2 bg-transparent">
                  <Edit className="h-4 w-4" />
                  Edit Notes
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="intakes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Contraindication History</h3>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Intake
            </Button>
          </div>
          <div className="space-y-4">
            {mockIntakes.map((intake) => (
              <Card key={intake.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <RiskPill risk={intake.result} />
                        <span className="text-sm text-muted-foreground">
                          {new Date(intake.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{intake.rationale}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Conditions: {intake.conditions.join(", ")}</span>
                        <span>Medications: {intake.medications.join(", ")}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analyses" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Skin Analysis History</h3>
            <Button size="sm" className="gap-2">
              <Camera className="h-4 w-4" />
              New Analysis
            </Button>
          </div>
          <div className="space-y-4">
            {mockAnalyses.map((analysis) => (
              <Card key={analysis.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">Fitzpatrick {analysis.fitzpatrick}</Badge>
                        <Badge variant="outline" className="capitalize">
                          {analysis.undertone} undertone
                        </Badge>
                        <Badge variant="outline">{Math.round(analysis.confidence * 100)}% confidence</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(analysis.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Recommended Pigments:</p>
                        <p className="text-sm text-muted-foreground">{analysis.recommendedPigments.join(", ")}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <FileText className="h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Notes & Observations</CardTitle>
              <CardDescription>Keep track of important client information and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm">{client.notes || "No notes added yet."}</p>
                </div>
                <Button className="gap-2">
                  <Edit className="h-4 w-4" />
                  Add Note
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
