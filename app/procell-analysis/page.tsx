import type { Metadata } from "next"
import { NavBar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"
import Link from "next/link"
import ProcellSegmentation from "@/components/procell/procell-segmentation"

export const metadata: Metadata = {
  title: "ProCell Therapies Skin Analysis - PMU Pro",
  description: "Advanced skin segmentation analysis for ProCell therapy planning",
}

export default function ProcellAnalysisPage() {
  const mockUser = {
    name: "Demo PMU Artist",
    email: "demo@pmupro.com",
    initials: "DA",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img
          src="/images/pmu-guide-logo-transparent.png"
          alt="PMU Guide Logo"
          className="w-[60%] max-w-2xl h-auto opacity-[0.02] object-contain"
        />
      </div>

      <NavBar currentPath="/procell-analysis" user={mockUser} />
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img src="/images/pmu-guide-logo.png" alt="PMU Guide Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-3xl font-bold text-foreground font-serif mb-2">ProCell Therapies Analysis</h1>
              <p className="text-muted-foreground">Advanced skin segmentation for therapy planning</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 hover:bg-lavender/10 hover:border-lavender bg-white/90 backdrop-blur-sm border-lavender/30 text-lavender-700 font-semibold"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
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
        </div>

        <div className="flex justify-center">
          <ProcellSegmentation />
        </div>
      </main>
    </div>
  )
}
