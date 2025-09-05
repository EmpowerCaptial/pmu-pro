"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Calendar, 
  FileText, 
  DollarSign, 
  MessageSquare, 
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Send,
  Plus,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  CalendarDays,
  File,
  MessageCircle,
  Activity,
  Settings,
  LogOut,
  Star,
  Gift,
  Users,
  Award,
  TrendingUp,
  Shield,
  Building,
  PiggyBank,
  Sparkles,
  Heart,
  Home,
  Search,
  ShoppingBag
} from 'lucide-react'
import { 
  ClientPortalUser,
  ClientPortalDocument,
  ClientPortalAppointment,
  ClientPortalPayment,
  ClientPortalMessage,
  ClientPortalActivity
} from '@/types/client-portal'
import { ClientPortalService } from '@/lib/client-portal-service'
import { EnhancedClientProfile } from '@/types/client-pipeline'
import { PointSystemService } from '@/lib/point-system-service'
import { ClientSettingsModal } from '@/components/portal/client-settings-modal'
import { updateClientFromPortal } from '@/lib/client-storage'
import { ServiceShowcase } from '@/components/portal/service-showcase'
import { ClientProgress } from '@/components/portal/client-progress'
import { PartnerFacilities } from '@/components/portal/partner-facilities'

interface ClientPortalDashboardProps {
  client: EnhancedClientProfile
  portalUser: ClientPortalUser
}

export default function ClientPortalDashboard({ client, portalUser }: ClientPortalDashboardProps) {
  const [activeTab, setActiveTab] = useState('home')
  const [documents, setDocuments] = useState<ClientPortalDocument[]>([])
  const [appointments, setAppointments] = useState<ClientPortalAppointment[]>([])
  const [payments, setPayments] = useState<ClientPortalPayment[]>([])
  const [messages, setMessages] = useState<ClientPortalMessage[]>([])
  const [activities, setActivities] = useState<ClientPortalActivity[]>([])
  const [currentClient, setCurrentClient] = useState<EnhancedClientProfile>(client)

  const portalService = ClientPortalService.getInstance()
  const pointSystem = PointSystemService.getInstance()

  // Mock progress data for RepeatMD-style interface
  const clientProgress = {
    totalPoints: 275,
    level: 3,
    nextLevelPoints: 100,
    completedServices: ['microblading', 'touchup'],
    upcomingAppointments: appointments.filter(a => a.status === 'scheduled'),
    milestones: [
      {
        id: 'first-service',
        title: 'First Service',
        description: 'Completed your first PMU service',
        icon: <Heart className="h-4 w-4" />,
        completed: true,
        date: '2024-01-15',
        points: 50
      },
      {
        id: 'touchup-complete',
        title: 'Touch-Up Complete',
        description: 'Completed your touch-up session',
        icon: <CheckCircle className="h-4 w-4" />,
        completed: true,
        date: '2024-02-20',
        points: 25
      },
      {
        id: 'referral',
        title: 'Refer a Friend',
        description: 'Successfully referred a friend',
        icon: <Users className="h-4 w-4" />,
        completed: false,
        points: 100
      },
      {
        id: 'annual',
        title: 'Annual Member',
        description: 'Been a client for over a year',
        icon: <Award className="h-4 w-4" />,
        completed: false,
        points: 200
      }
    ]
  }

  // Service showcase progress data
  const serviceProgress = {
    completedServices: ['microblading', 'touchup'],
    nextRecommended: 'lip-blush',
    points: 275
  }

  const handleClientUpdate = (updatedClient: EnhancedClientProfile) => {
    setCurrentClient(updatedClient)
    
    // Sync with main client storage
    const clientUpdate = {
      name: `${updatedClient.firstName} ${updatedClient.lastName}`,
      email: updatedClient.email,
      phone: updatedClient.phone,
      dateOfBirth: updatedClient.dateOfBirth?.toISOString(),
      medicalConditions: updatedClient.preferences?.medicalConditions || [],
      medications: [], // Not in EnhancedClientProfile
      allergies: updatedClient.preferences?.allergies || [],
      emergencyContact: updatedClient.emergencyContact,
      emergencyPhone: '', // Not in EnhancedClientProfile
      // Add avatar as a custom field
      avatar: (updatedClient as any).avatar,
      // Add insurance information
      insurance: (updatedClient as any).insurance ? [{
        id: `insurance_${updatedClient.id}`,
        provider: (updatedClient as any).insurance.provider,
        policyNumber: (updatedClient as any).insurance.policyNumber,
        groupNumber: (updatedClient as any).insurance.groupNumber,
        subscriberName: `${updatedClient.firstName} ${updatedClient.lastName}`,
        relationship: 'self',
        expirationDate: (updatedClient as any).insurance.expirationDate,
      }] : [],
    }
    
    updateClientFromPortal(updatedClient.id, clientUpdate)
  }

  const handleViewDocuments = () => {
    setActiveTab('documents')
  }

  const handleViewMessages = () => {
    setActiveTab('messages')
  }

  const handleViewAppointments = () => {
    setActiveTab('appointments')
  }

  const handleViewPaymentHistory = () => {
    setActiveTab('payments')
  }

  const handleSignOut = () => {
    // Clear authentication and redirect to login
    window.location.href = '/client-portal/' + client.id
  }

  const handleBrowseProducts = () => {
    // Navigate to products page or open products modal
    setActiveTab('products')
  }

  const handleBookService = () => {
    // Navigate to booking page or open booking modal
    window.open('/booking', '_blank')
  }

  const handleBuyGiftCard = () => {
    // Navigate to gift card page or open gift card modal
    setActiveTab('gift-cards')
  }

  const handleRedeemReward = (rewardId: string) => {
    // Handle reward redemption
    console.log('Redeeming reward:', rewardId)
    // In production, this would call an API to redeem the reward
  }

  useEffect(() => {
    // Load client portal data
    setDocuments(portalService.getClientDocuments(client.id))
    setAppointments(portalService.getClientAppointments(client.id))
    setPayments(portalService.getClientPayments(client.id))
    setMessages(portalService.getClientMessages(client.id))
    setActivities(portalService.getClientActivity(client.id))
  }, [client.id])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusIcon = (status: ClientPortalPayment['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.scheduledDate) > new Date() && apt.status !== 'cancelled'
  )

  const pendingPayments = payments.filter(pay => pay.status === 'pending')
  const unreadMessages = messages.filter(msg => !msg.isRead)

  // Point system data
  const clientPoints = pointSystem.getClientPoints(client.id)
  const referralProgram = pointSystem.getReferralProgram(client.id)
  const creditApplication = pointSystem.getCreditApplication(client.id)
  const availableRewards = pointSystem.getAvailableRewards(client.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                {(currentClient as any).avatar ? (
                  <img
                    src={(currentClient as any).avatar}
                    alt={`${currentClient.firstName} ${currentClient.lastName}`}
                    className="w-10 h-10 rounded-full object-cover border-2 border-lavender"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-lavender to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials(currentClient.firstName, currentClient.lastName)}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Welcome back, {currentClient.firstName}!</h1>
                <p className="text-sm text-gray-600">Your PMU Pro Client Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Reward Points Badge */}
              <Badge variant="outline" className="bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300 text-yellow-800">
                <Star className="h-3 w-3 mr-1" />
                {clientPoints?.totalPoints || 0} pts
              </Badge>
              {/* Activity Badge */}
              <Badge variant="outline" className="bg-gradient-to-r from-blue-100 to-purple-100 border-blue-300 text-blue-800">
                <Activity className="h-3 w-3 mr-1" />
                {activities.length}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Content Sections */}
          <div className="space-y-6">
            {/* Home Tab */}
            {activeTab === 'home' && (
              <div className="space-y-8">
                {/* Welcome Section */}
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-lavender">
                    <Sparkles className="h-6 w-6" />
                    <h2 className="text-2xl font-bold">Welcome back, {currentClient.firstName}! 👋</h2>
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <p className="text-gray-600">
                    Your PMU journey continues with exclusive services and rewards
                  </p>
                </div>

                {/* Progress Section */}
                <ClientProgress 
                  clientName={currentClient.firstName}
                  totalPoints={clientProgress.totalPoints}
                  level={clientProgress.level}
                  nextLevelPoints={clientProgress.nextLevelPoints}
                  completedServices={clientProgress.completedServices}
                  upcomingAppointments={clientProgress.upcomingAppointments}
                  milestones={clientProgress.milestones}
                />
              </div>
            )}

            {/* Discover Tab */}
            {activeTab === 'discover' && (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">Discover</h2>
                  <p className="text-gray-600">Explore our services and partner facilities</p>
                </div>

                {/* Service Showcase */}
                <ServiceShowcase 
                  onServiceSelect={(service) => {
                    console.log('Selected service:', service)
                    // Handle service selection
                  }}
                  clientProgress={serviceProgress}
                />

                {/* Partner Facilities */}
                <PartnerFacilities 
                  onBookConsultation={(facility) => {
                    console.log('Booking consultation with:', facility)
                    // Handle facility booking
                  }}
                />
              </div>
            )}

            {/* Shop Tab */}
            {activeTab === 'shop' && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">Shop</h2>
                  <p className="text-gray-600">Browse our products and services</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-lavender to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <ShoppingBag className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">PMU Products</h3>
                        <p className="text-gray-600 text-sm mb-4">Professional-grade pigments and tools</p>
                        <Button className="w-full" onClick={handleBrowseProducts}>Browse Products</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calendar className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Book Services</h3>
                        <p className="text-gray-600 text-sm mb-4">Schedule your next appointment</p>
                        <Button className="w-full" onClick={handleBookService}>Book Now</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Gift className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Gift Cards</h3>
                        <p className="text-gray-600 text-sm mb-4">Give the gift of beauty</p>
                        <Button className="w-full" onClick={handleBuyGiftCard}>Buy Gift Card</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">PMU Products</h2>
                  <p className="text-gray-600">Professional-grade pigments and tools</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Product Card 1 */}
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Sparkles className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Premium Pigments</h3>
                        <p className="text-gray-600 text-sm mb-4">High-quality, long-lasting pigments</p>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-lg font-bold text-lavender">$45</span>
                          <Badge variant="secondary">Best Seller</Badge>
                        </div>
                        <Button className="w-full">Add to Cart</Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Product Card 2 */}
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Activity className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Aftercare Kit</h3>
                        <p className="text-gray-600 text-sm mb-4">Essential aftercare products</p>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-lg font-bold text-lavender">$35</span>
                          <Badge variant="secondary">New</Badge>
                        </div>
                        <Button className="w-full">Add to Cart</Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Product Card 3 */}
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Shield className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Numbing Cream</h3>
                        <p className="text-gray-600 text-sm mb-4">Professional numbing solution</p>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-lg font-bold text-lavender">$25</span>
                          <Badge variant="secondary">Popular</Badge>
                        </div>
                        <Button className="w-full">Add to Cart</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Back to Shop Button */}
                <div className="text-center">
                  <Button variant="outline" onClick={() => setActiveTab('shop')}>
                    ← Back to Shop
                  </Button>
                </div>
              </div>
            )}

            {/* Gift Cards Tab */}
            {activeTab === 'gift-cards' && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">Gift Cards</h2>
                  <p className="text-gray-600">Give the gift of beauty</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Gift Card Option 1 */}
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Gift className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">$50 Gift Card</h3>
                        <p className="text-gray-600 text-sm mb-4">Perfect for a touch-up session</p>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-lg font-bold text-lavender">$50</span>
                          <Badge variant="secondary">Popular</Badge>
                        </div>
                        <Button className="w-full">Purchase</Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Gift Card Option 2 */}
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Gift className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">$100 Gift Card</h3>
                        <p className="text-gray-600 text-sm mb-4">Great for a full service</p>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-lg font-bold text-lavender">$100</span>
                          <Badge variant="secondary">Best Value</Badge>
                        </div>
                        <Button className="w-full">Purchase</Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Gift Card Option 3 */}
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Gift className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">$200 Gift Card</h3>
                        <p className="text-gray-600 text-sm mb-4">Premium package deal</p>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-lg font-bold text-lavender">$200</span>
                          <Badge variant="secondary">Premium</Badge>
                        </div>
                        <Button className="w-full">Purchase</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Back to Shop Button */}
                <div className="text-center">
                  <Button variant="outline" onClick={() => setActiveTab('shop')}>
                    ← Back to Shop
                  </Button>
                </div>
              </div>
            )}

            {/* Rewards Tab */}
            {activeTab === 'rewards' && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">Rewards</h2>
                  <p className="text-gray-600">Earn points and redeem rewards</p>
                </div>

                {/* Points Summary */}
                <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="h-10 w-10 text-white" />
                      </div>
                                             <h3 className="text-2xl font-bold text-gray-900 mb-2">{clientPoints?.totalPoints || 0} Points</h3>
                       <p className="text-gray-600">{clientPoints?.currentTier || 'bronze'} Member</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Available Rewards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableRewards.map((reward) => (
                    <Card key={reward.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Gift className="h-6 w-6 text-white" />
                          </div>
                                                     <div className="flex-1">
                             <h4 className="font-semibold">{reward.description}</h4>
                             <p className="text-sm text-gray-600">{reward.type.replace('_', ' ')}</p>
                             <p className="text-sm font-medium text-purple-600">{reward.pointsCost} points</p>
                           </div>
                          <Button size="sm" variant="outline" onClick={() => handleRedeemReward(reward.id)}>Redeem</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">Account</h2>
                  <p className="text-gray-600">Manage your profile and settings</p>
                </div>

                {/* Profile Section */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        {(currentClient as any).avatar ? (
                          <img
                            src={(currentClient as any).avatar}
                            alt={`${currentClient.firstName} ${currentClient.lastName}`}
                            className="w-16 h-16 rounded-full object-cover border-2 border-lavender"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-lavender to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                            {getInitials(currentClient.firstName, currentClient.lastName)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{currentClient.firstName} {currentClient.lastName}</h3>
                        <p className="text-gray-600">{currentClient.email}</p>
                        <p className="text-gray-600">{currentClient.phone}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <ClientSettingsModal 
                        client={currentClient} 
                        onUpdate={handleClientUpdate}
                        trigger={
                          <Button className="w-full">
                            <Settings className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Button>
                        }
                      />
                      
                      <Button variant="outline" className="w-full" onClick={handleViewDocuments}>
                        <FileText className="h-4 w-4 mr-2" />
                        View Documents
                      </Button>
                      
                      <Button variant="outline" className="w-full" onClick={handleViewMessages}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Messages
                      </Button>
                      
                      <Button variant="outline" className="w-full" onClick={handleViewAppointments}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Appointments
                      </Button>
                      
                      <Button variant="outline" className="w-full" onClick={handleViewPaymentHistory}>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Payment History
                      </Button>
                      
                      <Button variant="outline" className="w-full text-red-600 hover:text-red-700" onClick={handleSignOut}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
                  <p className="text-gray-600">View and manage your documents</p>
                </div>

                <Card>
                  <CardContent className="p-6">
                    {documents.length > 0 ? (
                      <div className="space-y-4">
                        {documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="h-8 w-8 text-lavender" />
                              <div>
                                <h4 className="font-semibold">{doc.title}</h4>
                                <p className="text-sm text-gray-600">{doc.type} • {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents</h3>
                        <p className="text-gray-600">You don't have any documents yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
                  <p className="text-gray-600">Communicate with your PMU artist</p>
                </div>

                <Card>
                  <CardContent className="p-6">
                    {messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div key={msg.id} className={`p-4 border rounded-lg ${!msg.isRead ? 'bg-blue-50 border-blue-200' : ''}`}>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{msg.subject}</h4>
                              <span className="text-sm text-gray-500">{new Date(msg.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-600 mb-3">{msg.content}</p>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Reply
                              </Button>
                              {!msg.isRead && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Messages</h3>
                        <p className="text-gray-600">You don't have any messages yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
                  <p className="text-gray-600">View and manage your appointments</p>
                </div>

                <Card>
                  <CardContent className="p-6">
                    {appointments.length > 0 ? (
                      <div className="space-y-4">
                        {appointments.map((apt) => (
                          <div key={apt.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{apt.type}</h4>
                              <Badge variant={apt.status === 'scheduled' ? 'default' : 'secondary'}>
                                {apt.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-2">{new Date(apt.scheduledDate).toLocaleDateString()} at {apt.type}</p>
                            <p className="text-sm text-gray-500 mb-3">{apt.notes}</p>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Calendar className="h-4 w-4 mr-2" />
                                Reschedule
                              </Button>
                              <Button variant="outline" size="sm">
                                <Phone className="h-4 w-4 mr-2" />
                                Contact
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Appointments</h3>
                        <p className="text-gray-600">You don't have any appointments scheduled.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Payment History Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
                  <p className="text-gray-600">View your payment history and invoices</p>
                </div>

                <Card>
                  <CardContent className="p-6">
                    {payments.length > 0 ? (
                      <div className="space-y-4">
                        {payments.map((payment) => (
                          <div key={payment.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{payment.type}</h4>
                              <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                                {payment.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-2">${payment.amount} • {new Date(payment.createdAt).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-500 mb-3">{payment.description}</p>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Invoice
                              </Button>
                              <Button variant="outline" size="sm">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Receipt
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payments</h3>
                        <p className="text-gray-600">You don't have any payment history yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center py-2">
          {/* Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              activeTab === 'home' 
                ? 'text-lavender bg-lavender/10' 
                : 'text-gray-600 hover:text-lavender'
            }`}
          >
            <Home className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </button>

          {/* Discover */}
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              activeTab === 'discover' 
                ? 'text-lavender bg-lavender/10' 
                : 'text-gray-600 hover:text-lavender'
            }`}
          >
            <Search className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">Discover</span>
          </button>

          {/* Shop */}
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              activeTab === 'shop' 
                ? 'text-lavender bg-lavender/10' 
                : 'text-gray-600 hover:text-lavender'
            }`}
          >
            <ShoppingBag className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">Shop</span>
          </button>

          {/* Rewards */}
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              activeTab === 'rewards' 
                ? 'text-lavender bg-lavender/10' 
                : 'text-gray-600 hover:text-lavender'
            }`}
          >
            <Star className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">Rewards</span>
          </button>

          {/* Account */}
          <button
            onClick={() => setActiveTab('account')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              activeTab === 'account' 
                ? 'text-lavender bg-lavender/10' 
                : 'text-gray-600 hover:text-lavender'
            }`}
          >
            <User className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">Account</span>
          </button>
        </div>
      </div>
    </div>
  )
}
