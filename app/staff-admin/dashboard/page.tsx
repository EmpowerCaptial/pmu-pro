"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  User
} from 'lucide-react'
import { 
  StaffMember, 
  hasPermission, 
  getStaffMembers, 
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
  type StaffRole 
} from '@/lib/staff-auth'
import { setArtistViewMode } from '@/lib/artist-view-mode'
import ApplicationReview from '@/components/staff/application-review'
import TicketManagement from '@/components/staff/ticket-management'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  status: string;
}

interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  lastLogin: string;
  createdAt: string;
  subscriptionStatus: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Complaint {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string;
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function StaffAdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const router = useRouter()

  // Mock data for demonstration
  const mockActivityLogs: ActivityLog[] = [
    {
      id: '1',
      timestamp: '2024-01-15T10:30:00Z',
      userId: 'user123',
      userName: 'john.doe@example.com',
      action: 'LOGIN',
      details: 'User logged in successfully',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome/120.0.0.0',
      status: 'success'
    },
    {
      id: '2',
      timestamp: '2024-01-15T10:25:00Z',
      userId: 'user456',
      userName: 'jane.smith@example.com',
      action: 'DOCUMENT_UPLOAD',
      details: 'Uploaded client consent form',
      ipAddress: '192.168.1.101',
      userAgent: 'Safari/17.0',
      status: 'success'
    },
    {
      id: '3',
      timestamp: '2024-01-15T10:20:00Z',
      userId: 'user789',
      userName: 'bob.wilson@example.com',
      action: 'PAYMENT_FAILED',
      details: 'Stripe payment failed - insufficient funds',
      ipAddress: '192.168.1.102',
      userAgent: 'Firefox/121.0',
      status: 'error'
    },
    {
      id: '4',
      timestamp: '2024-01-15T10:15:00Z',
      userId: 'staff001',
      userName: 'manager1@pmupro.com',
      action: 'APPLICATION_APPROVED',
      details: 'Approved artist application for Sarah Johnson',
      ipAddress: '192.168.1.103',
      userAgent: 'Chrome/120.0.0.0',
      status: 'success'
    },
    {
      id: '5',
      timestamp: '2024-01-15T10:10:00Z',
      userId: 'user999',
      userName: 'emma.wilson@pmu.com',
      action: 'SKIN_ANALYSIS',
      details: 'Completed Fitzpatrick analysis - Type III detected',
      ipAddress: '192.168.1.104',
      userAgent: 'Edge/120.0.0.0',
      status: 'success'
    },
    {
      id: '6',
      timestamp: '2024-01-15T10:05:00Z',
      userId: 'user888',
      userName: 'maria.garcia@pmu.com',
      action: 'CLIENT_CREATED',
      details: 'New client profile created for Maria Garcia',
      ipAddress: '192.168.1.105',
      userAgent: 'Safari/17.0',
      status: 'success'
    },
    {
      id: '7',
      timestamp: '2024-01-15T10:00:00Z',
      userId: 'staff002',
      userName: 'director1@pmupro.com',
      action: 'STAFF_ADDED',
      details: 'New staff member added: Jessica Chen (Representative)',
      ipAddress: '192.168.1.106',
      userAgent: 'Chrome/120.0.0.0',
      status: 'success'
    },
    {
      id: '8',
      timestamp: '2024-01-15T09:55:00Z',
      userId: 'user777',
      userName: 'alex.turner@pmu.com',
      action: 'PIGMENT_SEARCH',
      details: 'Searched pigment library for Fitzpatrick Type IV',
      ipAddress: '192.168.1.107',
      userAgent: 'Firefox/121.0',
      status: 'success'
    }
  ]

  const mockUserAccounts: UserAccount[] = [
    {
      id: '1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      role: 'artist',
      status: 'active',
      lastLogin: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      subscriptionStatus: 'active'
    },
    {
      id: '2',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      role: 'artist',
      status: 'active',
      lastLogin: '2024-01-15T09:15:00Z',
      createdAt: '2024-01-02T00:00:00Z',
      subscriptionStatus: 'active'
    },
    {
      id: '3',
      email: 'bob.wilson@example.com',
      name: 'Bob Wilson',
      role: 'artist',
      status: 'suspended',
      lastLogin: '2024-01-14T16:45:00Z',
      createdAt: '2024-01-03T00:00:00Z',
      subscriptionStatus: 'expired'
    },
    {
      id: '4',
      email: 'emma.wilson@pmu.com',
      name: 'Emma Wilson',
      role: 'artist',
      status: 'active',
      lastLogin: '2024-01-15T10:10:00Z',
      createdAt: '2024-01-08T00:00:00Z',
      subscriptionStatus: 'active'
    },
    {
      id: '5',
      email: 'maria.garcia@pmu.com',
      name: 'Maria Garcia',
      role: 'artist',
      status: 'pending',
      lastLogin: '2024-01-15T10:05:00Z',
      createdAt: '2024-01-15T00:00:00Z',
      subscriptionStatus: 'pending'
    }
  ]

  const mockTickets: Ticket[] = [
    {
      id: '1',
      title: 'Payment Processing Issue',
      description: 'User unable to complete subscription payment',
      status: 'open',
      priority: 'high',
      assignedTo: 'manager1',
      createdBy: 'john.doe@example.com',
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-01-15T09:00:00Z'
    },
    {
      id: '2',
      title: 'Feature Request - Bulk Export',
      description: 'Request for ability to export multiple client records',
      status: 'in_progress',
      priority: 'medium',
      assignedTo: 'rep1',
      createdBy: 'jane.smith@example.com',
      createdAt: '2024-01-14T14:30:00Z',
      updatedAt: '2024-01-15T08:00:00Z'
    },
    {
      id: '3',
      title: 'Skin Analysis Accuracy',
      description: 'User reports inconsistent Fitzpatrick type results',
      status: 'open',
      priority: 'medium',
      assignedTo: 'manager1',
      createdBy: 'bob.wilson@example.com',
      createdAt: '2024-01-15T08:30:00Z',
      updatedAt: '2024-01-15T08:30:00Z'
    }
  ]

  const mockComplaints: Complaint[] = [
    {
      id: '1',
      subject: 'Incorrect Skin Analysis Results',
      description: 'User reports inaccurate Fitzpatrick type determination',
      status: 'investigating',
      priority: 'high',
      assignedTo: 'manager1',
      reportedBy: 'bob.wilson@example.com',
      createdAt: '2024-01-15T07:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      subject: 'Slow System Response',
      description: 'Dashboard loading times are too slow',
      status: 'new',
      priority: 'medium',
      assignedTo: 'rep1',
      reportedBy: 'jane.smith@example.com',
      createdAt: '2024-01-15T09:30:00Z',
      updatedAt: '2024-01-15T09:30:00Z'
    }
  ]

  useEffect(() => {
    // Check authentication
    const staffAuth = localStorage.getItem('staffAuth')
    if (staffAuth) {
      try {
        const authData = JSON.parse(staffAuth)
        setCurrentUser(authData)
        setIsAuthenticated(true)
        setStaffMembers(getStaffMembers())
        
        // Load mock data
        setActivityLogs(mockActivityLogs)
        setUserAccounts(mockUserAccounts)
        setTickets(mockTickets)
        setComplaints(mockComplaints)
      } catch (error) {
        console.error('Invalid auth data:', error)
        router.push('/staff-admin/login')
      }
    } else {
      router.push('/staff-admin/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('staffAuth')
    router.push('/staff-admin/login')
  }

  const handleMobileTabSelect = (tab: string) => {
    setActiveTab(tab)
    setShowMobileMenu(false)
  }

  const handleReturnToDashboard = () => {
    setActiveTab('overview')
    setShowMobileMenu(false)
  }

  // Get real-time statistics
  const getOverviewStats = () => {
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    return {
      totalUsers: userAccounts.length,
      activeUsers: userAccounts.filter(u => u.status === 'active').length,
      pendingUsers: userAccounts.filter(u => u.status === 'pending').length,
      suspendedUsers: userAccounts.filter(u => u.status === 'suspended').length,
      openTickets: tickets.filter(t => t.status === 'open').length,
      highPriorityTickets: tickets.filter(t => t.priority === 'high' || t.priority === 'urgent').length,
      activeComplaints: complaints.filter(c => c.status !== 'resolved').length,
      urgentComplaints: complaints.filter(c => c.priority === 'high' || c.priority === 'urgent').length,
      totalStaff: staffMembers.length,
      activeStaff: staffMembers.filter(s => s.isActive).length,
      recentActivity: activityLogs.filter(log => new Date(log.timestamp) >= last24Hours).length,
      weeklyActivity: activityLogs.filter(log => new Date(log.timestamp) >= last7Days).length
    }
  }

  const getActivitySummary = () => {
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    const recentLogs = activityLogs.filter(log => new Date(log.timestamp) >= last24Hours)
    
    return {
      totalActions: recentLogs.length,
      successfulActions: recentLogs.filter(log => log.status === 'success').length,
      failedActions: recentLogs.filter(log => log.status === 'error').length,
      warningActions: recentLogs.filter(log => log.status === 'warning').length,
      topActions: recentLogs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const stats = getOverviewStats()
  const activitySummary = getActivitySummary()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Staff Admin Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {currentUser.firstName} {currentUser.lastName} 
                  <Badge className="ml-2" variant="outline">
                    {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                  </Badge>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Navigation - Category Buttons */}
        <div className="md:hidden mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Staff Dashboard</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? 'Hide Menu' : 'Show Menu'}
            </Button>
          </div>
          
          {showMobileMenu && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button 
                variant="outline" 
                className="h-12 text-sm"
                onClick={() => handleMobileTabSelect('overview')}
              >
                <Activity className="h-4 w-4 mr-2" />
                Overview
              </Button>
              <Button 
                variant="outline" 
                className="h-12 text-sm"
                onClick={() => handleMobileTabSelect('users')}
              >
                <Users className="h-4 w-4 mr-2" />
                Users
              </Button>
              <Button 
                variant="outline" 
                className="h-12 text-sm"
                onClick={() => handleMobileTabSelect('applications')}
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                Applications
              </Button>
              <Button 
                variant="outline" 
                className="h-12 text-sm"
                onClick={() => handleMobileTabSelect('tickets')}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Tickets
              </Button>
              <Button 
                variant="outline" 
                className="h-12 text-sm"
                onClick={() => handleMobileTabSelect('complaints')}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Complaints
              </Button>
              <Button 
                variant="outline" 
                className="h-12 text-sm"
                onClick={() => handleMobileTabSelect('staff')}
              >
                <Shield className="h-4 w-4 mr-2" />
                Staff
              </Button>
              <Button 
                variant="outline" 
                className="h-12 text-sm"
                onClick={() => handleMobileTabSelect('activity')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Activity
              </Button>
            </div>
          )}
        </div>

        {/* Desktop Navigation - Tabs */}
        <div className="hidden md:block">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7 gap-2">
              <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
              <TabsTrigger value="users" className="text-sm">Users</TabsTrigger>
              <TabsTrigger value="applications" className="text-sm">Applications</TabsTrigger>
              <TabsTrigger value="tickets" className="text-sm">Tickets</TabsTrigger>
              <TabsTrigger value="complaints" className="text-sm">Complaints</TabsTrigger>
              <TabsTrigger value="staff" className="text-sm">Staff</TabsTrigger>
              <TabsTrigger value="activity" className="text-sm">Activity</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content Wrapper - Works for both mobile and desktop */}
        <div className="space-y-6">

          {/* Overview Tab */}
          <div className={activeTab === 'overview' ? 'space-y-6' : 'hidden'}>
            {/* Mobile Return Button */}
            <div className="md:hidden flex items-center justify-between mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReturnToDashboard}
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                Return to Dashboard
              </Button>
              <Badge variant="outline" className="text-xs">
                Overview
              </Badge>
            </div>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-600">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-800">{stats.totalUsers}</div>
                  <p className="text-xs text-blue-600">
                    {stats.activeUsers} active • {stats.pendingUsers} pending
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-600">Open Tickets</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-800">{stats.openTickets}</div>
                  <p className="text-xs text-green-600">
                    {stats.highPriorityTickets} high priority
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 border-orange-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-600">Active Complaints</CardTitle>
                  <MessageSquare className="h-4 w-4 text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-800">{stats.activeComplaints}</div>
                  <p className="text-xs text-orange-600">
                    {stats.urgentComplaints} urgent
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-600">Staff Members</CardTitle>
                  <Shield className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-800">{stats.totalStaff}</div>
                  <p className="text-xs text-purple-600">
                    {stats.activeStaff} active
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
                    Recent Activity (24h)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Actions</span>
                      <Badge variant="outline">{activitySummary.totalActions}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Successful</span>
                      <Badge className="bg-green-100 text-green-800">{activitySummary.successfulActions}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Failed</span>
                      <Badge className="bg-red-100 text-red-800">{activitySummary.failedActions}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Warnings</span>
                      <Badge className="bg-yellow-100 text-yellow-800">{activitySummary.warningActions}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Uptime</span>
                      <Badge className="bg-green-100 text-green-800">99.9%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Response Time</span>
                      <Badge className="bg-blue-100 text-blue-800">~200ms</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Sessions</span>
                      <Badge variant="outline">{Math.floor(Math.random() * 50) + 20}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Database</span>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
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
                      onClick={() => setActiveTab('applications')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View All Applications
                    </Button>
                    <Button 
                      size="sm" 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setActiveTab('tickets')}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Check Support Tickets
                    </Button>
                    <Button 
                      size="sm" 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setActiveTab('staff')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Manage Staff
                    </Button>
                    <Button 
                      size="sm" 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setActiveTab('users')}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      User Accounts
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity Preview</CardTitle>
                <CardDescription>Latest system events and user actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(log.status)}`} />
                        <div>
                          <p className="text-sm font-medium">{log.action}</p>
                          <p className="text-xs text-gray-600">{log.userName}</p>
                          <p className="text-xs text-gray-500">{log.details}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">{formatTimestamp(log.timestamp)}</p>
                        <p className="text-xs text-gray-500">{log.ipAddress}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline" onClick={() => setActiveTab('activity')}>
                    View All Activity Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Accounts Tab */}
          <div className={activeTab === 'users' ? 'space-y-6' : 'hidden'}>
            {/* Mobile Return Button */}
            <div className="md:hidden flex items-center justify-between mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReturnToDashboard}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Return to Dashboard
              </Button>
              <Badge variant="outline" className="text-xs">
                Users
              </Badge>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  User Account Management
                </CardTitle>
                <CardDescription>
                  View and manage user accounts, access Artist View Mode, and monitor user activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Artist View Mode Section */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Artist View Mode</h3>
                    <p className="text-blue-700 mb-4">
                      Enter Artist View Mode to see user accounts from the user's perspective. 
                      This helps staff understand the user experience and troubleshoot issues.
                    </p>
                    <Button 
                      onClick={() => {
                        setArtistViewMode({
                          isActive: true,
                          userId: 'demo-user',
                          userRole: 'artist',
                          userEmail: 'demo@pmupro.com',
                          userName: 'Demo Artist',
                          enteredAt: new Date(),
                          enteredBy: currentUser?.username || 'Staff Member',
                          staffRole: currentUser?.role || 'representative'
                        })
                        router.push('/dashboard')
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Enter Artist View Mode
                    </Button>
                  </div>

                  {/* User Accounts List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">User Accounts ({userAccounts.length})</h3>
                    <div className="space-y-3">
                      {userAccounts.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              <p className="text-xs text-gray-500">Role: {user.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              className={
                                user.status === 'active' ? 'bg-green-100 text-green-800' :
                                user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }
                            >
                              {user.status}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              Last login: {formatTimestamp(user.lastLogin)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Applications Tab */}
          <div className={activeTab === 'applications' ? 'space-y-6' : 'hidden'}>
            {/* Mobile Return Button */}
            <div className="md:hidden flex items-center justify-between mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReturnToDashboard}
                className="flex items-center gap-2"
              >
                <ClipboardList className="h-4 w-4" />
                Return to Dashboard
              </Button>
              <Badge variant="outline" className="text-xs">
                Applications
              </Badge>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-lavender" />
                  Artist Application Review
                </CardTitle>
                <CardDescription>
                  Review, approve, deny, and manage artist applications with document review and communication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApplicationReview currentStaffMember={currentUser} />
              </CardContent>
            </Card>
          </div>

          {/* Support Tickets Tab */}
          <div className={activeTab === 'tickets' ? 'space-y-6' : 'hidden'}>
            {/* Mobile Return Button */}
            <div className="md:hidden flex items-center justify-between mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReturnToDashboard}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Return to Dashboard
              </Button>
              <Badge variant="outline" className="text-xs">
                Tickets
              </Badge>
            </div>
            <TicketManagement currentStaffMember={currentUser} />
          </div>

          {/* Complaints Tab */}
          <div className={activeTab === 'complaints' ? 'space-y-6' : 'hidden'}>
            {/* Mobile Return Button */}
            <div className="md:hidden flex items-center justify-between mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReturnToDashboard}
                className="flex items-center gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Return to Dashboard
              </Button>
              <Badge variant="outline" className="text-xs">
                Complaints
              </Badge>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  User Complaints
                </CardTitle>
                <CardDescription>
                  Review and investigate user complaints and feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complaints.map((complaint) => (
                    <div key={complaint.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{complaint.subject}</h3>
                          <p className="text-gray-600 mt-1">{complaint.description}</p>
                          <div className="flex items-center space-x-4 mt-3">
                            <Badge className={getPriorityColor(complaint.priority)}>
                              {complaint.priority}
                            </Badge>
                            <Badge 
                              className={
                                complaint.status === 'new' ? 'bg-red-100 text-red-800' :
                                complaint.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }
                            >
                              {complaint.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              Reported: {formatTimestamp(complaint.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Assigned to: {complaint.assignedTo}</p>
                          <p className="text-sm text-gray-500">By: {complaint.reportedBy}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Staff Management Tab */}
          <div className={activeTab === 'staff' ? 'space-y-6' : 'hidden'}>
            {/* Mobile Return Button */}
            <div className="md:hidden flex items-center justify-between mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReturnToDashboard}
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Return to Dashboard
              </Button>
              <Badge variant="outline" className="text-xs">
                Staff
              </Badge>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  Staff Management
                </CardTitle>
                <CardDescription>
                  Add, edit, and manage staff members and their permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Add Staff Member */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Add Staff Member</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input placeholder="First Name" />
                      <Input placeholder="Last Name" />
                      <Input placeholder="Email" type="email" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="representative">Representative</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="director">Director</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button className="w-full">Add Staff Member</Button>
                    </div>
                  </div>

                  {/* Staff Members List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Current Staff Members</h3>
                    <div className="space-y-3">
                      {staffMembers.map((staff) => (
                        <div key={staff.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <Shield className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">{staff.firstName} {staff.lastName}</p>
                              <p className="text-sm text-gray-600">{staff.email}</p>
                              <p className="text-xs text-gray-500">Role: {staff.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              className={staff.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                            >
                              {staff.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              Last login: {staff.lastLogin ? formatTimestamp(staff.lastLogin.toISOString()) : 'Never'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PDF Document Management */}
                  {currentUser?.role === 'director' && (
                    <div className="bg-lavender/5 p-4 rounded-lg border border-lavender/20">
                      <h3 className="text-lg font-semibold mb-4 text-lavender-700">PDF Document Management</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Manage PDF forms and documents for artists to access
                      </p>
                      <div className="flex gap-3">
                        <Button 
                          onClick={() => window.open('/standard-documents', '_blank')}
                          className="bg-lavender hover:bg-lavender-600 text-white"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Manage PDF Documents
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => window.open('/standard-documents?tab=upload', '_blank')}
                          className="border-lavender text-lavender hover:bg-lavender/5"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Upload New PDFs
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Logs Tab */}
          <div className={activeTab === 'activity' ? 'space-y-6' : 'hidden'}>
            {/* Mobile Return Button */}
            <div className="md:hidden flex items-center gap-2 mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReturnToDashboard}
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                Return to Dashboard
              </Button>
              <Badge variant="outline" className="text-xs">
                Activity
              </Badge>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Activity Logs
                </CardTitle>
                <CardDescription>Monitor system activity and user actions in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(log.status)}`} />
                        <div>
                          <p className="text-sm font-medium">{log.action}</p>
                          <p className="text-xs text-gray-600">{log.userName}</p>
                          <p className="text-xs text-gray-500">{log.details}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">{formatTimestamp(log.timestamp)}</p>
                        <p className="text-xs text-gray-500">{log.ipAddress}</p>
                        <p className="text-xs text-gray-500">{log.userAgent}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
