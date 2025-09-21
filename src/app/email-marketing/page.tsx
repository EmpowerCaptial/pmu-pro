'use client'

import { useState } from 'react'
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
  Target
} from 'lucide-react'

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <Mail className="inline-block mr-3 text-blue-600" />
            Email Marketing
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create professional emails for your clients with AI-powered templates. 
            Choose from premade templates or generate custom content.
          </p>
        </div>

        <Tabs defaultValue="templates" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Email Templates</TabsTrigger>
            <TabsTrigger value="custom">Custom Email</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            {/* Business Details Form */}
            <Card className="border-blue-100 bg-white">
              <CardHeader>
                <CardTitle className="text-blue-900">Business Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="e.g., Sarah's PMU Studio"
                    value={clientDetails.businessName}
                    onChange={(e) => setClientDetails({...clientDetails, businessName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="artistName">Artist Name</Label>
                  <Input
                    id="artistName"
                    placeholder="e.g., Sarah Johnson"
                    value={clientDetails.artistName}
                    onChange={(e) => setClientDetails({...clientDetails, artistName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="serviceType">Primary Service</Label>
                  <Input
                    id="serviceType"
                    placeholder="e.g., Microblading, Powder Brows"
                    value={clientDetails.serviceType}
                    onChange={(e) => setClientDetails({...clientDetails, serviceType: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="keyPoints">Key Points for Email</Label>
                  <Input
                    id="keyPoints"
                    placeholder="e.g., 20% off, limited time, new technique"
                    value={clientDetails.keyPoints}
                    onChange={(e) => setClientDetails({...clientDetails, keyPoints: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Special Events Templates */}
            <Card className="border-blue-100 bg-white">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center">
                  <Calendar className="mr-2 text-blue-600" />
                  Special Event Templates
                </CardTitle>
                <p className="text-gray-600">Perfect for holidays, anniversaries, and special occasions</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {SPECIAL_EVENT_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      className={`
                        p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                        ${selectedTemplate?.id === template.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-25'
                        }
                      `}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-full ${template.color} flex items-center justify-center mb-3`}>
                          <template.icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{template.title}</h3>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Special Pricing Templates */}
            <Card className="border-blue-100 bg-white">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center">
                  <DollarSign className="mr-2 text-blue-600" />
                  Special Pricing Templates
                </CardTitle>
                <p className="text-gray-600">Drive sales with compelling offers and promotions</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {SPECIAL_PRICING_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      className={`
                        p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                        ${selectedTemplate?.id === template.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-25'
                        }
                      `}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-full ${template.color} flex items-center justify-center mb-3`}>
                          <template.icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{template.title}</h3>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generate Email Button */}
            {selectedTemplate && (
              <Card className="border-blue-100 bg-gradient-to-r from-blue-50 to-teal-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Generate Email with AI
                      </h3>
                      <p className="text-gray-600">
                        Selected: <Badge variant="outline" className="ml-1">{selectedTemplate.title}</Badge>
                      </p>
                    </div>
                    <Button 
                      onClick={generateEmailWithAI}
                      disabled={isGenerating || !clientDetails.keyPoints}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {isGenerating ? 'Generating...' : 'Generate Email'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <Card className="border-blue-100 bg-white">
              <CardHeader>
                <CardTitle className="text-blue-900">Custom Email Generator</CardTitle>
                <p className="text-gray-600">Describe what you want to communicate and let AI create the perfect email</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customPrompt">Describe your email content</Label>
                  <textarea
                    id="customPrompt"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="e.g., I want to announce a new microblading technique, offer 15% off for the first 10 clients, and mention that I'm now certified in advanced shading techniques..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={generateEmailWithAI}
                  disabled={isGenerating || !customPrompt}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isGenerating ? 'Generating Custom Email...' : 'Generate Custom Email'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Email Preview */}
        {showPreview && emailContent && (
          <Card className="mt-8 border-blue-100 bg-white">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center justify-between">
                <div className="flex items-center">
                  <Eye className="mr-2 text-blue-600" />
                  Email Preview
                </div>
                <Button onClick={sendEmail} className="bg-green-600 hover:bg-green-700">
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg border">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: emailContent }}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
