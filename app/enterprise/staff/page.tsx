"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  UserPlus, 
  Shield, 
  Settings, 
  Activity, 
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react'
import { PermissionManager } from '@/components/staff/permission-manager'
import { StaffMember, StaffPermission, hasPermission, setStaffPermission } from '@/lib/staff-auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NavBar } from '@/components/ui/navbar'
import { useDemoAuth } from '@/hooks/use-demo-auth'

type StaffRole = 'admin' | 'manager' | 'staff' | 'viewer'

interface StaffMember {
  id: string
  name: string
  email: string
  role: StaffRole
  status: 'active' | 'inactive' | 'pending'
  lastActive: string
  permissions: string[]
  joinDate: string
  department?: string
  phone?: string
}

const mockStaffMembers: StaffMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@pmupro.com',
    role: 'admin',
    status: 'active',
    lastActive: '2024-01-20T10:30:00Z',
    permissions: ['full_access', 'user_management', 'financial_reports'],
    joinDate: '2023-06-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike@pmupro.com',
    role: 'manager',
    status: 'active',
    lastActive: '2024-01-20T09:15:00Z',
    permissions: ['appointment_management', 'client_management', 'reports'],
    joinDate: '2023-08-20T00:00:00Z'
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    email: 'emma@pmupro.com',
    role: 'staff',
    status: 'active',
    lastActive: '2024-01-19T16:45:00Z',
    permissions: ['appointment_management', 'client_notes'],
    joinDate: '2023-11-10T00:00:00Z'
  },
  {
    id: '4',
    name: 'Lisa Park',
    email: 'lisa@pmupro.com',
    role: 'staff',
    status: 'pending',
    lastActive: '2024-01-18T14:20:00Z',
    permissions: ['appointment_scheduling', 'client_checkin'],
    joinDate: '2024-01-15T00:00:00Z'
  }
]

export default function EnterpriseStaffPage() {
  const { currentUser } = useDemoAuth()
  const router = useRouter()
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(mockStaffMembers)
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddStaff, setShowAddStaff] = useState(false)
  const [selectedStaffForPermissions, setSelectedStaffForPermissions] = useState<StaffMember | null>(null)
  const [newStaffMember, setNewStaffMember] = useState({
    name: '',
    email: '',
    role: 'staff' as StaffRole,
    department: '',
    phone: ''
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'manager':
        return 'bg-blue-100 text-blue-800'
      case 'artist':
        return 'bg-purple-100 text-purple-800'
      case 'receptionist':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'inactive':
        return <XCircle className="h-4 w-4 text-gray-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <XCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const handleAddStaff = () => {
    setShowAddStaff(true)
  }

  const handleSubmitStaff = () => {
    if (!newStaffMember.name || !newStaffMember.email) {
      alert('Please fill in required fields')
      return
    }

    const staffMember: StaffMember = {
      id: `staff-${Date.now()}`,
      name: newStaffMember.name,
      email: newStaffMember.email,
      role: newStaffMember.role,
      department: newStaffMember.department,
      phone: newStaffMember.phone,
      status: 'active',
      permissions: ['basic_access'], // Default permissions
      lastActive: new Date().toISOString(),
      joinDate: new Date().toISOString()
    }

    setStaffMembers([...staffMembers, staffMember])
    setShowAddStaff(false)
    setNewStaffMember({
      name: '',
      email: '',
      role: 'staff',
      department: '',
      phone: ''
    })
    alert('Staff member added successfully!')
  }

  const handleEditStaff = (staffId: string) => {
    alert(`Edit staff member ${staffId} functionality would open here`)
  }

  const handlePermissionChange = (staffId: string, permission: StaffPermission) => {
    setStaffMembers(prev => prev.map(staff => {
      if (staff.id === staffId) {
        return setStaffPermission(staff, permission.resource, permission.action, permission.granted, currentUser?.name || 'admin', permission.reason)
      }
      return staff
    }))
  }

  const handleDeleteStaff = (staffId: string) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      setStaffMembers(staffMembers.filter(member => member.id !== staffId))
      alert('Staff member deleted successfully')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <NavBar currentPath="/enterprise/staff" user={user} />
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl relative z-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-1 sm:mb-2">Enterprise Staff Management</h1>
              <p className="text-sm sm:text-base text-muted">Manage your team roles, permissions, and access levels</p>
            </div>
            <Button 
              onClick={handleAddStaff}
              className="bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto text-sm sm:text-base"
            >
              <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Add Staff Member
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted">Total Staff</p>
                  <p className="text-xl sm:text-2xl font-bold text-ink">{staffMembers.length}</p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-lavender" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted">Active</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {staffMembers.filter(m => m.status === 'active').length}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted">Pending</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                    {staffMembers.filter(m => m.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted">Roles</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">
                    {new Set(staffMembers.map(m => m.role)).size}
                  </p>
                </div>
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
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
              value="permissions" 
              className="data-[state=active]:bg-teal-500 data-[state=active]:text-white data-[state=active]:shadow-md text-xs sm:text-sm"
            >
              Permissions
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md text-xs sm:text-sm"
            >
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-lavender text-base sm:text-lg">Staff Members</CardTitle>
                <CardDescription className="text-sm sm:text-base">Manage your team members and their roles</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-3 sm:space-y-4">
                  {staffMembers.map((member) => (
                    <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-white rounded-lg border border-gray-200 hover:border-lavender/30 transition-all duration-200 gap-3 sm:gap-0">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-lavender to-teal-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm sm:text-base">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-ink text-sm sm:text-base truncate">{member.name}</h3>
                          <p className="text-xs sm:text-sm text-muted truncate">{member.email}</p>
                          <div className="flex items-center space-x-2 mt-1 flex-wrap">
                            <Badge className={`${getRoleColor(member.role)} text-xs sm:text-sm`}>
                              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                            </Badge>
                            <Badge className={`${getStatusColor(member.status)} text-xs sm:text-sm`}>
                              {getStatusIcon(member.status)}
                              <span className="ml-1">{member.status.charAt(0).toUpperCase() + member.status.slice(1)}</span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-2">
                        <span className="text-xs sm:text-sm text-muted">
                          Last active: {new Date(member.lastActive).toLocaleDateString()}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-md hover:shadow-lg border border-gray-200"
                            >
                              <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 bg-white border-gray-200 shadow-lg">
                            <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50">
                              <Edit className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                              <span className="text-xs sm:text-sm">Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50">
                              <Settings className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                              <span className="text-xs sm:text-sm">Permissions</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-600 focus:text-red-600"
                              onClick={() => handleDeleteStaff(member.id)}
                            >
                              <Trash2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="text-xs sm:text-sm">Delete</span>
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

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-4 sm:space-y-6">
            <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-lavender text-base sm:text-lg">Individual Staff Permissions</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Manage specific permissions for each staff member. Individual permissions override role-based defaults.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-6">
                  {staffMembers.map((staff) => (
                    <div key={staff.id} className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{staff.firstName} {staff.lastName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {staff.email} • Role: {staff.role}
                          </p>
                        </div>
                        <Badge variant={staff.isActive ? 'default' : 'secondary'}>
                          {staff.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      {/* Quick Permission Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {staff.customPermissions?.filter(p => p.granted).length || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">Custom Permissions</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {staff.role === 'director' ? 'Full' : staff.role === 'manager' ? 'Enhanced' : 'Basic'}
                          </div>
                          <div className="text-sm text-muted-foreground">Role Access</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {staff.lastLogin ? new Date(staff.lastLogin).toLocaleDateString() : 'Never'}
                          </div>
                          <div className="text-sm text-muted-foreground">Last Login</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {staff.customPermissions?.length || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">Overrides</div>
                        </div>
                      </div>

                      {/* Permission Details */}
                      <div className="space-y-3">
                        <h4 className="font-medium">Key Permissions</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {[
                            { resource: 'users', action: 'delete', label: 'Delete Users' },
                            { resource: 'staff', action: 'create', label: 'Create Staff' },
                            { resource: 'system', action: 'configure', label: 'System Config' },
                            { resource: 'billing', action: 'refund', label: 'Process Refunds' },
                            { resource: 'reports', action: 'generate', label: 'Generate Reports' },
                            { resource: 'activity_logs', action: 'export', label: 'Export Logs' }
                          ].map(({ resource, action, label }) => {
                            const hasAccess = hasPermission(staff, resource, action)
                            return (
                              <div key={`${resource}-${action}`} className="flex items-center justify-between p-2 border rounded">
                                <span className="text-sm">{label}</span>
                                <div className="flex items-center gap-2">
                                  {hasAccess ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  )}
                                  <Badge variant={hasAccess ? 'default' : 'secondary'} className="text-xs">
                                    {hasAccess ? 'Allowed' : 'Denied'}
                                  </Badge>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Manage Permissions Button */}
                      <div className="mt-4 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedStaffForPermissions(staff)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Manage Individual Permissions
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4 sm:space-y-6">
            <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-lavender text-base sm:text-lg">Recent Activity</CardTitle>
                <CardDescription className="text-sm sm:text-base">Track staff actions and system changes</CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { user: 'Sarah Johnson', action: 'Updated client profile', time: '2 hours ago', type: 'edit' },
                    { user: 'Mike Chen', action: 'Scheduled new appointment', time: '4 hours ago', type: 'create' },
                    { user: 'Emma Rodriguez', action: 'Completed service session', time: '6 hours ago', type: 'complete' },
                    { user: 'Sarah Johnson', action: 'Added new staff member', time: '1 day ago', type: 'create' },
                    { user: 'Mike Chen', action: 'Generated monthly report', time: '2 days ago', type: 'report' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                      <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-lavender" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-ink truncate">{activity.user}</p>
                        <p className="text-xs sm:text-sm text-muted truncate">{activity.action}</p>
                      </div>
                      <span className="text-xs text-muted">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Staff Dialog */}
      <Dialog open={showAddStaff} onOpenChange={setShowAddStaff}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader className="p-4 sm:p-6 pb-4">
            <DialogTitle className="text-base sm:text-lg">Add New Staff Member</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Add a new team member to your enterprise account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm sm:text-base">Full Name *</Label>
              <Input
                id="name"
                value={newStaffMember.name}
                onChange={(e) => setNewStaffMember({ ...newStaffMember, name: e.target.value })}
                placeholder="Enter full name"
                className="h-9 sm:h-10 text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={newStaffMember.email}
                onChange={(e) => setNewStaffMember({ ...newStaffMember, email: e.target.value })}
                placeholder="Enter email address"
                className="h-9 sm:h-10 text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm sm:text-base">Role</Label>
              <Select
                value={newStaffMember.role}
                onValueChange={(value: StaffRole) => setNewStaffMember({ ...newStaffMember, role: value })}
              >
                <SelectTrigger className="h-9 sm:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm sm:text-base">Department</Label>
              <Input
                id="department"
                value={newStaffMember.department}
                onChange={(e) => setNewStaffMember({ ...newStaffMember, department: e.target.value })}
                placeholder="Enter department"
                className="h-9 sm:h-10 text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm sm:text-base">Phone Number</Label>
              <Input
                id="phone"
                value={newStaffMember.phone}
                onChange={(e) => setNewStaffMember({ ...newStaffMember, phone: e.target.value })}
                placeholder="Enter phone number"
                className="h-9 sm:h-10 text-sm sm:text-base"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4 px-4 sm:px-6">
            <Button 
              variant="outline" 
              onClick={() => setShowAddStaff(false)}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitStaff} 
              className="bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600 text-white w-full sm:w-auto text-sm sm:text-base"
            >
              Add Staff Member
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Permission Manager Dialog */}
      <Dialog open={!!selectedStaffForPermissions} onOpenChange={() => setSelectedStaffForPermissions(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Individual Permissions</DialogTitle>
            <DialogDescription>
              Configure specific permissions for {selectedStaffForPermissions?.firstName} {selectedStaffForPermissions?.lastName}
            </DialogDescription>
          </DialogHeader>
          {selectedStaffForPermissions && currentUser && (
            <PermissionManager
              staffMember={selectedStaffForPermissions}
              currentAdmin={currentUser as StaffMember}
              onPermissionChange={handlePermissionChange}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
