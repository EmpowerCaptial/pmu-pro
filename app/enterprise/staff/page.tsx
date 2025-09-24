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
      permissions: getPermissionsForRole(newStaffMember.role),
      lastLogin: null,
      createdAt: new Date().toISOString(),
      isActive: true
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

  const handleDeleteStaff = (staffId: string) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      setStaffMembers(staffMembers.filter(member => member.id !== staffId))
      alert('Staff member deleted successfully')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <NavBar currentPath="/enterprise/staff" user={user} />
      <main className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-ink mb-2">Enterprise Staff Management</h1>
              <p className="text-muted">Manage your team roles, permissions, and access levels</p>
            </div>
            <Button 
              onClick={handleAddStaff}
              className="bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">Total Staff</p>
                  <p className="text-2xl font-bold text-ink">{staffMembers.length}</p>
                </div>
                <Users className="h-8 w-8 text-lavender" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {staffMembers.filter(m => m.status === 'active').length}
                  </p>
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
                  <p className="text-2xl font-bold text-yellow-600">
                    {staffMembers.filter(m => m.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">Roles</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {new Set(staffMembers.map(m => m.role)).size}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-purple-600" />
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
              value="permissions" 
              className="data-[state=active]:bg-teal-500 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Permissions
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
              <CardHeader>
                <CardTitle className="text-lavender">Staff Members</CardTitle>
                <CardDescription>Manage your team members and their roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staffMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-lavender/30 transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-lavender to-teal-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-ink">{member.name}</h3>
                          <p className="text-sm text-muted">{member.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getRoleColor(member.role)}>
                              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                            </Badge>
                            <Badge className={getStatusColor(member.status)}>
                              {getStatusIcon(member.status)}
                              <span className="ml-1">{member.status.charAt(0).toUpperCase() + member.status.slice(1)}</span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted">
                          Last active: {new Date(member.lastActive).toLocaleDateString()}
                        </span>
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
                              <Edit className="mr-2 h-4 w-4 text-blue-500" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50">
                              <Settings className="mr-2 h-4 w-4 text-green-500" />
                              <span>Permissions</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-600 focus:text-red-600"
                              onClick={() => handleDeleteStaff(member.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
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
          <TabsContent value="permissions" className="space-y-6">
            <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
              <CardHeader>
                <CardTitle className="text-lavender">Role Permissions</CardTitle>
                <CardDescription>Configure what each role can access and modify</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {['admin', 'manager', 'artist', 'receptionist'].map((role) => (
                    <div key={role} className="p-4 bg-white rounded-lg border border-gray-200">
                      <h3 className="font-semibold text-lg text-ink mb-3 capitalize">{role} Permissions</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {[
                          'Full Access',
                          'User Management', 
                          'Financial Reports',
                          'Appointment Management',
                          'Client Management',
                          'Reports & Analytics',
                          'Settings Configuration',
                          'Staff Management',
                          'Inventory Management'
                        ].map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-muted">{permission}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
              <CardHeader>
                <CardTitle className="text-lavender">Recent Activity</CardTitle>
                <CardDescription>Track staff actions and system changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { user: 'Sarah Johnson', action: 'Updated client profile', time: '2 hours ago', type: 'edit' },
                    { user: 'Mike Chen', action: 'Scheduled new appointment', time: '4 hours ago', type: 'create' },
                    { user: 'Emma Rodriguez', action: 'Completed service session', time: '6 hours ago', type: 'complete' },
                    { user: 'Sarah Johnson', action: 'Added new staff member', time: '1 day ago', type: 'create' },
                    { user: 'Mike Chen', action: 'Generated monthly report', time: '2 days ago', type: 'report' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                      <Activity className="h-5 w-5 text-lavender" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-ink">{activity.user}</p>
                        <p className="text-sm text-muted">{activity.action}</p>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>
              Add a new team member to your enterprise account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={newStaffMember.name}
                onChange={(e) => setNewStaffMember({ ...newStaffMember, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={newStaffMember.email}
                onChange={(e) => setNewStaffMember({ ...newStaffMember, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={newStaffMember.role}
                onValueChange={(value: StaffRole) => setNewStaffMember({ ...newStaffMember, role: value })}
              >
                <SelectTrigger>
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
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={newStaffMember.department}
                onChange={(e) => setNewStaffMember({ ...newStaffMember, department: e.target.value })}
                placeholder="Enter department"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={newStaffMember.phone}
                onChange={(e) => setNewStaffMember({ ...newStaffMember, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowAddStaff(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitStaff} className="bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600 text-white">
              Add Staff Member
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
