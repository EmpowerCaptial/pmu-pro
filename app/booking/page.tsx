import type { Metadata } from "next"
import { NavBar } from "@/components/ui/navbar"
import { BookingCalendar } from "@/components/booking/booking-calendar"
import { BookingIntegrations } from "@/components/booking/booking-integrations"

export const metadata: Metadata = {
  title: "Booking & Scheduling - PMU Pro",
  description: "Manage appointments and integrate with popular booking platforms",
}

export default function BookingPage() {
  const mockUser = {
    name: "Demo PMU Artist",
    email: "demo@pmupro.com",
    initials: "DA",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <NavBar currentPath="/booking" user={mockUser} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground font-serif mb-2">Booking & Scheduling</h1>
          <p className="text-muted-foreground">Manage your appointments and connect with popular booking platforms</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <BookingCalendar />
          <BookingIntegrations />
        </div>
      </main>
    </div>
  )
}
