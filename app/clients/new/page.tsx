import type { Metadata } from "next"
import { NavBar } from "@/components/ui/navbar"
import { NewClientForm } from "@/components/clients/new-client-form"

export const metadata: Metadata = {
  title: "Add New Client - PMU Pro",
  description: "Add a new client to your PMU practice",
}

export default function NewClientPage() {
  const mockUser = {
    name: "Demo PMU Artist",
    email: "demo@pmupro.com",
    initials: "DA",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <NavBar currentPath="/clients" user={mockUser} />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <NewClientForm />
      </main>
    </div>
  )
}
