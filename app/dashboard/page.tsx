import type { Metadata } from "next"
import { Suspense } from "react"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { NavBar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import Link from "next/link"
import ArtistViewWrapper from "@/components/staff/artist-view-wrapper"
import InstallPrompt from "@/components/pwa/install-prompt"
import OfflineIndicator from "@/components/pwa/offline-indicator"
import DemoBanner from "@/components/demo/demo-banner"
import DemoDataProvider from "@/components/demo/demo-data-provider"

export const metadata: Metadata = {
  title: "Dashboard - PMU Pro",
  description: "Your PMU Pro professional dashboard",
}

export default function DashboardPage() {
  const mockUser = {
    name: "Demo PMU Artist",
    email: "demo@pmupro.com",
    initials: "DA",
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ArtistViewWrapper>
        <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img
              src="/images/pmu-guide-logo.png"
              alt="PMU Guide Logo"
              className="w-[40%] max-w-lg h-auto opacity-10 object-contain"
            />
          </div>

          <NavBar currentPath="/dashboard" user={mockUser} />
          <main className="container mx-auto px-4 py-8 relative z-10">
            <OfflineIndicator />
            <DemoBanner />
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <img src="/images/pmu-guide-logo.png" alt="PMU Guide Logo" className="w-10 h-10 object-contain" />
                <div>
                  <h1 className="text-3xl font-bold text-foreground font-serif mb-2">Dashboard</h1>
                  <p className="text-muted-foreground">Manage your PMU consultations and analysis</p>
                </div>
              </div>
              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 hover:bg-lavender/10 hover:border-lavender bg-white/90 backdrop-blur-sm border-lavender/30 text-lavender-700 font-semibold"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Button>
              </Link>
            </div>
            <DemoDataProvider>
              <DashboardCards />
            </DemoDataProvider>
          </main>
          <InstallPrompt />
        </div>
      </ArtistViewWrapper>
    </Suspense>
  )
}
