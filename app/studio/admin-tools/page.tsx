"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Settings, 
  RefreshCw, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Users,
  Package
} from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { NavBar } from '@/components/ui/navbar'

export default function AdminToolsPage() {
  const { currentUser, isLoading } = useDemoAuth()
  const [diagnostic, setDiagnostic] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)

  const runDiagnostic = async () => {
    setIsRunning(true)
    try {
      // Check current setup
      const teamMembers = JSON.parse(localStorage.getItem('studio-team-members') || '[]')
      const assignments = JSON.parse(localStorage.getItem('service-assignments') || '[]')
      
      // Fetch services
      const response = await fetch('/api/services', {
        headers: { 'x-user-email': currentUser?.email || '' }
      })
      
      let services = []
      if (response.ok) {
        const data = await response.json()
        services = data.services || []
      }
      
      // Build diagnostic report
      const report = {
        currentUser: {
          name: currentUser?.name,
          email: currentUser?.email,
          id: currentUser?.id,
          role: currentUser?.role,
          studioName: (currentUser as any)?.studioName,
          businessName: (currentUser as any)?.businessName
        },
        services: {
          total: services.length,
          active: services.filter((s: any) => s.isActive).length,
          list: services.map((s: any) => s.name)
        },
        teamMembers: {
          total: teamMembers.length,
          list: teamMembers.map((m: any) => ({
            name: m.name,
            email: m.email,
            id: m.id,
            role: m.role
          }))
        },
        assignments: {
          total: assignments.length,
          active: assignments.filter((a: any) => a.assigned).length,
          byUser: teamMembers.map((m: any) => ({
            name: m.name,
            id: m.id,
            assignedCount: assignments.filter((a: any) => a.userId === m.id && a.assigned).length
          }))
        }
      }
      
      setDiagnostic(report)
    } catch (error) {
      console.error('Error running diagnostic:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const fixJennyAssignments = async () => {
    const confirmed = confirm(
      'This will:\n' +
      '1. Find Jenny in team members\n' +
      '2. Assign ALL your services to her\n' +
      '3. Use correct IDs from production\n\n' +
      'Continue?'
    )
    
    if (!confirmed) return
    
    setIsRunning(true)
    try {
      // Get current user's services
      const response = await fetch('/api/services', {
        headers: { 'x-user-email': currentUser?.email || '' }
      })
      
      if (!response.ok) {
        alert('❌ Failed to fetch services')
        return
      }
      
      const data = await response.json()
      const services = data.services.filter((s: any) => s.isActive)
      
      // Find Jenny in team
      const teamMembers = JSON.parse(localStorage.getItem('studio-team-members') || '[]')
      const jenny = teamMembers.find((m: any) => 
        m.email === 'jenny@universalbeautystudio.com'
      )
      
      if (!jenny) {
        alert('❌ Jenny not found in team members. Add her first!')
        return
      }
      
      // Create assignments
      const assignments = services.map((service: any) => ({
        serviceId: service.id,
        userId: jenny.id,
        assigned: true
      }))
      
      localStorage.setItem('service-assignments', JSON.stringify(assignments))
      
      alert(`✅ Success! Assigned ${assignments.length} services to Jenny:\n\n${services.map((s: any) => s.name).join('\n')}`)
      
      // Refresh diagnostic
      await runDiagnostic()
      
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error fixing assignments')
    } finally {
      setIsRunning(false)
    }
  }

  const fixStudioNames = async () => {
    const studioName = prompt('Enter the correct Studio Name:')
    const businessName = prompt('Enter the correct Business Name:')
    
    if (!studioName || !businessName) {
      alert('Both names are required')
      return
    }
    
    setIsRunning(true)
    try {
      // Update current user's profile
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({
          studioName,
          businessName
        })
      })
      
      if (response.ok) {
        alert(`✅ Updated!\nStudio: ${studioName}\nBusiness: ${businessName}\n\nRefresh the page to see changes.`)
        window.location.reload()
      } else {
        alert('❌ Failed to update profile')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error updating profile')
    } finally {
      setIsRunning(false)
    }
  }

  const syncInstructors = () => {
    const confirmed = confirm(
      'Sync team members to supervision instructors?\n\n' +
      'This will:\n' +
      '- Clear old fake instructors\n' +
      '- Copy real instructors from Team Members\n' +
      '- Make them available for supervision booking'
    )
    
    if (!confirmed) return
    
    // Get real team members who are instructors
    const teamMembers = JSON.parse(localStorage.getItem('studio-team-members') || '[]')
    const instructors = teamMembers.filter((m: any) => 
      m.role === 'instructor' || m.role === 'licensed'
    )
    
    console.log('Found', instructors.length, 'instructors in team members')
    
    // Transform to instructor format
    const studioInstructors = instructors.map((m: any) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      role: m.role,
      specialty: m.specialties || 'PMU Specialist',
      experience: m.experience || '5+ years',
      rating: 4.8,
      location: (currentUser as any)?.businessName || 'Studio',
      phone: m.phone || '',
      avatar: m.avatar || null,
      licenseNumber: m.licenseNumber || `LIC-${m.id.slice(-6)}`,
      availability: {
        monday: ['9:30 AM', '1:00 PM', '4:00 PM'],
        tuesday: ['9:30 AM', '1:00 PM', '4:00 PM'],
        wednesday: ['9:30 AM', '1:00 PM', '4:00 PM'],
        thursday: ['9:30 AM', '1:00 PM', '4:00 PM'],
        friday: ['9:30 AM', '1:00 PM', '4:00 PM'],
        saturday: [],
        sunday: []
      }
    }))
    
    // Save to both instructor storage keys
    localStorage.setItem('studio-instructors', JSON.stringify(studioInstructors))
    localStorage.setItem('supervisionInstructors', JSON.stringify(studioInstructors))
    
    alert(`✅ Synced ${studioInstructors.length} instructors!\n\n${studioInstructors.map((i: any) => i.name).join('\n')}\n\nThese will now show in supervision booking.`)
    
    // Refresh diagnostic
    runDiagnostic()
  }

  useEffect(() => {
    if (currentUser) {
      runDiagnostic()
    }
  }, [currentUser])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-lavender-600/5">
        <NavBar user={currentUser ? {
        name: currentUser.name,
        email: currentUser.email,
        avatar: (currentUser as any).avatar
      } : undefined} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lavender mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
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
        avatar: (currentUser as any).avatar
      } : undefined} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Tools</h1>
          <p className="text-gray-600 mt-2">Quick fixes and diagnostics for your studio</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-lavender/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-lavender" />
                Fix Jenny's Services
              </CardTitle>
              <CardDescription>
                Automatically assign all services to Jenny
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={fixJennyAssignments}
                disabled={isRunning}
                className="w-full bg-lavender hover:bg-lavender-600"
              >
                Assign Services to Jenny
              </Button>
            </CardContent>
          </Card>

          <Card className="border-lavender/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-lavender" />
                Update Studio Names
              </CardTitle>
              <CardDescription>
                Fix studio name and business name
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={fixStudioNames}
                disabled={isRunning}
                variant="outline"
                className="w-full"
              >
                Update Names
              </Button>
            </CardContent>
          </Card>

          <Card className="border-lavender/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Sync Instructors
              </CardTitle>
              <CardDescription>
                Copy instructors from Team Members to Supervision
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={syncInstructors}
                disabled={isRunning}
                variant="outline"
                className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                Sync Instructors
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Diagnostic Report */}
        {diagnostic && (
          <Card className="border-lavender/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-lavender" />
                  System Diagnostic
                </CardTitle>
                <Button 
                  onClick={runDiagnostic}
                  size="sm"
                  variant="outline"
                  disabled={isRunning}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Owner Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Owner Account</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div className="grid grid-cols-2">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{diagnostic.currentUser.name}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{diagnostic.currentUser.email}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-600">Studio Name:</span>
                    <span className="font-medium">{diagnostic.currentUser.studioName || '❌ NOT SET'}</span>
                  </div>
                  <div className="grid grid-cols-2">
                    <span className="text-gray-600">Business Name:</span>
                    <span className="font-medium">{diagnostic.currentUser.businessName || '❌ NOT SET'}</span>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="h-5 w-5 text-lavender" />
                  Services ({diagnostic.services.total})
                </h3>
                {diagnostic.services.total === 0 ? (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      No services found! Add services first before assigning to team members.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <ul className="space-y-1 text-sm">
                      {diagnostic.services.list.map((name: string, i: number) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Team Members */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-lavender" />
                  Team Members ({diagnostic.teamMembers.total})
                </h3>
                <div className="space-y-2">
                  {diagnostic.teamMembers.list.map((member: any, i: number) => (
                    <div key={i} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-gray-600">{member.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-1">{member.role}</Badge>
                          <p className="text-xs text-gray-600">
                            {diagnostic.assignments.byUser.find((u: any) => u.id === member.id)?.assignedCount || 0} services
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assignments Summary */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Service Assignments</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-lavender/10 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-lavender">{diagnostic.assignments.total}</p>
                    <p className="text-xs text-gray-600">Total</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{diagnostic.assignments.active}</p>
                    <p className="text-xs text-gray-600">Active</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-gray-600">
                      {diagnostic.teamMembers.total > 0 
                        ? Math.round((diagnostic.assignments.active / (diagnostic.teamMembers.total * diagnostic.services.total)) * 100) 
                        : 0}%
                    </p>
                    <p className="text-xs text-gray-600">Coverage</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

