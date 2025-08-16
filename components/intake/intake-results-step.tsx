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
    const clientData = {
      intakeData,
      results,
      timestamp: new Date().toISOString(),
      analysisId: `analysis_${Date.now()}`,
    }

    // Save to localStorage for now (in production, this would be an API call)
    const existingClients = JSON.parse(localStorage.getItem("pmu_clients") || "[]")
    const updatedClients = existingClients.map((client: any) => {
      if (client.id === intakeData?.clientId) {
        return {
          ...client,
          analyses: [...(client.analyses || []), clientData],
          lastAnalysis: clientData,
          lastResult: results.result,
        }
      }
      return client
    })

    localStorage.setItem("pmu_clients", JSON.stringify(updatedClients))
    alert("Analysis saved to client file successfully!")
  }

  const handleExportConsent = () => {
    const consentForm = {
      clientName: intakeData?.clientId || "Client",
      date: new Date().toLocaleDateString(),
      riskLevel: results.result,
      flaggedItems: results.flaggedItems,
      recommendations: results.recommendations,
      rationale: results.rationale,
      artistSignature: "Digital Signature",
      clientSignature: "To be signed by client",
    }

    // Create downloadable consent form
    const consentText = `
PMU CONSENT FORM

Client: ${consentForm.clientName}
Date: ${consentForm.date}
Risk Assessment: ${consentForm.riskLevel.toUpperCase()}

FLAGGED ITEMS:
${consentForm.flaggedItems.map((item) => `• ${item}`).join("\n")}

RECOMMENDATIONS:
${consentForm.recommendations.map((rec) => `• ${rec}`).join("\n")}

CLINICAL RATIONALE:
${consentForm.rationale}

By signing below, I acknowledge that I have been informed of the risks and recommendations for my PMU procedure.

Client Signature: ___________________________ Date: ___________

Artist Signature: ___________________________ Date: ___________
    `

    const blob = new Blob([consentText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `consent_form_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
                <div className="flex flex-wrap gap-1 max-w-full">
                  {results.flaggedItems.map((item, index) => (
                    <Badge key={index} variant="outline" className="text-xs break-words max-w-full">
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
          <div className="p-3 sm:p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2">Clinical Rationale:</h4>
            <p className="text-sm text-muted-foreground break-words leading-relaxed">{results.rationale}</p>
          </div>

          {results.flaggedItems.length > 0 && (
            <div className="p-3 sm:p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                <h4 className="font-medium text-yellow-800 break-words">Items Requiring Attention:</h4>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                {results.flaggedItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="break-words">{item}</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Medical Conditions:</h4>
              <div className="flex flex-wrap gap-1 max-w-full">
                {intakeData?.conditions.map((condition, index) => (
                  <Badge key={index} variant="outline" className="text-xs break-words max-w-full">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Current Medications:</h4>
              <div className="flex flex-wrap gap-1 max-w-full">
                {intakeData?.medications.map((medication, index) => (
                  <Badge key={index} variant="outline" className="text-xs break-words max-w-full">
                    {medication}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {intakeData?.notes && (
            <div>
              <h4 className="font-medium mb-2">Additional Notes:</h4>
              <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg break-words leading-relaxed">
                {intakeData.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
            <Button onClick={onNewScreening} className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              New Screening
            </Button>
            <Button variant="outline" onClick={handleExportConsent} className="gap-2 bg-transparent w-full sm:w-auto">
              <FileText className="h-4 w-4" />
              Generate Consent Form
            </Button>
            <Button variant="outline" onClick={() => window.history.back()} className="bg-transparent w-full sm:w-auto">
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
