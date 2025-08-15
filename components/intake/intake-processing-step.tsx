"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Brain, Shield, Search, FileCheck } from "lucide-react"
import { useState, useEffect } from "react"
import type { IntakeData } from "./contraindication-workflow"

interface IntakeProcessingStepProps {
  intakeData: IntakeData | null
  results: any
}

const analysisSteps = [
  { icon: Search, label: "Normalizing medications and conditions", duration: 1000 },
  { icon: Shield, label: "Checking contraindication database", duration: 1500 },
  { icon: Brain, label: "AI risk assessment analysis", duration: 1000 },
  { icon: FileCheck, label: "Generating recommendations", duration: 500 },
]

export function IntakeProcessingStep({ intakeData, results }: IntakeProcessingStepProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (results) return // Analysis complete

    const totalDuration = analysisSteps.reduce((sum, step) => sum + step.duration, 0)
    let elapsed = 0

    const interval = setInterval(() => {
      elapsed += 100
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100)
      setProgress(newProgress)

      // Update current step
      let stepElapsed = 0
      for (let i = 0; i < analysisSteps.length; i++) {
        stepElapsed += analysisSteps[i].duration
        if (elapsed <= stepElapsed) {
          setCurrentStepIndex(i)
          break
        }
      }

      if (elapsed >= totalDuration) {
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [results])

  return (
    <div className="space-y-6">
      {/* Intake Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-lg bg-muted/30 flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Analyzing Client Safety Profile</h3>
              <p className="text-muted-foreground mb-4">
                Our AI is reviewing the medical history and medications to assess PMU procedure safety.
              </p>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Conditions:</span>{" "}
                  <span className="font-medium">{intakeData?.conditions.join(", ") || "None reported"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Medications:</span>{" "}
                  <span className="font-medium">{intakeData?.medications.join(", ") || "None reported"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Safety Assessment
          </CardTitle>
          <CardDescription>Processing medical information for contraindication analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Assessment Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-4">
            {analysisSteps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStepIndex && !results
              const isComplete = index < currentStepIndex || results
              const isUpcoming = index > currentStepIndex && !results

              return (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      isComplete
                        ? "border-primary bg-primary text-primary-foreground"
                        : isActive
                          ? "border-primary bg-background text-primary"
                          : "border-muted-foreground bg-background text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span
                    className={`text-sm ${
                      isComplete
                        ? "text-primary font-medium"
                        : isActive
                          ? "text-primary font-medium"
                          : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                    {isActive && !results && "..."}
                    {isComplete && " ✓"}
                  </span>
                </div>
              )
            })}
          </div>

          {results && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-green-600">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Safety Assessment Complete!</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
