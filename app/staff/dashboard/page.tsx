"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, AlertCircle, CheckCircle, Clock, FileText } from "lucide-react"
import Image from "next/image"

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState("artists")

  const pendingArtists = [
    { id: 1, name: "Sarah Johnson", email: "sarah@example.com", license: "CA-PMU-2024-001", status: "pending" },
    { id: 2, name: "Maria Garcia", email: "maria@example.com", license: "TX-PMU-2024-002", status: "review" },
  ]

  const workOrders = [
    { id: 1, artist: "Emma Wilson", issue: "Portfolio upload issue", priority: "high", created: "2024-01-15" },
    { id: 2, artist: "Lisa Chen", issue: "Billing question", priority: "medium", created: "2024-01-14" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-beige to-lavender/20">
      {/* Background logo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <Image
          src="/images/pmu-guide-logo.png"
          alt="PMU Guide Background"
          width={800}
          height={800}
          className="object-contain"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-lavender mb-2">Staff Dashboard</h1>
          <p className="text-gray-600">Manage artists, resolve issues, and oversee operations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-lavender/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Artists</p>
                  <p className="text-2xl font-bold text-lavender">12</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-lavender/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Artists</p>
                  <p className="text-2xl font-bold text-lavender">247</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-lavender/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Open Issues</p>
                  <p className="text-2xl font-bold text-lavender">8</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-lavender/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolved Today</p>
                  <p className="text-2xl font-bold text-lavender">15</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/80 backdrop-blur-sm border-lavender/20">
            <TabsTrigger value="artists">Artist Management</TabsTrigger>
            <TabsTrigger value="issues">Issues & Support</TabsTrigger>
            <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          </TabsList>

          <TabsContent value="artists" className="mt-6">
            <Card className="bg-white/80 backdrop-blur-sm border-lavender/20">
              <CardHeader>
                <CardTitle>Pending Artist Applications</CardTitle>
                <CardDescription>Review and approve new artist registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingArtists.map((artist) => (
                    <div
                      key={artist.id}
                      className="flex items-center justify-between p-4 border border-lavender/20 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{artist.name}</h4>
                        <p className="text-sm text-gray-600">{artist.email}</p>
                        <p className="text-sm text-gray-500">License: {artist.license}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={artist.status === "pending" ? "secondary" : "outline"}>{artist.status}</Badge>
                        <Button size="sm" className="bg-lavender hover:bg-lavender-600">
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues" className="mt-6">
            <Card className="bg-white/80 backdrop-blur-sm border-lavender/20">
              <CardHeader>
                <CardTitle>Work Orders & Support Issues</CardTitle>
                <CardDescription>Manage artist support requests and technical issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border border-lavender/20 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{order.artist}</h4>
                        <p className="text-sm text-gray-600">{order.issue}</p>
                        <p className="text-sm text-gray-500">Created: {order.created}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={order.priority === "high" ? "destructive" : "secondary"}>
                          {order.priority}
                        </Badge>
                        <Button size="sm" className="bg-lavender hover:bg-lavender-600">
                          Assign
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="onboarding" className="mt-6">
            <Card className="bg-white/80 backdrop-blur-sm border-lavender/20">
              <CardHeader>
                <CardTitle>Artist Onboarding</CardTitle>
                <CardDescription>Guide new approved artists through the setup process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-lavender mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Onboarding Tools</h3>
                  <p className="text-gray-600 mb-4">Help new artists get started with PMU Pro</p>
                  <Button className="bg-lavender hover:bg-lavender-600">Start Onboarding Session</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
