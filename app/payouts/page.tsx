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

interface Payout {
  id: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  method: 'stripe' | 'bank_transfer' | 'paypal'
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
  lastPayout: string
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
  const { currentUser } = useDemoAuth()
  const [payouts, setPayouts] = useState<Payout[]>(mockPayouts)
  const [summary, setSummary] = useState<PayoutSummary>(mockSummary)
  const [activeTab, setActiveTab] = useState('overview')
  const [timeFilter, setTimeFilter] = useState('week')
  const [loading, setLoading] = useState(false)

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
      case 'paypal':
        return <CreditCard className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const handleRequestPayout = () => {
    if (summary.availableBalance < 10) {
      alert('Minimum payout amount is $10.00')
      return
    }
    alert(`Request payout of $${summary.availableBalance.toFixed(2)} functionality would open here`)
  }

  const handleRefresh = () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      alert('Payout data refreshed!')
    }, 1000)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <NavBar currentPath="/payouts" user={user} />
      <main className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-ink mb-2">Payouts</h1>
              <p className="text-muted">Track your earnings and manage payouts</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline"
                onClick={handleRefresh}
                disabled={loading}
                className="border-lavender text-lavender hover:bg-lavender/10"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={handleRequestPayout}
                className="bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Request Payout
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">Available Balance</p>
                  <p className="text-2xl font-bold text-green-600">${summary.availableBalance.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">This Month</p>
                  <p className="text-2xl font-bold text-ink">${summary.thisMonthEarnings.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-lavender" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">Total Payouts</p>
                  <p className="text-2xl font-bold text-blue-600">${summary.totalPayouts.toFixed(2)}</p>
                </div>
                <ArrowUpRight className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">${summary.pendingAmount.toFixed(2)}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time Filter */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-muted">Filter by:</span>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
              value="history" 
              className="data-[state=active]:bg-teal-500 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              History
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Payouts */}
              <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
                <CardHeader>
                  <CardTitle className="text-lavender">Recent Payouts</CardTitle>
                  <CardDescription>Latest payout transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {payouts.slice(0, 3).map((payout) => (
                      <div key={payout.id} className="p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getMethodIcon(payout.method)}
                            <span className="font-semibold text-ink">${payout.netAmount.toFixed(2)}</span>
                          </div>
                          <Badge className={getStatusColor(payout.status)}>
                            {getStatusIcon(payout.status)}
                            <span className="ml-1">{payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted mb-2">{payout.description}</p>
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
                <CardHeader>
                  <CardTitle className="text-lavender">Payout Summary</CardTitle>
                  <CardDescription>Your earnings breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-sm font-medium text-muted">Total Earnings</span>
                      <span className="font-semibold text-ink">${summary.totalEarnings.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-sm font-medium text-muted">Total Payouts</span>
                      <span className="font-semibold text-blue-600">${summary.totalPayouts.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-sm font-medium text-muted">Available Balance</span>
                      <span className="font-semibold text-green-600">${summary.availableBalance.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-sm font-medium text-muted">Average Payout</span>
                      <span className="font-semibold text-purple-600">${summary.averagePayout.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-sm font-medium text-muted">Last Payout</span>
                      <span className="font-semibold text-muted">
                        {new Date(summary.lastPayout).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
              <CardHeader>
                <CardTitle className="text-lavender">Payout History</CardTitle>
                <CardDescription>Complete history of all payouts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPayouts.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-lavender/30 transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-lavender to-teal-500 rounded-full flex items-center justify-center">
                          {getMethodIcon(payout.method)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-ink">${payout.netAmount.toFixed(2)}</h3>
                          <p className="text-sm text-muted">{payout.description}</p>
                          <p className="text-xs text-muted">
                            {payout.processedAt ? `Processed: ${new Date(payout.processedAt).toLocaleDateString()}` : 'Processing...'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right text-sm text-muted">
                          <p>Gross: ${payout.amount.toFixed(2)}</p>
                          <p>Fees: ${payout.fees.toFixed(2)}</p>
                        </div>
                        <Badge className={getStatusColor(payout.status)}>
                          {getStatusIcon(payout.status)}
                          <span className="ml-1">{payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}</span>
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
                              <Download className="mr-2 h-4 w-4 text-green-500" />
                              <span>Download Receipt</span>
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

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
                <CardHeader>
                  <CardTitle className="text-lavender">Earnings Trend</CardTitle>
                  <CardDescription>Monthly earnings over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Chart visualization coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
                <CardHeader>
                  <CardTitle className="text-lavender">Payout Methods</CardTitle>
                  <CardDescription>Distribution by payment method</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-muted">Stripe</span>
                      </div>
                      <span className="font-semibold text-ink">85%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-2">
                        <Banknote className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-muted">Bank Transfer</span>
                      </div>
                      <span className="font-semibold text-ink">15%</span>
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
