"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Stepper } from "@/components/ui/stepper"
import { BiometricConsent } from "@/components/analyze/biometric-consent"
import { PMUAnalysisTool } from "@/components/analyze/pmu-analysis-tool"

const steps = [
  {
    id: "consent",
    title: "Consent",
    description: "Biometric data notice",
  },
  {
    id: "analysis",
    title: "PMU Analysis",
    description: "Complete skin analysis and pigment recommendations",
  },
]

interface PMUAnalysis {
  undertone: string
  pmu_pigment_recommendations: {
    brows: string[]
    lips: string[]
    eyeliner: string[]
  }
  healed_pigment_prediction: string
  skincare_suggestions: string[]
  artist_talking_points: string[]
}

export function AnalysisWorkflow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [analysisResults, setAnalysisResults] = useState<PMUAnalysis | null>(null)

  const handleConsent = () => {
    setCurrentStep(2)
  }

  const handleDeclineConsent = () => {
    // Redirect back or show message
    window.history.back()
  }

  const handleAnalysisComplete = (analysis: PMUAnalysis) => {
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

      {currentStep === 2 && <PMUAnalysisTool onAnalysisComplete={handleAnalysisComplete} />}
    </div>
  )
}
