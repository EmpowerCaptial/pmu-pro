"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Mail, 
  Send, 
  Users, 
  Sparkles, 
  Eye, 
  Edit, 
  CheckCircle, 
  Clock, 
  Target, 
  Gift, 
  Star, 
  Heart, 
  Calendar,
  Settings,
  ArrowLeft,
  Loader2,
  Copy,
  Download,
  Filter,
  Search,
  UserCheck,
  MessageSquare,
  TrendingUp,
  Award,
  DollarSign,
  Percent,
  Megaphone,
  Palette,
  Type,
  Image as ImageIcon,
  Link as LinkIcon,
  Smile,
  Zap
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// Email campaign types
const campaignTypes = [
  {
    id: 'special-offer',
    name: 'Special Offer',
    description: 'Promote discounts and limited-time deals',
    icon: Percent,
    color: 'bg-gradient-to-br from-green-500 to-emerald-600',
    template: 'special-offer'
  },
  {
    id: 'holiday-promotion',
    name: 'Holiday Promotion',
    description: 'Seasonal campaigns and holiday specials',
    icon: Gift,
    color: 'bg-gradient-to-br from-red-500 to-pink-600',
    template: 'holiday'
  },
  {
    id: 'referral-program',
    name: 'Referral Program',
    description: 'Encourage client referrals and rewards',
    icon: UserCheck,
    color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    template: 'referral'
  },
  {
    id: 'review-request',
    name: 'Review Request',
    description: 'Ask satisfied clients for reviews',
    icon: Star,
    color: 'bg-gradient-to-br from-yellow-500 to-orange-600',
    template: 'review'
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Regular updates and studio news',
    icon: MessageSquare,
    color: 'bg-gradient-to-br from-purple-500 to-violet-600',
    template: 'newsletter'
  },
  {
    id: 'appointment-reminder',
    name: 'Appointment Reminder',
    description: 'Remind clients of upcoming appointments',
    icon: Calendar,
    color: 'bg-gradient-to-br from-teal-500 to-cyan-600',
    template: 'reminder'
  }
]

// Client data will be loaded from API

export default function EmailMarketingPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('create')
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const [campaignDetails, setCampaignDetails] = useState({
    title: '',
    description: '',
    offer: '',
    deadline: '',
    targetAudience: 'all',
    personalization: true
  })
  const [generatedEmail, setGeneratedEmail] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [isLoadingClients, setIsLoadingClients] = useState(false)
  const [clientStats, setClientStats] = useState<any>(null)

  // Load clients from API
  const loadClients = async () => {
    console.log('Loading clients...')
    setIsLoadingClients(true)
    try {
      const response = await fetch('/api/email-marketing/clients', {
        headers: {
          'x-user-email': 'demo@pmupro.com' // In real app, get from auth context
        }
      })
      const data = await response.json()
      console.log('Client API response:', data)
      if (data.success) {
        setClients(data.clients)
        setClientStats(data.stats)
        console.log('Clients loaded:', data.clients)
      } else {
        console.error('API error:', data.error)
      }
    } catch (error) {
      console.error('Error loading clients:', error)
    } finally {
      setIsLoadingClients(false)
    }
  }

  // Load clients on component mount
  useEffect(() => {
    loadClients()
  }, [])

  // Filter clients based on search
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle campaign type selection
  const handleCampaignSelect = (campaignId: string) => {
    setSelectedCampaign(campaignId)
    const campaign = campaignTypes.find(c => c.id === campaignId)
    if (campaign) {
      setCampaignDetails(prev => ({
        ...prev,
        title: campaign.name,
        description: campaign.description
      }))
    }
  }

  // Generate AI email
  const generateEmail = async () => {
    if (!selectedCampaign || !campaignDetails.title) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/email-marketing/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignType: selectedCampaign,
          details: campaignDetails,
          personalization: campaignDetails.personalization
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setGeneratedEmail(data.email.content)
        setShowPreview(true)
        setActiveTab('preview')
      } else {
        console.error('Error generating email:', data.error)
      }
    } catch (error) {
      console.error('Error generating email:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Send email campaign
  const sendCampaign = async () => {
    if (selectedClients.length === 0 || !generatedEmail) return

    try {
      const response = await fetch('/api/email-marketing/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': 'demo@pmupro.com' // In real app, get from auth context
        },
        body: JSON.stringify({
          clientIds: selectedClients,
          campaignData: {
            campaignType: selectedCampaign,
            subject: campaignTypes.find(c => c.id === selectedCampaign)?.name || 'Email Campaign'
          },
          emailContent: generatedEmail
        })
      })
      
      const data = await response.json()
      if (data.success) {
        alert(`Email campaign sent successfully to ${data.stats.valid} clients!`)
        setSelectedClients([])
        setGeneratedEmail('')
        setActiveTab('create')
      } else {
        console.error('Error sending campaign:', data.error)
        alert('Failed to send email campaign. Please try again.')
      }
    } catch (error) {
      console.error('Error sending campaign:', error)
      alert('Failed to send email campaign. Please try again.')
    }
  }

  // Handle client selection
  const toggleClientSelection = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    )
  }

  // Select all clients
  const selectAllClients = () => {
    console.log('Select All clicked, filteredClients:', filteredClients)
    setSelectedClients(filteredClients.map(client => client.id))
  }

  // Clear all selections
  const clearAllSelections = () => {
    console.log('Clear All clicked')
    setSelectedClients([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/20 via-white to-purple/10 p-3 sm:p-4 pb-16 sm:pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-1 sm:mb-2">Email Marketing</h1>
          <p className="text-muted text-sm sm:text-base">AI-powered email campaigns for your clients</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger 
              value="create" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-blue-50 transition-all duration-200"
            >
              <Sparkles className="h-4 w-4" />
              Create Campaign
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-purple-50 transition-all duration-200"
            >
              <Eye className="h-4 w-4" />
              Preview & Edit
            </TabsTrigger>
            <TabsTrigger 
              value="send" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-green-50 transition-all duration-200"
            >
              <Send className="h-4 w-4" />
              Send Campaign
            </TabsTrigger>
          </TabsList>

          {/* Create Campaign Tab */}
          <TabsContent value="create" className="space-y-6">
            {/* Campaign Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-lavender" />
                  Choose Campaign Type
                </CardTitle>
                <CardDescription>
                  Select the type of email campaign you want to create
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {campaignTypes.map((campaign) => (
                    <div
                      key={campaign.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedCampaign === campaign.id
                          ? 'border-lavender bg-lavender/5 shadow-md'
                          : 'border-gray-200 hover:border-lavender/50 hover:shadow-sm'
                      }`}
                      onClick={() => handleCampaignSelect(campaign.id)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${campaign.color}`}>
                          <campaign.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                          <p className="text-sm text-gray-600">{campaign.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Campaign Details */}
            {selectedCampaign && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="h-5 w-5 text-lavender" />
                    Campaign Details
                  </CardTitle>
                  <CardDescription>
                    Provide details for AI to generate your email content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Campaign Title</Label>
                      <Input
                        id="title"
                        value={campaignDetails.title}
                        onChange={(e) => setCampaignDetails(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter campaign title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deadline">Deadline (Optional)</Label>
                      <Input
                        id="deadline"
                        value={campaignDetails.deadline}
                        onChange={(e) => setCampaignDetails(prev => ({ ...prev, deadline: e.target.value }))}
                        placeholder="e.g., January 31st"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={campaignDetails.description}
                      onChange={(e) => setCampaignDetails(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your campaign, special offer, or promotion..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="offer">Special Offer/Details</Label>
                    <Textarea
                      id="offer"
                      value={campaignDetails.offer}
                      onChange={(e) => setCampaignDetails(prev => ({ ...prev, offer: e.target.value }))}
                      placeholder="Describe the special offer, discount, or promotion details..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="personalization"
                      checked={campaignDetails.personalization}
                      onChange={(e) => setCampaignDetails(prev => ({ ...prev, personalization: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="personalization">Personalize emails with client names</Label>
                  </div>

                  <div className="pt-4">
                    <Button 
                      onClick={generateEmail}
                      disabled={isGenerating || !campaignDetails.title}
                      className="w-full sm:w-auto"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating Email...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Email with AI
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Preview & Edit Tab */}
          <TabsContent value="preview" className="space-y-6">
            {generatedEmail ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-lavender" />
                    Email Preview
                  </CardTitle>
                  <CardDescription>
                    Review and edit your generated email before sending
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        AI Generated
                      </Badge>
                      <Badge variant="outline">
                        {campaignTypes.find(c => c.id === selectedCampaign)?.name}
                      </Badge>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div 
                        dangerouslySetInnerHTML={{ __html: generatedEmail }}
                        className="email-preview"
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Content
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4 mr-2" />
                        Copy HTML
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Email Generated Yet</h3>
                  <p className="text-gray-600 mb-4">Create a campaign first to see the email preview</p>
                  <Button onClick={() => setActiveTab('create')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Create Campaign
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Send Campaign Tab */}
          <TabsContent value="send" className="space-y-6">
            {/* Client Statistics */}
            {clientStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <Card className="border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                      {clientStats.total}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700">Total Clients</div>
                  </CardContent>
                </Card>
                <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
                      {clientStats.active}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700">Active Clients</div>
                  </CardContent>
                </Card>
                <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-violet-50">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">
                      {clientStats.withEmail}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700">With Email</div>
                  </CardContent>
                </Card>
                <Card className="border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-orange-600 mb-1">
                      {clientStats.inactive}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-700">Inactive</div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-lavender" />
                  Select Recipients
                </CardTitle>
                <CardDescription>
                  Choose which clients will receive your email campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search clients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={selectAllClients}>
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={clearAllSelections}>
                        Clear All
                      </Button>
                    </div>
                  </div>

                  {/* Client List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {isLoadingClients ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-600">Loading clients...</p>
                      </div>
                    ) : filteredClients.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-600">No clients found</p>
                      </div>
                    ) : (
                      filteredClients.map((client) => (
                      <div
                        key={client.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedClients.includes(client.id)
                            ? 'border-lavender bg-lavender/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleClientSelection(client.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedClients.includes(client.id)}
                              onChange={() => toggleClientSelection(client.id)}
                              className="rounded"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{client.name}</p>
                              <p className="text-sm text-gray-600">{client.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={client.status === 'active' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {client.status}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Last visit: {client.lastVisit}
                            </span>
                          </div>
                        </div>
                      </div>
                      ))
                    )}
                  </div>

                  {/* Send Summary */}
                  {selectedClients.length > 0 && (
                    <div className="bg-lavender/5 border border-lavender/20 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Send Summary</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Recipients:</span>
                          <span className="font-medium ml-2">{selectedClients.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Campaign:</span>
                          <span className="font-medium ml-2">
                            {campaignTypes.find(c => c.id === selectedCampaign)?.name}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <span className="font-medium ml-2 text-green-600">Ready to Send</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Send Button */}
                  <div className="pt-4">
                    <Button 
                      onClick={sendCampaign}
                      disabled={selectedClients.length === 0 || !generatedEmail}
                      className="w-full sm:w-auto"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send to {selectedClients.length} Client{selectedClients.length !== 1 ? 's' : ''}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
