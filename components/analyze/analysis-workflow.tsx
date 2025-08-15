"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Stepper } from "@/components/ui/stepper"
import { BiometricConsent } from "@/components/analyze/biometric-consent"
import { EnhancedPhotoCapture } from "@/components/analyze/enhanced-photo-capture"
import { AnalysisProcessingStep } from "@/components/analyze/analysis-processing-step"
import { AnalysisResultsStep } from "@/components/analyze/analysis-results-step"

const steps = [
  {
    id: "consent",
    title: "Consent",
    description: "Biometric data notice",
  },
  {
    id: "capture",
    title: "Capture Photo",
    description: "Take or upload a clear photo",
  },
  {
    id: "processing",
    title: "AI Analysis",
    description: "Processing skin characteristics",
  },
  {
    id: "results",
    title: "Results",
    description: "View recommendations",
  },
]

export function AnalysisWorkflow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [analysisResults, setAnalysisResults] = useState<any>(null)

  const handleConsent = () => {
    setCurrentStep(2)
  }

  const handleDeclineConsent = () => {
    // Redirect back or show message
    window.history.back()
  }

  const handlePhotoCapture = (photoUrl: string) => {
    setCapturedPhoto(photoUrl)
    setCurrentStep(3)
    // Start analysis process
    setTimeout(() => {
      // Mock analysis results
      setAnalysisResults({
        fitzpatrick: 3,
        undertone: "neutral",
        confidence: 0.92,
        recommendations: [
          {
            pigmentId: "1",
            name: "Permablend Honey Magic",
            brand: "Permablend",
            why: "Perfect match for Fitzpatrick III with neutral undertones",
            expectedHealShift: "Slight warm heal, maintains golden base",
          },
          {
            pigmentId: "2",
            name: "Li Pigments Mocha",
            brand: "Li Pigments",
            why: "Warm alternative with rich brown tones",
            expectedHealShift: "Stable healing with minimal shift",
          },
          {
            pigmentId: "3",
            name: "Tina Davies Ash Brown",
            brand: "Tina Davies",
            why: "Cool alternative for versatile results",
            expectedHealShift: "May fade to soft gray undertones",
          },
        ],
      })
      setCurrentStep(4)
    }, 3000)
  }

  const handleRetakePhoto = () => {
    setCapturedPhoto(null)
    setAnalysisResults(null)
    setCurrentStep(2)
  }

  const handleNewAnalysis = () => {
    setCapturedPhoto(null)
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

      {currentStep === 2 && <EnhancedPhotoCapture onPhotoCapture={handlePhotoCapture} capturedPhoto={capturedPhoto} />}

      {currentStep === 3 && (
        <AnalysisProcessingStep photo={capturedPhoto} onRetake={handleRetakePhoto} results={analysisResults} />
      )}

      {currentStep === 4 && analysisResults && (
        <AnalysisResultsStep
          photo={capturedPhoto}
          results={analysisResults}
          onRetake={handleRetakePhoto}
          onNewAnalysis={handleNewAnalysis}
        />
      )}
    </div>
  )
}
