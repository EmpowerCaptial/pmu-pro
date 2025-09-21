'use client'

import { useState } from 'react'
import Head from 'next/head'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  Sparkles, 
  Eye, 
  Send, 
  Calendar, 
  DollarSign, 
  Gift, 
  Heart,
  Star,
  Megaphone,
  PartyPopper,
  Target,
  MoreVertical,
  Edit,
  Trash2,
  Eye as ViewIcon
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Template categories
const SPECIAL_EVENT_TEMPLATES = [
  {
    id: 'holiday-promotion',
    title: 'Holiday Special',
    description: 'Perfect for holiday seasons and special celebrations',
    icon: Gift,
    color: 'bg-red-500',
    category: 'Special Events'
  },
  {
    id: 'anniversary',
    title: 'Anniversary Celebration',
    description: 'Celebrate business milestones and client anniversaries',
    icon: Heart,
    color: 'bg-pink-500',
    category: 'Special Events'
  },
  {
    id: 'seasonal-update',
    title: 'Seasonal Services',
    description: 'Highlight seasonal PMU services and trends',
    icon: Calendar,
    color: 'bg-green-500',
    category: 'Special Events'
  },
  {
    id: 'grand-opening',
    title: 'Grand Opening',
    description: 'Announce new services, locations, or studio updates',
    icon: PartyPopper,
    color: 'bg-purple-500',
    category: 'Special Events'
  }
]

const SPECIAL_PRICING_TEMPLATES = [
  {
    id: 'flash-sale',
    title: 'Flash Sale',
    description: 'Limited-time offers with urgency',
    icon: DollarSign,
    color: 'bg-orange-500',
    category: 'Special Pricing'
  },
  {
    id: 'loyalty-discount',
    title: 'Loyalty Rewards',
    description: 'Reward returning clients with special pricing',
    icon: Star,
    color: 'bg-yellow-500',
    category: 'Special Pricing'
  },
  {
    id: 'referral-bonus',
    title: 'Referral Program',
    description: 'Encourage client referrals with incentives',
    icon: Target,
    color: 'bg-blue-500',
    category: 'Special Pricing'
  },
  {
    id: 'package-deal',
    title: 'Package Deals',
    description: 'Bundle services for better value',
    icon: Megaphone,
    color: 'bg-teal-500',
    category: 'Special Pricing'
  }
]

interface Template {
  id: string
  title: string
  description: string
  icon: any
  color: string
  category: string
}

export default function EmailMarketingPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [customPrompt, setCustomPrompt] = useState('')
  const [emailContent, setEmailContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [savedTemplates, setSavedTemplates] = useState<Template[]>([])
  const [clientDetails, setClientDetails] = useState({
    businessName: '',
    artistName: '',
    serviceType: '',
    keyPoints: ''
  })

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
    setShowPreview(false)
    setEmailContent('')
  }

  const generateEmailWithAI = async () => {
    if (!selectedTemplate || !clientDetails.keyPoints) {
      alert('Please select a template and provide key points for your email')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/email/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: selectedTemplate,
          businessName: clientDetails.businessName,
          artistName: clientDetails.artistName,
          serviceType: clientDetails.serviceType,
          keyPoints: clientDetails.keyPoints
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate email')
      }

      const data = await response.json()
      setEmailContent(data.content)
      setShowPreview(true)
    } catch (error) {
      console.error('Error generating email:', error)
      alert('Failed to generate email. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const sendEmail = async () => {
    // Implementation for sending emails
    alert('Email sending functionality will be implemented next!')
  }

  const handleTemplateAction = (action: string, template: Template) => {
    switch (action) {
      case 'view':
        setSelectedTemplate(template)
        setShowPreview(true)
        break
      case 'edit':
        setSelectedTemplate(template)
        setShowPreview(false)
        break
      case 'delete':
        setSavedTemplates(savedTemplates.filter(t => t.id !== template.id))
        break
      default:
        break
    }
  }

  const saveTemplate = () => {
    if (selectedTemplate && emailContent) {
      const newTemplate = {
        ...selectedTemplate,
        id: `${selectedTemplate.id}-${Date.now()}`,
        title: `${selectedTemplate.title} (Custom)`,
        description: 'Custom generated template'
      }
      setSavedTemplates([...savedTemplates, newTemplate])
      alert('Template saved successfully!')
    }
  }

  return (
    <>
      <Head>
        <title>Email Marketing - AI-Powered Templates | PMU Pro</title>
        <meta name="description" content="Create professional PMU business emails with AI-powered templates. Choose from 8 premade templates or generate custom content for your clients." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-ivory to-beige">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink mb-3 sm:mb-4">
            <Mail className="inline-block mr-2 sm:mr-3 text-lavender w-6 h-6 sm:w-8 sm:h-8" />
            Email Marketing
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-text max-w-2xl mx-auto px-2">
            Create professional emails for your clients with AI-powered templates. 
            Choose from premade templates or generate custom content.
          </p>
        </div>

        <Tabs defaultValue="templates" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
            <TabsTrigger value="templates" className="text-xs sm:text-sm">Email Templates</TabsTrigger>
            <TabsTrigger value="custom" className="text-xs sm:text-sm">Custom Email</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4 sm:space-y-6">
            {/* Business Details Form */}
            <Card className="border-beige bg-white shadow-sm">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lavender text-lg sm:text-xl">Business Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="businessName" className="text-sm sm:text-base">Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="e.g., Sarah's PMU Studio"
                    value={clientDetails.businessName}
                    onChange={(e) => setClientDetails({...clientDetails, businessName: e.target.value})}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="artistName" className="text-sm sm:text-base">Artist Name</Label>
                  <Input
                    id="artistName"
                    placeholder="e.g., Sarah Johnson"
                    value={clientDetails.artistName}
                    onChange={(e) => setClientDetails({...clientDetails, artistName: e.target.value})}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="serviceType" className="text-sm sm:text-base">Primary Service</Label>
                  <Input
                    id="serviceType"
                    placeholder="e.g., Microblading, Powder Brows"
                    value={clientDetails.serviceType}
                    onChange={(e) => setClientDetails({...clientDetails, serviceType: e.target.value})}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="keyPoints" className="text-sm sm:text-base">Key Points for Email</Label>
                  <Input
                    id="keyPoints"
                    placeholder="e.g., 20% off, limited time, new technique"
                    value={clientDetails.keyPoints}
                    onChange={(e) => setClientDetails({...clientDetails, keyPoints: e.target.value})}
                    className="text-sm sm:text-base"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Special Events Templates */}
            <Card className="border-beige bg-white shadow-sm">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lavender flex items-center text-lg sm:text-xl">
                  <Calendar className="mr-2 text-lavender w-5 h-5 sm:w-6 sm:h-6" />
                  Special Event Templates
                </CardTitle>
                <p className="text-muted-text text-sm sm:text-base">Perfect for holidays, anniversaries, and special occasions</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  {SPECIAL_EVENT_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      className={`
                        p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 relative group
                        ${selectedTemplate?.id === template.id 
                          ? 'border-lavender bg-lavender/10' 
                          : 'border-beige bg-white hover:border-lavender/50 hover:bg-lavender/5'
                        }
                      `}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${template.color} flex items-center justify-center mb-2 sm:mb-3`}>
                          <template.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-ink mb-1 text-xs sm:text-sm lg:text-base leading-tight">{template.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-text leading-tight">{template.description}</p>
                      </div>
                      
                      {/* Dropdown Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md hover:shadow-lg border border-lavender/20"
                          >
                            <MoreVertical className="h-4 w-4 text-lavender" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-white border-lavender/20 shadow-lg">
                          <DropdownMenuItem 
                            onClick={() => handleTemplateAction('view', template)}
                            className="cursor-pointer hover:bg-lavender/10 focus:bg-lavender/10"
                          >
                            <ViewIcon className="mr-2 h-4 w-4 text-lavender" />
                            <span className="text-ink">View</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleTemplateAction('edit', template)}
                            className="cursor-pointer hover:bg-lavender/10 focus:bg-lavender/10"
                          >
                            <Edit className="mr-2 h-4 w-4 text-teal-500" />
                            <span className="text-ink">Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleTemplateAction('delete', template)}
                            className="cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Special Pricing Templates */}
            <Card className="border-beige bg-white shadow-sm">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lavender flex items-center text-lg sm:text-xl">
                  <DollarSign className="mr-2 text-lavender w-5 h-5 sm:w-6 sm:h-6" />
                  Special Pricing Templates
                </CardTitle>
                <p className="text-muted-text text-sm sm:text-base">Drive sales with compelling offers and promotions</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  {SPECIAL_PRICING_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      className={`
                        p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 relative group
                        ${selectedTemplate?.id === template.id 
                          ? 'border-lavender bg-lavender/10' 
                          : 'border-beige bg-white hover:border-lavender/50 hover:bg-lavender/5'
                        }
                      `}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${template.color} flex items-center justify-center mb-2 sm:mb-3`}>
                          <template.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-ink mb-1 text-xs sm:text-sm lg:text-base leading-tight">{template.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-text leading-tight">{template.description}</p>
                      </div>
                      
                      {/* Dropdown Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md hover:shadow-lg border border-lavender/20"
                          >
                            <MoreVertical className="h-4 w-4 text-lavender" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-white border-lavender/20 shadow-lg">
                          <DropdownMenuItem 
                            onClick={() => handleTemplateAction('view', template)}
                            className="cursor-pointer hover:bg-lavender/10 focus:bg-lavender/10"
                          >
                            <ViewIcon className="mr-2 h-4 w-4 text-lavender" />
                            <span className="text-ink">View</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleTemplateAction('edit', template)}
                            className="cursor-pointer hover:bg-lavender/10 focus:bg-lavender/10"
                          >
                            <Edit className="mr-2 h-4 w-4 text-teal-500" />
                            <span className="text-ink">Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleTemplateAction('delete', template)}
                            className="cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generate Email Button */}
            {selectedTemplate && (
              <Card className="border-lavender/20 bg-gradient-to-r from-lavender/10 to-lavender/5">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-ink mb-1">
                        Generate Email with AI
                      </h3>
                      <p className="text-muted-text text-sm sm:text-base">
                        Selected: <Badge variant="outline" className="ml-1 text-xs sm:text-sm border-lavender text-lavender">{selectedTemplate.title}</Badge>
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <Button 
                        onClick={generateEmailWithAI}
                        disabled={isGenerating || !clientDetails.keyPoints}
                        className="bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600 text-white w-full sm:w-auto text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        {isGenerating ? 'Generating...' : 'Generate Email'}
                      </Button>
                      {emailContent && (
                        <Button 
                          onClick={saveTemplate}
                          variant="outline"
                          className="border-2 border-gradient-to-r from-lavender to-teal-500 bg-gradient-to-r from-lavender/10 to-teal-500/10 text-lavender hover:from-lavender/20 hover:to-teal-500/20 w-full sm:w-auto text-sm sm:text-base shadow-sm hover:shadow-md transition-all duration-300"
                        >
                          Save Template
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="custom" className="space-y-4 sm:space-y-6">
            <Card className="border-beige bg-white shadow-sm">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lavender text-lg sm:text-xl">Custom Email Generator</CardTitle>
                <p className="text-muted-text text-sm sm:text-base">Describe what you want to communicate and let AI create the perfect email</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customPrompt" className="text-sm sm:text-base">Describe your email content</Label>
                  <textarea
                    id="customPrompt"
                    className="w-full p-3 border border-beige rounded-lg focus:ring-2 focus:ring-lavender focus:border-transparent text-sm sm:text-base"
                    rows={4}
                    placeholder="e.g., I want to announce a new microblading technique, offer 15% off for the first 10 clients, and mention that I'm now certified in advanced shading techniques..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={generateEmailWithAI}
                  disabled={isGenerating || !customPrompt}
                  className="w-full bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600 text-white text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isGenerating ? 'Generating Custom Email...' : 'Generate Custom Email'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Email Campaigns Section */}
        <Card className="mt-6 sm:mt-8 border-beige bg-white shadow-sm">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lavender flex items-center text-lg sm:text-xl">
              <Megaphone className="mr-2 text-lavender w-5 h-5 sm:w-6 sm:h-6" />
              Email Campaigns
            </CardTitle>
            <p className="text-muted-text text-sm sm:text-base">Manage your existing email campaigns and templates</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* January Newsletter Campaign */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-teal-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-lavender to-teal-500 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink text-sm sm:text-base">January Newsletter</h3>
                    <p className="text-muted-text text-xs sm:text-sm">Monthly update for clients</p>
                    <p className="text-muted-text text-xs">Sent to 150 clients • Last sent: Jan 15, 2024</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md hover:shadow-lg border border-lavender/20"
                    >
                      <MoreVertical className="h-4 w-4 text-lavender" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 bg-white border-lavender/20 shadow-lg">
                    <DropdownMenuItem className="cursor-pointer hover:bg-lavender/10 focus:bg-lavender/10">
                      <ViewIcon className="mr-2 h-4 w-4 text-lavender" />
                      <span className="text-ink">View</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer hover:bg-lavender/10 focus:bg-lavender/10">
                      <Edit className="mr-2 h-4 w-4 text-teal-500" />
                      <span className="text-ink">Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-600 focus:text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Valentine's Day Promotions Campaign */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-gray-200 hover:border-pink-300 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink text-sm sm:text-base">Valentine's Day Promotions</h3>
                    <p className="text-muted-text text-xs sm:text-sm">Special romantic beauty offers</p>
                    <p className="text-muted-text text-xs">Scheduled for Feb 14 • 89 opens last campaign</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md hover:shadow-lg border border-lavender/20"
                    >
                      <MoreVertical className="h-4 w-4 text-lavender" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 bg-white border-lavender/20 shadow-lg">
                    <DropdownMenuItem className="cursor-pointer hover:bg-lavender/10 focus:bg-lavender/10">
                      <ViewIcon className="mr-2 h-4 w-4 text-lavender" />
                      <span className="text-ink">View</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer hover:bg-lavender/10 focus:bg-lavender/10">
                      <Edit className="mr-2 h-4 w-4 text-teal-500" />
                      <span className="text-ink">Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-600 focus:text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Appointment Reminders Campaign */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ink text-sm sm:text-base">Appointment Reminders</h3>
                    <p className="text-muted-text text-xs sm:text-sm">Automated booking confirmations</p>
                    <p className="text-muted-text text-xs">Active campaign • 95% open rate</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md hover:shadow-lg border border-lavender/20"
                    >
                      <MoreVertical className="h-4 w-4 text-lavender" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 bg-white border-lavender/20 shadow-lg">
                    <DropdownMenuItem className="cursor-pointer hover:bg-lavender/10 focus:bg-lavender/10">
                      <ViewIcon className="mr-2 h-4 w-4 text-lavender" />
                      <span className="text-ink">View</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer hover:bg-lavender/10 focus:bg-lavender/10">
                      <Edit className="mr-2 h-4 w-4 text-teal-500" />
                      <span className="text-ink">Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-600 focus:text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Preview */}
        {showPreview && emailContent && (
          <Card className="mt-6 sm:mt-8 border-beige bg-white shadow-sm">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lavender flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center">
                  <Eye className="mr-2 text-lavender w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-lg sm:text-xl">Email Preview</span>
                </div>
                <Button onClick={sendEmail} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white w-full sm:w-auto text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-300">
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-beige/30 p-4 sm:p-6 rounded-lg border border-beige">
                <div 
                  className="prose prose-sm sm:prose max-w-none text-ink"
                  dangerouslySetInnerHTML={{ __html: emailContent }}
                />
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </>
  )
}
