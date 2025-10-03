"use client"

import { Suspense, useState, useEffect } from "react"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { AppointmentDetailsCard } from "@/components/dashboard/appointment-details-card"
import { MetaMessengerBox } from "@/components/messenger/meta-messenger-box"
import { BlogSection } from "@/components/dashboard/blog-section"
import { NavBar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Home, Download, Smartphone, CreditCard, Package, Bell, X } from "lucide-react"
import Link from "next/link"
import ArtistViewWrapper from "@/components/staff/artist-view-wrapper"
import InstallPrompt from "@/components/pwa/install-prompt"
import OfflineIndicator from "@/components/pwa/offline-indicator"
import DemoBanner from "@/components/demo/demo-banner"
import DemoDataProvider from "@/components/demo/demo-data-provider"
import { TrialBanner } from "@/components/trial/trial-banner"
import { TrialExpirationBanner } from "@/components/trial/trial-expiration-banner"
import { SubscriptionGate } from "@/components/auth/subscription-gate"
import { TrialOnboarding } from "@/components/trial/trial-onboarding"
import { ApplicationStatusCard } from "@/components/trial/application-status-card"
import { ArtistApplicationService } from "@/lib/artist-application-service"
import { useDemoAuth } from "@/hooks/use-demo-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const { currentUser, isLoading, isProductionUser, isDemoUser } = useDemoAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [hasApplication, setHasApplication] = useState(false)
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined)
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  
  // Load avatar from API first, then fallback to localStorage
  useEffect(() => {
    const loadAvatar = async () => {
      if (currentUser?.email && typeof window !== 'undefined') {
        try {
          // Try to load from API first
          const response = await fetch('/api/profile', {
            headers: {
              'x-user-email': currentUser.email
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            if (data.profile?.avatar) {
              setUserAvatar(data.profile.avatar)
              return
            }
          }
          
          // Fallback to localStorage
          const avatar = localStorage.getItem(`profile_photo_${currentUser.email}`)
          setUserAvatar(avatar || undefined)
        } catch (error) {
          console.error('Error loading avatar:', error)
          // Fallback to localStorage on error
          const avatar = localStorage.getItem(`profile_photo_${currentUser.email}`)
          setUserAvatar(avatar || undefined)
        }
      }
    }
    
    loadAvatar()
  }, [currentUser?.email])

  // Load notifications with error handling to prevent infinite loops
  useEffect(() => {
    const loadNotifications = async () => {
      if (currentUser?.email && typeof window !== 'undefined') {
        try {
          const response = await fetch('/api/notifications', {
            headers: {
              'x-user-email': currentUser.email
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            setNotifications(data.notifications || [])
          } else if (response.status === 404) {
            // User not found in database - normal for new users
            setNotifications([])
            console.log('User not found in notifications database - normal for new users')
          } else {
            // Other errors - don't retry immediately
            console.error('Notifications API error:', response.status, response.statusText)
            setNotifications([])
          }
        } catch (error) {
          console.error('Error loading notifications:', error)
          setNotifications([]) // Always set array to prevent undefined state
        }
      }
    }
    
    loadNotifications()
    
    // Refresh notifications every 30 seconds - but only if initial load succeeded
    let interval: NodeJS.Timeout | undefined
    const setupInterval = () => {
      if (interval) clearInterval(interval)
      interval = setInterval(async () => {
        // Check if initial load was successful before setting up poll
        try {
          await loadNotifications()
        } catch (error) {
          console.log('Skipping notification poll due to error')
          if (interval) clearInterval(interval)
        }
      }, 30000)
    }
    
    setupInterval()
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [currentUser?.email])

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!currentUser?.email) return
    
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({ notificationId, isRead: true })
      })
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }
  
  // Fallback user if not authenticated
  const user = currentUser ? {
    name: currentUser.name,
    email: currentUser.email,
    initials: currentUser.name?.split(' ').map(n => n[0]).join('') || currentUser.email.charAt(0).toUpperCase(),
    avatar: userAvatar
  } : {
    name: "PMU Artist",
    email: "user@pmupro.com",
    initials: "PA",
  }

  // Check if user needs onboarding
  useEffect(() => {
    if (currentUser?.email) {
      // Check if onboarding was completed
      const onboardingCompleted = localStorage.getItem(`trial_onboarding_completed_${currentUser.email}`)
      
      // Check if user has an application
      const application = ArtistApplicationService.getApplication(currentUser.email)
      setHasApplication(!!application)
      
      // Show onboarding if not completed and user has application
      if (!onboardingCompleted && application) {
        setShowOnboarding(true)
      }
    }
  }, [currentUser?.email])

  const handleOnboardingClose = () => {
    setShowOnboarding(false)
  }

  const handleUpdateApplication = () => {
    window.location.href = '/artist-signup'
  }

  const handlePWAInstall = () => {
    // Check if PWA is installable
    if ('serviceWorker' in navigator) {
      // Try to show browser's native install UI
      if (window.matchMedia('(display-mode: standalone)').matches) {
        alert('PMU Pro is already installed as an app!')
        return
      }
      
      // Show manual install instructions
      const instructions = `
📱 Install PMU Pro as an App:

🔹 Chrome/Edge: Click ⋮ menu → "Install PMU Pro"
🔹 Safari: Click Share button → "Add to Home Screen"  
🔹 Mobile: Look for "Add to Home Screen" option
🔹 Firefox: Click ⋮ menu → "Install App"

💡 Tip: The install option appears in your browser's menu when PMU Pro meets install criteria.
      `
      alert(instructions)
    } else {
      alert('PWA installation not supported in this browser. Please use Chrome, Edge, Safari, or Firefox.')
    }
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ArtistViewWrapper>
        <SubscriptionGate>
          <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige pb-24 md:pb-20">

          <NavBar currentPath="/dashboard" user={user} />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
            {/* Only show offline indicator on desktop */}
            <div className="hidden md:block">
              <OfflineIndicator />
            </div>
            {/* Only show trial banners for users without active subscriptions */}
            {!(currentUser as any)?.hasActiveSubscription && (
              <>
                <TrialBanner onUpgrade={() => window.location.href = '/pricing'} />
                <TrialExpirationBanner 
                  onSubscribe={() => window.location.href = '/pricing'}
                  onDismiss={() => console.log('Trial banner dismissed')}
                />
              </>
            )}
            {isDemoUser && <DemoBanner />}
            
            {/* Application Status Card - only for users without active subscriptions */}
            {hasApplication && currentUser?.email && !(currentUser as any)?.hasActiveSubscription && (
              <ApplicationStatusCard 
                userEmail={currentUser.email}
                onUpdateApplication={handleUpdateApplication}
              />
            )}
            
            {/* Notifications Panel */}
            {showNotifications && (
              <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recent Notifications</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotifications(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                  ) : (
                    <div className="space-y-3">
                      {notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg border ${
                            notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">{notification.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="ml-2"
                              >
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Mobile Header */}
            <div className="md:hidden mb-6 sm:mb-8">
              <div className="text-center mb-4 sm:mb-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <img src="/images/pmu-guide-logo.png" alt="PMU Guide Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground font-serif">Dashboard</h1>
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative"
                    >
                      <Bell className="h-5 w-5" />
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {notifications.filter(n => !n.isRead).length}
                      </Badge>
                    </Button>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground px-4">Manage your PMU consultations and analysis</p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 px-4">
                <Button
                  onClick={handlePWAInstall}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto gap-2 hover:bg-purple-50 hover:border-purple-300 bg-white/90 backdrop-blur-sm border-purple-200 text-purple-700 font-semibold text-xs sm:text-sm"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  <Smartphone className="h-3 w-3 sm:h-4 sm:w-4" />
                  Install App
                </Button>
                <Link href="/products" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto gap-2 hover:bg-teal-50 hover:border-teal-300 bg-white/90 backdrop-blur-sm border-teal-200 text-teal-700 font-semibold text-xs sm:text-sm"
                  >
                    <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                    Products
                  </Button>
                </Link>
              </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between mb-6 lg:mb-8">
              <div className="flex items-center gap-3 lg:gap-4">
                <img src="/images/pmu-guide-logo.png" alt="PMU Guide Logo" className="w-8 h-8 lg:w-10 lg:h-10 object-contain" />
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground font-serif mb-1 lg:mb-2">Dashboard</h1>
                  <p className="text-sm lg:text-base text-muted-foreground">Manage your PMU consultations and analysis</p>
                </div>
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative"
                  >
                    <Bell className="h-5 w-5" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {notifications.filter(n => !n.isRead).length}
                    </Badge>
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2 lg:gap-3">
                <Button
                  onClick={handlePWAInstall}
                  variant="outline"
                  size="sm"
                  className="gap-2 hover:bg-purple-50 hover:border-purple-300 bg-white/90 backdrop-blur-sm border-purple-200 text-purple-700 font-semibold text-sm lg:text-base"
                >
                  <Download className="h-4 w-4" />
                  <Smartphone className="h-4 w-4" />
                  Install App
                </Button>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 hover:bg-lavender/10 hover:border-lavender bg-white/90 backdrop-blur-sm border-lavender/30 text-lavender-700 font-semibold text-sm lg:text-base"
                  >
                    <Home className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
            {isDemoUser ? (
              <DemoDataProvider>
                <DashboardCards />
              </DemoDataProvider>
            ) : (
              <>
                {/* Mobile: Show dashboard cards first, then appointments, then messenger */}
                <div className="md:hidden">
                  <DashboardCards />
                  <div className="mt-6">
                    <AppointmentDetailsCard />
                  </div>
                  <div className="mt-6">
                    <MetaMessengerBox />
                  </div>
                </div>
                
                {/* Desktop: Show dashboard cards first, then appointments */}
                <div className="hidden md:block">
                  <DashboardCards />
                  <div className="mt-6">
                    <AppointmentDetailsCard />
                  </div>
                </div>
              </>
            )}
            
            {/* Blog Section - Hidden while building */}
            {/* <div className="mt-8">
              <BlogSection />
            </div> */}
          </main>
          <InstallPrompt />
        </div>
        </SubscriptionGate>
      </ArtistViewWrapper>
      
      {/* Trial Onboarding Modal */}
      {currentUser?.email && (
        <TrialOnboarding
          userEmail={currentUser.email}
          isOpen={showOnboarding}
          onClose={handleOnboardingClose}
        />
      )}
    </Suspense>
  )
}
