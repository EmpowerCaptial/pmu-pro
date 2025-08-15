import type { Metadata } from "next"
import { ClientAnalysisWorkflow } from "@/components/client/client-analysis-workflow"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Free Skin Analysis - PMU Pro",
  description: "Get personalized PMU recommendations and connect with licensed artists",
}

export default function ClientAnalysisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-foreground font-serif mb-2">Free Skin Analysis</h1>
            <p className="text-muted-foreground">Discover your perfect PMU match with licensed artists near you</p>
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
        <ClientAnalysisWorkflow />
      </main>
    </div>
  )
}
