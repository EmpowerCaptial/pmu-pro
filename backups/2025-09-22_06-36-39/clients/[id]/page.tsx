"use client"

import { useEffect, useState } from "react"
import { NavBar } from "@/components/ui/navbar"
import { ClientDetails } from "@/components/clients/client-details"
import { useDemoAuth } from "@/hooks/use-demo-auth"
import { getClientById, type Client } from "@/lib/client-storage"

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const { currentUser } = useDemoAuth()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  
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

  useEffect(() => {
    const loadClient = () => {
      const clientData = getClientById(params.id)
      if (clientData) {
        setClient(clientData)
      }
      setLoading(false)
    }

    loadClient()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
        <NavBar currentPath="/clients" user={user} />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-lavender mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading client profile...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
        <NavBar currentPath="/clients" user={user} />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Client Not Found</h2>
            <p className="text-red-600">Could not find client with ID: {params.id}</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <NavBar currentPath="/clients" user={user} />
      <main className="container mx-auto px-4 py-8">
        <ClientDetails client={client} />
      </main>
    </div>
  )
}
