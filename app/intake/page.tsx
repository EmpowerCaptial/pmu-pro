"use client"

import { NavBar } from "@/components/ui/navbar"
import { ContraindicationWorkflow } from "@/components/intake/contraindication-workflow"
import { useDemoAuth } from "@/hooks/use-demo-auth"

export default function IntakePage() {
  const { currentUser } = useDemoAuth()
  
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
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <NavBar currentPath="/intake" user={user} />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-serif mb-2">Contraindication Screening</h1>
          <p className="text-sm md:text-base text-muted-foreground px-4">AI-powered safety assessment to determine PMU procedure suitability</p>
        </div>
        <ContraindicationWorkflow />
      </main>
    </div>
  )
}
