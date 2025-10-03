"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Shield
} from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { checkStudioSupervisionAccess } from '@/lib/studio-supervision-gate'
import { FeatureAccessGate } from '@/components/ui/feature-access-gate'
import { FEATURES } from '@/lib/feature-access'

export default function StudioSupervisionPage() {
  const { currentUser, isLoading } = useDemoAuth()
  const router = useRouter()
  const [supervisionAccess, setSupervisionAccess] = useState<any>(null)
  const [userRole, setUserRole] = useState<'INSTRUCTOR' | 'APPRENTICE' | 'ADMIN' | 'NONE'>('NONE')

  useEffect(() => {
    if (currentUser && !isLoading) {
      // Check Enterprise Studio access
      const accessCheck = checkStudioSupervisionAccess({
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role || 'artist',
        selectedPlan: currentUser.subscription || 'starter',
        isLicenseVerified: (currentUser as any).isLicenseVerified || false,
        hasActiveSubscription: (currentUser as any).hasActiveSubscription || false
      })

      setSupervisionAccess(accessCheck)
      setUserRole(accessCheck.userRole)
    }
  }, [currentUser, isLoading])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender"></div>
      </div>
    )
  }

  // Feature gate for Enterprise Studio subscribers
  if (!supervisionAccess?.isEnterpriseStudio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-beige/20 to-ivory flex items-center justify-center p-4">
        <FeatureAccessGate 
          feature={FEATURES.ENTERPRISE_STUDIO.SUPERVISION_SCHEDULING}
          userPlan={(currentUser?.subscription === 'studio' ? 'studio' : 'basic') as any}
          children={null}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-beige/20 to-ivory">
      {/* Header */}
      <div className="bg-white border-b border-lavender/20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Supervision Scheduling</h1>
              <p className="text-gray-600 mt-2">Enterprise Studio supervised booking system</p>
              <div className="flex items-center gap-4 mt-4">
                <Badge variant="outline" className="bg-lavender/10 text-lavender border-lavender">
                  <Shield className="h-3 w-3 mr-1" />
                  Studio Enterprise
                </Badge>
                <Badge variant="outline">
                  <Users className="h-3 w-3 mr-1" />
                  {userRole === 'INSTRUCTOR' && 'Supervisor Access'}
                  {userRole === 'APPRENTICE' && 'Apprentice Access'}
                  {userRole === 'ADMIN' && 'Admin Access'}
                </Badge>
              </div>
            </div>
            <Button 
              onClick={() => router.push('/dashboard')}
              variant="outline"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue={userRole === 'INSTRUCTOR' ? 'availability' : userRole === 'APPRENTICE' ? 'find' : 'overview'} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value={userRole === 'INSTRUCTOR' ? 'availability' : 'find'}>
              {userRole === 'INSTRUCTOR' ? 'My Availability' : 'Find Supervisors'}
            </TabsTrigger>
            <TabsTrigger value={userRole === 'INSTRUCTOR' ? 'bookings' : 'history'}>
              {userRole === 'INSTRUCTOR' ? 'My Bookings' : 'My History'}
            </TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Training Hours</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Procedures</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18</div>
                  <p className="text-xs text-muted-foreground">
                    +8 this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">
                    +2 this week
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common actions for your role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {userRole === 'INSTRUCTOR' && (
                    <>
                      <Button 
                        className="h-auto p-4 flex-col"
                        onClick={() => router.push('/studio/supervision/availability')}
                      >
                        <Calendar className="h-6 w-6 mb-2" />
                        <span>Set Availability</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex-col"
                        onClick={() => router.push('/studio/supervision/bookings')}
                      >
                        <Users className="h-6 w-6 mb-2" />
                        <span>Review Bookings</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex-col"
                        onClick={() => router.push('/studio/supervision/procedure-logs')}
                      >
                        <CheckCircle className="h-6 w-6 mb-2" />
                        <span>Log Procedures</span>
                      </Button>
                    </>
                  )}

                  {userRole === 'APPRENTICE' && (
                    <>
                      <Button 
                        className="h-auto p-4 flex-col"
                        onClick={() => router.push('/studio/supervision/find')}
                      >
                        <Calendar className="h-6 w-6 mb-2" />
                        <span>Book Session</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex-col"
                        onClick={() => router.push('/studio/supervision/history')}
                      >
                        <Clock className="h-6 w-6 mb-2" />
                        <span>View History</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex-col"
                        onClick={() => router.push('/studio/supervision/progress')}
                      >
                        <BarChart3 className="h-6 w-6 mb-2" />
                        <span>Track Progress</span>
                      </Button>
                    </>
                  )}

                  {userRole === 'ADMIN' && (
                    <>
                      <Button 
                        className="h-auto p-4 flex-col"
                        onClick={() => router.push('/studio/supervision/overview')}
                      >
                        <BarChart3 className="h-6 w-6 mb-2" />
                        <span>Studio Overview</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex-col"
                        onClick={() => router.push('/studio/supervision/reports')}
                      >
                        <Clock className="h-6 w-6 mb-2" />
                        <span>Export Reports</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex-col"
                        onClick={() => router.push('/enterprise/staff')}
                      >
                        <Users className="h-6 w-6 mb-2" />
                        <span>Manage Team</span>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feature Coming Soon Placeholders */}
          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle>Set Availability</CardTitle>
                <CardDescription>Schedule your supervision blocks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Feature Under Development</h3>
                  <p className="text-gray-600">
                    Supervisor availability calendar coming soon in the next release.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="find">
            <Card>
              <CardHeader>
                <CardTitle>Find Supervisors</CardTitle>
                <CardDescription>Book supervised training sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Feature Under Development</h3>
                  <p className="text-gray-600">
                    Supervisor search and booking calendar coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>Manage your supervision bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Feature Under Development</h3>
                  <p className="text-gray-600">
                    Booking management dashboard coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Training History</CardTitle>
                <CardDescription>View your completed supervised procedures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Feature Under Development</h3>
                  <p className="text-gray-600">
                    Procedure logging system coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>Export training progress and compliance data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Feature Under Development</h3>
                  <p className="text-gray-600">
                    Advanced reporting and CSV export coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
