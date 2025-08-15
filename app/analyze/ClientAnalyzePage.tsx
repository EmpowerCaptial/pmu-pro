"use client"

import { NavBar } from "@/components/ui/navbar"
import { AnalysisWorkflow } from "@/components/analyze/analysis-workflow"
import FitzpatrickProSelector from "@/components/fitzpatrick/fitzpatrick-pro-selector"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import Link from "next/link"

export default function ClientAnalyzePage() {
  const mockUser = {
    name: "Demo PMU Artist",
    email: "demo@pmupro.com",
    initials: "DA",
  }

  const handleAnalyze = async (formState: any) => {
    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 2000))
    return {
      type: formState.selectedType,
      confidence: 92,
      pigments: [
        { name: "Warm Brown", hex: "#8B4513", code: "WB-001" },
        { name: "Neutral Taupe", hex: "#A0826D", code: "NT-002" },
      ],
      techniques: {
        needleSpeed: "Medium speed recommended",
        depth: "Shallow to medium depth",
        care: "Standard aftercare protocol",
      },
      reasoning: "Based on your skin type and undertone, these pigments will provide the most natural-looking results.",
    }
  }

  const handleSave = (result: any) => {
    console.log("Saving result:", result)
  }

  const handleExport = (result: any) => {
    console.log("Exporting result:", result)
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

      <NavBar currentPath="/analyze" user={mockUser} />
      <main className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 text-center">
            <img src="/images/pmu-guide-logo.png" alt="PMU Guide Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-3xl font-bold text-foreground font-serif mb-2">Professional Skin Analysis</h1>
              <p className="text-muted-foreground">
                AI-powered Fitzpatrick classification and undertone detection for precise pigment matching
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

        <div className="space-y-6">
          <FitzpatrickProSelector onAnalyze={handleAnalyze} onSave={handleSave} onExport={handleExport} />
          <AnalysisWorkflow />
        </div>
      </main>
    </div>
  )
}
