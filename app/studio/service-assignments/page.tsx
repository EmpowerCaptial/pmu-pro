"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { 
  Settings, 
  Users, 
  Package, 
  CheckCircle,
  XCircle,
  User,
  GraduationCap,
  Award,
  Save,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  X
} from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { NavBar } from '@/components/ui/navbar'

interface Service {
  id: string
  name: string
  defaultPrice: number
  description?: string
  category?: string
  defaultDuration?: number
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'student' | 'licensed' | 'instructor'
  specialties?: string
  certifications?: string
  avatar?: string
}

interface ServiceAssignment {
  serviceId: string
  userId: string
  assigned: boolean
}

export default function ServiceAssignmentsPage() {
  const { currentUser, isLoading } = useDemoAuth()
  const [services, setServices] = useState<Service[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [assignments, setAssignments] = useState<ServiceAssignment[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  // Load data on component mount
  useEffect(() => {
    if (currentUser?.email) {
      loadServiceAssignments()
    }
  }, [currentUser])

  const loadServiceAssignments = async () => {
    try {
      setIsLoadingData(true)
      
      // PRODUCTION FIX: Fetch from database API (not localStorage)
      const response = await fetch('/api/service-assignments', {
        method: 'GET',
        headers: {
          'x-user-email': currentUser?.email || ''
        }
      })

      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
        setTeamMembers(data.teamMembers || [])
        
        // Load assignments from DATABASE (not localStorage)
        const dbAssignments = data.assignments || []
        console.log('📋 Loaded service assignments from DATABASE:', dbAssignments.length)
        
        // Transform to local format
        const formattedAssignments: ServiceAssignment[] = dbAssignments.map((a: any) => ({
          serviceId: a.serviceId,
          userId: a.userId,
          assigned: a.assigned
        }))
        
        setAssignments(formattedAssignments)
      } else {
        console.error('Failed to load service assignments')
      }
    } catch (error) {
      console.error('Error loading service assignments:', error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const toggleAssignment = (serviceId: string, userId: string) => {
    const existingAssignment = assignments.find(
      a => a.serviceId === serviceId && a.userId === userId
    )

    let updatedAssignments: ServiceAssignment[]
    
    if (existingAssignment) {
      // Toggle existing assignment
      updatedAssignments = assignments.map(a =>
        a.serviceId === serviceId && a.userId === userId
          ? { ...a, assigned: !a.assigned }
          : a
      )
    } else {
      // Create new assignment
      updatedAssignments = [...assignments, { serviceId, userId, assigned: true }]
    }

    console.log(`🔄 Toggling assignment - Service: ${serviceId}, User: ${userId}`, updatedAssignments)
    setAssignments(updatedAssignments)
  }

  const saveAssignments = async () => {
    try {
      setIsSaving(true)
      
      console.log('💾 Saving service assignments to DATABASE:', assignments.length)
      
      // PRODUCTION FIX: Save to DATABASE (not localStorage)
      const response = await fetch('/api/service-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({ assignments })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Saved to database:', data)
        
        // Log assignment details
        const assignmentsByUser = assignments.reduce((acc: any, assignment) => {
          if (assignment.assigned) {
            if (!acc[assignment.userId]) {
              acc[assignment.userId] = {
                userId: assignment.userId,
                userName: teamMembers.find(m => m.id === assignment.userId)?.name || 'Unknown',
                serviceCount: 0
              }
            }
            acc[assignment.userId].serviceCount++
          }
          return acc
        }, {})
        
        const assignedCount = assignments.filter(a => a.assigned).length
        const userCount = Object.keys(assignmentsByUser).length
        
        alert(`✅ Service assignments saved to database!\n\n${assignedCount} assignments for ${userCount} team member(s).\n\nChanges are immediately available across all devices.`)
      } else {
        const errorData = await response.json()
        console.error('Failed to save service assignments:', errorData)
        alert(`Failed to save assignments: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error saving service assignments:', error)
      alert('Error saving assignments. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const isAssigned = (serviceId: string, userId: string) => {
    const assignment = assignments.find(
      a => a.serviceId === serviceId && a.userId === userId
    )
    return assignment?.assigned || false
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'instructor':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs"><GraduationCap className="h-3 w-3 mr-1" />Instructor</Badge>
      case 'licensed':
        return <Badge className="bg-green-100 text-green-800 border-green-300 text-xs"><Award className="h-3 w-3 mr-1" />Licensed</Badge>
      case 'student':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-xs"><User className="h-3 w-3 mr-1" />Student</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{role}</Badge>
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAssignedServicesCount = (userId: string) => {
    return assignments.filter(a => a.userId === userId && a.assigned).length
  }

  // Check if user has permission to access service assignments
  const hasServiceAssignmentAccess = currentUser && 
    (currentUser.role === 'owner' || 
     currentUser.role === 'manager' || 
     currentUser.role === 'director') &&
    (currentUser as any)?.selectedPlan === 'studio'

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-lavender-600/5">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lavender mx-auto mb-4"></div>
              <p className="text-gray-600">Loading service assignments...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Access denied for unauthorized users
  if (!hasServiceAssignmentAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-lavender-600/5">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
              <p className="text-gray-600 mb-4">
                Service assignments are only available to studio owners, managers, and directors.
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
      <NavBar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Service Assignments</h1>
              <p className="text-gray-600 mt-2">Select a team member to assign services</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={loadServiceAssignments}
                variant="outline"
                className="border-lavender/30 text-lavender hover:bg-lavender/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={saveAssignments}
                disabled={isSaving}
                className="bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base px-3 md:px-4 py-2 md:py-2"
              >
                {isSaving ? (
                  <>
                    <Save className="h-4 w-4 mr-1 md:mr-2 animate-spin flex-shrink-0" />
                    <span className="truncate">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1 md:mr-2 flex-shrink-0" />
                    <span className="truncate">Save Assignments</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <Card className="mb-8 bg-lavender/10 border-lavender/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Settings className="h-6 w-6 text-lavender flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How Service Assignments Work</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Click on a team member's name to view and assign their services</li>
                  <li>• <strong>Students</strong> can only see assigned services in the supervision booking system</li>
                  <li>• <strong>Licensed Artists</strong> can only see assigned services in the regular booking system</li>
                  <li>• <strong>Instructors</strong> can see all services and supervise any assigned service</li>
                  <li>• Unassigned services will not appear in team members' booking interfaces</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Team Members List */}
          <div className="lg:col-span-1">
            <Card className="border-lavender/20 sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-lavender" />
                  Team Members
                </CardTitle>
                <CardDescription>
                  {teamMembers.length} members • Click to assign services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {teamMembers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No team members found</p>
                      <p className="text-sm mt-1">Add team members from Studio Management</p>
                    </div>
                  ) : (
                    teamMembers.map((member) => (
                      <button
                      key={member.id}
                        onClick={() => setSelectedMember(member)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                          selectedMember?.id === member.id
                            ? 'bg-lavender/10 border-lavender shadow-md'
                            : 'bg-white border-gray-200 hover:border-lavender/50 hover:bg-lavender/5'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage 
                            src={member.avatar || undefined} 
                            alt={`${member.name} profile`}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-gradient-to-r from-lavender to-lavender-600 text-white text-sm font-semibold">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                          <div className="text-left">
                          <p className="font-medium text-gray-900 text-sm">{member.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getRoleBadge(member.role)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getAssignedServicesCount(member.id)} / {services.length}
                          </Badge>
                          <ChevronRight className={`h-4 w-4 transition-transform ${
                            selectedMember?.id === member.id ? 'text-lavender rotate-90' : 'text-gray-400'
                          }`} />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Services for Selected Member */}
          <div className="lg:col-span-2">
            {selectedMember ? (
              <Card className="border-lavender/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage 
                          src={selectedMember.avatar || undefined} 
                          alt={`${selectedMember.name} profile`}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-r from-lavender to-lavender-600 text-white font-semibold">
                          {getInitials(selectedMember.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl">{selectedMember.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          {getRoleBadge(selectedMember.role)}
                          <span className="text-xs">•</span>
                          <span className="text-xs">{selectedMember.email}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedMember(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {services.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="font-medium mb-2">No Services Available</p>
                      <p className="text-sm">Add services from the Services page first</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">Available Services</h3>
                        <p className="text-sm text-gray-600">
                          {getAssignedServicesCount(selectedMember.id)} of {services.length} assigned
                        </p>
                      </div>
                      
                      {services.map((service) => (
                        <div
                          key={service.id}
                          className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                            isAssigned(service.id, selectedMember.id)
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white border-gray-200 hover:border-lavender/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Package className={`h-5 w-5 ${
                              isAssigned(service.id, selectedMember.id) ? 'text-green-600' : 'text-gray-400'
                            }`} />
                            <div>
                              <p className="font-medium text-gray-900">{service.name}</p>
                              <p className="text-sm text-gray-600">
                                ${service.defaultPrice} • {service.defaultDuration ? `${Math.floor(service.defaultDuration / 60)}h ${service.defaultDuration % 60}m` : '2 hours'}
                              </p>
                              {service.description && (
                                <p className="text-xs text-gray-500 mt-1">{service.description}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {isAssigned(service.id, selectedMember.id) ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-300" />
                        )}
                        <Switch
                              checked={isAssigned(service.id, selectedMember.id)}
                              onCheckedChange={() => toggleAssignment(service.id, selectedMember.id)}
                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-lavender/20 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 bg-lavender/10 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-10 w-10 text-lavender" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Select a Team Member
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    Choose a team member from the list on the left to view and manage their service assignments
                  </p>
              </CardContent>
            </Card>
            )}
          </div>
        </div>

        {/* Summary */}
        <Card className="mt-8 bg-gradient-to-r from-lavender/10 to-lavender-600/10 border-lavender/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="h-6 w-6 text-lavender" />
              <h3 className="font-semibold text-gray-900">Assignment Summary</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-4 rounded-lg">
                <p className="font-medium text-gray-900 mb-1">Total Services</p>
                <p className="text-3xl font-bold text-lavender">{services.length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="font-medium text-gray-900 mb-1">Team Members</p>
                <p className="text-3xl font-bold text-lavender">{teamMembers.length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="font-medium text-gray-900 mb-1">Active Assignments</p>
                <p className="text-3xl font-bold text-lavender">
                  {assignments.filter(a => a.assigned).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
