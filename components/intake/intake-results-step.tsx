"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RiskPill } from "@/components/ui/risk-pill"
import { ResultPanel } from "@/components/ui/result-panel"
import { Save, Download, Plus, FileText, AlertTriangle } from "lucide-react"
import type { IntakeData } from "./contraindication-workflow"

interface IntakeResultsStepProps {
  intakeData: IntakeData | null
  results: {
    result: "safe" | "precaution" | "not_recommended"
    rationale: string
    flaggedItems: string[]
    recommendations: string[]
  }
  onNewScreening: () => void
}

export function IntakeResultsStep({ intakeData, results, onNewScreening }: IntakeResultsStepProps) {
  const handleSaveToClient = () => {
    // TODO: Implement save to client functionality
    console.log("Save to client")
  }

  const handleExportConsent = () => {
    // TODO: Implement export consent form functionality
    console.log("Export consent form")
  }

  const getRiskColor = (result: string) => {
    switch (result) {
      case "safe":
        return "text-green-600"
      case "precaution":
        return "text-yellow-600"
      case "not_recommended":
        return "text-red-600"
      default:
        return "text-muted-foreground"
    }
  }

  const getRiskDescription = (result: string) => {
    switch (result) {
      case "safe":
        return "Client is suitable for PMU procedures with standard protocols"
      case "precaution":
        return "Proceed with caution - special considerations required"
      case "not_recommended":
        return "PMU procedure is not recommended at this time"
      default:
        return "Assessment complete"
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Results */}
      <ResultPanel
        title="Contraindication Assessment"
        description={getRiskDescription(results.result)}
        result={results.result}
        details={[
          {
            label: "Risk Level",
            value: <RiskPill risk={results.result} />,
          },
          {
            label: "Flagged Items",
            value:
              results.flaggedItems.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {results.flaggedItems.map((item, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              ) : (
                "None"
              ),
          },
          {
            label: "Assessment Date",
            value: new Date().toLocaleDateString(),
          },
        ]}
        recommendations={results.recommendations}
        actions={[
          {
            label: "Save to Client",
            onClick: handleSaveToClient,
            variant: "default",
            icon: <Save className="h-4 w-4" />,
          },
          {
            label: "Export Consent",
            onClick: handleExportConsent,
            variant: "outline",
            icon: <Download className="h-4 w-4" />,
          },
        ]}
      />

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detailed Analysis
          </CardTitle>
          <CardDescription>AI assessment rationale and clinical considerations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2">Clinical Rationale:</h4>
            <p className="text-sm text-muted-foreground">{results.rationale}</p>
          </div>

          {results.flaggedItems.length > 0 && (
            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <h4 className="font-medium text-yellow-800">Items Requiring Attention:</h4>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                {results.flaggedItems.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-yellow-600 rounded-full"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Information Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Client Information Summary</CardTitle>
          <CardDescription>Medical history provided for this assessment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Medical Conditions:</h4>
              <div className="flex flex-wrap gap-1">
                {intakeData?.conditions.map((condition, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Current Medications:</h4>
              <div className="flex flex-wrap gap-1">
                {intakeData?.medications.map((medication, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {medication}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {intakeData?.notes && (
            <div>
              <h4 className="font-medium mb-2">Additional Notes:</h4>
              <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">{intakeData.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={onNewScreening} className="gap-2">
              <Plus className="h-4 w-4" />
              New Screening
            </Button>
            <Button variant="outline" onClick={handleExportConsent} className="gap-2 bg-transparent">
              <FileText className="h-4 w-4" />
              Generate Consent Form
            </Button>
            <Button variant="outline" onClick={() => window.history.back()} className="bg-transparent">
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
