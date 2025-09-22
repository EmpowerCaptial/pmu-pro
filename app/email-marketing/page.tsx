'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  Send, 
  Eye, 
  Users, 
  TrendingUp, 
  Calendar,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Sparkles,
  Target,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { NavBar } from '@/components/ui/navbar'
import { useDemoAuth } from '@/hooks/use-demo-auth'

interface EmailCampaign {
  id: string
  name: string
  subject: string
  template: string
  status: 'draft' | 'scheduled' | 'sent' | 'delivered'
  recipients: number
  sentAt?: string
  scheduledFor?: string
  openRate?: number
  clickRate?: number
  createdAt: string
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  category: 'newsletter' | 'promotion' | 'appointment' | 'followup'
  isDefault: boolean
}

const mockCampaigns: EmailCampaign[] = [
  {
    id: '1',
    name: 'January Newsletter',
    subject: 'New Year, New You - PMU Special Offers',
    template: 'newsletter',
    status: 'sent',
    recipients: 150,
    sentAt: '2024-01-15T10:00:00Z',
    openRate: 68.5,
    clickRate: 12.3,
    createdAt: '2024-01-10T00:00:00Z'
  },
  {
    id: '2',
    name: 'Valentine\'s Day Promotion',
    subject: 'Love Your Look - 20% Off PMU Services',
    template: 'promotion',
    status: 'scheduled',
    recipients: 200,
    scheduledFor: '2024-02-10T09:00:00Z',
    createdAt: '2024-01-20T00:00:00Z'
  },
  {
    id: '3',
    name: 'Appointment Reminders',
    subject: 'Your PMU Appointment Tomorrow',
    template: 'appointment',
    status: 'draft',
    recipients: 0,
    createdAt: '2024-01-25T00:00:00Z'
  }
]

const emailTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Newsletter Template',
    subject: 'Monthly PMU Newsletter',
    content: `
      <h1>Welcome to our PMU Newsletter!</h1>
      <p>Stay updated with the latest trends and techniques in permanent makeup.</p>
      <h2>This Month's Highlights:</h2>
      <ul>
        <li>New pigment colors available</li>
        <li>Client spotlight: Amazing transformation</li>
        <li>Aftercare tips for better results</li>
      </ul>
    `,
    category: 'newsletter',
    isDefault: true
  },
  {
    id: '2',
    name: 'Promotion Template',
    subject: 'Special Offer - Limited Time',
    content: `
      <h1>Don't Miss This Special Offer!</h1>
      <p>Get 20% off on all PMU services this month.</p>
      <h2>Services Included:</h2>
      <ul>
        <li>Microblading</li>
        <li>Ombré Brows</li>
        <li>Lip Blushing</li>
      </ul>
      <p>Book now to secure your spot!</p>
    `,
    category: 'promotion',
    isDefault: true
  },
  {
    id: '3',
    name: 'Appointment Reminder',
    subject: 'Your PMU Appointment Reminder',
    content: `
      <h1>Appointment Reminder</h1>
      <p>Hi [Client Name],</p>
      <p>This is a friendly reminder that you have a PMU appointment scheduled for [Date] at [Time].</p>
      <h2>What to Expect:</h2>
      <ul>
        <li>Consultation and design</li>
        <li>Numbing process</li>
        <li>PMU application</li>
        <li>Aftercare instructions</li>
      </ul>
      <p>Please arrive 15 minutes early. If you need to reschedule, please contact us at least 24 hours in advance.</p>
    `,
    category: 'appointment',
    isDefault: true
  }
]

export default function EmailMarketingPage() {
  const { currentUser } = useDemoAuth()
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(mockCampaigns)
  const [templates, setTemplates] = useState<EmailTemplate[]>(emailTemplates)
  const [activeTab, setActiveTab] = useState('campaigns')
  
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    template: '',
    recipients: 0
  })

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'newsletter'
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'delivered':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4" />
      case 'scheduled':
        return <Clock className="h-4 w-4" />
      case 'draft':
        return <Edit className="h-4 w-4" />
      case 'delivered':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const handleCreateCampaign = () => {
    if (!newCampaign.name || !newCampaign.subject) {
      alert('Please fill in required fields')
      return
    }

    const campaign: EmailCampaign = {
      id: Date.now().toString(),
      name: newCampaign.name,
      subject: newCampaign.subject,
      template: newCampaign.template,
      status: 'draft',
      recipients: newCampaign.recipients,
      createdAt: new Date().toISOString()
    }

    setCampaigns([...campaigns, campaign])
    setNewCampaign({ name: '', subject: '', template: '', recipients: 0 })
  }

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.content) {
      alert('Please fill in required fields')
      return
    }

    const template: EmailTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      subject: newTemplate.subject,
      content: newTemplate.content,
      category: newTemplate.category as any,
      isDefault: false
    }

    setTemplates([...templates, template])
    setNewTemplate({ name: '', subject: '', content: '', category: 'newsletter' })
  }

  const handleSendCampaign = (id: string) => {
    setCampaigns(campaigns.map(campaign => 
      campaign.id === id 
        ? { ...campaign, status: 'sent', sentAt: new Date().toISOString() }
        : campaign
    ))
  }

  const handleDeleteCampaign = (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      setCampaigns(campaigns.filter(campaign => campaign.id !== id))
    }
  }

  const totalRecipients = campaigns.reduce((total, campaign) => total + campaign.recipients, 0)
  const averageOpenRate = campaigns
    .filter(campaign => campaign.openRate)
    .reduce((total, campaign, _, array) => total + (campaign.openRate! / array.length), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/20 via-white to-purple/10">
      <NavBar currentPath="/email-marketing" user={currentUser || undefined} />
      
      <div className="container mx-auto px-4 py-8 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-ink mb-2">Email Marketing</h1>
            <p className="text-muted">Create and manage email campaigns for your PMU business</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="border-lavender text-lavender hover:bg-lavender/5">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Total Campaigns</p>
                  <p className="text-2xl font-bold">{campaigns.length}</p>
                </div>
                <Mail className="h-8 w-8 text-lavender" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Total Recipients</p>
                  <p className="text-2xl font-bold">{totalRecipients}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Avg Open Rate</p>
                  <p className="text-2xl font-bold">{averageOpenRate.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Templates</p>
                  <p className="text-2xl font-bold">{templates.length}</p>
                </div>
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Email Campaigns</CardTitle>
                  <Button 
                    onClick={() => setNewCampaign({ name: '', subject: '', template: '', recipients: 0 })}
                    className="bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold">{campaign.name}</h3>
                            <Badge className={getStatusColor(campaign.status)}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(campaign.status)}
                                <span>{campaign.status}</span>
                              </div>
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{campaign.subject}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Recipients: {campaign.recipients}</span>
                            {campaign.openRate && <span>Open Rate: {campaign.openRate}%</span>}
                            {campaign.clickRate && <span>Click Rate: {campaign.clickRate}%</span>}
                            <span>Created: {new Date(campaign.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {campaign.status === 'draft' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleSendCampaign(campaign.id)}
                              className="bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Send
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Email Templates</CardTitle>
                  <Button 
                    onClick={() => setNewTemplate({ name: '', subject: '', content: '', category: 'newsletter' })}
                    className="bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">{template.subject}</p>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Target className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaigns.filter(c => c.openRate).map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-sm text-gray-600">{campaign.recipients} recipients</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">{campaign.openRate}% open rate</p>
                          <p className="text-sm text-gray-600">{campaign.clickRate}% click rate</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Campaign "January Newsletter" sent to 150 recipients</span>
                      <span className="text-xs text-gray-500">2 days ago</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Campaign "Valentine's Day Promotion" scheduled</span>
                      <span className="text-xs text-gray-500">5 days ago</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">New template "Appointment Reminder" created</span>
                      <span className="text-xs text-gray-500">1 week ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
