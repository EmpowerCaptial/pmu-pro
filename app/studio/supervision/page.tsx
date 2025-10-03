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
  Shield,
  GraduationCap
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
    <div className="min-h-screen bg-gradient-to-br from-lavender/20 via-beige/30 to-ivory">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-lavender/30 to-lavender/10 border-b border-lavender/40">
        <div className="absolute inset-0 bg-gradient-to-r from-lavender/10 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-lavender to-lavender-600 rounded-full flex items-center justify-center shadow-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-ink">Enterprise Studio Supervision</h1>
                  <p className="text-ink/70 mt-1 font-medium">Professional apprentice training & supervision system</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <Badge variant="outline" className="bg-lavender/20 text-ink border-lavender shadow-sm">
                  <Shield className="h-3 w-3 mr-1" />
                  Studio Enterprise
                </Badge>
                <Badge variant="outline" className="bg-white/80 text-ink/80 border-lavender/50 shadow-sm">
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
              className="bg-white/90 hover:bg-white border-lavender/50 text-ink hover:text-ink shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue={userRole === 'INSTRUCTOR' ? 'availability' : userRole === 'APPRENTICE' ? 'find' : 'overview'} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-white/90 backdrop-blur-sm border border-lavender/50 shadow-xl rounded-xl p-1">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lavender data-[state=active]:to-lavender-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-200 font-medium"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value={userRole === 'INSTRUCTOR' ? 'availability' : 'find'}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lavender data-[state=active]:to-lavender-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-200 font-medium"
            >
              {userRole === 'INSTRUCTOR' ? 'My Availability' : 'Find Supervisors'}
            </TabsTrigger>
            <TabsTrigger 
              value={userRole === 'INSTRUCTOR' ? 'bookings' : 'history'}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lavender data-[state=active]:to-lavender-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-200 font-medium"
            >
              {userRole === 'INSTRUCTOR' ? 'My Bookings' : 'My History'}
            </TabsTrigger>
            <TabsTrigger 
              value="reports"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lavender data-[state=active]:to-lavender-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-200 font-medium"
            >
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="relative overflow-hidden border-lavender/50 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-lavender/20 to-white backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-lavender/30 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-bold text-ink">Training Hours</CardTitle>
                  <div className="w-10 h-10 bg-gradient-to-r from-lavender to-lavender-600 rounded-full flex items-center justify-center shadow-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-ink">24</div>
                  <p className="text-sm text-lavender-600 font-medium">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-green-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-green-50/80 to-white backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-100/50 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-bold text-green-800">Completed Procedures</CardTitle>
                  <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-green-900">18</div>
                  <p className="text-sm text-green-600 font-medium">
                    +8 this month
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-blue-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-50/80 to-white backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100/50 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-bold text-blue-800">Active Bookings</CardTitle>
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-blue-900">5</div>
                  <p className="text-sm text-blue-600 font-medium">
                    +2 this week
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="relative overflow-hidden border-lavender/50 shadow-2xl bg-gradient-to-br from-white/95 to-lavender/20 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 to-transparent"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-xl font-bold text-ink">Quick Actions</CardTitle>
                <CardDescription className="text-ink/70 font-medium">
                  Common actions for your role
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {userRole === 'INSTRUCTOR' && (
                    <>
                      <Button 
                        className="h-auto p-6 flex-col bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-white shadow-xl hover:shadow-2xl transition-all duration-300 border-0 rounded-xl"
                        onClick={() => router.push('/studio/supervision/availability')}
                      >
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                          <Calendar className="h-6 w-6" />
                        </div>
                        <span className="font-bold text-lg">Set Availability</span>
                        <span className="text-white/90 text-sm mt-1">Schedule supervision blocks</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-6 flex-col border-lavender/50 bg-white/90 hover:bg-lavender/10 text-ink hover:text-ink shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl"
                        onClick={() => router.push('/studio/supervision/bookings')}
                      >
                        <div className="w-12 h-12 bg-lavender/20 rounded-full flex items-center justify-center mb-3">
                          <Users className="h-6 w-6 text-lavender" />
                        </div>
                        <span className="font-bold text-lg">Review Bookings</span>
                        <span className="text-ink/70 text-sm mt-1">Manage apprentice sessions</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-6 flex-col border-lavender/50 bg-white/90 hover:bg-lavender/10 text-ink hover:text-ink shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl"
                        onClick={() => router.push('/studio/supervision/procedure-logs')}
                      >
                        <div className="w-12 h-12 bg-lavender/20 rounded-full flex items-center justify-center mb-3">
                          <CheckCircle className="h-6 w-6 text-lavender" />
                        </div>
                        <span className="font-bold text-lg">Log Procedures</span>
                        <span className="text-ink/70 text-sm mt-1">Track completed work</span>
                      </Button>
                    </>
                  )}

                  {userRole === 'APPRENTICE' && (
                    <>
                      <Button 
                        className="h-auto p-6 flex-col bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 border-0 rounded-xl"
                        onClick={() => router.push('/studio/supervision/find')}
                      >
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                          <Calendar className="h-6 w-6" />
                        </div>
                        <span className="font-bold text-lg">Book Session</span>
                        <span className="text-blue-100 text-sm mt-1">Find available supervisors</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-6 flex-col border-blue-200/50 bg-white/90 hover:bg-blue-50/80 text-blue-700 hover:text-blue-800 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl"
                        onClick={() => router.push('/studio/supervision/history')}
                      >
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                          <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                        <span className="font-bold text-lg">View History</span>
                        <span className="text-blue-600 text-sm mt-1">Past training sessions</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-6 flex-col border-blue-200/50 bg-white/90 hover:bg-blue-50/80 text-blue-700 hover:text-blue-800 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl"
                        onClick={() => router.push('/studio/supervision/progress')}
                      >
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                          <BarChart3 className="h-6 w-6 text-blue-600" />
                        </div>
                        <span className="font-bold text-lg">Track Progress</span>
                        <span className="text-blue-600 text-sm mt-1">Monitor development</span>
                      </Button>
                    </>
                  )}

                  {userRole === 'ADMIN' && (
                    <>
                      <Button 
                        className="h-auto p-6 flex-col bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 border-0 rounded-xl"
                        onClick={() => router.push('/studio/supervision/overview')}
                      >
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
                          <BarChart3 className="h-6 w-6" />
                        </div>
                        <span className="font-bold text-lg">Studio Overview</span>
                        <span className="text-emerald-100 text-sm mt-1">Complete system analytics</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-6 flex-col border-emerald-200/50 bg-white/90 hover:bg-emerald-50/80 text-emerald-700 hover:text-emerald-800 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl"
                        onClick={() => router.push('/studio/supervision/reports')}
                      >
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                          <Clock className="h-6 w-6 text-emerald-600" />
                        </div>
                        <span className="font-bold text-lg">Export Reports</span>
                        <span className="text-emerald-600 text-sm mt-1">Generate compliance data</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-6 flex-col border-emerald-200/50 bg-white/90 hover:bg-emerald-50/80 text-emerald-700 hover:text-emerald-800 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl"
                        onClick={() => router.push('/enterprise/staff')}
                      >
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                          <Users className="h-6 w-6 text-emerald-600" />
                        </div>
                        <span className="font-bold text-lg">Manage Team</span>
                        <span className="text-emerald-600 text-sm mt-1">Staff & permissions</span>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feature Coming Soon Placeholders */}
          <TabsContent value="availability">
            <Card className="relative overflow-hidden border-lavender/50 shadow-2xl bg-gradient-to-br from-white/95 to-lavender/20 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 to-transparent"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl font-bold text-ink">Set Availability</CardTitle>
                <CardDescription className="text-ink/70 font-medium">Schedule your supervision blocks</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-lavender to-lavender-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <Calendar className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-ink mb-3">Feature Under Development</h3>
                  <p className="text-ink/70 text-lg max-w-md mx-auto">
                    Supervisor availability calendar coming soon in the next release.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="find">
            <Card className="relative overflow-hidden border-lavender/50 shadow-2xl bg-gradient-to-br from-white/95 to-lavender/20 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 to-transparent"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl font-bold text-ink">Find Supervisors</CardTitle>
                <CardDescription className="text-ink/70 font-medium">Book supervised training sessions</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-lavender to-lavender-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-ink mb-3">Feature Under Development</h3>
                  <p className="text-ink/70 text-lg max-w-md mx-auto">
                    Supervisor search and booking calendar coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card className="relative overflow-hidden border-lavender/50 shadow-2xl bg-gradient-to-br from-white/95 to-lavender/20 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 to-transparent"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl font-bold text-ink">My Bookings</CardTitle>
                <CardDescription className="text-ink/70 font-medium">Manage your supervision bookings</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-lavender to-lavender-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <Clock className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-ink mb-3">Feature Under Development</h3>
                  <p className="text-ink/70 text-lg max-w-md mx-auto">
                    Booking management dashboard coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="relative overflow-hidden border-lavender/50 shadow-2xl bg-gradient-to-br from-white/95 to-lavender/20 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 to-transparent"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl font-bold text-ink">Training History</CardTitle>
                <CardDescription className="text-ink/70 font-medium">View your completed supervised procedures</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-lavender to-lavender-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-ink mb-3">Feature Under Development</h3>
                  <p className="text-ink/70 text-lg max-w-md mx-auto">
                    Procedure logging system coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="relative overflow-hidden border-lavender/50 shadow-2xl bg-gradient-to-br from-white/95 to-lavender/20 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 to-transparent"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl font-bold text-ink">Reports & Analytics</CardTitle>
                <CardDescription className="text-ink/70 font-medium">Export training progress and compliance data</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-r from-lavender to-lavender-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <BarChart3 className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-ink mb-3">Feature Under Development</h3>
                  <p className="text-ink/70 text-lg max-w-md mx-auto">
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
