"use client"

import { NavBar } from "@/components/ui/navbar"
import { SendAnalysisForm } from "@/components/send-analysis/send-analysis-form"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import Link from "next/link"
import { useDemoAuth } from "@/hooks/use-demo-auth"

export default function SendAnalysisPage() {
  const { currentUser } = useDemoAuth()
  
  // Fallback user if not authenticated
  const user = currentUser ? {
    name: currentUser.name,
    email: currentUser.email,
    initials: currentUser.name?.split(' ').map(n => n[0]).join('') || currentUser.email.charAt(0).toUpperCase()
  } : {
    name: "PMU Artist",
    email: "user@pmupro.com",
    initials: "PA",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="/images/pmu-guide-logo.png"
          alt="PMU Guide Logo"
          className="w-[40%] max-w-lg h-auto opacity-10 object-contain"
        />
      </div>

      <NavBar currentPath="/send-analysis" user={user} />
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img src="/images/pmu-guide-logo.png" alt="PMU Guide Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-3xl font-bold text-foreground font-serif mb-2">Send Client Analysis</h1>
              <p className="text-muted-foreground">Send skin analysis links to clients for remote consultation</p>
            </div>
          </div>
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 hover:bg-lavender/10 hover:border-lavender bg-white/90 backdrop-blur-sm border-lavender/30 text-lavender-700 font-semibold"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <SendAnalysisForm />
        </div>
      </main>
    </div>
  )
}
