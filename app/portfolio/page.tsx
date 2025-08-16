"use client"

import { useState } from "react"
import { NavBar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Send, Eye, Trash2, Plus, Share } from "lucide-react"

interface PortfolioItem {
  id: string
  type: "eyebrows" | "lips" | "eyeliner"
  title: string
  description: string
  beforeImage: string
  afterImage: string
  date: string
}

export default function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([
    {
      id: "1",
      type: "eyebrows",
      title: "Natural Microblading",
      description: "Hair-stroke technique for natural-looking brows",
      beforeImage: "/images/portfolio-screenshot.png", // Using actual uploaded client images
      afterImage: "/images/analysis-report-screenshot.png",
      date: "2024-01-15",
    },
    {
      id: "2",
      type: "lips",
      title: "Lip Blush Enhancement",
      description: "Subtle color enhancement for natural lips",
      beforeImage: "/images/treatment-protocol-screenshot.png", // Real client work images
      afterImage: "/images/contraindication-screenshot.png",
      date: "2024-01-10",
    },
    {
      id: "3",
      type: "eyeliner",
      title: "Classic Eyeliner",
      description: "Defined lash line enhancement",
      beforeImage: "/before-eyeliner.png",
      afterImage: "/classic-eyeliner-look.png",
      date: "2024-01-05",
    },
  ])

  const [selectedClient, setSelectedClient] = useState("")
  const [shareMessage, setShareMessage] = useState(
    "Check out my PMU work! I specialize in natural-looking permanent makeup.",
  )

  const handleSendPortfolio = async () => {
    try {
      const selectedImages = portfolioItems.filter(
        (item) =>
          // Logic to determine which images to share based on client inquiry
          item.type === "eyebrows" || item.type === "lips",
      )

      const portfolioData = {
        clientEmail: selectedClient,
        message: shareMessage,
        portfolioItems: selectedImages,
        artistInfo: {
          name: "Sarah Johnson",
          specialties: ["Microblading", "Lip Blush", "Eyeliner"],
          experience: "5+ years",
        },
      }

      const response = await fetch("/api/portfolio/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(portfolioData),
      })

      if (response.ok) {
        console.log("Portfolio sent successfully to:", selectedClient)
        // Show success message
      }
    } catch (error) {
      console.error("Failed to send portfolio:", error)
    }
  }

  const getItemsByType = (type: string) => {
    return portfolioItems.filter((item) => item.type === type)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/20 via-beige/30 to-ivory">
      {/* Background Logo */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <img src="/images/pmu-guide-logo.png" alt="PMU Guide Logo" className="w-96 h-96 opacity-5 object-contain" />
      </div>

      <NavBar currentPath="/portfolio" user={{ name: "Sarah Johnson", email: "sarah@pmuartist.com", initials: "SJ" }} />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-serif text-ink">My Portfolio</h1>
              <p className="text-muted-foreground">Showcase your PMU work to potential clients</p>
            </div>
            <div className="flex space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-white/90 backdrop-blur-sm border border-lavender text-lavender hover:bg-lavender hover:text-white font-semibold">
                    <Share className="h-4 w-4 mr-2" />
                    Send to Client
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white/95 backdrop-blur-sm">
                  <DialogHeader>
                    <DialogTitle>Send Portfolio to Client</DialogTitle>
                    <DialogDescription>Share your portfolio with a potential client</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-email">Client Email</Label>
                      <Input
                        id="client-email"
                        placeholder="client@example.com"
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Personal Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Add a personal message..."
                        value={shareMessage}
                        onChange={(e) => setShareMessage(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleSendPortfolio} className="w-full bg-lavender hover:bg-lavender-600">
                      <Send className="h-4 w-4 mr-2" />
                      Send Portfolio
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button className="bg-white/90 backdrop-blur-sm border border-lavender text-lavender hover:bg-lavender hover:text-white font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Add Work
              </Button>
            </div>
          </div>

          {/* Portfolio Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/90 backdrop-blur-sm">
              <TabsTrigger value="all" className="font-semibold">
                All Work
              </TabsTrigger>
              <TabsTrigger value="eyebrows" className="font-semibold">
                EYEBROWS
              </TabsTrigger>
              <TabsTrigger value="lips" className="font-semibold">
                LIPS
              </TabsTrigger>
              <TabsTrigger value="eyeliner" className="font-semibold">
                EYELINER
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioItems.map((item) => (
                  <Card key={item.id} className="bg-white/90 backdrop-blur-sm border-lavender/20 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-lavender/20 text-lavender font-bold">
                          {item.type.toUpperCase()}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="text-lg font-serif">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold">BEFORE</Label>
                          <img
                            src={item.beforeImage || "/placeholder.svg"}
                            alt="Before"
                            className="w-full h-32 object-cover rounded-md border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold">AFTER</Label>
                          <img
                            src={item.afterImage || "/placeholder.svg"}
                            alt="After"
                            className="w-full h-32 object-cover rounded-md border"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Added {new Date(item.date).toLocaleDateString()}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="eyebrows">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getItemsByType("eyebrows").map((item) => (
                  <Card key={item.id} className="bg-white/90 backdrop-blur-sm border-lavender/20 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg font-serif">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold">BEFORE</Label>
                          <img
                            src={item.beforeImage || "/placeholder.svg"}
                            alt="Before"
                            className="w-full h-32 object-cover rounded-md border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold">AFTER</Label>
                          <img
                            src={item.afterImage || "/placeholder.svg"}
                            alt="After"
                            className="w-full h-32 object-cover rounded-md border"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="lips">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getItemsByType("lips").map((item) => (
                  <Card key={item.id} className="bg-white/90 backdrop-blur-sm border-lavender/20 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg font-serif">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold">BEFORE</Label>
                          <img
                            src={item.beforeImage || "/placeholder.svg"}
                            alt="Before"
                            className="w-full h-32 object-cover rounded-md border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold">AFTER</Label>
                          <img
                            src={item.afterImage || "/placeholder.svg"}
                            alt="After"
                            className="w-full h-32 object-cover rounded-md border"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="eyeliner">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getItemsByType("eyeliner").map((item) => (
                  <Card key={item.id} className="bg-white/90 backdrop-blur-sm border-lavender/20 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg font-serif">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold">BEFORE</Label>
                          <img
                            src={item.beforeImage || "/placeholder.svg"}
                            alt="Before"
                            className="w-full h-32 object-cover rounded-md border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold">AFTER</Label>
                          <img
                            src={item.afterImage || "/placeholder.svg"}
                            alt="After"
                            className="w-full h-32 object-cover rounded-md border"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
