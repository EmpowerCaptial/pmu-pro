"use client"

import { Suspense, useState, useEffect } from "react"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { AppointmentDetailsCard } from "@/components/dashboard/appointment-details-card"
import { NavBar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Home, Download, Smartphone } from "lucide-react"
import Link from "next/link"
import ArtistViewWrapper from "@/components/staff/artist-view-wrapper"
import InstallPrompt from "@/components/pwa/install-prompt"
import OfflineIndicator from "@/components/pwa/offline-indicator"
import DemoBanner from "@/components/demo/demo-banner"
import DemoDataProvider from "@/components/demo/demo-data-provider"
import { TrialBanner } from "@/components/trial/trial-banner"
import { TrialOnboarding } from "@/components/trial/trial-onboarding"
import { ApplicationStatusCard } from "@/components/trial/application-status-card"
import { ArtistApplicationService } from "@/lib/artist-application-service"
import { useDemoAuth } from "@/hooks/use-demo-auth"

export default function DashboardPage() {
  const { currentUser, isLoading, isProductionUser, isDemoUser } = useDemoAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [hasApplication, setHasApplication] = useState(false)
  
  // Fallback user if not authenticated
  const user = currentUser ? {
    name: currentUser.name,
    email: currentUser.email,
    initials: currentUser.name?.split(' ').map(n => n[0]).join('') || currentUser.email.charAt(0).toUpperCase()
  } : {
    name: "PMU Artist",
    email: "artist@pmupro.com",
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
  }, [currentUser])

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
        <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige pb-24 md:pb-20">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img
              src="/images/logotransparent.jpeg"
              alt="PMU Pro Logo"
              className="w-[40%] max-w-lg h-auto opacity-10 object-contain"
            />
          </div>

          <NavBar currentPath="/dashboard" user={user} />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
            <OfflineIndicator />
            <TrialBanner onUpgrade={() => window.location.href = '/pricing'} />
            {isDemoUser && <DemoBanner />}
            
            {/* Application Status Card */}
            {hasApplication && currentUser?.email && (
              <ApplicationStatusCard 
                userEmail={currentUser.email}
                onUpdateApplication={handleUpdateApplication}
              />
            )}
            
            {/* Mobile Header */}
            <div className="md:hidden mb-6 sm:mb-8">
              <div className="text-center mb-4 sm:mb-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <img src="/images/pmu-guide-logo.png" alt="PMU Guide Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground font-serif">Dashboard</h1>
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
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto gap-2 hover:bg-lavender/10 hover:border-lavender bg-white/90 backdrop-blur-sm border-lavender/30 text-lavender-700 font-semibold text-xs sm:text-sm"
                  >
                    <Home className="h-3 w-3 sm:h-4 sm:w-4" />
                    Dashboard
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
                <DashboardCards />
                <div className="mt-6">
                  <AppointmentDetailsCard />
                </div>
              </>
            )}
          </main>
          <InstallPrompt />
        </div>
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
