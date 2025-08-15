import type { Metadata } from "next"
import { NavBar } from "@/components/ui/navbar"
import { AftercareInstructions } from "@/components/aftercare/aftercare-instructions"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Aftercare Instructions - PMU Pro",
  description: "Professional PMU aftercare instructions for optimal healing",
}

export default function AftercarePage() {
  const mockUser = {
    name: "Demo PMU Artist",
    email: "demo@pmupro.com",
    initials: "DA",
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

      <NavBar currentPath="/aftercare" user={mockUser} />
      <main className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 text-center">
            <img src="/images/pmu-guide-logo.png" alt="PMU Guide Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-3xl font-bold text-foreground font-serif mb-2">Aftercare Instructions</h1>
              <p className="text-muted-foreground">
                Professional aftercare guidance for optimal PMU healing and results
              </p>
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
        <AftercareInstructions />
      </main>
    </div>
  )
}
