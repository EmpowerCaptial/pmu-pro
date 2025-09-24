"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Gift, 
  Share2, 
  Copy, 
  TrendingUp, 
  Calendar, 
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Eye,
  Download,
  MoreVertical,
  Target,
  Star,
  Send
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NavBar } from '@/components/ui/navbar'
import { useDemoAuth } from '@/hooks/use-demo-auth'

interface ReferralProgram {
  id: string
  name: string
  description: string
  referralReward: number
  refereeReward: number
  minPurchase: number
  isActive: boolean
  createdAt: string
  totalReferrals: number
  totalRewards: number
}

interface Referral {
  id: string
  referrerName: string
  referrerEmail: string
  refereeName: string
  refereeEmail: string
  status: 'pending' | 'completed' | 'cancelled'
  rewardAmount: number
  createdAt: string
  completedAt?: string
  service: string
}

interface ReferralLink {
  id: string
  name: string
  url: string
  programId: string
  clicks: number
  conversions: number
  createdAt: string
  isActive: boolean
}

const mockReferralPrograms: ReferralProgram[] = [
  {
    id: '1',
    name: 'Standard Referral Program',
    description: 'Earn $25 for each successful referral',
    referralReward: 25.00,
    refereeReward: 15.00,
    minPurchase: 100.00,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    totalReferrals: 12,
    totalRewards: 300.00
  },
  {
    id: '2',
    name: 'Premium Referral Program',
    description: 'Earn $50 for premium service referrals',
    referralReward: 50.00,
    refereeReward: 25.00,
    minPurchase: 250.00,
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    totalReferrals: 5,
    totalRewards: 250.00
  }
]

const mockReferrals: Referral[] = [
  {
    id: '1',
    referrerName: 'Sarah Johnson',
    referrerEmail: 'sarah.j@email.com',
    refereeName: 'Emma Rodriguez',
    refereeEmail: 'emma.r@email.com',
    status: 'completed',
    rewardAmount: 25.00,
    createdAt: '2024-01-15T10:30:00Z',
    completedAt: '2024-01-20T14:20:00Z',
    service: 'Eyebrow Microblading'
  },
  {
    id: '2',
    referrerName: 'Mike Chen',
    referrerEmail: 'mike.c@email.com',
    refereeName: 'Lisa Park',
    refereeEmail: 'lisa.p@email.com',
    status: 'pending',
    rewardAmount: 25.00,
    createdAt: '2024-01-18T09:15:00Z',
    service: 'Lip Blushing'
  },
  {
    id: '3',
    referrerName: 'Sarah Johnson',
    referrerEmail: 'sarah.j@email.com',
    refereeName: 'David Kim',
    refereeEmail: 'david.k@email.com',
    status: 'completed',
    rewardAmount: 50.00,
    createdAt: '2024-01-20T16:45:00Z',
    completedAt: '2024-01-25T11:30:00Z',
    service: 'Premium Package'
  }
]

const mockReferralLinks: ReferralLink[] = [
  {
    id: '1',
    name: 'General Referral Link',
    url: 'https://pmupro.com/ref/sarah123',
    programId: '1',
    clicks: 45,
    conversions: 8,
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true
  },
  {
    id: '2',
    name: 'Premium Service Referral',
    url: 'https://pmupro.com/ref/sarah-premium',
    programId: '2',
    clicks: 23,
    conversions: 3,
    createdAt: '2024-01-15T00:00:00Z',
    isActive: true
  }
]

export default function ReferralsPage() {
  const { currentUser } = useDemoAuth()
  const [referralPrograms, setReferralPrograms] = useState<ReferralProgram[]>(mockReferralPrograms)
  const [referrals, setReferrals] = useState<Referral[]>(mockReferrals)
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>(mockReferralLinks)
  const [activeTab, setActiveTab] = useState('overview')
  const [showCreateProgram, setShowCreateProgram] = useState(false)
  const [newProgram, setNewProgram] = useState({
    name: '',
    description: '',
    referralReward: 25,
    refereeReward: 15,
    minPurchase: 100
  })

  // Fallback user if not authenticated
  const user = currentUser ? {
    name: currentUser.name,
    email: currentUser.email,
    initials: currentUser.name?.split(' ').map(n => n[0]).join('') || currentUser.email.charAt(0).toUpperCase()
  } : {
    name: "PMU Artist",
    email: "artist@pmupro.com",
    initials: "PA",
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const handleCreateProgram = () => {
    if (!newProgram.name || !newProgram.description) {
      alert('Please fill in required fields')
      return
    }

    const program: ReferralProgram = {
      id: Date.now().toString(),
      name: newProgram.name,
      description: newProgram.description,
      referralReward: newProgram.referralReward,
      refereeReward: newProgram.refereeReward,
      minPurchase: newProgram.minPurchase,
      isActive: true,
      createdAt: new Date().toISOString(),
      totalReferrals: 0,
      totalRewards: 0
    }

    setReferralPrograms([...referralPrograms, program])
    setNewProgram({ name: '', description: '', referralReward: 25, refereeReward: 15, minPurchase: 100 })
    setShowCreateProgram(false)
    alert('Referral program created successfully!')
  }

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    alert('Referral link copied to clipboard!')
  }

  const handleSendLink = (linkId: string) => {
    alert(`Send referral link ${linkId} functionality would open here`)
  }

  const totalReferrals = referrals.length
  const completedReferrals = referrals.filter(r => r.status === 'completed').length
  const pendingReferrals = referrals.filter(r => r.status === 'pending').length
  const totalRewards = referrals.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.rewardAmount, 0)
  const pendingRewards = referrals.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.rewardAmount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <NavBar currentPath="/referrals" user={user} />
      <main className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-ink mb-2">Referral Program</h1>
              <p className="text-muted">Grow your business through client referrals</p>
            </div>
            <Button 
              onClick={() => setShowCreateProgram(true)}
              className="bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Program
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">Total Referrals</p>
                  <p className="text-2xl font-bold text-ink">{totalReferrals}</p>
                </div>
                <Users className="h-8 w-8 text-lavender" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedReferrals}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">Total Rewards</p>
                  <p className="text-2xl font-bold text-blue-600">${totalRewards.toFixed(2)}</p>
                </div>
                <Gift className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">${pendingRewards.toFixed(2)}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-lavender data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="programs" 
              className="data-[state=active]:bg-teal-500 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Programs
            </TabsTrigger>
            <TabsTrigger 
              value="referrals" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Referrals
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Programs */}
              <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
                <CardHeader>
                  <CardTitle className="text-lavender">Active Programs</CardTitle>
                  <CardDescription>Your current referral programs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {referralPrograms.filter(p => p.isActive).map((program) => (
                      <div key={program.id} className="p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-ink">{program.name}</h3>
                            <p className="text-sm text-muted">{program.description}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted">
                          <div>Referrer Reward: ${program.referralReward}</div>
                          <div>Referee Reward: ${program.refereeReward}</div>
                          <div>Min Purchase: ${program.minPurchase}</div>
                          <div>Total Referrals: {program.totalReferrals}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Referrals */}
              <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
                <CardHeader>
                  <CardTitle className="text-lavender">Recent Referrals</CardTitle>
                  <CardDescription>Latest referral activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {referrals.slice(0, 3).map((referral) => (
                      <div key={referral.id} className="p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-ink">{referral.referrerName}</h3>
                            <p className="text-sm text-muted">Referred: {referral.refereeName}</p>
                            <p className="text-sm text-muted">{referral.service}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-green-600">${referral.rewardAmount}</span>
                            <Badge className={getStatusColor(referral.status)}>
                              {getStatusIcon(referral.status)}
                              <span className="ml-1">{referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}</span>
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted">
                          <span>{referral.referrerEmail}</span>
                          <span>{new Date(referral.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Referral Links */}
            <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
              <CardHeader>
                <CardTitle className="text-lavender">Your Referral Links</CardTitle>
                <CardDescription>Share these links to earn rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {referralLinks.map((link) => (
                    <div key={link.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-lavender/30 transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-lavender to-teal-500 rounded-full flex items-center justify-center">
                          <Share2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-ink">{link.name}</h3>
                          <p className="text-sm text-muted">{link.url}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted">
                            <span>{link.clicks} clicks</span>
                            <span>{link.conversions} conversions</span>
                            <span>{link.clicks > 0 ? ((link.conversions / link.clicks) * 100).toFixed(1) : 0}% conversion</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={link.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {link.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCopyLink(link.url)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md hover:shadow-lg border border-gray-200"
                            >
                              <MoreVertical className="h-4 w-4 text-gray-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 bg-white border-gray-200 shadow-lg">
                            <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50">
                              <Send className="mr-2 h-4 w-4 text-blue-500" />
                              <span>Send Link</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50">
                              <Eye className="mr-2 h-4 w-4 text-green-500" />
                              <span>View Analytics</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50">
                              <Download className="mr-2 h-4 w-4 text-purple-500" />
                              <span>Export Data</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-6">
            <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
              <CardHeader>
                <CardTitle className="text-lavender">Referral Programs</CardTitle>
                <CardDescription>Manage your referral programs and rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {referralPrograms.map((program) => (
                    <div key={program.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-lavender/30 transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-lavender to-teal-500 rounded-full flex items-center justify-center">
                          <Target className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-ink">{program.name}</h3>
                          <p className="text-sm text-muted">{program.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted mt-1">
                            <span>Referrer: ${program.referralReward}</span>
                            <span>Referee: ${program.refereeReward}</span>
                            <span>Min: ${program.minPurchase}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right text-sm text-muted">
                          <p>{program.totalReferrals} referrals</p>
                          <p>${program.totalRewards.toFixed(2)} earned</p>
                        </div>
                        <Badge className={program.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {program.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md hover:shadow-lg border border-gray-200"
                            >
                              <MoreVertical className="h-4 w-4 text-gray-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 bg-white border-gray-200 shadow-lg">
                            <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50">
                              <Eye className="mr-2 h-4 w-4 text-blue-500" />
                              <span>View Details</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50">
                              <Share2 className="mr-2 h-4 w-4 text-green-500" />
                              <span>Create Link</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50">
                              <Download className="mr-2 h-4 w-4 text-purple-500" />
                              <span>Export Data</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-6">
            <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
              <CardHeader>
                <CardTitle className="text-lavender">All Referrals</CardTitle>
                <CardDescription>Complete list of referral activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {referrals.map((referral) => (
                    <div key={referral.id} className="p-4 bg-white rounded-lg border border-gray-200 hover:border-lavender/30 transition-all duration-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-lavender to-teal-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {referral.referrerName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-ink">{referral.referrerName}</h3>
                            <p className="text-sm text-muted">Referred: {referral.refereeName}</p>
                            <p className="text-sm text-muted">{referral.service}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-green-600">${referral.rewardAmount}</span>
                          <Badge className={getStatusColor(referral.status)}>
                            {getStatusIcon(referral.status)}
                            <span className="ml-1">{referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}</span>
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted">
                        <div className="flex items-center space-x-4">
                          <span>{referral.referrerEmail}</span>
                          <span>→</span>
                          <span>{referral.refereeEmail}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span>Created: {new Date(referral.createdAt).toLocaleDateString()}</span>
                          {referral.completedAt && (
                            <span>Completed: {new Date(referral.completedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Program Modal */}
        {showCreateProgram && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Create Referral Program</CardTitle>
                <CardDescription>Set up a new referral program</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Program Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Standard Referral Program"
                    value={newProgram.name}
                    onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Brief description of the program"
                    value={newProgram.description}
                    onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="referralReward">Referrer Reward ($)</Label>
                    <Input
                      id="referralReward"
                      type="number"
                      value={newProgram.referralReward}
                      onChange={(e) => setNewProgram({ ...newProgram, referralReward: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="refereeReward">Referee Reward ($)</Label>
                    <Input
                      id="refereeReward"
                      type="number"
                      value={newProgram.refereeReward}
                      onChange={(e) => setNewProgram({ ...newProgram, refereeReward: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minPurchase">Minimum Purchase ($)</Label>
                  <Input
                    id="minPurchase"
                    type="number"
                    value={newProgram.minPurchase}
                    onChange={(e) => setNewProgram({ ...newProgram, minPurchase: Number(e.target.value) })}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleCreateProgram}
                    className="flex-1 bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600 text-white"
                  >
                    Create Program
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateProgram(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
