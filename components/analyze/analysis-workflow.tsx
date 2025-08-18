"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Stepper } from "@/components/ui/stepper"
import { BiometricConsent } from "@/components/analyze/biometric-consent"
import { AdvancedSkinAnalysisTool } from "@/components/analyze/advanced-skin-analysis-tool"

const steps = [
  {
    id: "consent",
    title: "Consent",
    description: "Biometric data notice",
  },
  {
    id: "analysis",
    title: "Advanced Analysis",
    description: "Comprehensive skin analysis with PerfectCorp-style assessment",
  },
]

interface ComprehensiveSkinAnalysis {
  fitzpatrick: number
  undertone: "cool" | "neutral" | "warm"
  confidence: number
  skinConcerns: Array<{
    type: string
    score: number
    severity: "low" | "moderate" | "high"
    areas: Array<{ x: number; y: number; intensity: number }>
    peerComparison: {
      ageGroup: string
      percentile: number
      average: number
    }
  }>
  overallSkinScore: number
  pmuReadiness: {
    overall: number
    hydration: number
    texture: number
    sunExposure: number
    contraindications: number
    healing_potential: number
  }
  pigmentRecommendations: {
    brows: Array<any>
    lips: Array<any>
    eyeliner: Array<any>
  }
  procellAnalysis: {
    recommended_sessions: number
    healing_speed_prediction: "fast" | "normal" | "slow"
    collagen_response: "excellent" | "good" | "moderate"
    downtime_estimate: string
    area_focus: string[]
    expected_benefits: string[]
  }
  analysisId: string
  timestamp: string
  photoQuality: "excellent" | "good" | "fair" | "poor"
  healingPrediction: string
  longevityPrediction: string
  maintenanceSchedule: string[]
}

export function AnalysisWorkflow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [analysisResults, setAnalysisResults] = useState<ComprehensiveSkinAnalysis | null>(null)

  const handleConsent = () => {
    setCurrentStep(2)
  }

  const handleDeclineConsent = () => {
    window.history.back()
  }

  const handleAnalysisComplete = (analysis: ComprehensiveSkinAnalysis) => {
    setAnalysisResults(analysis)
  }

  const handleNewAnalysis = () => {
    setAnalysisResults(null)
    setCurrentStep(1)
  }

  return (
    <div className="space-y-8">
      {/* Progress Stepper */}
      <Card className="border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <Stepper steps={steps} currentStep={currentStep} />
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 1 && <BiometricConsent onConsent={handleConsent} onDecline={handleDeclineConsent} />}

      {currentStep === 2 && <AdvancedSkinAnalysisTool onAnalysisComplete={handleAnalysisComplete} />}
    </div>
  )
}
