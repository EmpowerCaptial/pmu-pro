"use client"

import { useState, useEffect } from "react"
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
import { Send, Eye, Trash2, Plus, Share, Camera } from "lucide-react"
import { useDemoAuth } from "@/hooks/use-demo-auth"

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
  const { currentUser, isAuthenticated } = useDemoAuth()
  
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])

  const [selectedClient, setSelectedClient] = useState("")
  const [shareMessage, setShareMessage] = useState(
    "Check out my PMU work! I specialize in natural-looking permanent makeup.",
  )

  const [isAddWorkOpen, setIsAddWorkOpen] = useState(false)
  const [newWork, setNewWork] = useState({
    type: "eyebrows" as "eyebrows" | "lips" | "eyeliner",
    title: "",
    description: "",
    beforeImage: null as File | null,
    afterImage: null as File | null,
  })

  // Load saved portfolio items on component mount
  useEffect(() => {
    if (currentUser) {
      const savedPortfolio = localStorage.getItem(`portfolio_${currentUser.email}`)
      if (savedPortfolio) {
        try {
          setPortfolioItems(JSON.parse(savedPortfolio))
        } catch (error) {
          console.error('Error loading saved portfolio:', error)
        }
      }
    }
  }, [currentUser])

  const handleAddWork = () => {
    if (!newWork.title || !newWork.description || !newWork.beforeImage || !newWork.afterImage) {
      alert("Please fill in all fields and upload both images")
      return
    }

    const newItem: PortfolioItem = {
      id: Date.now().toString(),
      type: newWork.type,
      title: newWork.title,
      description: newWork.description,
      beforeImage: URL.createObjectURL(newWork.beforeImage),
      afterImage: URL.createObjectURL(newWork.afterImage),
      date: new Date().toISOString().split("T")[0],
    }

    const updatedItems = [newItem, ...portfolioItems]
    setPortfolioItems(updatedItems)
    
    // Save to localStorage
    if (currentUser) {
      localStorage.setItem(`portfolio_${currentUser.email}`, JSON.stringify(updatedItems))
    }
    
    setIsAddWorkOpen(false)
    setNewWork({
      type: "eyebrows",
      title: "",
      description: "",
      beforeImage: null,
      afterImage: null,
    })
  }

  const handleDeleteWork = (itemId: string) => {
    const updatedItems = portfolioItems.filter(item => item.id !== itemId)
    setPortfolioItems(updatedItems)
    
    // Save to localStorage
    if (currentUser) {
      localStorage.setItem(`portfolio_${currentUser.email}`, JSON.stringify(updatedItems))
    }
  }

  const handleFileUpload = (type: "before" | "after", file: File | null) => {
    if (type === "before") {
      setNewWork({ ...newWork, beforeImage: file })
    } else {
      setNewWork({ ...newWork, afterImage: file })
    }
  }

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

      <NavBar 
        currentPath="/portfolio" 
        user={currentUser ? {
          name: currentUser.name,
          email: currentUser.email,
          initials: currentUser.name?.split(' ').map(n => n[0]).join('') || currentUser.email.charAt(0).toUpperCase()
        } : undefined} 
      />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          {/* Mobile Layout */}
          <div className="md:hidden text-center mb-6">
            <h1 className="text-2xl font-bold font-serif text-ink mb-2">My Portfolio</h1>
            <p className="text-sm text-muted-foreground mb-4">Showcase your PMU work to potential clients</p>
            <div className="flex flex-col gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-white/90 backdrop-blur-sm border border-lavender text-lavender hover:bg-lavender hover:text-white font-semibold w-full">
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
              <Dialog open={isAddWorkOpen} onOpenChange={setIsAddWorkOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-white/90 backdrop-blur-sm border border-lavender text-lavender hover:bg-lavender hover:text-white font-semibold w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Work
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white/95 backdrop-blur-sm max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Portfolio Work</DialogTitle>
                    <DialogDescription>Upload before and after images of your PMU work</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="work-type">Type</Label>
                      <select
                        id="work-type"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={newWork.type}
                        onChange={(e) => setNewWork({ ...newWork, type: e.target.value as any })}
                      >
                        <option value="eyebrows">Eyebrows</option>
                        <option value="lips">Lips</option>
                        <option value="eyeliner">Eyeliner</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="work-title">Title</Label>
                      <Input
                        id="work-title"
                        placeholder="e.g., Natural Microblading"
                        value={newWork.title}
                        onChange={(e) => setNewWork({ ...newWork, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="work-description">Description</Label>
                      <Textarea
                        id="work-description"
                        placeholder="Describe the technique and results..."
                        value={newWork.description}
                        onChange={(e) => setNewWork({ ...newWork, description: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="before-image">Before Image</Label>
                        <Input
                          id="before-image"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload("before", e.target.files?.[0] || null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="after-image">After Image</Label>
                        <Input
                          id="after-image"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload("after", e.target.files?.[0] || null)}
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddWork} className="w-full bg-lavender hover:bg-lavender-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Portfolio
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
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
              <Dialog open={isAddWorkOpen} onOpenChange={setIsAddWorkOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-white/90 backdrop-blur-sm border border-lavender text-lavender hover:bg-lavender hover:text-white font-semibold">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Work
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white/95 backdrop-blur-sm max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Portfolio Work</DialogTitle>
                    <DialogDescription>Upload before and after images of your PMU work</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="work-type">Type</Label>
                      <select
                        id="work-type"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={newWork.type}
                        onChange={(e) => setNewWork({ ...newWork, type: e.target.value as any })}
                      >
                        <option value="eyebrows">Eyebrows</option>
                        <option value="lips">Lips</option>
                        <option value="eyeliner">Eyeliner</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="work-title">Title</Label>
                      <Input
                        id="work-title"
                        placeholder="e.g., Natural Microblading"
                        value={newWork.title}
                        onChange={(e) => setNewWork({ ...newWork, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="work-description">Description</Label>
                      <Textarea
                        id="work-description"
                        placeholder="Describe the technique and results..."
                        value={newWork.description}
                        onChange={(e) => setNewWork({ ...newWork, description: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="before-image">Before Image</Label>
                        <Input
                          id="before-image"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload("before", e.target.files?.[0] || null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="after-image">After Image</Label>
                        <Input
                          id="after-image"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload("after", e.target.files?.[0] || null)}
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddWork} className="w-full bg-lavender hover:bg-lavender-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Portfolio
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Portfolio Tabs */}
          <Tabs defaultValue="all" className="w-full">
            {/* Mobile Tabs */}
            <div className="md:hidden mb-4">
              <TabsList className="grid w-full grid-cols-2 bg-white/90 backdrop-blur-sm shadow-lg border border-lavender/20">
                <TabsTrigger value="all" className="font-semibold text-xs data-[state=active]:bg-lavender data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-lavender/10 transition-all duration-200">
                  All Work
                </TabsTrigger>
                <TabsTrigger value="eyebrows" className="font-semibold text-xs data-[state=active]:bg-lavender data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-lavender/10 transition-all duration-200">
                  EYEBROWS
                </TabsTrigger>
                <TabsTrigger value="lips" className="font-semibold text-xs data-[state=active]:bg-lavender data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-lavender/10 transition-all duration-200">
                  LIPS
                </TabsTrigger>
                <TabsTrigger value="eyeliner" className="font-semibold text-xs data-[state=active]:bg-lavender data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-lavender/10 transition-all duration-200">
                  EYELINER
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Desktop Tabs */}
            <div className="hidden md:block">
              <TabsList className="grid w-full grid-cols-4 bg-white/90 backdrop-blur-sm shadow-lg border border-lavender/20">
                <TabsTrigger value="all" className="font-semibold data-[state=active]:bg-lavender data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-lavender/10 transition-all duration-200">
                  All Work
                </TabsTrigger>
                <TabsTrigger value="eyebrows" className="font-semibold data-[state=active]:bg-lavender data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-lavender/10 transition-all duration-200">
                  EYEBROWS
                </TabsTrigger>
                <TabsTrigger value="lips" className="font-semibold data-[state=active]:bg-lavender data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-lavender/10 transition-all duration-200">
                  LIPS
                </TabsTrigger>
                <TabsTrigger value="eyeliner" className="font-semibold data-[state=active]:bg-lavender data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-lavender/10 transition-all duration-200">
                  EYELINER
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="space-y-4">
              {portfolioItems.length === 0 ? (
                <Card className="bg-white/90 backdrop-blur-sm border-lavender/20 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <Camera className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Portfolio Items Yet</h3>
                    <p className="text-gray-500 mb-6">
                      Start building your portfolio by uploading your best PMU work. 
                      Showcase your skills with before and after photos.
                    </p>
                    <Button
                      onClick={() => setIsAddWorkOpen(true)}
                      className="bg-lavender hover:bg-lavender-600 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Work
                    </Button>
                  </CardContent>
                </Card>
              ) : (
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
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteWork(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
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
              )}
            </TabsContent>

            <TabsContent value="eyebrows">
              {getItemsByType("eyebrows").length === 0 ? (
                <Card className="bg-white/90 backdrop-blur-sm border-lavender/20 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Eyebrow Work Yet</h3>
                    <p className="text-gray-500">Upload your eyebrow work to showcase your skills.</p>
                  </CardContent>
                </Card>
              ) : (
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
              )}
            </TabsContent>

            <TabsContent value="lips">
              {getItemsByType("lips").length === 0 ? (
                <Card className="bg-white/90 backdrop-blur-sm border-lavender/20 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Lip Work Yet</h3>
                    <p className="text-gray-500">Upload your lip work to showcase your skills.</p>
                  </CardContent>
                </Card>
              ) : (
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
              )}
            </TabsContent>

            <TabsContent value="eyeliner">
              {getItemsByType("eyeliner").length === 0 ? (
                <Card className="bg-white/90 backdrop-blur-sm border-lavender/20 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Eyeliner Work Yet</h3>
                    <p className="text-gray-500">Upload your eyeliner work to showcase your skills.</p>
                  </CardContent>
                </Card>
              ) : (
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
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
