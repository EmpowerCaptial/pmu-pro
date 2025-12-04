"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  Activity, 
  Shield, 
  LogOut, 
  Eye, 
  UserCheck, 
  UserX, 
  Clock, 
  Database,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Crown,
  UserPlus,
  Edit,
  Trash2,
  Plus,
  MessageSquare,
  FileText,
  CreditCard,
  Settings,
  TrendingUp,
  BarChart3,
  ClipboardList,
  User,
  History,
  Download,
  DollarSign,
  Target,
  Zap,
  Globe,
  Mail,
  Phone,
  MapPin,
  Award,
  Calendar,
  RefreshCw,
  KeyRound,
  Loader2
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface User {
  id: string
  name: string
  email: string
  businessName: string
  phone?: string
  licenseNumber: string
  licenseState: string
  yearsExperience?: string
  selectedPlan: string
  hasActiveSubscription: boolean
  isLicenseVerified: boolean
  role: string
  subscriptionStatus: string
  createdAt: string
  updatedAt: string
  clients: Array<{
    id: string
    name: string
    createdAt: string
  }>
  depositPayments: Array<{
    id: string
    amount: number
    status: string
    createdAt: string
  }>
}

interface Analytics {
  users: {
    total: number
    active: number
    pending: number
    newThisPeriod: number
  }
  clients: {
    total: number
    newThisPeriod: number
    averagePerUser: string
  }
  deposits: {
    total: number
    paid: number
    newThisPeriod: number
    totalRevenue: number
  }
  activity: {
    totalLogins: number
    activeSessions: number
    pageViews: number
    apiCalls: number
  }
  systemHealth: {
    uptime: string
    responseTime: string
    errorRate: string
    databaseStatus: string
    stripeStatus: string
    emailStatus: string
  }
}

export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState<User[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [passwordResetDialogOpen, setPasswordResetDialogOpen] = useState(false)
  const [userToReset, setUserToReset] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [passwordResetError, setPasswordResetError] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication
    const staffAuth = localStorage.getItem('staffAuth')
    if (staffAuth) {
      try {
        const authData = JSON.parse(staffAuth)
        setCurrentUser(authData)
        setIsAuthenticated(true)
        loadData()
      } catch (error) {
        console.error('Invalid auth data:', error)
      }
    }
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [usersRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/analytics')
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.data || [])
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        setAnalytics(analyticsData.data || null)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: string, plan?: string) => {
    try {
      const response = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, plan })
      })

      if (response.ok) {
        await loadData() // Reload data
        alert(`User ${action} successfully`)
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user')
    }
  }

  const openPasswordResetDialog = (user: User) => {
    // Check if current user is owner
    if (currentUser?.role?.toLowerCase() !== 'owner') {
      alert('Only owners can reset passwords')
      return
    }
    setUserToReset(user)
    setNewPassword('')
    setConfirmPassword('')
    setPasswordResetError(null)
    setPasswordResetDialogOpen(true)
  }

  const handleResetPassword = async () => {
    if (!userToReset || !currentUser) return

    if (!newPassword || !confirmPassword) {
      setPasswordResetError('Both password fields are required')
      return
    }

    if (newPassword.length < 8) {
      setPasswordResetError('Password must be at least 8 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordResetError('Passwords do not match')
      return
    }

    setIsResettingPassword(true)
    setPasswordResetError(null)

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email || ''
        },
        body: JSON.stringify({
          email: userToReset.email,
          newPassword,
          adminEmail: currentUser.email
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Password reset successfully for ${userToReset.name}`)
        setPasswordResetDialogOpen(false)
        setUserToReset(null)
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordResetError(data.error || 'Failed to reset password')
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      setPasswordResetError('Failed to reset password. Please try again.')
    } finally {
      setIsResettingPassword(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.businessName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || user.subscriptionStatus === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-gray-100 text-gray-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'suspended': return <XCircle className="h-4 w-4" />
      case 'expired': return <AlertTriangle className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {currentUser.firstName} {currentUser.lastName} 
                  <Badge className="ml-2" variant="outline">
                    {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                  </Badge>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={loadData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" onClick={() => {
                localStorage.removeItem('staffAuth')
                window.location.href = '/staff-admin/login'
              }}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 gap-2 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger 
              value="overview" 
              className="text-sm data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="text-sm data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="subscriptions" 
              className="text-sm data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Subscriptions
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="text-sm data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="system" 
              className="text-sm data-[state=active]:bg-gray-600 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              System
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {analytics && (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-blue-600">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-800">{analytics.users.total}</div>
                      <p className="text-xs text-blue-600">
                        {analytics.users.active} active • {analytics.users.pending} pending
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-green-600">Total Clients</CardTitle>
                      <User className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-800">{analytics.clients.total}</div>
                      <p className="text-xs text-green-600">
                        {analytics.clients.averagePerUser} avg per user
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-orange-50 border-orange-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-orange-600">Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-orange-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-800">
                        ${analytics.deposits.totalRevenue.toLocaleString()}
                      </div>
                      <p className="text-xs text-orange-600">
                        {analytics.deposits.paid} deposits paid
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 border-purple-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-purple-600">System Health</CardTitle>
                      <Zap className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-800">{analytics.systemHealth.uptime}</div>
                      <p className="text-xs text-purple-600">
                        {analytics.systemHealth.responseTime} response
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Activity Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-500" />
                        User Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Logins</span>
                          <Badge variant="outline">{analytics.activity.totalLogins}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Active Sessions</span>
                          <Badge className="bg-green-100 text-green-800">{analytics.activity.activeSessions}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Page Views</span>
                          <Badge variant="outline">{analytics.activity.pageViews}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">API Calls</span>
                          <Badge variant="outline">{analytics.activity.apiCalls}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        System Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Database</span>
                          <Badge className="bg-green-100 text-green-800">{analytics.systemHealth.databaseStatus}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Stripe</span>
                          <Badge className="bg-green-100 text-green-800">{analytics.systemHealth.stripeStatus}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Email</span>
                          <Badge className="bg-green-100 text-green-800">{analytics.systemHealth.emailStatus}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Error Rate</span>
                          <Badge className="bg-blue-100 text-blue-800">{analytics.systemHealth.errorRate}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-purple-500" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Button 
                          size="sm" 
                          className="w-full justify-start" 
                          variant="outline"
                          onClick={() => setActiveTab('users')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Manage Users
                        </Button>
                        <Button 
                          size="sm" 
                          className="w-full justify-start" 
                          variant="outline"
                          onClick={() => setActiveTab('subscriptions')}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          View Subscriptions
                        </Button>
                        <Button 
                          size="sm" 
                          className="w-full justify-start" 
                          variant="outline"
                          onClick={() => setActiveTab('analytics')}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Analytics
                        </Button>
                        <Button 
                          size="sm" 
                          className="w-full justify-start" 
                          variant="outline"
                          onClick={() => setActiveTab('system')}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          System Status
                        </Button>
                        <Button 
                          size="sm" 
                          className="w-full justify-start bg-purple-600 hover:bg-purple-700 text-white" 
                          onClick={() => window.open('/auth/create-instructor', '_blank')}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Create Instructor
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  User Management ({filteredUsers.length})
                </CardTitle>
                <CardDescription>
                  Manage user accounts, approve/reject subscriptions, and monitor user activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search and Filters */}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Input
                          data-testid="admin-user-search"
                          placeholder="Search users by name, email, or business..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Users List */}
                  <div className="space-y-3">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{user.name}</p>
                              <Badge className={getStatusColor(user.subscriptionStatus)}>
                                {getStatusIcon(user.subscriptionStatus)}
                                <span className="ml-1 capitalize">{user.subscriptionStatus}</span>
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-sm text-gray-500">{user.businessName}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Plan: {user.selectedPlan}</span>
                              <span>Clients: {user.clients.length}</span>
                              <span>Deposits: {user.depositPayments.length}</span>
                              <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {user.subscriptionStatus === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleUserAction(user.id, 'approve')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleUserAction(user.id, 'reject')}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {user.subscriptionStatus === 'active' && (
                            <Button
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'suspend')}
                              className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Suspend
                            </Button>
                          )}
                          {user.subscriptionStatus === 'suspended' && (
                            <Button
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Restore
                            </Button>
                          )}
                          {currentUser?.role?.toLowerCase() === 'owner' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openPasswordResetDialog(user)}
                              className="border-orange-300 text-orange-700 hover:bg-orange-50"
                            >
                              <KeyRound className="h-4 w-4 mr-1" />
                              Reset Password
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-500" />
                  Subscription Management
                </CardTitle>
                <CardDescription>
                  Monitor subscription status, revenue, and manage billing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Subscription Analytics</h3>
                  <p className="text-gray-600">Detailed subscription metrics and revenue tracking coming soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                  Business Analytics
                </CardTitle>
                <CardDescription>
                  Comprehensive business metrics and performance analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
                  <p className="text-gray-600">Detailed analytics dashboard with charts and insights coming soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  System Status
                </CardTitle>
                <CardDescription>
                  Monitor system health, performance, and configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">System Health</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Uptime</span>
                          <Badge className="bg-green-100 text-green-800">{analytics.systemHealth.uptime}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Response Time</span>
                          <Badge className="bg-blue-100 text-blue-800">{analytics.systemHealth.responseTime}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Error Rate</span>
                          <Badge className="bg-green-100 text-green-800">{analytics.systemHealth.errorRate}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold">Service Status</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Database</span>
                          <Badge className="bg-green-100 text-green-800">{analytics.systemHealth.databaseStatus}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Stripe</span>
                          <Badge className="bg-green-100 text-green-800">{analytics.systemHealth.stripeStatus}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Email Service</span>
                          <Badge className="bg-green-100 text-green-800">{analytics.systemHealth.emailStatus}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Password Reset Dialog */}
      <Dialog open={passwordResetDialogOpen} onOpenChange={setPasswordResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Reset password for {userToReset?.name} ({userToReset?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {passwordResetError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {passwordResetError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 8 characters)"
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                minLength={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={isResettingPassword}>
              {isResettingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4 mr-2" />
                  Reset Password
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
