"use client"

import { NavBar } from "@/components/ui/navbar"
import ClientList from "@/components/clients/client-list"
import { Button } from "@/components/ui/button"
import { Plus, Home } from "lucide-react"
import Link from "next/link"
import { useDemoAuth } from "@/hooks/use-demo-auth"

export default function ClientsPage() {
  const { currentUser, isLoading } = useDemoAuth()
  
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige pb-20">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="/images/pmu-guide-logo.png"
          alt="PMU Guide Logo"
          className="w-[40%] max-w-lg h-auto opacity-10 object-contain"
        />
      </div>

      <NavBar currentPath="/clients" user={user} />
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Mobile Header */}
        <div className="md:hidden mb-6">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-3 mb-3">
              <img src="/images/pmu-guide-logo.png" alt="PMU Guide Logo" className="w-8 h-8 object-contain" />
              <h1 className="text-2xl font-bold text-foreground font-serif">Clients</h1>
            </div>
            <p className="text-sm text-muted-foreground">Manage your PMU clients and consultation history</p>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/clients/new">
              <Button className="w-full gap-2 bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender">
                <Plus className="h-4 w-4" />
                Add New Client
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 hover:bg-lavender/10 hover:border-lavender bg-white/90 backdrop-blur-sm border-lavender/30 text-lavender-700 font-semibold"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img src="/images/pmu-guide-logo.png" alt="PMU Guide Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-3xl font-bold text-foreground font-serif mb-2">Clients</h1>
              <p className="text-muted-foreground">Manage your PMU clients and consultation history</p>
            </div>
          </div>
          <div className="flex gap-3">
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
            <Link href="/clients/new">
              <Button className="gap-2 bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender">
                <Plus className="h-4 w-4" />
                Add New Client
              </Button>
            </Link>
          </div>
        </div>
        <ClientList />
      </main>
    </div>
  )
}
