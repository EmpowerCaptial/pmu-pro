import type { Metadata } from "next"
import { ClientAnalysisWorkflow } from "@/components/client/client-analysis-workflow"

export const metadata: Metadata = {
  title: "Free Skin Analysis - PMU Pro",
  description: "Get personalized PMU recommendations and connect with licensed artists",
}

export default function ClientAnalysisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground font-serif mb-2">Free Skin Analysis</h1>
          <p className="text-muted-foreground">Discover your perfect PMU match with licensed artists near you</p>
        </div>
        <ClientAnalysisWorkflow />
      </main>
    </div>
  )
}
