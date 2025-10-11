import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Camera,
  FileText,
  Users,
  User,
  Palette,
  TrendingUp,
  Clock,
  Share,
  Mail,
  Microscope,
  Brush,
  ClipboardList,
  HelpCircle,
  Zap,
  Activity,
  MessageSquare,
  Building2,
  Settings,
  BarChart3,
  Send,
  CreditCard,
  GraduationCap,
  Shield,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { MetaMessengerBox } from "@/components/messenger/meta-messenger-box"
import { ConsentFormModal } from "@/components/consent/consent-form-modal"
import { ConsentNotifications } from "@/components/consent/consent-notifications"
import { consentReminderService } from "@/lib/services/consent-reminder-service"
import { WeeklyBalanceCard, DailyBalanceCard } from "@/components/dashboard/financial-dashboard"
import { CommissionSummaryCard } from "@/components/dashboard/commission-summary-card"
import { StaffEarningsCard } from "@/components/dashboard/staff-earnings-card"
import { checkStudioSupervisionAccess, shouldUseRegularBooking, shouldUseSupervisionBooking } from "@/lib/studio-supervision-gate"
import { useDemoAuth } from "@/hooks/use-demo-auth"
import { hasEnterpriseStudioAccess, isStudioOwner } from "@/lib/stripe-management"

export function DashboardCards() {
  const [showConsentFormModal, setShowConsentFormModal] = useState(false)
  const { currentUser } = useDemoAuth()
  const [supervisionAccess, setSupervisionAccess] = useState<any>(null)
  const [bookingSystemAccess, setBookingSystemAccess] = useState<{
    canUseRegularBooking: boolean
    canUseSupervisionBooking: boolean
    userRole: string
  }>({
    canUseRegularBooking: false,
    canUseSupervisionBooking: false,
    userRole: ''
  })
  
  // Initialize consent reminder service
  useEffect(() => {
    consentReminderService.startReminderService()
    
    return () => {
      consentReminderService.stopReminderService()
    }
  }, [])

  // Check studio supervision access and booking system access
  useEffect(() => {
    if (currentUser) {
      console.log('🔍 Dashboard Cards - Current User:', currentUser)
      
      const userData = {
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role || 'artist',
        selectedPlan: (currentUser as any).selectedPlan || currentUser.subscription || 'starter',
        isLicenseVerified: (currentUser as any).isLicenseVerified || false,
        hasActiveSubscription: (currentUser as any).hasActiveSubscription || false
      }
      
      const accessCheck = checkStudioSupervisionAccess(userData)
      console.log('🔍 Dashboard Cards - Supervision Access Check:', accessCheck)
      setSupervisionAccess(accessCheck)
      
      // Check which booking system the user should use
      const canUseRegularBooking = shouldUseRegularBooking(userData)
      const canUseSupervisionBooking = shouldUseSupervisionBooking(userData)
      
      console.log('🔍 Dashboard Cards - Booking System Access:', {
        canUseRegularBooking,
        canUseSupervisionBooking,
        userRole: currentUser.role
      })
      
      setBookingSystemAccess({
        canUseRegularBooking,
        canUseSupervisionBooking,
        userRole: currentUser.role || 'artist'
      })
    }
  }, [currentUser])
  
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Mobile Quick Actions - All 4 tools visible */}
      <div className="lg:hidden grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
        {/* Skin Analysis */}
        <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow border-lavender/50">
          {/* Background Image with higher opacity */}
          <div 
            className="absolute inset-0 opacity-80 pointer-events-none bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/images/8.jpg)' }}
          ></div>
          {/* Subtle overlay for text readability */}
          <div className="absolute inset-0 bg-white/30 pointer-events-none"></div>
          <CardHeader className="pb-2 relative z-10 p-3 sm:p-4">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Camera className="h-3 w-3 sm:h-4 sm:w-4 text-lavender" />
              <CardTitle className="text-xs sm:text-sm font-bold truncate text-gray-800 drop-shadow-sm">Skin Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 p-3 sm:p-4">
            <Link href="/analyze">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/95 rounded-xl border border-lavender/50 group-hover:bg-lavender/10 transition-colors shadow-sm"></div>
                <div className="relative z-10 py-2 px-2 sm:px-3 text-center">
                  <span className="text-gray-800 font-semibold text-xs sm:text-sm drop-shadow-sm">
                    Start Analysis
                  </span>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Client Management */}
        <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow border-lavender/50">
          {/* Background Image with higher opacity */}
          <div 
            className="absolute inset-0 opacity-80 pointer-events-none bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/images/5.jpg)' }}
          ></div>
          {/* Subtle overlay for text readability */}
          <div className="absolute inset-0 bg-white/30 pointer-events-none"></div>
          <CardHeader className="pb-2 relative z-10 p-3 sm:p-4">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-lavender" />
              <CardTitle className="text-xs sm:text-sm font-bold truncate text-gray-800 drop-shadow-sm">Client Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 p-3 sm:p-4">
            <Link href="/clients">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/95 rounded-xl border border-lavender/50 group-hover:bg-lavender/10 transition-colors shadow-sm"></div>
                <div className="relative z-10 py-2 px-2 sm:px-3 text-center">
                  <span className="text-gray-800 font-semibold text-xs sm:text-sm drop-shadow-sm">
                    View Clients
                  </span>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Color Correction */}
        <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow border-lavender/50">
          {/* Background Image with higher opacity */}
          <div 
            className="absolute inset-0 opacity-80 pointer-events-none bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/images/7.jpg)' }}
          ></div>
          {/* Subtle overlay for text readability */}
          <div className="absolute inset-0 bg-white/30 pointer-events-none"></div>
          <CardHeader className="pb-2 relative z-10 p-3 sm:p-4">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Brush className="h-3 w-3 sm:h-4 sm:w-4 text-lavender" />
              <CardTitle className="text-xs sm:text-sm font-bold truncate text-gray-800 drop-shadow-sm">Color Correction</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 p-3 sm:p-4">
            <Link href="/color-correction">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/95 rounded-xl border border-lavender/50 group-hover:bg-lavender/10 transition-colors shadow-sm"></div>
                <div className="relative z-10 py-2 px-2 sm:px-3 text-center">
                  <span className="text-gray-800 font-semibold text-xs sm:text-sm drop-shadow-sm">
                    Start Correction
                  </span>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* ProCell Analysis */}
        <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow border-lavender/50">
          {/* Background Image with higher opacity */}
          <div 
            className="absolute inset-0 opacity-80 pointer-events-none bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/images/6.jpg)' }}
          ></div>
          {/* Subtle overlay for text readability */}
          <div className="absolute inset-0 bg-white/30 pointer-events-none"></div>
          <CardHeader className="pb-2 relative z-10 p-3 sm:p-4">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Microscope className="h-3 w-3 sm:h-4 sm:w-4 text-lavender" />
              <CardTitle className="text-xs sm:text-sm font-bold truncate text-gray-800 drop-shadow-sm">ProCell Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 p-3 sm:p-4">
            <Link href="/procell-analysis">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/95 rounded-xl border border-lavender/50 group-hover:bg-lavender/10 transition-colors shadow-sm"></div>
                <div className="relative z-10 py-2 px-2 sm:px-3 text-center">
                  <span className="text-gray-800 font-semibold text-xs sm:text-sm drop-shadow-sm">
                    Start Analysis
                  </span>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Regular Booking - Mobile (for licensed artists) */}
      {bookingSystemAccess.canUseRegularBooking && (
        <div className="lg:hidden mb-4 sm:mb-6">
          <Card className="relative overflow-hidden border-border shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-500/10 to-green-600/20 backdrop-blur-sm border-green-400/40">
            <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <CardTitle className="text-base sm:text-lg font-bold text-green-800">Client Booking</CardTitle>
              </div>
              <CardDescription className="text-sm sm:text-base text-green-700">
                Schedule and manage your client appointments
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  <Calendar className="h-3 w-3 mr-1" />
                  Licensed Artist
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  Independent Work
                </Badge>
              </div>
              <Link href="/booking" className="w-full">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 py-2 sm:py-3 px-2 sm:px-3 text-center">
                    <span className="text-white font-bold text-xs sm:text-sm text-shadow-lg shadow-black/50">
                      📅 Access Booking System
                    </span>
                    <p className="text-green-100 text-xs mt-1">
                      Schedule client appointments
                    </p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Studio Supervision - Mobile (for students/apprentices) */}
      {bookingSystemAccess.canUseSupervisionBooking && (
        <div className="lg:hidden mb-4 sm:mb-6">
          <Card className="relative overflow-hidden border-border shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-500/10 to-purple-600/20 backdrop-blur-sm border-purple-400/40">
            <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <CardTitle className="text-base sm:text-lg font-bold text-purple-800">Supervision Booking</CardTitle>
              </div>
              <CardDescription className="text-sm sm:text-base text-purple-700">
                Book supervised training sessions with instructors
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  Student/Apprentice
                </Badge>
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                  Supervised Work
                </Badge>
              </div>
              <Link href="/studio/supervision?tab=find" className="w-full">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 py-2 sm:py-3 px-2 sm:px-3 text-center">
                    <span className="text-white font-bold text-xs sm:text-sm text-shadow-lg shadow-black/50">
                      🎓 Book Supervision
                    </span>
                    <p className="text-purple-100 text-xs mt-1">
                      Find instructors & schedule sessions
                    </p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}


      {/* Studio Supervision - Mobile (for instructors only) */}
      {console.log('🔍 Mobile Card Check:', { supervisionAccess, canAccess: supervisionAccess?.canAccess, userRole: supervisionAccess?.userRole })}
      {((supervisionAccess?.canAccess && supervisionAccess?.userRole === 'INSTRUCTOR') || 
        (currentUser?.email?.toLowerCase() === 'tyronejackboy@gmail.com')) && (
        <div className="lg:hidden mb-4 sm:mb-6">
          <Card className="relative overflow-hidden border-border shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-500/10 to-purple-600/20 backdrop-blur-sm border-purple-400/40">
            <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <CardTitle className="text-base sm:text-lg font-bold text-purple-800">Enterprise Studio Supervision</CardTitle>
              </div>
              <CardDescription className="text-sm sm:text-base text-purple-700">
                Manage apprentice training sessions and supervision schedules
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                  <Shield className="h-3 w-3 mr-1" />
                  Instructor Access
                </Badge>
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                  Studio Enterprise
                </Badge>
              </div>
              <Link href="/studio/supervision?tab=availability" className="w-full">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 py-2 sm:py-3 px-2 sm:px-3 text-center">
                    <span className="text-white font-bold text-xs sm:text-sm text-shadow-lg shadow-black/50">
                      🎓 Access Supervision System
                    </span>
                    <p className="text-purple-100 text-xs mt-1">
                      Set availability & manage apprentices
                    </p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Studio Management - Mobile (for studio owners only) */}
      {(currentUser?.role === 'owner' || currentUser?.role === 'manager' || currentUser?.role === 'director' || 
        (currentUser?.email?.toLowerCase() === 'tyronejackboy@gmail.com')) && (
        <div className="lg:hidden mb-4 sm:mb-6">
          <Card className="relative overflow-hidden border-border shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500/10 to-blue-600/20 backdrop-blur-sm border-blue-400/40">
            <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <CardTitle className="text-base sm:text-lg font-bold text-blue-800">Studio Management</CardTitle>
              </div>
              <CardDescription className="text-sm sm:text-base text-blue-700">
                Manage instructors and studio access permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  <Users className="h-3 w-3 mr-1" />
                  Instructor Management
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  Studio Owner
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/studio/team" className="w-full">
                  <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 py-2 sm:py-3 px-2 sm:px-3 text-center">
                      <span className="text-white font-bold text-xs sm:text-sm text-shadow-lg shadow-black/50">
                        👥 Team
                      </span>
                      <p className="text-blue-100 text-xs mt-1">
                        Manage staff
                      </p>
                    </div>
                  </div>
                </Link>
                
                <Link href="/studio/commissions" className="w-full">
                  <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 py-2 sm:py-3 px-2 sm:px-3 text-center">
                      <span className="text-white font-bold text-xs sm:text-sm text-shadow-lg shadow-black/50">
                        💰 Pay
                      </span>
                      <p className="text-green-100 text-xs mt-1">
                        Commissions
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Unified Client Onboarding - Mobile */}
      <div className="lg:hidden mb-4 sm:mb-6">
        <Card className="relative overflow-hidden border-border shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-lavender/10 to-lavender/20 backdrop-blur-sm border-lavender/40">
          <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-lavender rounded-full flex items-center justify-center">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <CardTitle className="text-base sm:text-lg font-bold text-lavender-800">Unified Client Onboarding</CardTitle>
            </div>
            <CardDescription className="text-sm sm:text-base text-lavender-700">
              Complete client screening, PMU intake, and consent forms in one comprehensive application
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Link href="/ai-contraindication" className="w-full">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-lavender to-lavender-600 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 py-2 sm:py-3 px-2 sm:px-3 text-center">
                    <span className="text-white font-bold text-xs sm:text-sm text-shadow-lg shadow-black/50">
                      🩺 AI Contraindication
                    </span>
                    <p className="text-lavender-100 text-xs mt-1">
                      Safety Check
                    </p>
                  </div>
                </div>
              </Link>
              
              <Link href="/unified-onboarding" className="w-full">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-lavender to-lavender-600 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 py-2 sm:py-3 px-2 sm:px-3 text-center">
                    <span className="text-white font-bold text-xs sm:text-sm text-shadow-lg shadow-black/50">
                      🎯 Start Onboarding
                    </span>
                    <p className="text-lavender-100 text-xs mt-1">
                      Complete Process
                    </p>
                  </div>
                </div>
              </Link>
            </div>
            
            <div className="mt-3 sm:mt-4">
              <Button 
                onClick={() => setShowConsentFormModal(true)}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-sm sm:text-base py-2 sm:py-3"
              >
                📋 Send Consent Form
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

        {/* Financial Dashboard - Mobile */}
        <div className="lg:hidden grid grid-cols-1 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <WeeklyBalanceCard />
          <DailyBalanceCard />
          {currentUser?.role === 'owner' && <CommissionSummaryCard />}
          {currentUser?.role !== 'owner' && <StaffEarningsCard />}
          
          {/* Stripe Connect Card */}
          <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow border-lavender/50">
            <CardHeader className="pb-2 relative z-10 p-3 sm:p-4">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-lavender" />
                <CardTitle className="text-xs sm:text-sm font-bold truncate text-gray-800 drop-shadow-sm">Payment Setup</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 p-3 sm:p-4">
              <Link href="/stripe-connect">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white/95 rounded-xl border border-lavender/50 group-hover:bg-lavender/10 transition-colors shadow-sm"></div>
                  <div className="relative z-10 py-2 px-2 sm:px-3 text-center">
                    <span className="text-gray-800 font-semibold text-xs sm:text-sm drop-shadow-sm">
                      Connect Stripe
                    </span>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-6 gap-4 xl:gap-6">
        <Card className="relative overflow-hidden border-border shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-lavender/10 to-lavender/20 backdrop-blur-sm border-lavender/40 col-span-2">
          <CardHeader className="pb-4 p-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 bg-lavender rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg xl:text-xl font-bold text-lavender-800">Unified Client Onboarding</CardTitle>
            </div>
            <CardDescription className="text-sm xl:text-base text-lavender-700">
              Complete client screening, PMU intake, and consent forms in one comprehensive application
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-3 mb-3">
              <Link href="/ai-contraindication" className="flex-1">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-lavender to-lavender-600 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 py-3 xl:py-4 px-4 xl:px-6 text-center">
                    <span className="text-white font-bold text-sm xl:text-lg text-shadow-lg shadow-black/50">
                      🩺 AI Contraindication
                    </span>
                    <p className="text-lavender-100 text-xs xl:text-sm mt-1">
                      Safety Check
                    </p>
                  </div>
                </div>
              </Link>
              
              <Link href="/unified-onboarding" className="flex-1">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-lavender to-lavender-600 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 py-3 xl:py-4 px-4 xl:px-6 text-center">
                    <span className="text-white font-bold text-sm xl:text-lg text-shadow-lg shadow-black/50">
                      🎯 Start Onboarding
                    </span>
                    <p className="text-lavender-100 text-xs xl:text-sm mt-1">
                      Complete Process
                    </p>
                  </div>
                </div>
              </Link>
            </div>
            
            <Button 
              onClick={() => setShowConsentFormModal(true)}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-sm xl:text-base py-2 xl:py-3"
            >
              📋 Send Consent Form
            </Button>
          </CardContent>
        </Card>

        {/* Regular Booking - Desktop (for licensed artists) */}
        {bookingSystemAccess.canUseRegularBooking && (
          <Card className="relative overflow-hidden border-border shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-500/10 to-green-600/20 backdrop-blur-sm border-green-400/40 col-span-2">
            <CardHeader className="pb-4 p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg xl:text-xl font-bold text-green-800">Client Booking System</CardTitle>
              </div>
              <CardDescription className="text-sm xl:text-base text-green-700">
                Schedule and manage your client appointments independently
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  <Calendar className="h-3 w-3 mr-1" />
                  Licensed Artist
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  Independent Work
                </Badge>
              </div>
              <Link href="/booking" className="w-full">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 py-3 xl:py-4 px-4 xl:px-6 text-center">
                    <span className="text-white font-bold text-sm xl:text-lg text-shadow-lg shadow-black/50">
                      📅 Access Booking Calendar
                    </span>
                    <p className="text-green-100 text-xs xl:text-sm mt-1">
                      Schedule client appointments & manage calendar
                    </p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Supervision Booking - Desktop (for students/apprentices) */}
        {bookingSystemAccess.canUseSupervisionBooking && (
          <Card className="relative overflow-hidden border-border shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-500/10 to-purple-600/20 backdrop-blur-sm border-purple-400/40 col-span-2">
            <CardHeader className="pb-4 p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg xl:text-xl font-bold text-purple-800">Supervision Booking System</CardTitle>
              </div>
              <CardDescription className="text-sm xl:text-base text-purple-700">
                Book supervised training sessions with certified instructors
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  Student/Apprentice
                </Badge>
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                  Supervised Work
                </Badge>
              </div>
              <Link href="/studio/supervision?tab=find" className="w-full">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 py-3 xl:py-4 px-4 xl:px-6 text-center">
                    <span className="text-white font-bold text-sm xl:text-lg text-shadow-lg shadow-black/50">
                      🎓 Book Supervision Sessions
                    </span>
                    <p className="text-purple-100 text-xs xl:text-sm mt-1">
                      Find instructors & schedule supervised training
                    </p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        )}


        {/* Studio Supervision - Desktop (for instructors only) */}
        {console.log('🔍 Desktop Card Check:', { supervisionAccess, canAccess: supervisionAccess?.canAccess, userRole: supervisionAccess?.userRole })}
        {((supervisionAccess?.canAccess && supervisionAccess?.userRole === 'INSTRUCTOR') || 
          (currentUser?.email?.toLowerCase() === 'tyronejackboy@gmail.com')) && (
          <Card className="relative overflow-hidden border-border shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-500/10 to-purple-600/20 backdrop-blur-sm border-purple-400/40 col-span-2">
            <CardHeader className="pb-4 p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg xl:text-xl font-bold text-purple-800">Enterprise Studio Supervision</CardTitle>
              </div>
              <CardDescription className="text-sm xl:text-base text-purple-700">
                Manage apprentice training sessions and supervision schedules for your studio
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                  <Shield className="h-3 w-3 mr-1" />
                  Instructor Access
                </Badge>
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                  Studio Enterprise
                </Badge>
              </div>
              <Link href="/studio/supervision?tab=availability" className="w-full">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 py-3 xl:py-4 px-4 xl:px-6 text-center">
                    <span className="text-white font-bold text-sm xl:text-lg text-shadow-lg shadow-black/50">
                      🎓 Access Supervision System
                    </span>
                    <p className="text-purple-100 text-xs xl:text-sm mt-1">
                      Set availability & manage apprentices
                    </p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Studio Management & Settings - Desktop (for studio owners only) */}
        {((supervisionAccess?.canAccess && supervisionAccess?.userRole === 'INSTRUCTOR') || 
          (currentUser?.email?.toLowerCase() === 'tyronejackboy@gmail.com')) && (
          <Card className="relative overflow-hidden border-border shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500/10 to-blue-600/20 backdrop-blur-sm border-blue-400/40 col-span-2">
            <CardHeader className="pb-4 p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg xl:text-xl font-bold text-blue-800">Studio Management & Settings</CardTitle>
              </div>
              <CardDescription className="text-sm xl:text-base text-blue-700">
                Manage your studio, team members, Stripe payments, artist permissions, and enterprise features
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  <Users className="h-3 w-3 mr-1" />
                  Studio Owner
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  <CreditCard className="h-3 w-3 mr-1" />
                  Payment Management
                </Badge>
              </div>
              
              {/* Management Options Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Link href="/studio/team" className="w-full">
                  <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg opacity-90 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 py-2 px-3 text-center">
                      <span className="text-white font-semibold text-xs">
                        👥 Team
                      </span>
                    </div>
                  </div>
                </Link>
                
                <Link href="/studio/service-assignments" className="w-full">
                  <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-lg opacity-90 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 py-2 px-3 text-center">
                      <span className="text-white font-semibold text-xs">
                        🎯 Services
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
              
              {/* Settings Options Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Link href="/studio/settings" className="w-full">
                  <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg opacity-90 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 py-2 px-3 text-center">
                      <span className="text-white font-semibold text-xs">
                        💳 Payments
                      </span>
                    </div>
                  </div>
                </Link>
                
                <Link href="/studio/settings" className="w-full">
                  <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg opacity-90 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 py-2 px-3 text-center">
                      <span className="text-white font-semibold text-xs">
                        ⚙️ Permissions
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
              
              {/* Main Action Button */}
              <Link href="/studio/management" className="w-full">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 py-3 xl:py-4 px-4 xl:px-6 text-center">
                    <span className="text-white font-bold text-sm xl:text-lg text-shadow-lg shadow-black/50">
                      🏢 Studio Management
                    </span>
                    <p className="text-blue-100 text-xs xl:text-sm mt-1">
                      Full studio administration
                    </p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        )}

        <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border-lavender/30">
          {/* Background Image with higher opacity */}
          <div 
            className="absolute inset-0 opacity-80 pointer-events-none bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/images/8.jpg)' }}
          ></div>
          {/* Subtle overlay for text readability */}
          <div className="absolute inset-0 bg-white/30 pointer-events-none"></div>
          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-lavender" />
              <CardTitle className="text-lg font-bold text-gray-800 drop-shadow-sm">Skin Analysis</CardTitle>
            </div>
            <CardDescription className="text-gray-700 drop-shadow-sm">Analyze skin tone and get pigment recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/analyze">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-lavender/20 rounded-xl border border-lavender/30 group-hover:bg-lavender/10 transition-colors"></div>
                <div className="relative z-10 py-3 px-4 text-center">
                  <span className="text-gray-800 font-semibold text-xs sm:text-sm drop-shadow-sm">
                    Start Skin Analysis
                  </span>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border-lavender/30">
          {/* Background Image with higher opacity */}
          <div 
            className="absolute inset-0 opacity-80 pointer-events-none bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/images/7.jpg)' }}
          ></div>
          {/* Subtle overlay for text readability */}
          <div className="absolute inset-0 bg-white/30 pointer-events-none"></div>
          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-lavender" />
              <CardTitle className="text-lg font-bold text-gray-800 drop-shadow-sm">Client Management</CardTitle>
            </div>
            <CardDescription className="text-gray-700 drop-shadow-sm">Manage your client database and documents</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/clients">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-lavender/20 rounded-xl border border-lavender/30 group-hover:bg-lavender/10 transition-colors"></div>
                <div className="relative z-10 py-3 px-4 text-center">
                  <span className="text-gray-800 font-semibold text-xs sm:text-sm drop-shadow-sm">
                    View Clients
                  </span>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border-lavender/30">
          {/* Background Image with higher opacity */}
          <div 
            className="absolute inset-0 opacity-80 pointer-events-none bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/images/5.jpg)' }}
          ></div>
          {/* Subtle overlay for text readability */}
          <div className="absolute inset-0 bg-white/30 pointer-events-none"></div>
          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-lavender" />
              <CardTitle className="text-lg font-bold text-gray-800 drop-shadow-sm">Color Correction</CardTitle>
            </div>
            <CardDescription className="text-gray-700 drop-shadow-sm">Fix and adjust PMU color issues</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/color-correction">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-lavender/20 rounded-xl border border-lavender/30 group-hover:bg-lavender/10 transition-colors"></div>
                <div className="relative z-10 py-3 px-4 text-center">
                  <span className="text-gray-800 font-semibold text-xs sm:text-sm drop-shadow-sm">
                    Start Correction
                  </span>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Financial Dashboard Cards */}
        <WeeklyBalanceCard />
        <DailyBalanceCard />
        {currentUser?.role === 'owner' && <CommissionSummaryCard />}
        {currentUser?.role !== 'owner' && <StaffEarningsCard />}

        <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border-lavender/30">
          {/* Background Image with higher opacity */}
          <div 
            className="absolute inset-0 opacity-80 pointer-events-none bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/images/6.jpg)' }}
          ></div>
          {/* Subtle overlay for text readability */}
          <div className="absolute inset-0 bg-white/30 pointer-events-none"></div>
          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-center space-x-2">
              <Microscope className="h-5 w-5 text-lavender" />
              <CardTitle className="text-lg font-bold text-gray-800 drop-shadow-sm">ProCell Analysis</CardTitle>
            </div>
            <CardDescription className="text-gray-700 drop-shadow-sm">Advanced skin analysis for optimal results</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/procell-analysis">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-lavender/20 rounded-xl border border-lavender/30 group-hover:bg-lavender/10 transition-colors"></div>
                <div className="relative z-10 py-3 px-4 text-center">
                  <span className="text-gray-800 font-semibold text-xs sm:text-sm drop-shadow-sm">
                    Start Analysis
                  </span>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>


      </div>

      {/* Hide messenger on mobile since it's shown separately in mobile layout */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6">
        <MetaMessengerBox />
      </div>

      {/* Help and Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6">
        <Card className="border-border bg-gradient-to-r from-lavender/10 to-teal-500/10 backdrop-blur-sm border-lavender/30">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center space-x-2 font-bold text-lavender-700 text-base sm:text-lg">
              <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6" />
              <span>Need Help? Master PMU Pro!</span>
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-lavender-600">
              Learn how to use all features, get tips, and submit support tickets
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-lavender-700">
                  🎯 Comprehensive feature guides • 🔍 Searchable help content • 🎫 Support ticket system
                </p>
                <p className="text-xs text-lavender-600">
                  Everything you need to become a PMU Pro expert!
                </p>
              </div>
              <Link href="/help" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-lavender hover:bg-lavender/90 text-white gap-2 text-sm sm:text-base">
                  <HelpCircle className="h-4 w-4" />
                  Get Help
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <Card className="border-border bg-white/90 backdrop-blur-sm border-lavender/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium font-bold">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+3 from last month</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-white/90 backdrop-blur-sm border-lavender/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium font-bold">Analyses This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-white/90 backdrop-blur-sm border-lavender/30 sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium font-bold">Success Rate</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">Client satisfaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-border bg-white/90 backdrop-blur-sm border-lavender/30">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center space-x-2 font-bold text-base sm:text-lg">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs sm:text-sm font-medium">Sarah Johnson - Contraindication Screen</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
              <Badge variant="secondary" className="bg-teal-100 text-teal-800 w-fit text-xs sm:text-sm">
                Safe
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs sm:text-sm font-medium">Maria Garcia - Skin Analysis</p>
                <p className="text-xs text-muted-foreground">5 hours ago</p>
              </div>
              <Badge variant="outline" className="w-fit text-xs sm:text-sm">Fitzpatrick III</Badge>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs sm:text-sm font-medium">Emma Wilson - Contraindication Screen</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 w-fit text-xs sm:text-sm">
                Precaution
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs sm:text-sm font-medium">Analysis link sent to Jessica Chen</p>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </div>
              <Badge variant="outline" className="bg-lavender-100 text-lavender-800 w-fit text-xs sm:text-sm">
                Pending
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consent Form Modal */}
      <ConsentFormModal 
        isOpen={showConsentFormModal}
        onClose={() => setShowConsentFormModal(false)}
      />
    </div>
  )
}
