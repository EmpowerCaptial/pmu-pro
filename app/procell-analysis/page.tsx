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

  // Mock analysis result - in a real app this would be state
  const analysisResult = {
    redPercentage: "0.0",
    severity: "None",
    description: "No analysis performed yet",
    recommendation: "Upload an image to begin analysis",
    analyzed: false
  }

  const analyzeImage = (imageData: ImageData) => {
    const data = imageData.data
    let redPixels = 0
    let totalPixels = 0
    
    // Improved red detection algorithm with better thresholds
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
      totalPixels++
      
      // More sophisticated red detection that accounts for natural skin tones
      // Red should be significantly higher than green and blue for skin burn detection
      const redDominance = r - Math.max(g, b)
      const redRatio = r / (g + b + 1) // Avoid division by zero
      
      // Adjusted thresholds for more accurate detection
      // Only count as red if red is clearly dominant and ratio is high enough
      if (redDominance > 30 && redRatio > 1.4 && r > 150) {
        redPixels++
      }
    }
    
    const redPercentage = (redPixels / totalPixels) * 100
    
    // Adjusted severity levels based on more accurate detection
    let severity = 'Low'
    let description = 'Minimal skin irritation detected'
    let recommendation = 'Continue with normal care routine'
    
    if (redPercentage > 15) {
      severity = 'High'
      description = 'Significant skin irritation or burn detected'
      recommendation = 'Immediate attention required. Consider postponing treatment.'
    } else if (redPercentage > 8) {
      severity = 'Medium'
      description = 'Moderate skin irritation detected'
      recommendation = 'Proceed with caution. Monitor closely during treatment.'
    } else if (redPercentage > 3) {
      severity = 'Low'
      description = 'Mild skin irritation detected'
      recommendation = 'Proceed with standard protocols. Monitor for changes.'
    } else {
      severity = 'None'
      description = 'No significant skin irritation detected'
      recommendation = 'Safe to proceed with treatment.'
    }
    
    // In a real app, this would update state
    console.log('Analysis result:', {
      redPercentage: redPercentage.toFixed(1),
      severity,
      description,
      recommendation,
      analyzed: true
    })
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
