"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Stepper } from "@/components/ui/stepper"
import { IntakeFormStep } from "@/components/intake/intake-form-step"
import { IntakeProcessingStep } from "@/components/intake/intake-processing-step"
import { IntakeResultsStep } from "@/components/intake/intake-results-step"

const steps = [
  {
    id: "intake",
    title: "Client Intake",
    description: "Medical history and medications",
  },
  {
    id: "processing",
    title: "AI Assessment",
    description: "Analyzing contraindications",
  },
  {
    id: "results",
    title: "Safety Results",
    description: "View recommendations",
  },
]

export interface IntakeData {
  conditions: string[]
  medications: string[]
  notes: string
  clientId?: string
}

export function ContraindicationWorkflow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [intakeData, setIntakeData] = useState<IntakeData | null>(null)
  const [analysisResults, setAnalysisResults] = useState<any>(null)

  const handleIntakeSubmit = (data: IntakeData) => {
    setIntakeData(data)
    setCurrentStep(2)

    // Start AI analysis
    setTimeout(() => {
      // Mock analysis results based on intake data
      const hasHighRiskMeds = data.medications.some(
        (med) =>
          med.toLowerCase().includes("isotretinoin") ||
          med.toLowerCase().includes("accutane") ||
          med.toLowerCase().includes("warfarin") ||
          med.toLowerCase().includes("aspirin"),
      )

      const hasHighRiskConditions = data.conditions.some(
        (condition) =>
          condition.toLowerCase().includes("diabetes") ||
          condition.toLowerCase().includes("keloid") ||
          condition.toLowerCase().includes("infection"),
      )

      let result: "safe" | "precaution" | "not_recommended"
      let rationale: string
      let flaggedItems: string[] = []

      if (hasHighRiskMeds && data.medications.some((med) => med.toLowerCase().includes("isotretinoin"))) {
        result = "not_recommended"
        rationale =
          "Client is currently taking or recently took isotretinoin (Accutane), which significantly increases risk of poor healing and scarring. PMU is contraindicated for 6-12 months after discontinuation."
        flaggedItems = data.medications.filter(
          (med) => med.toLowerCase().includes("isotretinoin") || med.toLowerCase().includes("accutane"),
        )
      } else if (hasHighRiskMeds || hasHighRiskConditions) {
        result = "precaution"
        rationale =
          "Client has conditions or medications that require special consideration. Proceed with caution, consider medical clearance, and inform client of increased risks."
        flaggedItems = [
          ...data.medications.filter(
            (med) => med.toLowerCase().includes("warfarin") || med.toLowerCase().includes("aspirin"),
          ),
          ...data.conditions.filter(
            (condition) => condition.toLowerCase().includes("diabetes") || condition.toLowerCase().includes("keloid"),
          ),
        ]
      } else {
        result = "safe"
        rationale =
          "No significant contraindications found. Client appears suitable for PMU procedures with standard precautions."
        flaggedItems = []
      }

      setAnalysisResults({
        result,
        rationale,
        flaggedItems,
        recommendations:
          result === "safe"
            ? [
                "Proceed with standard PMU protocols",
                "Ensure proper aftercare instructions",
                "Schedule follow-up as needed",
              ]
            : result === "precaution"
              ? [
                  "Consider medical clearance",
                  "Inform client of increased risks",
                  "Use modified technique if needed",
                  "Monitor healing closely",
                ]
              : [
                  "Do not proceed with PMU",
                  "Recommend waiting period",
                  "Suggest alternative options",
                  "Document decision",
                ],
      })
      setCurrentStep(3)
    }, 3000)
  }

  const handleNewScreening = () => {
    setIntakeData(null)
    setAnalysisResults(null)
    setCurrentStep(1)
  }

  return (
    <div className="space-y-8">
      {/* Progress Stepper */}
      <Card>
        <CardContent className="p-6">
          <Stepper steps={steps} currentStep={currentStep} />
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 1 && <IntakeFormStep onSubmit={handleIntakeSubmit} />}

      {currentStep === 2 && <IntakeProcessingStep intakeData={intakeData} results={analysisResults} />}

      {currentStep === 3 && analysisResults && (
        <IntakeResultsStep intakeData={intakeData} results={analysisResults} onNewScreening={handleNewScreening} />
      )}
    </div>
  )
}
