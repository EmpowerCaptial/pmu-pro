"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Download, 
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  RefreshCw,
  Eye,
  MoreVertical,
  AlertTriangle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { NavBar } from '@/components/ui/navbar'

interface Payout {
  id: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  method: 'stripe' | 'bank_transfer'
  createdAt: string
  processedAt?: string
  description: string
  fees: number
  netAmount: number
}

interface PayoutSummary {
  totalEarnings: number
  totalPayouts: number
  pendingAmount: number
  availableBalance: number
  thisMonthEarnings: number
  lastPayout: string | null
  averagePayout: number
}

const mockPayouts: Payout[] = [
  {
    id: '1',
    amount: 1250.00,
    status: 'completed',
    method: 'stripe',
    createdAt: '2024-01-20T10:30:00Z',
    processedAt: '2024-01-20T11:15:00Z',
    description: 'Weekly payout for services',
    fees: 37.50,
    netAmount: 1212.50
  },
  {
    id: '2',
    amount: 890.00,
    status: 'completed',
    method: 'stripe',
    createdAt: '2024-01-13T10:30:00Z',
    processedAt: '2024-01-13T11:15:00Z',
    description: 'Weekly payout for services',
    fees: 26.70,
    netAmount: 863.30
  },
  {
    id: '3',
    amount: 2100.00,
    status: 'processing',
    method: 'stripe',
    createdAt: '2024-01-27T10:30:00Z',
    description: 'Weekly payout for services',
    fees: 63.00,
    netAmount: 2037.00
  },
  {
    id: '4',
    amount: 750.00,
    status: 'pending',
    method: 'stripe',
    createdAt: '2024-01-28T14:20:00Z',
    description: 'Daily payout for services',
    fees: 22.50,
    netAmount: 727.50
  }
]

const mockSummary: PayoutSummary = {
  totalEarnings: 15680.00,
  totalPayouts: 14250.00,
  pendingAmount: 2850.00,
  availableBalance: 750.00,
  thisMonthEarnings: 4850.00,
  lastPayout: '2024-01-20T11:15:00Z',
  averagePayout: 1187.50
}

export default function PayoutsPage() {
  const { currentUser, isLoading } = useDemoAuth()
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [summary, setSummary] = useState<PayoutSummary | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [timeFilter, setTimeFilter] = useState('week')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user has permission to access payouts
  const hasPayoutsAccess = currentUser && 
    (currentUser.role === 'owner' || 
     currentUser.role === 'manager' || 
     currentUser.role === 'director') &&
    (currentUser as any)?.selectedPlan === 'studio'

  // Load payout data
  useEffect(() => {
    if (currentUser?.email) {
      loadPayoutData()
    }
  }, [currentUser?.email])

  const loadPayoutData = async () => {
    if (!currentUser?.email) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/payouts', {
        headers: {
          'x-user-email': currentUser.email
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch payout data: ${response.statusText}`)
      }

      const data = await response.json()
      setSummary(data.summary)
      setPayouts(data.payouts || [])
    } catch (err) {
      console.error('Error loading payout data:', err)
      setError('Failed to load payout data')
      
      // Fallback to empty state for new artists
      setSummary({
        totalEarnings: 0,
        totalPayouts: 0,
        pendingAmount: 0,
        availableBalance: 0,
        thisMonthEarnings: 0,
        lastPayout: null,
        averagePayout: 0
      })
      setPayouts([])
    } finally {
      setLoading(false)
    }
  }

  // Fallback user if not authenticated
  const user = currentUser ? {
    name: currentUser.name,
    email: currentUser.email,
    initials: currentUser.name?.split(' ').map(n => n[0]).join('') || currentUser.email.charAt(0).toUpperCase()
  } : {
    name: "PMU Artist",
    email: "user@pmupro.com",
    initials: "PA",
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'stripe':
        return <CreditCard className="h-4 w-4" />
      case 'bank_transfer':
        return <Banknote className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const handleRequestPayout = async () => {
    if (!summary || summary.availableBalance < 10) {
      alert('Minimum payout amount is $10.00')
      return
    }
    
    if (!currentUser?.email) return
    
    try {
      const response = await fetch('/api/payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          amount: summary.availableBalance
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        // Refresh the data
        loadPayoutData()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to request payout')
      }
    } catch (error) {
      console.error('Error requesting payout:', error)
      alert('Failed to request payout. Please try again.')
    }
  }

  const handleRefresh = () => {
    loadPayoutData()
  }

  const filteredPayouts = payouts.filter(payout => {
    const payoutDate = new Date(payout.createdAt)
    const now = new Date()
    
    switch (timeFilter) {
      case 'day':
        return payoutDate.toDateString() === now.toDateString()
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return payoutDate >= weekAgo
      case 'month':
        return payoutDate.getMonth() === now.getMonth() && payoutDate.getFullYear() === now.getFullYear()
      case 'year':
        return payoutDate.getFullYear() === now.getFullYear()
      default:
        return true
    }
  })

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
        <NavBar />
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lavender mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Access denied for unauthorized users
  if (!hasPayoutsAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
        <NavBar />
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
              <p className="text-gray-600 mb-4">
                Payout management is only available to studio owners, managers, and directors.
              </p>
              <p className="text-sm text-gray-500">
                Your current role: <span className="font-medium">{currentUser?.role || 'Unknown'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <NavBar currentPath="/payouts" user={user} />
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl relative z-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-1 sm:mb-2">Payouts</h1>
              <p className="text-muted text-sm sm:text-base">Track your earnings and manage payouts</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <Button 
                variant="outline"
                onClick={handleRefresh}
                disabled={loading}
                className="border-lavender text-lavender hover:bg-lavender/10 text-sm sm:text-base w-full sm:w-auto"
              >
                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={handleRequestPayout}
                className="bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
              >
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Request Payout
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-lavender" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="mb-6 sm:mb-8">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-700">{error}</p>
                <Button 
                  onClick={handleRefresh}
                  variant="outline"
                  className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : summary ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted">Available Balance</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">${summary.availableBalance.toFixed(2)}</p>
                </div>
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted">This Month</p>
                  <p className="text-lg sm:text-2xl font-bold text-ink">${summary.thisMonthEarnings.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-lavender" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted">Total Payouts</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">${summary.totalPayouts.toFixed(2)}</p>
                </div>
                <ArrowUpRight className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted">Pending</p>
                  <p className="text-lg sm:text-2xl font-bold text-yellow-600">${summary.pendingAmount.toFixed(2)}</p>
                </div>
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
              <CardContent className="p-3 sm:p-6 text-center">
                <p className="text-gray-500">No data available</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Time Filter */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <span className="text-xs sm:text-sm font-medium text-muted">Filter by:</span>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-full sm:w-32 h-9 sm:h-10 text-sm sm:text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day" className="text-sm sm:text-base">Today</SelectItem>
                <SelectItem value="week" className="text-sm sm:text-base">This Week</SelectItem>
                <SelectItem value="month" className="text-sm sm:text-base">This Month</SelectItem>
                <SelectItem value="year" className="text-sm sm:text-base">This Year</SelectItem>
                <SelectItem value="all" className="text-sm sm:text-base">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 h-9 sm:h-10">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-lavender data-[state=active]:text-white data-[state=active]:shadow-md text-xs sm:text-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="data-[state=active]:bg-teal-500 data-[state=active]:text-white data-[state=active]:shadow-md text-xs sm:text-sm"
            >
              History
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md text-xs sm:text-sm"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Recent Payouts */}
              <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-lavender text-base sm:text-lg">Recent Payouts</CardTitle>
                  <CardDescription className="text-sm sm:text-base">Latest payout transactions</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    {payouts.slice(0, 3).map((payout) => (
                      <div key={payout.id} className="p-3 sm:p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getMethodIcon(payout.method)}
                            <span className="font-semibold text-ink text-sm sm:text-base">${payout.netAmount.toFixed(2)}</span>
                          </div>
                          <Badge className={`${getStatusColor(payout.status)} text-xs`}>
                            {getStatusIcon(payout.status)}
                            <span className="ml-1">{payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}</span>
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted mb-2">{payout.description}</p>
                        <div className="flex items-center justify-between text-xs text-muted">
                          <span>Fees: ${payout.fees.toFixed(2)}</span>
                          <span>{new Date(payout.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payout Summary */}
              <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-lavender text-base sm:text-lg">Payout Summary</CardTitle>
                  <CardDescription className="text-sm sm:text-base">Your earnings breakdown</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-xs sm:text-sm font-medium text-muted">Total Earnings</span>
                      <span className="font-semibold text-ink text-sm sm:text-base">${summary?.totalEarnings?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-xs sm:text-sm font-medium text-muted">Total Payouts</span>
                      <span className="font-semibold text-blue-600 text-sm sm:text-base">${summary?.totalPayouts?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-xs sm:text-sm font-medium text-muted">Available Balance</span>
                      <span className="font-semibold text-green-600 text-sm sm:text-base">${summary?.availableBalance?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-xs sm:text-sm font-medium text-muted">Average Payout</span>
                      <span className="font-semibold text-purple-600 text-sm sm:text-base">${summary?.averagePayout?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-xs sm:text-sm font-medium text-muted">Last Payout</span>
                      <span className="font-semibold text-muted text-xs sm:text-sm">
                        {summary?.lastPayout ? new Date(summary.lastPayout).toLocaleDateString() : 'No payouts yet'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4 sm:space-y-6">
            <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-lavender text-base sm:text-lg">Payout History</CardTitle>
                <CardDescription className="text-sm sm:text-base">Complete history of all payouts</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {filteredPayouts.map((payout) => (
                    <div key={payout.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-white rounded-lg border border-gray-200 hover:border-lavender/30 transition-all duration-200 gap-3 sm:gap-0">
                      <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-lavender to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                          {getMethodIcon(payout.method)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-ink text-sm sm:text-base">${payout.netAmount.toFixed(2)}</h3>
                          <p className="text-xs sm:text-sm text-muted truncate">{payout.description}</p>
                          <p className="text-xs text-muted">
                            {payout.processedAt ? `Processed: ${new Date(payout.processedAt).toLocaleDateString()}` : 'Processing...'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right text-xs sm:text-sm text-muted">
                          <p>Gross: ${payout.amount.toFixed(2)}</p>
                          <p>Fees: ${payout.fees.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getStatusColor(payout.status)} text-xs`}>
                            {getStatusIcon(payout.status)}
                            <span className="ml-1">{payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}</span>
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-white/90 hover:bg-white shadow-md hover:shadow-lg border border-gray-200"
                              >
                                <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 bg-white border-gray-200 shadow-lg">
                              <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 text-xs sm:text-sm">
                                <Eye className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 text-xs sm:text-sm">
                                <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                                <span>Download Receipt</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-lavender text-base sm:text-lg">Earnings Trend</CardTitle>
                  <CardDescription className="text-sm sm:text-base">Monthly earnings over time</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm sm:text-base">Chart visualization coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-lavender text-base sm:text-lg">Payout Methods</CardTitle>
                  <CardDescription className="text-sm sm:text-base">Distribution by payment method</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                        <span className="text-xs sm:text-sm font-medium text-muted">Stripe</span>
                      </div>
                      <span className="font-semibold text-ink text-sm sm:text-base">85%</span>
                    </div>
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-2">
                        <Banknote className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                        <span className="text-xs sm:text-sm font-medium text-muted">Bank Transfer</span>
                      </div>
                      <span className="font-semibold text-ink text-sm sm:text-base">15%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
