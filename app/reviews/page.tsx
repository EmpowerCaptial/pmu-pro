"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageSquare, 
  Star, 
  Send, 
  Copy, 
  Share2, 
  Eye, 
  Calendar,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Filter,
  Download,
  MoreVertical
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NavBar } from '@/components/ui/navbar'
import { useDemoAuth } from '@/hooks/use-demo-auth'

interface Review {
  id: string
  clientName: string
  clientEmail: string
  service: string
  rating: number
  comment: string
  platform: 'google' | 'facebook' | 'yelp' | 'website'
  status: 'pending' | 'published' | 'hidden'
  createdAt: string
  publishedAt?: string
}

interface ReviewLink {
  id: string
  name: string
  url: string
  service: string
  sentTo: number
  responses: number
  createdAt: string
  isActive: boolean
}

const mockReviews: Review[] = [
  {
    id: '1',
    clientName: 'Sarah Johnson',
    clientEmail: 'sarah.j@email.com',
    service: 'Eyebrow Microblading',
    rating: 5,
    comment: 'Absolutely amazing work! Sarah made me feel so comfortable and the results are perfect. Highly recommend!',
    platform: 'google',
    status: 'published',
    createdAt: '2024-01-15T10:30:00Z',
    publishedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    clientName: 'Mike Chen',
    clientEmail: 'mike.c@email.com',
    service: 'Lip Blushing',
    rating: 4,
    comment: 'Great experience overall. The color turned out beautiful and the healing process was smooth.',
    platform: 'facebook',
    status: 'published',
    createdAt: '2024-01-18T14:20:00Z',
    publishedAt: '2024-01-18T14:20:00Z'
  },
  {
    id: '3',
    clientName: 'Emma Rodriguez',
    clientEmail: 'emma.r@email.com',
    service: 'Eyeliner Tattoo',
    rating: 5,
    comment: 'Perfect eyeliner that saves me so much time every morning. Emma is incredibly talented!',
    platform: 'website',
    status: 'published',
    createdAt: '2024-01-20T09:15:00Z',
    publishedAt: '2024-01-20T09:15:00Z'
  }
]

const mockReviewLinks: ReviewLink[] = [
  {
    id: '1',
    name: 'General Service Review',
    url: 'https://pmupro.com/review/abc123',
    service: 'All Services',
    sentTo: 45,
    responses: 12,
    createdAt: '2024-01-10T00:00:00Z',
    isActive: true
  },
  {
    id: '2',
    name: 'Eyebrow Service Review',
    url: 'https://pmupro.com/review/def456',
    service: 'Eyebrow Microblading',
    sentTo: 23,
    responses: 8,
    createdAt: '2024-01-12T00:00:00Z',
    isActive: true
  },
  {
    id: '3',
    name: 'Lip Service Review',
    url: 'https://pmupro.com/review/ghi789',
    service: 'Lip Blushing',
    sentTo: 18,
    responses: 5,
    createdAt: '2024-01-15T00:00:00Z',
    isActive: false
  }
]

export default function ReviewsPage() {
  const { currentUser } = useDemoAuth()
  const [reviews, setReviews] = useState<Review[]>(mockReviews)
  const [reviewLinks, setReviewLinks] = useState<ReviewLink[]>(mockReviewLinks)
  const [activeTab, setActiveTab] = useState('overview')
  const [showCreateLink, setShowCreateLink] = useState(false)
  const [newLink, setNewLink] = useState({
    name: '',
    service: '',
    platform: 'google'
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

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'google':
        return 'bg-blue-100 text-blue-800'
      case 'facebook':
        return 'bg-blue-100 text-blue-800'
      case 'yelp':
        return 'bg-red-100 text-red-800'
      case 'website':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'hidden':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'hidden':
        return <AlertCircle className="h-4 w-4 text-gray-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const handleCreateLink = () => {
    if (!newLink.name || !newLink.service) {
      alert('Please fill in required fields')
      return
    }

    const link: ReviewLink = {
      id: Date.now().toString(),
      name: newLink.name,
      url: `https://pmupro.com/review/${Math.random().toString(36).substr(2, 9)}`,
      service: newLink.service,
      sentTo: 0,
      responses: 0,
      createdAt: new Date().toISOString(),
      isActive: true
    }

    setReviewLinks([...reviewLinks, link])
    setNewLink({ name: '', service: '', platform: 'google' })
    setShowCreateLink(false)
    alert('Review link created successfully!')
  }

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    alert('Link copied to clipboard!')
  }

  const handleSendLink = (linkId: string) => {
    alert(`Send review link ${linkId} functionality would open here`)
  }

  const averageRating = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0
  const totalReviews = reviews.length
  const publishedReviews = reviews.filter(r => r.status === 'published').length
  const pendingReviews = reviews.filter(r => r.status === 'pending').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <NavBar currentPath="/reviews" user={user} />
      <main className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-ink mb-2">Client Reviews</h1>
              <p className="text-muted">Manage client feedback and build your reputation</p>
            </div>
            <Button 
              onClick={() => setShowCreateLink(true)}
              className="bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Review Link
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">Average Rating</p>
                  <p className="text-2xl font-bold text-ink">{averageRating.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">Total Reviews</p>
                  <p className="text-2xl font-bold text-ink">{totalReviews}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-lavender" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">Published</p>
                  <p className="text-2xl font-bold text-green-600">{publishedReviews}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingReviews}</p>
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
              value="links" 
              className="data-[state=active]:bg-teal-500 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Review Links
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              All Reviews
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Reviews */}
              <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
                <CardHeader>
                  <CardTitle className="text-lavender">Recent Reviews</CardTitle>
                  <CardDescription>Latest client feedback</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-ink">{review.clientName}</h3>
                            <p className="text-sm text-muted">{review.service}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <Badge className={getPlatformColor(review.platform)}>
                              {review.platform.charAt(0).toUpperCase() + review.platform.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted mb-2">{review.comment}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                          <Badge className={getStatusColor(review.status)}>
                            {getStatusIcon(review.status)}
                            <span className="ml-1">{review.status.charAt(0).toUpperCase() + review.status.slice(1)}</span>
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Review Links */}
              <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
                <CardHeader>
                  <CardTitle className="text-lavender">Active Review Links</CardTitle>
                  <CardDescription>Share these links with clients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviewLinks.filter(link => link.isActive).map((link) => (
                      <div key={link.id} className="p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-ink">{link.name}</h3>
                            <p className="text-sm text-muted">{link.service}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 mb-3">
                          <Input 
                            value={link.url} 
                            readOnly 
                            className="text-xs bg-gray-50"
                          />
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCopyLink(link.url)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted">
                          <span>Sent to {link.sentTo} clients</span>
                          <span>{link.responses} responses</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Review Links Tab */}
          <TabsContent value="links" className="space-y-6">
            <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
              <CardHeader>
                <CardTitle className="text-lavender">Review Links</CardTitle>
                <CardDescription>Create and manage review request links</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviewLinks.map((link) => (
                    <div key={link.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-lavender/30 transition-all duration-200 gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-lavender to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Share2 className="h-6 w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-ink truncate">{link.name}</h3>
                          <p className="text-sm text-muted truncate">{link.service}</p>
                          <p className="text-xs text-muted truncate">{link.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-2">
                        <div className="text-right text-sm text-muted">
                          <p>Sent: {link.sentTo}</p>
                          <p>Responses: {link.responses}</p>
                        </div>
                        <Badge className={link.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {link.isActive ? 'Active' : 'Inactive'}
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
                            <DropdownMenuItem 
                              className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
                              onClick={() => handleCopyLink(link.url)}
                            >
                              <Copy className="mr-2 h-4 w-4 text-blue-500" />
                              <span>Copy Link</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
                              onClick={() => handleSendLink(link.id)}
                            >
                              <Send className="mr-2 h-4 w-4 text-green-500" />
                              <span>Send to Clients</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
                              onClick={() => alert(`Viewing responses for ${link.name}`)}
                            >
                              <Eye className="mr-2 h-4 w-4 text-purple-500" />
                              <span>View Responses</span>
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

          {/* All Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
              <CardHeader>
                <CardTitle className="text-lavender">All Reviews</CardTitle>
                <CardDescription>Complete list of client reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 bg-white rounded-lg border border-gray-200 hover:border-lavender/30 transition-all duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-lavender to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold">
                              {review.clientName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-ink truncate">{review.clientName}</h3>
                            <p className="text-sm text-muted truncate">{review.service}</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge className={getPlatformColor(review.platform)}>
                              {review.platform.charAt(0).toUpperCase() + review.platform.slice(1)}
                            </Badge>
                            <Badge className={getStatusColor(review.status)}>
                              {getStatusIcon(review.status)}
                              <span className="ml-1">{review.status.charAt(0).toUpperCase() + review.status.slice(1)}</span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted mb-3">{review.comment}</p>
                      <div className="flex items-center justify-between text-xs text-muted">
                        <span>{review.clientEmail}</span>
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Review Link Modal */}
        {showCreateLink && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Create Review Link</CardTitle>
                <CardDescription>Generate a new review request link</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Link Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., General Service Review"
                    value={newLink.name}
                    onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service">Service</Label>
                  <Select value={newLink.service} onValueChange={(value) => setNewLink({ ...newLink, service: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Services">All Services</SelectItem>
                      <SelectItem value="Eyebrow Microblading">Eyebrow Microblading</SelectItem>
                      <SelectItem value="Lip Blushing">Lip Blushing</SelectItem>
                      <SelectItem value="Eyeliner Tattoo">Eyeliner Tattoo</SelectItem>
                      <SelectItem value="Touch-up Session">Touch-up Session</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={newLink.platform} onValueChange={(value) => setNewLink({ ...newLink, platform: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="yelp">Yelp</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleCreateLink}
                    className="flex-1 bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600 text-white"
                  >
                    Create Link
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateLink(false)}
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
