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
  RefreshCw
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

  // Load data on component mount
  useEffect(() => {
    if (currentUser?.email) {
      loadServiceAssignments()
    }
  }, [currentUser])

  const loadServiceAssignments = async () => {
    try {
      setIsLoadingData(true)
      
      const response = await fetch('/api/studio/service-assignments', {
        headers: {
          'x-user-email': currentUser?.email || ''
        }
      })

      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
        setTeamMembers(data.teamMembers || [])
        
        // Load assignments from localStorage
        const savedAssignments = localStorage.getItem('service-assignments')
        if (savedAssignments) {
          setAssignments(JSON.parse(savedAssignments))
        } else {
          // Initialize with no assignments
          const initialAssignments: ServiceAssignment[] = []
          setAssignments(initialAssignments)
        }
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

    setAssignments(updatedAssignments)
  }

  const saveAssignments = async () => {
    try {
      setIsSaving(true)
      
      // Save to localStorage
      localStorage.setItem('service-assignments', JSON.stringify(assignments))
      
      // In a real system, you'd save to the database here
      const response = await fetch('/api/studio/service-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({ assignments })
      })

      if (response.ok) {
        alert('✅ Service assignments saved successfully!')
      } else {
        console.error('Failed to save service assignments')
        alert('Failed to save assignments. Please try again.')
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

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-lavender-600/5">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 py-8">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-lavender-600/5">
      <NavBar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Service Assignments</h1>
              <p className="text-gray-600 mt-2">Control which services each team member can offer</p>
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
                  <li>• <strong>Students</strong> can only see assigned services in the supervision booking system</li>
                  <li>• <strong>Licensed Artists</strong> can only see assigned services in the regular booking system</li>
                  <li>• <strong>Instructors</strong> can see all services and supervise any assigned service</li>
                  <li>• Unassigned services will not appear in team members' booking interfaces</li>
                  <li>• This ensures quality control and proper supervision</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services and Team Members Grid */}
        <div className="space-y-6">
          {services.map((service) => (
            <Card key={service.id} className="border-lavender/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-lavender" />
                  <div>
                    <span className="text-lg">{service.name}</span>
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      ${service.defaultPrice} • {service.defaultDuration ? `${Math.floor(service.defaultDuration / 60)}h ${service.defaultDuration % 60}m` : '2 hours'}
                    </span>
                  </div>
                </CardTitle>
                {service.description && (
                  <CardDescription>{service.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-lavender/30 transition-colors"
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
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{member.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getRoleBadge(member.role)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isAssigned(service.id, member.id) ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-300" />
                        )}
                        <Switch
                          checked={isAssigned(service.id, member.id)}
                          onCheckedChange={() => toggleAssignment(service.id, member.id)}
                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <Card className="mt-8 bg-gradient-to-r from-lavender/10 to-lavender-600/10 border-lavender/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-6 w-6 text-lavender" />
              <h3 className="font-semibold text-gray-900">Assignment Summary</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg">
                <p className="font-medium text-gray-900">Total Services</p>
                <p className="text-2xl font-bold text-lavender">{services.length}</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="font-medium text-gray-900">Team Members</p>
                <p className="text-2xl font-bold text-lavender">{teamMembers.length}</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="font-medium text-gray-900">Active Assignments</p>
                <p className="text-2xl font-bold text-lavender">
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
