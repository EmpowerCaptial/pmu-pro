"use client"

import { NavBar } from "@/components/ui/navbar"
import { AftercareInstructions } from "@/components/aftercare/aftercare-instructions"
import { useDemoAuth } from "@/hooks/use-demo-auth"

export default function AftercarePage() {
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
      <NavBar currentPath="/aftercare" user={user} />
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl relative z-10">
        <AftercareInstructions />
      </main>
    </div>
  )
}
