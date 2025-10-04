"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Crown,
  User
} from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { NavBar } from '@/components/ui/navbar'

interface TeamMember {
  id: string
  name: string
  email: string
  status: 'pending' | 'active' | 'suspended'
  invitedAt: string
  joinedAt?: string
  role: 'student' | 'licensed' | 'instructor' | 'owner'
  licenseNumber?: string
  licenseState?: string
}

export default function StudioTeamPage() {
  const { currentUser, isLoading } = useDemoAuth()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [invitePassword, setInvitePassword] = useState('')
  const [inviteRole, setInviteRole] = useState<'student' | 'licensed' | 'instructor'>('student')
  const [isInviting, setIsInviting] = useState(false)

  // Load team members from localStorage
  useEffect(() => {
    const savedTeamMembers = localStorage.getItem('studio-team-members')
    if (savedTeamMembers) {
      setTeamMembers(JSON.parse(savedTeamMembers))
    } else {
      // Add the current user as the studio owner
      if (currentUser) {
        const owner: TeamMember = {
          id: currentUser.id || 'owner-1',
          name: currentUser.name || 'Studio Owner',
          email: currentUser.email || 'owner@studio.com',
          status: 'active',
          invitedAt: new Date().toISOString(),
          joinedAt: new Date().toISOString(),
          role: 'owner'
        }
        setTeamMembers([owner])
        localStorage.setItem('studio-team-members', JSON.stringify([owner]))
      }
    }
  }, [currentUser])

  // Save team members to localStorage
  const saveTeamMembers = (newTeamMembers: TeamMember[]) => {
    setTeamMembers(newTeamMembers)
    localStorage.setItem('studio-team-members', JSON.stringify(newTeamMembers))
  }

  const handleInviteTeamMember = async () => {
    if (!inviteEmail || !inviteName || !invitePassword) return

    setIsInviting(true)
    
    try {
      // Send invitation email via API
      const response = await fetch('/api/studio/invite-team-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberEmail: inviteEmail,
          memberName: inviteName,
          memberPassword: invitePassword,
          memberRole: inviteRole,
          studioName: (currentUser as any)?.businessName || currentUser?.name || 'Your Studio',
          studioOwnerName: currentUser?.name || 'Studio Owner'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send invitation')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to send invitation')
      }

      // Create new team member invitation
      const newTeamMember: TeamMember = {
        id: Date.now().toString(),
        name: inviteName,
        email: inviteEmail,
        status: 'pending',
        invitedAt: new Date().toISOString(),
        role: inviteRole
      }

      const updatedTeamMembers = [...teamMembers, newTeamMember]
      saveTeamMembers(updatedTeamMembers)

      // Reset form
      setInviteEmail('')
      setInviteName('')
      setInvitePassword('')
      setInviteRole('student')
      setShowInviteForm(false)
      setIsInviting(false)

      alert(`Invitation sent successfully to ${inviteName}! They will receive an email with their login credentials.`)
    } catch (error) {
      console.error('Error sending invitation:', error)
      alert('Failed to send invitation. Please try again.')
      setIsInviting(false)
    }
  }

  const handleRemoveTeamMember = (memberId: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      const updatedTeamMembers = teamMembers.filter(member => member.id !== memberId)
      saveTeamMembers(updatedTeamMembers)
    }
  }

  const handleChangeTeamMemberRole = (memberId: string, newRole: 'student' | 'licensed' | 'instructor') => {
    const member = teamMembers.find(m => m.id === memberId)
    if (!member) return
    
    const updatedTeamMembers = teamMembers.map(member => 
      member.id === memberId 
        ? { ...member, role: newRole }
        : member
    )
    saveTeamMembers(updatedTeamMembers)
    
    const roleText = newRole === 'licensed' ? 'Licensed Artist' : 
                    newRole === 'instructor' ? 'Instructor' : 'Student'
    alert(`${member.name} has been changed to ${roleText} status!`)
  }

  const handleApproveTeamMember = (memberId: string) => {
    const updatedTeamMembers = teamMembers.map(member => 
      member.id === memberId 
        ? { ...member, status: 'active' as const, joinedAt: new Date().toISOString() }
        : member
    )
    saveTeamMembers(updatedTeamMembers)
  }

  const handleSuspendTeamMember = (memberId: string) => {
    const updatedTeamMembers = teamMembers.map(member => 
      member.id === memberId 
        ? { ...member, status: 'suspended' as const }
        : member
    )
    saveTeamMembers(updatedTeamMembers)
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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300"><Crown className="h-3 w-3 mr-1" />Studio Owner</Badge>
      case 'instructor':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300"><GraduationCap className="h-3 w-3 mr-1" />Instructor</Badge>
      case 'licensed':
        return <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />Licensed Artist</Badge>
      case 'student':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300"><User className="h-3 w-3 mr-1" />Student</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Full studio management access'
      case 'instructor':
        return 'Can supervise students and manage availability'
      case 'licensed':
        return 'Independent client work with regular booking system'
      case 'student':
        return 'Requires supervision for all procedures'
      default:
        return ''
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
            <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Studio Team Management</h1>
              <p className="text-gray-600">Manage your studio's team members and their roles</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
                  <p className="text-sm text-gray-600">Total Members</p>
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
                    {teamMembers.filter(member => member.status === 'active').length}
                  </p>
                  <p className="text-sm text-gray-600">Active Members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {teamMembers.filter(member => member.role === 'student').length}
                  </p>
                  <p className="text-sm text-gray-600">Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {teamMembers.filter(member => ['instructor', 'licensed'].includes(member.role)).length}
                  </p>
                  <p className="text-sm text-gray-600">Licensed Artists</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invite New Team Member */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus className="h-5 w-5 text-violet-600" />
                  <span>Invite Team Member</span>
                </CardTitle>
                <CardDescription>
                  Add students, licensed artists, or instructors to your studio team
                </CardDescription>
              </div>
              <Button 
                onClick={() => setShowInviteForm(!showInviteForm)}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {showInviteForm ? 'Cancel' : 'Invite Team Member'}
              </Button>
            </div>
          </CardHeader>
          
          {showInviteForm && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="member-name">Full Name</Label>
                  <Input
                    id="member-name"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Enter team member's full name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="member-email">Email Address</Label>
                  <Input
                    id="member-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter team member's email"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <Label htmlFor="member-password">Initial Password</Label>
                <Input
                  id="member-password"
                  type="password"
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  placeholder="Create initial password for team member"
                  className="mt-1"
                />
                <p className="text-sm text-gray-600 mt-2">
                  The team member will use this password to log in. They can change it after their first login.
                </p>
              </div>
              
              <div className="mt-4">
                <Label htmlFor="member-role">Role</Label>
                <select
                  id="member-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'student' | 'licensed' | 'instructor')}
                  className="w-full mt-1 p-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                >
                  <option value="student">Student/Apprentice - Requires supervision for all procedures</option>
                  <option value="licensed">Licensed Artist - Independent client work</option>
                  <option value="instructor">Instructor - Can supervise students and manage availability</option>
                </select>
                <p className="text-sm text-gray-600 mt-2">
                  {inviteRole === 'student' && 'Students will use the supervision booking system and require instructor oversight for all procedures.'}
                  {inviteRole === 'licensed' && 'Licensed artists will use the regular booking system and can work independently with clients.'}
                  {inviteRole === 'instructor' && 'Instructors can supervise students, manage their availability, and access instructor management features.'}
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
                  onClick={handleInviteTeamMember}
                  disabled={!inviteName || !inviteEmail || !invitePassword || isInviting}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  {isInviting ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Team Members List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-violet-600" />
              <span>Studio Team Members</span>
            </CardTitle>
            <CardDescription>
              Manage your studio's team members and their access levels
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {teamMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
                <p className="text-gray-600 mb-4">Invite your first team member to get started</p>
                <Button 
                  onClick={() => setShowInviteForm(true)}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  Invite Team Member
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{member.name}</h3>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          {member.licenseNumber && (
                            <p className="text-xs text-gray-500">
                              License: {member.licenseNumber} ({member.licenseState})
                            </p>
                          )}
                          <p className="text-xs text-gray-500">{getRoleDescription(member.role)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(member.status)}
                      {getRoleBadge(member.role)}
                      
                      <div className="flex space-x-2">
                        {member.role !== 'owner' && (
                          <>
                            {member.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handleApproveTeamMember(member.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                Approve
                              </Button>
                            )}
                            
                            {member.status === 'active' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSuspendTeamMember(member.id)}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                Suspend
                              </Button>
                            )}
                            
                            {member.status === 'suspended' && (
                              <Button
                                size="sm"
                                onClick={() => handleApproveTeamMember(member.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                Reactivate
                              </Button>
                            )}
                            
                            {member.status === 'active' && (
                              <select
                                value={member.role}
                                onChange={(e) => handleChangeTeamMemberRole(member.id, e.target.value as 'student' | 'licensed' | 'instructor')}
                                className="text-xs border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="student">Student</option>
                                <option value="licensed">Licensed</option>
                                <option value="instructor">Instructor</option>
                              </select>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveTeamMember(member.id)}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
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
