"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Shield,
  GraduationCap,
  ChevronDown,
  Star,
  MapPin,
  Phone,
  Mail
} from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { checkStudioSupervisionAccess } from '@/lib/studio-supervision-gate'
import { FeatureAccessGate } from '@/components/ui/feature-access-gate'
import { FEATURES } from '@/lib/feature-access'
import { NavBar } from '@/components/ui/navbar'

// Mock data for instructors and bookings
const mockInstructors = [
  {
    id: '1',
    name: 'Sarah Johnson',
    specialty: 'Eyebrow Microblading',
    experience: '8 years',
    rating: 4.9,
    location: 'Downtown Studio',
    phone: '(555) 123-4567',
    email: 'sarah@universalbeautystudio.com',
    avatar: '/images/instructor1.jpg'
  },
  {
    id: '2', 
    name: 'Michael Chen',
    specialty: 'Lip Blushing',
    experience: '6 years',
    rating: 4.8,
    location: 'Midtown Location',
    phone: '(555) 987-6543',
    email: 'michael@universalbeautystudio.com',
    avatar: '/images/instructor2.jpg'
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    specialty: 'Eyeliner & Lash Enhancement',
    experience: '10 years',
    rating: 5.0,
    location: 'Westside Studio',
    phone: '(555) 456-7890',
    email: 'emma@universalbeautystudio.com',
    avatar: '/images/instructor3.jpg'
  }
]

const timeSlots = ['9:30 AM', '1:00 PM', '4:00 PM']

export default function StudioSupervisionPage() {
  const { currentUser, isLoading } = useDemoAuth()
  const router = useRouter()
  const [supervisionAccess, setSupervisionAccess] = useState<any>(null)
  const [userRole, setUserRole] = useState<'INSTRUCTOR' | 'APPRENTICE' | 'ADMIN' | 'NONE'>('NONE')
  
  // Booking system state
  const [selectedInstructor, setSelectedInstructor] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [showBookingModal, setShowBookingModal] = useState(false)

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

  // Load existing bookings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedBookings = localStorage.getItem('supervision-bookings')
      if (storedBookings) {
        setBookings(JSON.parse(storedBookings))
      }
    }
  }, [])

  // Get available time slots for selected instructor and date
  const getAvailableSlots = (instructorId: string, date: string) => {
    const existingBookings = bookings.filter(
      booking => booking.instructorId === instructorId && booking.date === date
    )
    const bookedTimes = existingBookings.map(booking => booking.time)
    return timeSlots.filter(time => !bookedTimes.includes(time))
  }

  // Handle instructor selection
  const handleInstructorSelect = (instructorId: string) => {
    setSelectedInstructor(instructorId)
    setSelectedDate('')
    setSelectedTime('')
    setAvailableSlots([])
  }

  // Handle date selection
  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedTime('')
    if (selectedInstructor) {
      const slots = getAvailableSlots(selectedInstructor, date)
      setAvailableSlots(slots)
    }
  }

  // Handle booking submission
  const handleBookingSubmit = () => {
    if (selectedInstructor && selectedDate && selectedTime) {
      const instructor = mockInstructors.find(i => i.id === selectedInstructor)
      const newBooking = {
        id: Date.now().toString(),
        instructorId: selectedInstructor,
        instructorName: instructor?.name,
        date: selectedDate,
        time: selectedTime,
        apprenticeName: currentUser?.name || 'Apprentice',
        apprenticeEmail: currentUser?.email,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      }

      const updatedBookings = [...bookings, newBooking]
      setBookings(updatedBookings)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('supervision-bookings', JSON.stringify(updatedBookings))
      }

      // Reset form
      setSelectedInstructor('')
      setSelectedDate('')
      setSelectedTime('')
      setAvailableSlots([])
      setShowBookingModal(false)

      alert(`Booking confirmed with ${instructor?.name} on ${selectedDate} at ${selectedTime}`)
    }
  }

  // Generate calendar dates (next 30 days)
  const generateCalendarDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push({
        date: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })
      })
    }
    return dates
  }

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
      {/* Navigation Header */}
      <NavBar 
        currentPath="/studio/supervision"
        user={currentUser ? {
          name: currentUser.name,
          email: currentUser.email,
          initials: currentUser.name?.split(' ').map(n => n[0]).join('') || currentUser.email.charAt(0).toUpperCase(),
          avatar: undefined
        } : undefined}
      />

      {/* Page Header */}
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
            <div className="space-y-6">
              {/* Instructor Selection */}
              <Card className="relative overflow-hidden border-lavender/50 shadow-2xl bg-gradient-to-br from-white/95 to-lavender/20 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 to-transparent"></div>
                <CardHeader className="relative z-10">
                  <CardTitle className="text-2xl font-bold text-ink flex items-center gap-2">
                    <Users className="h-6 w-6 text-lavender" />
                    Select Your Instructor
                  </CardTitle>
                  <CardDescription className="text-ink/70 font-medium">
                    Choose from our certified PMU instructors
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mockInstructors.map((instructor) => (
                      <Card 
                        key={instructor.id}
                        className={`cursor-pointer transition-all duration-300 border-2 ${
                          selectedInstructor === instructor.id 
                            ? 'border-lavender bg-lavender/10 shadow-lg' 
                            : 'border-gray-200 hover:border-lavender/50 hover:shadow-md'
                        }`}
                        onClick={() => handleInstructorSelect(instructor.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-lavender to-lavender-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {instructor.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <h3 className="font-bold text-ink">{instructor.name}</h3>
                              <p className="text-sm text-ink/70">{instructor.specialty}</p>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-ink/70">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span>{instructor.rating} ({instructor.experience})</span>
                            </div>
                            <div className="flex items-center gap-2 text-ink/70">
                              <MapPin className="h-4 w-4 text-lavender" />
                              <span>{instructor.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-ink/70">
                              <Phone className="h-4 w-4 text-lavender" />
                              <span>{instructor.phone}</span>
                            </div>
                          </div>
                          {selectedInstructor === instructor.id && (
                            <div className="mt-3 p-2 bg-lavender/20 rounded-lg">
                              <p className="text-sm font-medium text-lavender">Selected ✓</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Date and Time Selection */}
              {selectedInstructor && (
                <>
                  {/* Date Selection */}
                  <Card className="relative overflow-hidden border-lavender/50 shadow-2xl bg-gradient-to-br from-white/95 to-lavender/20 backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 to-transparent"></div>
                    <CardHeader className="relative z-10">
                      <CardTitle className="text-2xl font-bold text-ink flex items-center gap-2">
                        <Calendar className="h-6 w-6 text-lavender" />
                        Select Date
                      </CardTitle>
                      <CardDescription className="text-ink/70 font-medium">
                        Choose from available dates in the next 30 days
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-7 gap-3">
                        {generateCalendarDates().map((dateInfo) => (
                          <Button
                            key={dateInfo.date}
                            variant={selectedDate === dateInfo.date ? "default" : "outline"}
                            className={`h-16 flex-col p-2 ${
                              selectedDate === dateInfo.date 
                                ? 'bg-lavender hover:bg-lavender-600 text-white' 
                                : 'hover:bg-lavender/10'
                            }`}
                            onClick={() => handleDateSelect(dateInfo.date)}
                          >
                            <span className="text-xs font-medium">{dateInfo.display}</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Time Selection */}
                  {selectedDate && (
                    <Card className="relative overflow-hidden border-lavender/50 shadow-2xl bg-gradient-to-br from-white/95 to-lavender/20 backdrop-blur-sm">
                      <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 to-transparent"></div>
                      <CardHeader className="relative z-10">
                        <CardTitle className="text-2xl font-bold text-ink flex items-center gap-2">
                          <Clock className="h-6 w-6 text-lavender" />
                          Select Time
                        </CardTitle>
                        <CardDescription className="text-ink/70 font-medium">
                          Available time slots for {selectedDate}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        {availableSlots.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {availableSlots.map((time) => (
                              <Button
                                key={time}
                                variant={selectedTime === time ? "default" : "outline"}
                                className={`h-16 text-lg font-medium ${
                                  selectedTime === time 
                                    ? 'bg-lavender hover:bg-lavender-600 text-white' 
                                    : 'hover:bg-lavender/10'
                                }`}
                                onClick={() => setSelectedTime(time)}
                              >
                                {time}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                            <p className="text-ink/70 text-lg">No available time slots for this date</p>
                            <p className="text-ink/50 text-sm mt-2">Please select a different date</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Booking Confirmation */}
                  {selectedInstructor && selectedDate && selectedTime && (
                    <Card className="relative overflow-hidden border-lavender/50 shadow-2xl bg-gradient-to-br from-white/95 to-lavender/20 backdrop-blur-sm">
                      <div className="absolute inset-0 bg-gradient-to-br from-lavender/10 to-transparent"></div>
                      <CardHeader className="relative z-10">
                        <CardTitle className="text-2xl font-bold text-ink flex items-center gap-2">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                          Confirm Booking
                        </CardTitle>
                        <CardDescription className="text-ink/70 font-medium">
                          Review your supervision session details
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <div className="bg-white/80 rounded-xl p-6 border border-lavender/30">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-ink">Instructor:</span>
                              <span className="text-ink/80">{mockInstructors.find(i => i.id === selectedInstructor)?.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-ink">Date:</span>
                              <span className="text-ink/80">{selectedDate}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-ink">Time:</span>
                              <span className="text-ink/80">{selectedTime}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-ink">Duration:</span>
                              <span className="text-ink/80">2 hours</span>
                            </div>
                          </div>
                          <div className="mt-6 pt-4 border-t border-lavender/30">
                            <Button 
                              onClick={handleBookingSubmit}
                              className="w-full bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <CheckCircle className="h-5 w-5 mr-2" />
                              Confirm Booking
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
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
