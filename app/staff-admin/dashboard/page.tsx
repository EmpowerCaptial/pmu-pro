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
  User,
  History,
  Download,
  PenTool
} from 'lucide-react'
import { CONSENT_FORM_TEMPLATES } from '@/lib/data/consent-form-templates'
import { ConsentFormTemplateEditor } from '@/components/staff/consent-form-template-editor'
import { 
  StaffMember, 
  hasPermission, 
  getStaffMembers, 
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
  suspendStaffMember,
  restoreStaffMember,
  resetStaffPassword,
  getPermissionsForRole,
  type StaffRole 
} from '@/lib/staff-auth'
import { setArtistViewMode } from '@/lib/artist-view-mode'
import { ClientPortalManagement } from '@/components/admin/client-portal-management'
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
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [newStaffData, setNewStaffData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'representative' as StaffRole
  })
  const [isAddingStaff, setIsAddingStaff] = useState(false)
  const [newStaffSuccess, setNewStaffSuccess] = useState<{show: boolean, data: any}>({show: false, data: null})
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
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

  const loadData = async () => {
    setLoading(true)
    try {
      const [usersRes, ticketsRes, complaintsRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/tickets'),
        fetch('/api/admin/complaints'),
        fetch('/api/admin/analytics')
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUserAccounts(usersData.data || [])
      }

      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json()
        setTickets(ticketsData.data || [])
      }

      if (complaintsRes.ok) {
        const complaintsData = await complaintsRes.json()
        setComplaints(complaintsData.data || [])
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        setAnalytics(analyticsData.data || null)
      }

      // Keep mock data for activity logs and staff members for now
      setActivityLogs(mockActivityLogs)
      setStaffMembers(getStaffMembers())
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const openTemplateEditor = (templateId: string) => {
    console.log('Opening template editor for:', templateId)
    setEditingTemplateId(templateId)
    setShowTemplateEditor(true)
    console.log('State updated - showTemplateEditor:', true, 'editingTemplateId:', templateId)
  }

  const closeTemplateEditor = () => {
    setShowTemplateEditor(false)
    setEditingTemplateId(null)
  }

  const handleAddStaffMember = async () => {
    if (!newStaffData.firstName || !newStaffData.lastName || !newStaffData.email) {
      alert('Please fill in all required fields')
      return
    }

    setIsAddingStaff(true)
    try {
      const newStaff = createStaffMember({
        username: newStaffData.email,
        email: newStaffData.email,
        firstName: newStaffData.firstName,
        lastName: newStaffData.lastName,
        role: newStaffData.role,
        isActive: true,
        permissions: getPermissionsForRole(newStaffData.role)
      })

      // Update the staff members list
      setStaffMembers([...staffMembers, newStaff])

      // Reset form
      setNewStaffData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'representative'
      })

      // Show success message with temporary password
      setNewStaffSuccess({
        show: true,
        data: {
          name: `${newStaff.firstName} ${newStaff.lastName}`,
          email: newStaff.email,
          temporaryPassword: newStaff.temporaryPassword
        }
      })

      // Hide success message after 10 seconds
      setTimeout(() => {
        setNewStaffSuccess({show: false, data: null})
      }, 10000)

    } catch (error) {
      console.error('Error adding staff member:', error)
      alert('Failed to add staff member. Please try again.')
    } finally {
      setIsAddingStaff(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setNewStaffData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSuspendStaff = (staffId: string) => {
    if (confirm('Are you sure you want to suspend this staff member?')) {
      const success = suspendStaffMember(staffId)
      if (success) {
        // Update the staff members list
        setStaffMembers(staffMembers.map(staff => 
          staff.id === staffId ? { ...staff, isActive: false } : staff
        ))
        alert('Staff member suspended successfully')
      } else {
        alert('Failed to suspend staff member')
      }
    }
  }

  const handleRestoreStaff = (staffId: string) => {
    if (confirm('Are you sure you want to restore this staff member?')) {
      const success = restoreStaffMember(staffId)
      if (success) {
        // Update the staff members list
        setStaffMembers(staffMembers.map(staff => 
          staff.id === staffId ? { ...staff, isActive: true } : staff
        ))
        alert('Staff member restored successfully')
      } else {
        alert('Failed to restore staff member')
      }
    }
  }

  const handleResetPassword = (username: string) => {
    if (confirm('Are you sure you want to reset the password for this staff member?')) {
      const newPassword = resetStaffPassword(username)
      if (newPassword) {
        alert(`Password reset successfully. New temporary password: ${newPassword}`)
      } else {
        alert('Failed to reset password')
      }
    }
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
          {/* Mobile Header */}
          <div className="md:hidden py-4">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Shield className="h-6 w-6 text-purple-600" />
                <h1 className="text-xl font-bold text-gray-900">Staff Admin Dashboard</h1>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Welcome back, {currentUser.firstName} {currentUser.lastName} 
                <Badge className="ml-2" variant="outline">
                  {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                </Badge>
              </p>
              <Button variant="outline" onClick={handleLogout} className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex justify-between items-center py-4">
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
                className="h-12 text-sm bg-blue-50 border-blue-200 hover:bg-blue-100"
                onClick={() => handleMobileTabSelect('overview')}
              >
                <Activity className="h-4 w-4 mr-2" />
                Overview
              </Button>
              <Button 
                variant="outline" 
                className="h-12 text-sm bg-green-50 border-green-200 hover:bg-green-100"
                onClick={() => handleMobileTabSelect('users')}
              >
                <Users className="h-4 w-4 mr-2" />
                Users
              </Button>
              <Button 
                variant="outline" 
                className="h-12 text-sm bg-purple-50 border-purple-200 hover:bg-purple-100"
                onClick={() => handleMobileTabSelect('applications')}
              >
                <ClipboardList className="h-4 w-4 mr-2" />
                Applications
              </Button>
              <Button 
                variant="outline" 
                className="h-12 text-sm bg-orange-50 border-orange-200 hover:bg-orange-100"
                onClick={() => handleMobileTabSelect('tickets')}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Tickets
              </Button>
              <Button 
                variant="outline" 
                className="h-12 text-sm bg-red-50 border-red-200 hover:bg-red-100"
                onClick={() => handleMobileTabSelect('complaints')}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Complaints
              </Button>
              <Button 
                variant="outline" 
                className="h-12 text-sm bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
                onClick={() => handleMobileTabSelect('staff')}
              >
                <Shield className="h-4 w-4 mr-2" />
                Staff
              </Button>
              <Button 
                variant="outline" 
                className="h-12 text-sm bg-lavender/10 border-lavender/200 hover:bg-lavender/20"
                onClick={() => handleMobileTabSelect('consent-forms')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Consent Forms
              </Button>
              <Button 
                variant="outline" 
                className="h-12 text-sm bg-teal-50 border-teal-200 hover:bg-teal-100 opacity-50 cursor-not-allowed"
                disabled
              >
                <Settings className="h-4 w-4 mr-2" />
                Client Portal
                <span className="ml-2 text-xs text-teal-600">Coming Soon</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-12 text-sm bg-gray-50 border-gray-200 hover:bg-gray-100"
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
            <TabsList className="grid w-full grid-cols-9 gap-2 bg-gray-100 p-1 rounded-lg">
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
                value="applications" 
                className="text-sm data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                Applications
              </TabsTrigger>
              <TabsTrigger 
                value="tickets" 
                className="text-sm data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                Tickets
              </TabsTrigger>
              <TabsTrigger 
                value="complaints" 
                className="text-sm data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                Complaints
              </TabsTrigger>
              <TabsTrigger 
                value="staff" 
                className="text-sm data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                Staff
              </TabsTrigger>
              <TabsTrigger 
                value="consent-forms" 
                className="text-sm data-[state=active]:bg-lavender data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                Consent Forms
              </TabsTrigger>
              <TabsTrigger 
                value="client-portal" 
                className="text-sm data-[state=active]:bg-teal-500 data-[state=active]:text-white data-[state=active]:shadow-md opacity-50 cursor-not-allowed"
                disabled
              >
                Client Portal
                <span className="ml-2 text-xs">Coming Soon</span>
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="text-sm data-[state=active]:bg-gray-600 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                Activity
              </TabsTrigger>
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
                    <Button 
                      size="sm" 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => window.open('/admin', '_blank')}
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Full Admin Dashboard
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
                      <Input 
                        placeholder="First Name" 
                        value={newStaffData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                      />
                      <Input 
                        placeholder="Last Name" 
                        value={newStaffData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                      />
                      <Input 
                        placeholder="Email" 
                        type="email" 
                        value={newStaffData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <Select 
                        value={newStaffData.role} 
                        onValueChange={(value) => handleInputChange('role', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="representative">Representative</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="director">Director</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        className="w-full" 
                        onClick={handleAddStaffMember}
                        disabled={isAddingStaff}
                      >
                        {isAddingStaff ? 'Adding...' : 'Add Staff Member'}
                      </Button>
                    </div>
                  </div>

                  {/* Success Message for New Staff */}
                  {newStaffSuccess.show && newStaffSuccess.data && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-green-800 mb-2">
                            Staff Member Added Successfully!
                          </h4>
                          <div className="text-sm text-green-700 space-y-1">
                            <p><strong>Name:</strong> {newStaffSuccess.data.name}</p>
                            <p><strong>Email:</strong> {newStaffSuccess.data.email}</p>
                            <p><strong>Temporary Password:</strong> 
                              <span className="font-mono bg-green-100 px-2 py-1 rounded ml-2">
                                {newStaffSuccess.data.temporaryPassword}
                              </span>
                            </p>
                            <p className="text-xs text-green-600 mt-2">
                              ⚠️ Share this temporary password with the new staff member. 
                              They will need to change it on their first login.
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setNewStaffSuccess({show: false, data: null})}
                          className="text-green-600 hover:text-green-800"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

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
                              {!staff.passwordSet && (
                                <p className="text-xs text-orange-600 font-medium">
                                  ⚠️ Password not set
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              className={staff.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                            >
                              {staff.isActive ? 'Active' : 'Suspended'}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              Last login: {staff.lastLogin ? formatTimestamp(staff.lastLogin.toISOString()) : 'Never'}
                            </p>
                            <div className="flex gap-2 mt-2">
                              {staff.isActive ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSuspendStaff(staff.id)}
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  Suspend
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRestoreStaff(staff.id)}
                                  className="text-green-600 border-green-300 hover:bg-green-50"
                                >
                                  Restore
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResetPassword(staff.username)}
                                className="text-blue-600 border-blue-300 hover:bg-blue-50"
                              >
                                Reset Password
                              </Button>
                            </div>
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

          {/* Consent Forms Tab */}
          <div className={activeTab === 'consent-forms' ? 'space-y-6' : 'hidden'}>
            {/* Mobile Return Button */}
            <div className="md:hidden flex items-center gap-2 mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReturnToDashboard}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Return to Dashboard
              </Button>
              <Badge variant="outline" className="text-xs">
                Consent Forms
              </Badge>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Consent Form Templates</h2>
                  <p className="text-gray-600">Manage and customize consent form templates for artists</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(CONSENT_FORM_TEMPLATES).map(([id, template]) => (
                  <Card key={id} className="border-2 border-lavender/200 bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3 bg-gradient-to-r from-lavender/5 to-purple/5 rounded-t-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                            {template.name}
                          </CardTitle>
                          <CardDescription className="text-gray-700 mb-3">
                            {template.description}
                          </CardDescription>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="bg-lavender/10 text-lavender border-lavender/200">
                              {template.fields.length} fields
                            </Badge>
                            {template.required && (
                              <Badge variant="outline" className="bg-red/10 text-red border-red/200">
                                Required
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <Button
                          onClick={() => openTemplateEditor(id)}
                          className="w-full bg-lavender hover:bg-lavender/90 text-white"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Template
                        </Button>
                        <Button
                          onClick={() => openTemplateEditor(id)}
                          variant="outline"
                          className="w-full border-lavender/200 text-lavender hover:bg-lavender/10"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Preview Form
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-2 border-lavender/200 bg-gradient-to-r from-lavender/5 to-purple/5">
                <CardHeader>
                  <CardTitle className="text-gray-900">Advanced Template Management</CardTitle>
                  <CardDescription>Full visual editor with drag & drop, live preview, and version control</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        onClick={() => openTemplateEditor('general-consent')}
                        variant="ghost"
                        className="text-center p-4 bg-white rounded-lg border border-lavender/200 hover:bg-lavender/5 hover:border-lavender/300 transition-all h-auto"
                      >
                        <Edit className="h-8 w-8 text-lavender mx-auto mb-2" />
                        <h4 className="font-semibold text-gray-900 mb-1">Visual Editor</h4>
                        <p className="text-xs text-gray-600">Drag & drop interface</p>
                      </Button>
                      <Button
                        onClick={() => openTemplateEditor('medical-history')}
                        variant="ghost"
                        className="text-center p-4 bg-white rounded-lg border border-lavender/200 hover:bg-lavender/5 hover:border-lavender/300 transition-all h-auto"
                      >
                        <Eye className="h-8 w-8 text-lavender mx-auto mb-2" />
                        <h4 className="font-semibold text-gray-900 mb-1">Live Preview</h4>
                        <p className="text-xs text-gray-600">Real-time form preview</p>
                      </Button>
                      <Button
                        onClick={() => openTemplateEditor('brows-consent')}
                        variant="ghost"
                        className="text-center p-4 bg-white rounded-lg border border-lavender/200 hover:bg-lavender/5 hover:border-lavender/300 transition-all h-auto"
                      >
                        <History className="h-8 w-8 text-lavender mx-auto mb-2" />
                        <h4 className="font-semibold text-gray-900 mb-1">Version Control</h4>
                        <p className="text-xs text-gray-600">Track all changes</p>
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-green/10 text-green border-green/200 cursor-pointer hover:bg-green/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Drag & Drop Reordering
                        </Badge>
                        <Badge variant="outline" className="bg-blue/10 text-blue border-blue/200 cursor-pointer hover:bg-blue/20">
                          <Eye className="h-3 w-3 mr-1" />
                          Live Preview
                        </Badge>
                        <Badge variant="outline" className="bg-purple/10 text-purple border-purple/200 cursor-pointer hover:bg-purple/20">
                          <History className="h-3 w-3 mr-1" />
                          Undo/Redo
                        </Badge>
                        <Badge variant="outline" className="bg-orange/10 text-orange border-orange/200 cursor-pointer hover:bg-orange/20">
                          <Download className="h-3 w-3 mr-1" />
                          Export/Import
                        </Badge>
                      </div>
                      <Button
                        onClick={() => openTemplateEditor('general-consent')}
                        className="bg-lavender hover:bg-lavender/90 text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Client Portal Management Tab */}
          <div className={activeTab === 'client-portal' ? 'space-y-6' : 'hidden'}>
            {/* Mobile Return Button */}
            <div className="md:hidden flex items-center gap-2 mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReturnToDashboard}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Return to Dashboard
              </Button>
              <Badge variant="outline" className="text-xs">
                Client Portal
              </Badge>
            </div>
            <ClientPortalManagement />
            
            {/* PDF Signature System Demo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="h-5 w-5 text-blue-500" />
                  PDF Signature System
                </CardTitle>
                <CardDescription>Test the new digital signature system for client documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg bg-blue-50">
                  <p className="text-blue-700 text-sm mb-3">
                    The signature system can automatically detect signature fields in PDF forms and allow clients to generate digital signatures.
                  </p>
                  <a 
                    href="/documents/signature-demo" 
                    target="_blank"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <PenTool className="h-4 w-4" />
                    Test Signature System
                  </a>
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

      {/* Template Editor Modal */}
      <ConsentFormTemplateEditor
        isOpen={showTemplateEditor}
        onClose={closeTemplateEditor}
        templateId={editingTemplateId as any}
      />
      
      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs">
          <div>showTemplateEditor: {showTemplateEditor.toString()}</div>
          <div>editingTemplateId: {editingTemplateId || 'null'}</div>
        </div>
      )}
    </div>
  )
}
