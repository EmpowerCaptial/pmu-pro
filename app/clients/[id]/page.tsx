import type { Metadata } from "next"
import { NavBar } from "@/components/ui/navbar"
import { ClientDetails } from "@/components/clients/client-details"
import { notFound } from "next/navigation"

interface ClientPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ClientPageProps): Promise<Metadata> {
  // In real app, fetch client name from database
  return {
    title: `Client Details - PMU Pro`,
    description: "View client consultation history and analysis results",
  }
}

export default function ClientPage({ params }: ClientPageProps) {
  const mockUser = {
    name: "Demo PMU Artist",
    email: "demo@pmupro.com",
    initials: "DA",
  }

  // Mock client data - in real app this would be fetched from database
  const mockClient = {
    id: params.id,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+1-555-0123",
    notes: "First-time PMU client, interested in microblading",
    createdAt: "2024-01-10",
  }

  if (!mockClient) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <NavBar currentPath="/clients" user={mockUser} />
      <main className="container mx-auto px-4 py-8">
        <ClientDetails client={mockClient} />
      </main>
    </div>
  )
}
