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
  User,
  Package,
  MoreVertical,
  Settings,
  DollarSign,
  X,
  Shield
} from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { NavBar } from '@/components/ui/navbar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface TeamMember {
  id: string
  name: string
  email: string
  status: 'pending' | 'active' | 'suspended'
  invitedAt: string
  joinedAt?: string
  role: 'student' | 'licensed' | 'instructor' | 'owner' | 'staff' | 'director' | 'hr' | 'manager'
  licenseNumber?: string
  licenseState?: string
  phone?: string
  avatar?: string
  // Payment settings
  employmentType?: 'commissioned' | 'booth_renter' | null
  commissionRate?: number
  boothRentAmount?: number
}

export default function StudioTeamPage() {
  const { currentUser, isLoading } = useDemoAuth()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [invitePassword, setInvitePassword] = useState('')
  const [inviteRole, setInviteRole] = useState<'student' | 'licensed' | 'instructor' | 'staff' | 'director' | 'hr' | 'manager'>('student')
  const [isInviting, setIsInviting] = useState(false)
  const [addMode, setAddMode] = useState<'invite' | 'manual'>('invite') // New state for add mode
  const [isSyncing, setIsSyncing] = useState(false)
  
  // Employment settings modal state
  const [showEmploymentModal, setShowEmploymentModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [employmentType, setEmploymentType] = useState<'commissioned' | 'booth_renter' | ''>('')
  const [commissionRate, setCommissionRate] = useState<number>(50)
  const [boothRentAmount, setBoothRentAmount] = useState<number>(500)
  const [isSavingEmployment, setIsSavingEmployment] = useState(false)

  // Load team members from DATABASE (not localStorage)
  useEffect(() => {
    const loadTeamMembersFromDatabase = async () => {
      if (!currentUser?.email) return
      
      try {
        // PRODUCTION FIX: Fetch from database first
        const response = await fetch('/api/studio/team-members', {
          headers: {
            'x-user-email': currentUser.email
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          const dbTeamMembers = data.teamMembers || []
          
          console.log('📋 Loaded team members from DATABASE:', dbTeamMembers.length)
          setTeamMembers(dbTeamMembers)
          
          // Cache in localStorage for offline support
          localStorage.setItem('studio-team-members', JSON.stringify(dbTeamMembers))
          
          // Sync instructors
          syncExistingInstructors(dbTeamMembers)
        } else {
          // Fallback to localStorage if API fails
          const savedTeamMembers = localStorage.getItem('studio-team-members')
          if (savedTeamMembers) {
            const teamMembers = JSON.parse(savedTeamMembers)
            setTeamMembers(teamMembers)
            syncExistingInstructors(teamMembers)
          }
        }
      } catch (error) {
        console.error('Error loading team members:', error)
        
        // Fallback to localStorage
        const savedTeamMembers = localStorage.getItem('studio-team-members')
        if (savedTeamMembers) {
          setTeamMembers(JSON.parse(savedTeamMembers))
        }
      }
    }
    
    loadTeamMembersFromDatabase()
  }, [currentUser])

  // Sync existing team members who are instructors to supervision list
  const syncExistingInstructors = (teamMembers: TeamMember[]) => {
    console.log('🔄 Syncing existing team members to supervision list...')
    
    const existingInstructors = JSON.parse(localStorage.getItem('studio-instructors') || '[]')
    console.log('📋 Current instructors in localStorage:', existingInstructors)
    
    const instructorsToSync = teamMembers.filter(member => 
      (member.role === 'instructor' || member.role === 'licensed') && 
      member.status === 'active'
    )
    
    console.log('👥 Team members who should be instructors:', instructorsToSync)
    
    instructorsToSync.forEach(member => {
      // Check if already exists
      const exists = existingInstructors.some((inst: any) => inst.id === member.id)
      
      if (!exists) {
        const instructorData = {
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role,
          specialty: member.role === 'instructor' ? 'PMU Instructor' : 'Licensed Artist',
          experience: '5+ years',
          rating: 4.8,
          location: (currentUser as any)?.businessName || 'Studio',
          phone: member.phone || '',
          avatar: member.avatar || null,
          licenseNumber: member.licenseNumber || `LIC-${member.id.slice(-6)}`,
          availability: {
            monday: ['9:30 AM', '1:00 PM', '4:00 PM'],
            tuesday: ['9:30 AM', '1:00 PM', '4:00 PM'],
            wednesday: ['9:30 AM', '1:00 PM', '4:00 PM'],
            thursday: ['9:30 AM', '1:00 PM', '4:00 PM'],
            friday: ['9:30 AM', '1:00 PM', '4:00 PM'],
            saturday: [],
            sunday: []
          }
        }
        
        existingInstructors.push(instructorData)
        console.log('✅ Synced instructor to supervision list:', instructorData.name)
      } else {
        console.log('ℹ️ Instructor already exists in supervision list:', member.name)
      }
    })
    
    if (instructorsToSync.length > 0) {
      localStorage.setItem('studio-instructors', JSON.stringify(existingInstructors))
      console.log('✅ Updated studio-instructors localStorage with synced instructors')
    }
  }

  // Save team members to localStorage
  const saveTeamMembers = (newTeamMembers: TeamMember[]) => {
    setTeamMembers(newTeamMembers)
    localStorage.setItem('studio-team-members', JSON.stringify(newTeamMembers))
  }

  // Sync team members from database
  const syncFromDatabase = async () => {
    if (!currentUser?.email) return
    
    setIsSyncing(true)
    try {
      const response = await fetch('/api/studio/instructors', {
        headers: {
          'x-user-email': currentUser.email
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const dbInstructors = data.instructors || []
        
        // Convert database instructors to team member format
        const dbTeamMembers: TeamMember[] = dbInstructors.map((instructor: any) => ({
          id: instructor.id,
          name: instructor.name,
          email: instructor.email,
          status: 'active' as const,
          invitedAt: new Date().toISOString(),
          joinedAt: new Date().toISOString(),
          role: instructor.role as 'student' | 'licensed' | 'instructor' | 'owner' | 'staff' | 'director' | 'hr' | 'manager',
          licenseNumber: instructor.licenseNumber,
          licenseState: instructor.licenseState,
          phone: instructor.phone,
          avatar: instructor.avatar
        }))
        
        // Get existing team members
        const existingTeamMembers = [...teamMembers]
        
        // Add database instructors that aren't already in the team
        dbTeamMembers.forEach(dbMember => {
          const exists = existingTeamMembers.some(member => member.email === dbMember.email)
          if (!exists) {
            existingTeamMembers.push(dbMember)
          }
        })
        
        // Save updated team members
        saveTeamMembers(existingTeamMembers)
        
        console.log('✅ Synced team members from database')
      } else {
        console.error('Failed to sync from database:', response.statusText)
      }
    } catch (error) {
      console.error('Error syncing from database:', error)
    } finally {
      setIsSyncing(false)
    }
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
          'x-user-email': currentUser?.email || '' // CRITICAL: Pass owner's email so API can get correct studio name from database
        },
        body: JSON.stringify({
          memberEmail: inviteEmail,
          memberName: inviteName,
          memberPassword: invitePassword,
          memberRole: inviteRole,
          studioName: (currentUser as any)?.studioName || (currentUser as any)?.businessName || currentUser?.name || 'Your Studio',
          studioOwnerName: currentUser?.name || 'Studio Owner'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error || errorData.details || 'Failed to send invitation'
        throw new Error(errorMessage)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || result.warning || 'Failed to send invitation')
      }
      
      // Show warning if email failed but user was created
      if (result.warning) {
        alert(`${result.message}\n\n${result.warning}\n\nUser ID: ${result.userId}`)
      }

      // Create new team member invitation
      // IMPORTANT: Use the database user ID to prevent ID mismatch issues
      const newTeamMember: TeamMember = {
        id: result.userId || Date.now().toString(), // Use database ID if available
        name: inviteName,
        email: inviteEmail,
        status: 'pending',
        invitedAt: new Date().toISOString(),
        role: inviteRole
      }

      const updatedTeamMembers = [...teamMembers, newTeamMember]
      saveTeamMembers(updatedTeamMembers)
      
      console.log(`✅ Added team member with ID: ${newTeamMember.id} (from database)`)
      console.log(`   This ID will match when ${inviteName} logs in`)

      // Reset form
      setInviteEmail('')
      setInviteName('')
      setInvitePassword('')
      setInviteRole('student')
      setShowInviteForm(false)
      setIsInviting(false)

      // Only show success if no warning was already shown
      if (!result.warning) {
        alert(`Invitation sent successfully to ${inviteName}! They will receive an email with their login credentials.`)
      }
    } catch (error) {
      console.error('Error sending invitation:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to send invitation'
      alert(`Failed to add team member:\n\n${errorMessage}\n\nPlease check:\n1. Email format is correct\n2. Password is at least 6 characters\n3. Email is not already registered`)
      setIsInviting(false)
    }
  }

  const handleAddTeamMemberManually = async () => {
    if (!inviteEmail || !inviteName) return

    setIsInviting(true)
    
    try {
      // Generate a default password for manual additions
      const defaultPassword = `temp${Date.now().toString().slice(-6)}`
      
      // Create database account via API (same as invitation but without email)
      const response = await fetch('/api/studio/invite-team-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || '' // CRITICAL: Pass owner's email so API can get correct studio name from database
        },
        body: JSON.stringify({
          memberEmail: inviteEmail,
          memberName: inviteName,
          memberPassword: defaultPassword,
          memberRole: inviteRole,
          studioName: (currentUser as any)?.studioName || (currentUser as any)?.businessName || currentUser?.name || 'Your Studio',
          studioOwnerName: currentUser?.name || 'Studio Owner'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create team member account')
      }

      const data = await response.json()
      
      // Add to team members list with the real database ID
      const newMember: TeamMember = {
        id: data.userId, // Use the real database ID
        name: inviteName,
        email: inviteEmail,
        status: 'active', // Directly active since added manually
        invitedAt: new Date().toISOString(),
        joinedAt: new Date().toISOString(),
        role: inviteRole,
        licenseNumber: `LIC-${Date.now().toString().slice(-6)}`
      }

      const updatedTeamMembers = [...teamMembers, newMember]
      saveTeamMembers(updatedTeamMembers)

      // Also add to studio instructors if they're an instructor
      if (inviteRole === 'instructor' || inviteRole === 'licensed') {
        const instructorData = {
          id: newMember.id,
          name: newMember.name,
          email: newMember.email,
          role: inviteRole,
          specialty: inviteRole === 'instructor' ? 'PMU Instructor' : 'Licensed Artist',
          experience: '5+ years',
          rating: 4.8,
          location: (currentUser as any)?.businessName || 'Studio',
          phone: '',
          avatar: null,
          licenseNumber: newMember.licenseNumber,
          availability: {
            monday: ['9:30 AM', '1:00 PM', '4:00 PM'],
            tuesday: ['9:30 AM', '1:00 PM', '4:00 PM'],
            wednesday: ['9:30 AM', '1:00 PM', '4:00 PM'],
            thursday: ['9:30 AM', '1:00 PM', '4:00 PM'],
            friday: ['9:30 AM', '1:00 PM', '4:00 PM'],
            saturday: [],
            sunday: []
          }
        }

        // Add to studio instructors localStorage
        const existingInstructors = JSON.parse(localStorage.getItem('studio-instructors') || '[]')
        console.log('➕ Adding instructor manually:', instructorData.name, 'with role:', inviteRole)
        console.log('📋 Existing instructors before add:', existingInstructors)
        
        existingInstructors.push(instructorData)
        localStorage.setItem('studio-instructors', JSON.stringify(existingInstructors))
        
        console.log('✅ Added to studio-instructors localStorage:', instructorData)
        console.log('📋 Updated instructors list:', existingInstructors)
      }

      // Reset form
      setInviteEmail('')
      setInviteName('')
      setInvitePassword('')
      setInviteRole('student')
      setShowInviteForm(false)

      const roleDisplayName = inviteRole === 'instructor' ? 'Instructor' : 
                              inviteRole === 'licensed' ? 'Licensed Artist' : 
                              inviteRole === 'student' ? 'Student' :
                              inviteRole === 'staff' ? 'Staff' :
                              inviteRole === 'director' ? 'Director' :
                              inviteRole === 'hr' ? 'HR' :
                              inviteRole === 'manager' ? 'Manager' : 'Team Member'
      alert(`${roleDisplayName} added to team successfully!\n\nLogin credentials:\nEmail: ${inviteEmail}\nPassword: ${defaultPassword}`)
    } catch (error) {
      console.error('Error adding team member manually:', error)
      alert('Failed to add team member. Please try again.')
    } finally {
      setIsInviting(false)
    }
  }

  // Open employment settings modal
  const handleOpenEmploymentSettings = (member: TeamMember) => {
    setSelectedMember(member)
    setEmploymentType(member.employmentType || '')
    setCommissionRate(member.commissionRate || 50)
    setBoothRentAmount(member.boothRentAmount || 500)
    setShowEmploymentModal(true)
  }

  // Save employment settings
  const handleSaveEmploymentSettings = async () => {
    if (!selectedMember) return

    setIsSavingEmployment(true)
    try {
      const response = await fetch('/api/studio/update-employment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({
          memberId: selectedMember.id,
          employmentType: employmentType || null,
          commissionRate: employmentType === 'commissioned' ? commissionRate : null,
          boothRentAmount: employmentType === 'booth_renter' ? boothRentAmount : null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update employment settings')
      }

      const result = await response.json()

      // Update local state
      const updatedMembers = teamMembers.map(m =>
        m.id === selectedMember.id
          ? {
              ...m,
              employmentType: result.member.employmentType,
              commissionRate: result.member.commissionRate,
              boothRentAmount: result.member.boothRentAmount
            }
          : m
      )
      
      setTeamMembers(updatedMembers)
      localStorage.setItem('studio-team-members', JSON.stringify(updatedMembers))

      alert(`✅ Employment settings updated for ${selectedMember.name}`)
      setShowEmploymentModal(false)
      setSelectedMember(null)

    } catch (error) {
      console.error('Error updating employment settings:', error)
      alert(error instanceof Error ? error.message : 'Failed to update employment settings')
    } finally {
      setIsSavingEmployment(false)
    }
  }

  const handleRemoveTeamMember = async (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId)
    if (!member) return
    
    const confirmMessage = `Are you sure you want to remove ${member.name} from your team?\n\nThis will:\n• Delete their account from the database\n• Remove them from all team lists\n• Revoke their access to the studio\n\nThis action cannot be undone.`
    
    if (!confirm(confirmMessage)) return
    
    try {
      // Delete from database via API
      const response = await fetch('/api/studio/delete-team-member', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({ memberId })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete team member')
      }
      
      // Remove from localStorage team members
      const updatedTeamMembers = teamMembers.filter(m => m.id !== memberId)
      saveTeamMembers(updatedTeamMembers)
      
      // Remove from studio-instructors localStorage if they were an instructor
      const existingInstructors = JSON.parse(localStorage.getItem('studio-instructors') || '[]')
      const filteredInstructors = existingInstructors.filter((i: any) => i.id !== memberId)
      localStorage.setItem('studio-instructors', JSON.stringify(filteredInstructors))
      
      // Remove from supervisionInstructors localStorage
      const supervisionInstructors = JSON.parse(localStorage.getItem('supervisionInstructors') || '[]')
      const filteredSupervision = supervisionInstructors.filter((i: any) => i.id !== memberId)
      localStorage.setItem('supervisionInstructors', JSON.stringify(filteredSupervision))
      
      // Remove from service-assignments localStorage
      const serviceAssignments = JSON.parse(localStorage.getItem('service-assignments') || '[]')
      const filteredAssignments = serviceAssignments.filter((a: any) => a.userId !== memberId)
      localStorage.setItem('service-assignments', JSON.stringify(filteredAssignments))
      
      alert(`✅ ${member.name} has been successfully removed from your team and deleted from the system.`)
      
      // Refresh the page to ensure all data is in sync
      window.location.reload()
    } catch (error) {
      console.error('Error removing team member:', error)
      alert(`❌ Failed to remove team member: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleChangeTeamMemberRole = (memberId: string, newRole: 'student' | 'licensed' | 'instructor' | 'staff' | 'director' | 'hr' | 'manager') => {
    const member = teamMembers.find(m => m.id === memberId)
    if (!member) return
    
    const updatedTeamMembers = teamMembers.map(member => 
      member.id === memberId 
        ? { ...member, role: newRole }
        : member
    )
    saveTeamMembers(updatedTeamMembers)
    
    // Sync with studio-instructors localStorage for supervision booking
    const existingInstructors = JSON.parse(localStorage.getItem('studio-instructors') || '[]')
    console.log('🔄 Syncing role change for:', member.name, 'to role:', newRole)
    console.log('📋 Current existing instructors:', existingInstructors)
    
    if (newRole === 'instructor' || newRole === 'licensed') {
      // Add or update instructor in the instructors list
      const instructorData = {
        id: member.id,
        name: member.name,
        email: member.email,
        role: newRole,
        specialty: newRole === 'instructor' ? 'PMU Instructor' : 'Licensed Artist',
        experience: '5+ years',
        rating: 4.8,
        location: (currentUser as any)?.businessName || 'Studio',
        phone: member.phone || '',
        avatar: member.avatar || null,
        licenseNumber: member.licenseNumber || `LIC-${member.id.slice(-6)}`,
        availability: {
          monday: ['9:30 AM', '1:00 PM', '4:00 PM'],
          tuesday: ['9:30 AM', '1:00 PM', '4:00 PM'],
          wednesday: ['9:30 AM', '1:00 PM', '4:00 PM'],
          thursday: ['9:30 AM', '1:00 PM', '4:00 PM'],
          friday: ['9:30 AM', '1:00 PM', '4:00 PM'],
          saturday: [],
          sunday: []
        }
      }
      
      // Check if instructor already exists
      const existingIndex = existingInstructors.findIndex((i: any) => i.id === member.id)
      if (existingIndex >= 0) {
        existingInstructors[existingIndex] = instructorData
      } else {
        existingInstructors.push(instructorData)
      }
      
      localStorage.setItem('studio-instructors', JSON.stringify(existingInstructors))
      console.log('✅ Updated instructor in supervision list:', instructorData)
    } else {
      // Remove from instructors list if changed to student
      const filteredInstructors = existingInstructors.filter((i: any) => i.id !== member.id)
      localStorage.setItem('studio-instructors', JSON.stringify(filteredInstructors))
      console.log('✅ Removed from supervision list (now student)')
    }
    
    const roleText = newRole === 'licensed' ? 'Licensed Artist' : 
                    newRole === 'instructor' ? 'Instructor' : 
                    newRole === 'student' ? 'Student' :
                    newRole === 'staff' ? 'Staff' :
                    newRole === 'director' ? 'Director' :
                    newRole === 'hr' ? 'HR' :
                    newRole === 'manager' ? 'Manager' : 'Team Member'
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

  const handleSeparateTeamMember = async (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId)
    if (!member) return

    const newPlan = confirm(`Separate ${member.name} from the studio?\n\nThis will create an individual ${member.role === 'student' ? 'Starter' : 'Professional'} account for them.\n\nClick OK to proceed.`) 
      ? (member.role === 'student' ? 'starter' : 'professional')
      : null

    if (!newPlan) return

    try {
      const response = await fetch('/api/studio/separate-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberEmail: member.email,
          newPlan: newPlan,
          reason: 'Studio separation',
          ownerEmail: currentUser?.email
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to separate member')
      }

      const result = await response.json()
      
      // Remove member from team list
      const updatedTeamMembers = teamMembers.filter(m => m.id !== memberId)
      saveTeamMembers(updatedTeamMembers)

      alert(`✅ ${member.name} has been successfully separated from the studio!\n\nThey now have their own ${newPlan} account:\nEmail: ${result.newAccount.email}\nTemporary Password: ${result.newAccount.temporaryPassword}\n\nPlease share these credentials with them securely.`)

    } catch (error) {
      console.error('Error separating team member:', error)
      alert(`Failed to separate ${member.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600 text-xs"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'active':
        return <Badge variant="outline" className="text-green-600 border-green-600 text-xs"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>
      case 'suspended':
        return <Badge variant="outline" className="text-red-600 border-red-600 text-xs"><AlertTriangle className="h-3 w-3 mr-1" />Suspended</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300 text-xs"><Crown className="h-3 w-3 mr-1" />Studio Owner</Badge>
      case 'instructor':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs"><GraduationCap className="h-3 w-3 mr-1" />Instructor</Badge>
      case 'licensed':
        return <Badge className="bg-green-100 text-green-800 border-green-300 text-xs"><CheckCircle className="h-3 w-3 mr-1" />Licensed Artist</Badge>
      case 'student':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-xs"><User className="h-3 w-3 mr-1" />Student</Badge>
      case 'staff':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300 text-xs"><User className="h-3 w-3 mr-1" />Staff</Badge>
      case 'director':
        return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-300 text-xs"><Crown className="h-3 w-3 mr-1" />Director</Badge>
      case 'hr':
        return <Badge className="bg-pink-100 text-pink-800 border-pink-300 text-xs"><Users className="h-3 w-3 mr-1" />HR</Badge>
      case 'manager':
        return <Badge className="bg-cyan-100 text-cyan-800 border-cyan-300 text-xs"><Settings className="h-3 w-3 mr-1" />Manager</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{role}</Badge>
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
      case 'staff':
        return 'Administrative and operational support'
      case 'director':
        return 'Management and oversight responsibilities'
      case 'hr':
        return 'Human resources and personnel management'
      case 'manager':
        return 'Team and operations coordination'
      default:
        return ''
    }
  }

  // Check if user has permission to access team management
  const hasTeamManagementAccess = currentUser && 
    (currentUser.role === 'owner' || 
     currentUser.role === 'manager' || 
     currentUser.role === 'director') &&
    (currentUser as any)?.selectedPlan === 'studio'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-lavender-600/5">
        <NavBar user={currentUser ? {
          name: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.avatar
        } : undefined} />
        <div className="max-w-7xl mx-auto px-3 py-4 pb-20 md:px-4 md:py-8 md:pb-8">
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
  if (!hasTeamManagementAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-lavender-600/5">
        <NavBar user={currentUser ? {
          name: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.avatar
        } : undefined} />
        <div className="max-w-7xl mx-auto px-3 py-4 pb-20 md:px-4 md:py-8 md:pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
              <p className="text-gray-600 mb-4">
                Team management is only available to studio owners, managers, and directors.
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
    <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-lavender-600/5">
      <NavBar user={currentUser ? {
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar
      } : undefined} />
      
      <div className="max-w-7xl mx-auto px-3 py-4 pb-20 md:px-4 md:py-8 md:pb-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 break-words">Studio Team Management</h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">Manage your studio's team members and their roles</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <Card>
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 md:h-5 md:w-5 text-violet-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg md:text-2xl font-bold text-gray-900">{teamMembers.length}</p>
                  <p className="text-xs md:text-sm text-gray-600">Total Members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {teamMembers.filter(member => member.status === 'active').length}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600">Active Members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {teamMembers.filter(member => member.role === 'student').length}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600">Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-6">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    {teamMembers.filter(member => ['instructor', 'licensed'].includes(member.role)).length}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600">Licensed Artists</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invite New Team Member */}
        <Card className="mb-6 md:mb-8">
          <CardHeader className="pb-4">
            <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div>
                <CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
                  <UserPlus className="h-4 w-4 md:h-5 md:w-5 text-violet-600" />
                  <span>Add Team Member</span>
                </CardTitle>
                <CardDescription className="text-sm md:text-base mt-1">
                  Add students, licensed artists, or instructors to your studio team
                </CardDescription>
              </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      onClick={() => setShowInviteForm(!showInviteForm)}
                      className="bg-violet-600 hover:bg-violet-700 w-full md:w-auto"
                      size="sm"
                    >
                      {showInviteForm ? 'Cancel' : 'Add Team Member'}
                    </Button>
                    <Button 
                      onClick={syncFromDatabase}
                      disabled={isSyncing}
                      variant="outline"
                      className="w-full sm:w-auto border-lavender/30 text-lavender hover:bg-lavender/10"
                      size="sm"
                    >
                      {isSyncing ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <Package className="h-4 w-4 mr-2" />
                          Sync from Database
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={() => window.location.href = '/studio/service-assignments'}
                      variant="outline"
                      className="w-full sm:w-auto border-lavender/30 text-lavender hover:bg-lavender/10"
                      size="sm"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Service Assignments
                    </Button>
                  </div>
            </div>
          </CardHeader>
          
          {showInviteForm && (
            <CardContent className="pt-0">
              {/* Add Mode Toggle */}
              <div className="mb-6">
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                  <button
                    onClick={() => setAddMode('invite')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      addMode === 'invite'
                        ? 'bg-white text-violet-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Send Invitation
                  </button>
                  <button
                    onClick={() => setAddMode('manual')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      addMode === 'manual'
                        ? 'bg-white text-violet-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Add to Database
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {addMode === 'invite' 
                    ? 'Send an email invitation with login credentials to the team member'
                    : 'Add the team member directly to the database without sending an email'
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="member-name" className="text-sm font-medium">Full Name</Label>
                  <Input
                    id="member-name"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Enter team member's full name"
                    className="mt-1 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="member-email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="member-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter team member's email"
                    className="mt-1 text-sm"
                  />
                </div>
              </div>
              
              {addMode === 'invite' && (
                <div className="mt-4">
                  <Label htmlFor="member-password" className="text-sm font-medium">Initial Password</Label>
                  <Input
                    id="member-password"
                    type="password"
                    value={invitePassword}
                    onChange={(e) => setInvitePassword(e.target.value)}
                    placeholder="Create initial password for team member"
                    className="mt-1 text-sm"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    The team member will use this password to log in. They can change it after their first login.
                  </p>
                </div>
              )}
              
              <div className="mt-4">
                <Label htmlFor="member-role" className="text-sm font-medium">Role</Label>
                <select
                  id="member-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'student' | 'licensed' | 'instructor' | 'staff' | 'director' | 'hr' | 'manager')}
                  className="w-full mt-1 p-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm"
                >
                  <option value="student">Student/Apprentice - Requires supervision for all procedures</option>
                  <option value="licensed">Licensed Artist - Independent client work</option>
                  <option value="instructor">Instructor - Can supervise students and manage availability</option>
                  <option value="staff">Staff - Administrative and support role</option>
                  <option value="director">Director - Management and oversight role</option>
                  <option value="hr">Human Resources - HR and personnel management</option>
                  <option value="manager">Manager - Team and operations management</option>
                </select>
                <p className="text-xs text-gray-600 mt-2">
                  {inviteRole === 'student' && 'Students will use the supervision booking system and require instructor oversight for all procedures.'}
                  {inviteRole === 'licensed' && 'Licensed artists will use the regular booking system and can work independently with clients.'}
                  {inviteRole === 'instructor' && 'Instructors can supervise students, manage their availability, and access instructor management features.'}
                  {inviteRole === 'staff' && 'Staff members provide administrative and operational support for studio activities.'}
                  {inviteRole === 'director' && 'Directors have management and oversight responsibilities for studio operations.'}
                  {inviteRole === 'hr' && 'HR team members handle human resources and personnel management functions.'}
                  {inviteRole === 'manager' && 'Managers oversee team operations and coordinate studio activities.'}
                </p>
              </div>
              
              <div className="flex flex-col space-y-3 md:flex-row md:justify-end md:space-y-0 md:space-x-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowInviteForm(false)}
                  className="w-full md:w-auto"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={addMode === 'invite' ? handleInviteTeamMember : handleAddTeamMemberManually}
                  disabled={
                    addMode === 'invite' 
                      ? (!inviteName || !inviteEmail || !invitePassword || isInviting)
                      : (!inviteName || !inviteEmail)
                  }
                  className="bg-violet-600 hover:bg-violet-700 w-full md:w-auto"
                  size="sm"
                >
                  {addMode === 'invite' 
                    ? (isInviting ? 'Sending...' : 'Send Invitation')
                    : (isInviting ? 'Adding...' : 'Add to Database')
                  }
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Team Members List */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
              <Building2 className="h-4 w-4 md:h-5 md:w-5 text-violet-600" />
              <span>Studio Team Members</span>
            </CardTitle>
            <CardDescription className="text-sm md:text-base">
              Manage your studio's team members and their access levels
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {teamMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
                <p className="text-gray-600 mb-4 text-sm">Invite your first team member to get started</p>
                <Button 
                  onClick={() => setShowInviteForm(true)}
                  className="bg-violet-600 hover:bg-violet-700"
                  size="sm"
                >
                  Add Team Member
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex flex-col p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors gap-3">
                      {/* Top row: Avatar and basic info */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-gray-600">
                            {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <h3 className="font-medium text-gray-900 text-sm truncate">{member.name}</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              {getStatusBadge(member.status)}
                              {/* Employment Type Badge */}
                              {(member.role === 'instructor' || member.role === 'licensed') && member.employmentType && (
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    member.employmentType === 'commissioned' 
                                      ? 'bg-green-50 text-green-700 border-green-300'
                                      : 'bg-blue-50 text-blue-700 border-blue-300'
                                  }`}
                                >
                                  {member.employmentType === 'commissioned' 
                                    ? `💰 ${member.commissionRate}% Commission`
                                    : `🏢 $${member.boothRentAmount}/mo Rent`
                                  }
                                </Badge>
                              )}
                              {/* Warning if employment not set */}
                              {(member.role === 'instructor' || member.role === 'licensed') && !member.employmentType && (
                                <div className="flex items-center gap-1 text-xs text-amber-600">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span>Pay Type</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 truncate mt-1">{member.email}</p>
                        </div>
                      </div>

                      {/* Bottom row: Role and actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {member.role !== 'owner' && member.status === 'active' ? (
                            <select
                              value={member.role}
                              onChange={(e) => handleChangeTeamMemberRole(member.id, e.target.value as 'student' | 'licensed' | 'instructor')}
                              className="text-xs border border-gray-300 rounded px-2 py-1 h-7 bg-white"
                            >
                              <option value="student">🎓 Student</option>
                              <option value="licensed">🎨 Licensed Artist</option>
                              <option value="instructor">🏆 Instructor</option>
                            </select>
                          ) : (
                            <div className="text-xs text-gray-600 px-2 py-1">
                              {member.role === 'owner' ? '👑 Owner' : getRoleDescription(member.role)}
                            </div>
                          )}
                        </div>

                        {/* Actions Dropdown */}
                        {member.role !== 'owner' && (
                          <div className="flex-shrink-0">
                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 w-7 p-0 hover:bg-gray-50"
                                >
                                  <MoreVertical className="h-3 w-3" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg z-50">
                              {/* Status Management */}
                              {member.status === 'pending' && (
                                <DropdownMenuItem 
                                  onClick={() => handleApproveTeamMember(member.id)}
                                  className="hover:bg-green-50 focus:bg-green-50 text-gray-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                  Approve
                                </DropdownMenuItem>
                              )}
                              
                              {member.status === 'active' && (
                                <DropdownMenuItem 
                                  onClick={() => handleSuspendTeamMember(member.id)}
                                  className="hover:bg-red-50 focus:bg-red-50 text-gray-700"
                                >
                                  <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                                  Suspend
                                </DropdownMenuItem>
                              )}
                              
                              {member.status === 'suspended' && (
                                <DropdownMenuItem 
                                  onClick={() => handleApproveTeamMember(member.id)}
                                  className="hover:bg-green-50 focus:bg-green-50 text-gray-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                  Reactivate
                                </DropdownMenuItem>
                              )}

                              {/* Role Management */}
                              {member.status === 'active' && (
                                <>
                                  <div className="px-2 py-1.5 text-xs font-medium text-gray-500 border-t border-gray-100 mt-1">
                                    Change Role
                                  </div>
                                  
                                  {member.role !== 'student' && (
                                    <DropdownMenuItem 
                                      onClick={() => handleChangeTeamMemberRole(member.id, 'student')}
                                      className="hover:bg-purple-50 focus:bg-purple-50 text-gray-700"
                                    >
                                      <GraduationCap className="h-4 w-4 mr-2 text-purple-600" />
                                      Make Student/Apprentice
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {member.role !== 'licensed' && (
                                    <DropdownMenuItem 
                                      onClick={() => handleChangeTeamMemberRole(member.id, 'licensed')}
                                      className="hover:bg-blue-50 focus:bg-blue-50 text-gray-700"
                                    >
                                      <User className="h-4 w-4 mr-2 text-blue-600" />
                                      Make Licensed Artist
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {member.role !== 'instructor' && (
                                    <DropdownMenuItem 
                                      onClick={() => handleChangeTeamMemberRole(member.id, 'instructor')}
                                      className="hover:bg-yellow-50 focus:bg-yellow-50 text-gray-700"
                                    >
                                      <Crown className="h-4 w-4 mr-2 text-yellow-600" />
                                      Make Instructor
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                              
                              {/* Permissions - Only for staff, hr, director, and manager roles */}
                              {(member.role === 'staff' || member.role === 'hr' || member.role === 'director' || member.role === 'manager') && member.status === 'active' && (
                                <>
                                  <div className="px-2 py-1.5 text-xs font-medium text-gray-500 border-t border-gray-100 mt-1">
                                    Permissions
                                  </div>
                                  <DropdownMenuItem 
                                    onClick={() => alert('Permissions management coming soon! This will allow you to control what actions this team member can perform.')}
                                    className="hover:bg-purple-50 focus:bg-purple-50 text-gray-700"
                                  >
                                    <Shield className="h-4 w-4 mr-2 text-purple-600" />
                                    Manage Permissions
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              {/* Employment Settings - Only for instructors and licensed artists */}
                              {(member.role === 'instructor' || member.role === 'licensed') && member.status === 'active' && (
                                <>
                                  <div className="px-2 py-1.5 text-xs font-medium text-gray-500 border-t border-gray-100 mt-1">
                                    Payment Settings
                                  </div>
                                  <DropdownMenuItem 
                                    onClick={() => handleOpenEmploymentSettings(member)}
                                    className="hover:bg-green-50 focus:bg-green-50 text-gray-700"
                                  >
                                    <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                                    Set Employment Type
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              {/* Account Management */}
                              <div className="px-2 py-1.5 text-xs font-medium text-gray-500 border-t border-gray-100 mt-1">
                                Account Actions
                              </div>
                              
                              <DropdownMenuItem 
                                onClick={() => handleSeparateTeamMember(member.id)}
                                className="hover:bg-blue-50 focus:bg-blue-50 text-gray-700"
                              >
                                <User className="h-4 w-4 mr-2 text-blue-600" />
                                Separate from Studio
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem 
                                onClick={() => handleRemoveTeamMember(member.id)}
                                className="hover:bg-red-50 focus:bg-red-50 text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove from Team
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employment Settings Modal */}
        {showEmploymentModal && selectedMember && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Employment & Payment Settings
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Set how {selectedMember.name} will be paid for their services
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEmploymentModal(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Member Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {selectedMember.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedMember.name}</p>
                      <p className="text-sm text-gray-600">{selectedMember.email}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {selectedMember.role === 'instructor' ? '🏆 Instructor' : '🎨 Licensed Artist'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Employment Type Selection */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Employment Type</Label>
                  
                  {/* Commissioned Option */}
                  <div 
                    onClick={() => setEmploymentType('commissioned')}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      employmentType === 'commissioned'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                        employmentType === 'commissioned'
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      }`}>
                        {employmentType === 'commissioned' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">💰 Commissioned Artist</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          All client payments come to your Stripe account. You pay them a percentage commission.
                        </p>
                        
                        {employmentType === 'commissioned' && (
                          <div className="space-y-3 mt-4 pt-4 border-t border-green-200">
                            <div>
                              <Label className="text-sm font-medium">Commission Rate (%)</Label>
                              <div className="flex items-center gap-3 mt-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={commissionRate}
                                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                                  className="w-24"
                                />
                                <span className="text-sm text-gray-600">
                                  {selectedMember.name} gets {commissionRate}%, you keep {100 - commissionRate}%
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Example: On a $400 service, {selectedMember.name} earns ${(400 * commissionRate / 100).toFixed(2)}, you keep ${(400 * (100 - commissionRate) / 100).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Booth Renter Option */}
                  <div 
                    onClick={() => setEmploymentType('booth_renter')}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      employmentType === 'booth_renter'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                        employmentType === 'booth_renter'
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {employmentType === 'booth_renter' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">🏢 Independent Booth Renter</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Payments go directly to their Stripe account. They pay you monthly booth rent.
                        </p>
                        
                        {employmentType === 'booth_renter' && (
                          <div className="space-y-3 mt-4 pt-4 border-t border-blue-200">
                            <div>
                              <Label className="text-sm font-medium">Monthly Booth Rent ($)</Label>
                              <div className="flex items-center gap-3 mt-2">
                                <Input
                                  type="number"
                                  min="0"
                                  value={boothRentAmount}
                                  onChange={(e) => setBoothRentAmount(Number(e.target.value))}
                                  className="w-32"
                                />
                                <span className="text-sm text-gray-600">per month</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                ⚠️ {selectedMember.name} must connect their own Stripe account to receive payments
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSaveEmploymentSettings}
                    disabled={!employmentType || isSavingEmployment}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isSavingEmployment ? 'Saving...' : 'Save Settings'}
                  </Button>
                  <Button
                    onClick={() => setShowEmploymentModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>

                {/* Info Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  <p className="font-medium text-blue-900 mb-2">📝 Important Notes:</p>
                  <ul className="space-y-1 text-blue-800 text-xs">
                    <li>• Students are always 100% commissioned (you keep all revenue)</li>
                    <li>• Commission rates can be adjusted anytime</li>
                    <li>• Booth renters need their own Stripe Connect account</li>
                    <li>• Payment type affects how reports and dashboards display earnings</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}