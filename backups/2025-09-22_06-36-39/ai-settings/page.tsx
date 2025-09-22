"use client"

import { NavBar } from "@/components/ui/navbar"
import { AISettings } from "@/components/ai/ai-settings"
import { useDemoAuth } from "@/hooks/use-demo-auth"

export default function AISettingsPage() {
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
      <NavBar currentPath="/ai-settings" user={user} />
      <main className="container mx-auto px-4 py-8">
        <AISettings />
      </main>
    </div>
  )
}

