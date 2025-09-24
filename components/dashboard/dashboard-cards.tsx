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
  Settings,
  BarChart3,
  Send,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { MetaMessengerBox } from "@/components/messenger/meta-messenger-box"
import { ConsentFormModal } from "@/components/consent/consent-form-modal"
import { ConsentNotifications } from "@/components/consent/consent-notifications"
import { consentReminderService } from "@/lib/services/consent-reminder-service"
import { WeeklyBalanceCard, DailyBalanceCard } from "@/components/dashboard/financial-dashboard"

export function DashboardCards() {
  const [showConsentFormModal, setShowConsentFormModal] = useState(false)
  
  // Initialize consent reminder service
  useEffect(() => {
    consentReminderService.startReminderService()
    
    return () => {
      consentReminderService.stopReminderService()
    }
  }, [])
  
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

      {/* Financial Dashboard - Mobile */}
      <div className="lg:hidden grid grid-cols-1 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <WeeklyBalanceCard />
        <DailyBalanceCard />
      </div>

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
              
              <Link href="/clients/new" className="w-full">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-lavender to-lavender-600 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 py-2 sm:py-3 px-2 sm:px-3 text-center">
                    <span className="text-white font-bold text-xs sm:text-sm text-shadow-lg shadow-black/50">
                      👤 Quick Add
                    </span>
                    <p className="text-lavender-100 text-xs mt-1">
                      Basic Info
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
              
              <Link href="/clients/new" className="flex-1">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-lavender to-lavender-600 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 py-3 xl:py-4 px-4 xl:px-6 text-center">
                    <span className="text-white font-bold text-sm xl:text-lg text-shadow-lg shadow-black/50">
                      👤 Quick Add
                    </span>
                    <p className="text-lavender-100 text-xs xl:text-sm mt-1">
                      Basic Info
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

        <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border-lavender/30">
          {/* Background Image */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
              <circle cx="50" cy="40" r="25" fill="none" stroke="currentColor" strokeWidth="2"/>
              <path d="M30 60l40 0M35 70l30 0M40 80l20 0" stroke="currentColor" strokeWidth="2"/>
              <circle cx="40" cy="35" r="2" fill="currentColor"/>
              <circle cx="60" cy="35" r="2" fill="currentColor"/>
              <path d="M45 45q5 5 10 0" stroke="currentColor" strokeWidth="1" fill="none"/>
              <path d="M25 25l10-10M75 25l-10-10" stroke="currentColor" strokeWidth="1"/>
            </svg>
          </div>
          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-lavender" />
              <CardTitle className="text-lg font-bold">Skin Analysis</CardTitle>
            </div>
            <CardDescription>Analyze skin tone and get pigment recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/analyze">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-lavender/20 rounded-xl border border-lavender/30 group-hover:bg-lavender/10 transition-colors"></div>
                <div className="relative z-10 py-3 px-4 text-center">
                  <span className="text-lavender-700 font-semibold text-shadow-sm shadow-white/80">
                    Start Skin Analysis
                  </span>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border-lavender/30">
          {/* Background Image */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
              <path d="M20 20h60v60h-60z" fill="none" stroke="currentColor" strokeWidth="2"/>
              <path d="M30 30h40v10h-40z" fill="currentColor"/>
              <path d="M30 45h25v5h-25z" fill="currentColor"/>
              <path d="M30 55h35v5h-35z" fill="currentColor"/>
              <path d="M30 65h20v5h-20z" fill="currentColor"/>
              <circle cx="75" cy="35" r="3" fill="currentColor"/>
            </svg>
          </div>
          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-lavender" />
              <CardTitle className="text-lg font-bold">Client Management</CardTitle>
            </div>
            <CardDescription>Manage your client database and documents</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/clients">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-lavender/20 rounded-xl border border-lavender/30 group-hover:bg-lavender/10 transition-colors"></div>
                <div className="relative z-10 py-3 px-4 text-center">
                  <span className="text-lavender-700 font-semibold text-shadow-sm shadow-white/80">
                    View Clients
                  </span>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border-lavender/30">
          {/* Background Image */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
              <circle cx="30" cy="30" r="15" fill="currentColor" opacity="0.3"/>
              <circle cx="70" cy="30" r="15" fill="currentColor" opacity="0.5"/>
              <circle cx="50" cy="60" r="15" fill="currentColor" opacity="0.7"/>
              <path d="M20 20l60 60M80 20l-60 60" stroke="currentColor" strokeWidth="1"/>
              <rect x="25" y="25" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="1"/>
              <path d="M35 35l30 30M65 35l-30 30" stroke="currentColor" strokeWidth="1"/>
            </svg>
          </div>
          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-lavender" />
              <CardTitle className="text-lg font-bold">Color Correction</CardTitle>
            </div>
            <CardDescription>Fix and adjust PMU color issues</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/color-correction">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-lavender/20 rounded-xl border border-lavender/30 group-hover:bg-lavender/10 transition-colors"></div>
                <div className="relative z-10 py-3 px-4 text-center">
                  <span className="text-lavender-700 font-semibold text-shadow-sm shadow-white/80">
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

        <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border-lavender/30">
          {/* Background Image */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2"/>
              <circle cx="50" cy="50" r="25" fill="currentColor" opacity="0.3"/>
              <circle cx="50" cy="50" r="15" fill="currentColor" opacity="0.5"/>
              <path d="M20 20l15 15M80 20l-15 15M20 80l15-15M80 80l-15-15" stroke="currentColor" strokeWidth="1"/>
              <path d="M35 50h30M50 35v30" stroke="currentColor" strokeWidth="1"/>
            </svg>
          </div>
          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-center space-x-2">
              <Microscope className="h-5 w-5 text-lavender" />
              <CardTitle className="text-lg font-bold">ProCell Analysis</CardTitle>
            </div>
            <CardDescription>Advanced skin analysis for optimal results</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/procell-analysis">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-lavender/20 rounded-xl border border-lavender/30 group-hover:bg-lavender/10 transition-colors"></div>
                <div className="relative z-10 py-3 px-4 text-center">
                  <span className="text-lavender-700 font-semibold text-shadow-sm shadow-white/80">
                    Start Analysis
                  </span>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>


      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6">
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
