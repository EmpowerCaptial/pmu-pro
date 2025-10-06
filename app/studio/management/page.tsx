"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Users, 
  UserPlus, 
  Mail, 
  CheckCircle,
  Clock,
  AlertTriangle,
  Building2,
  GraduationCap,
  Trash2,
  Edit,
  MoreVertical
} from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { NavBar } from '@/components/ui/navbar'

interface Instructor {
  id: string
  name: string
  email: string
  status: 'pending' | 'active' | 'suspended'
  invitedAt: string
  joinedAt?: string
  licenseNumber?: string
  licenseState?: string
  role: 'instructor' | 'licensed' | 'student'
  avatar?: string
}

export default function StudioManagementPage() {
  const { currentUser, isLoading } = useDemoAuth()
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<'instructor' | 'licensed' | 'student'>('instructor')
  const [isInviting, setIsInviting] = useState(false)

  // Load instructors from localStorage
  useEffect(() => {
    const savedInstructors = localStorage.getItem('studio-instructors')
    if (savedInstructors) {
      setInstructors(JSON.parse(savedInstructors))
    }
  }, [])

  // Save instructors to localStorage
  const saveInstructors = (newInstructors: Instructor[]) => {
    setInstructors(newInstructors)
    localStorage.setItem('studio-instructors', JSON.stringify(newInstructors))
  }

  const handleInviteInstructor = async () => {
    if (!inviteEmail || !inviteName) return

    setIsInviting(true)
    
    try {
      // Send invitation email via API
      const response = await fetch('/api/studio/invite-instructor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instructorEmail: inviteEmail,
          instructorName: inviteName,
          studioName: (currentUser as any)?.businessName || currentUser?.name || 'Your Studio',
          studioOwnerName: currentUser?.name || 'Studio Owner'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send invitation')
      }

      // Create new instructor invitation
      const newInstructor: Instructor = {
        id: Date.now().toString(),
        name: inviteName,
        email: inviteEmail,
        status: 'pending',
        invitedAt: new Date().toISOString(),
        role: inviteRole
      }

      const updatedInstructors = [...instructors, newInstructor]
      saveInstructors(updatedInstructors)

      // Reset form
      setInviteEmail('')
      setInviteName('')
      setInviteRole('instructor')
      setShowInviteForm(false)
      setIsInviting(false)

      alert('Invitation sent successfully!')
    } catch (error) {
      console.error('Error sending invitation:', error)
      alert('Failed to send invitation. Please try again.')
      setIsInviting(false)
    }
  }

  const handleRemoveInstructor = (instructorId: string) => {
    if (confirm('Are you sure you want to remove this instructor?')) {
      const updatedInstructors = instructors.filter(inst => inst.id !== instructorId)
      saveInstructors(updatedInstructors)
    }
  }

  const handleUpgradeInstructorRole = (instructorId: string, newRole: 'instructor' | 'licensed' | 'student') => {
    const instructor = instructors.find(i => i.id === instructorId)
    if (!instructor) return
    
    const updatedInstructors = instructors.map(instructor => 
      instructor.id === instructorId 
        ? { ...instructor, role: newRole }
        : instructor
    )
    saveInstructors(updatedInstructors)
    
    const roleText = newRole === 'instructor' ? 'Instructor' : newRole === 'licensed' ? 'Licensed Artist' : 'Student'
    alert(`${instructor.name} has been changed to ${roleText} status!`)
  }

  const handleApproveInstructor = (instructorId: string) => {
    const updatedInstructors = instructors.map(inst => 
      inst.id === instructorId 
        ? { ...inst, status: 'active' as const, joinedAt: new Date().toISOString() }
        : inst
    )
    saveInstructors(updatedInstructors)
  }

  const handleSuspendInstructor = (instructorId: string) => {
    const updatedInstructors = instructors.map(inst => 
      inst.id === instructorId 
        ? { ...inst, status: 'suspended' as const }
        : inst
    )
    saveInstructors(updatedInstructors)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'active':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
      case 'suspended':
        return <Badge variant="outline" className="text-red-600 border-red-600"><AlertTriangle className="h-3 w-3 mr-1" />Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-lavender-600/5">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-lavender-600/5">
      <NavBar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-lavender rounded-full flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Studio Management</h1>
              <p className="text-gray-600">Manage instructors and studio access</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{instructors.length}</p>
                  <p className="text-sm text-gray-600">Total Instructors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {instructors.filter(inst => inst.status === 'active').length}
                  </p>
                  <p className="text-sm text-gray-600">Active Instructors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {instructors.filter(inst => inst.status === 'pending').length}
                  </p>
                  <p className="text-sm text-gray-600">Pending Invitations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invite New Instructor */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus className="h-5 w-5 text-lavender" />
                  <span>Invite New Instructor</span>
                </CardTitle>
                <CardDescription>
                  Send an invitation to a licensed instructor to join your studio
                </CardDescription>
              </div>
              <Button 
                onClick={() => setShowInviteForm(!showInviteForm)}
                className="bg-lavender hover:bg-lavender-600"
              >
                {showInviteForm ? 'Cancel' : 'Add New Instructor'}
              </Button>
            </div>
          </CardHeader>
          
          {showInviteForm && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instructor-name">Instructor Name</Label>
                  <Input
                    id="instructor-name"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Enter instructor's full name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="instructor-email">Email Address</Label>
                  <Input
                    id="instructor-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter instructor's email"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <Label htmlFor="instructor-role">Role</Label>
                <select
                  id="instructor-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'instructor' | 'licensed' | 'student')}
                  className="w-full mt-1 p-3 border border-lavender/30 rounded-lg focus:ring-2 focus:ring-lavender/50 focus:border-lavender"
                >
                  <option value="instructor">🏆 Instructor - Gets instructor dashboard & can supervise students</option>
                  <option value="licensed">🎨 Licensed Artist - Uses regular booking system independently</option>
                  <option value="student">🎓 Student/Apprentice - Uses supervision booking system</option>
                </select>
                <p className="text-sm text-ink/70 mt-2">
                  {inviteRole === 'instructor' 
                    ? 'Instructors get access to the instructor dashboard, can supervise students, and manage the supervision booking system.'
                    : inviteRole === 'student' 
                    ? 'Students will use the supervision booking system and require instructor oversight for all procedures.'
                    : 'Licensed artists will use the regular booking system and can work independently with clients.'
                  }
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowInviteForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleInviteInstructor}
                  disabled={!inviteName || !inviteEmail || isInviting}
                  className="bg-lavender hover:bg-lavender-600"
                >
                  {isInviting ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Studio Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Studio Settings</span>
            </CardTitle>
            <CardDescription>
              Configure your studio's location and clock in/out settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Geolocation Settings</h3>
                    <p className="text-sm text-gray-600">Set your studio address for clock in/out tracking</p>
                  </div>
                </div>
                <Button
                  onClick={() => window.location.href = '/studio/geolocation-settings'}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Configure
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructors List */}
        <Card>
          <CardHeader>
            <CardTitle>Studio Instructors</CardTitle>
            <CardDescription>
              Manage your studio's instructors and their access levels
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {instructors.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No instructors yet</h3>
                <p className="text-gray-600 mb-4">Use the "Invite New Instructor" section above to invite your first instructor</p>
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <UserPlus className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-blue-700 text-sm font-medium">Invite form is above ↑</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {instructors.map((instructor) => (
                  <div key={instructor.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200">
                          {instructor.avatar ? (
                            <img 
                              src={instructor.avatar} 
                              alt={`${instructor.name} profile`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-medium text-gray-600">
                              {instructor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 text-lg">{instructor.name}</h3>
                          {instructor.licenseNumber && (
                            <p className="text-sm text-gray-500">
                              License: {instructor.licenseNumber} ({instructor.licenseState})
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-3 flex-wrap">
                        {getStatusBadge(instructor.status)}
                        
                        <Badge variant="outline" className={
                          instructor.role === 'instructor'
                            ? 'text-gold-600 border-gold-600 bg-gold-50'
                            : instructor.role === 'licensed' 
                            ? 'text-blue-600 border-blue-600 bg-blue-50' 
                            : 'text-purple-600 border-purple-600 bg-purple-50'
                        }>
                          {instructor.role === 'instructor' ? '🏆 Instructor' : instructor.role === 'licensed' ? '🎨 Licensed Artist' : '🎓 Student/Apprentice'}
                        </Badge>
                      </div>
                      
                      {/* Actions dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 w-8 p-0 hover:bg-gray-50"
                          >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 z-50 bg-white border border-gray-200 shadow-lg">
                          {instructor.status === 'pending' && (
                            <DropdownMenuItem 
                              onClick={() => handleApproveInstructor(instructor.id)}
                              className="hover:bg-green-50 focus:bg-green-50 text-gray-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          
                          {instructor.status === 'active' && (
                            <DropdownMenuItem 
                              onClick={() => handleSuspendInstructor(instructor.id)}
                              className="hover:bg-red-50 focus:bg-red-50 text-gray-700"
                            >
                              <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          
                          {instructor.status === 'suspended' && (
                            <DropdownMenuItem 
                              onClick={() => handleApproveInstructor(instructor.id)}
                              className="hover:bg-green-50 focus:bg-green-50 text-gray-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              Reactivate
                            </DropdownMenuItem>
                          )}
                          
                          {instructor.status === 'active' && (
                            <>
                              {instructor.role === 'student' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => handleUpgradeInstructorRole(instructor.id, 'licensed')}
                                    className="hover:bg-blue-50 focus:bg-blue-50 text-gray-700"
                                  >
                                    <GraduationCap className="h-4 w-4 mr-2 text-blue-600" />
                                    Make Licensed Artist
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleUpgradeInstructorRole(instructor.id, 'instructor')}
                                    className="hover:bg-yellow-50 focus:bg-yellow-50 text-gray-700"
                                  >
                                    <GraduationCap className="h-4 w-4 mr-2 text-yellow-600" />
                                    Make Instructor
                                  </DropdownMenuItem>
                                </>
                              )}
                              {instructor.role === 'licensed' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => handleUpgradeInstructorRole(instructor.id, 'student')}
                                    className="hover:bg-purple-50 focus:bg-purple-50 text-gray-700"
                                  >
                                    <Users className="h-4 w-4 mr-2 text-purple-600" />
                                    Make Student
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleUpgradeInstructorRole(instructor.id, 'instructor')}
                                    className="hover:bg-yellow-50 focus:bg-yellow-50 text-gray-700"
                                  >
                                    <GraduationCap className="h-4 w-4 mr-2 text-yellow-600" />
                                    Make Instructor
                                  </DropdownMenuItem>
                                </>
                              )}
                              {instructor.role === 'instructor' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => handleUpgradeInstructorRole(instructor.id, 'licensed')}
                                    className="hover:bg-blue-50 focus:bg-blue-50 text-gray-700"
                                  >
                                    <GraduationCap className="h-4 w-4 mr-2 text-blue-600" />
                                    Make Licensed Artist
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleUpgradeInstructorRole(instructor.id, 'student')}
                                    className="hover:bg-purple-50 focus:bg-purple-50 text-gray-700"
                                  >
                                    <Users className="h-4 w-4 mr-2 text-purple-600" />
                                    Make Student
                                  </DropdownMenuItem>
                                </>
                              )}
                            </>
                          )}
                          
                          <DropdownMenuItem 
                            onClick={() => handleRemoveInstructor(instructor.id)}
                            className="hover:bg-red-50 focus:bg-red-50 text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
