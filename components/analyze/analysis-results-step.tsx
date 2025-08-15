"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PigmentCard } from "@/components/ui/pigment-card"
import { ResultPanel } from "@/components/ui/result-panel"
import { Save, Download, RotateCcw, Plus, Share } from "lucide-react"

interface AnalysisResultsStepProps {
  photo: string | null
  results: {
    fitzpatrick: number
    undertone: string
    confidence: number
    recommendations: Array<{
      pigmentId: string
      name: string
      brand: string
      why: string
      expectedHealShift: string
    }>
  }
  onRetake: () => void
  onNewAnalysis: () => void
}

export function AnalysisResultsStep({ photo, results, onRetake, onNewAnalysis }: AnalysisResultsStepProps) {
  const handleSaveToClient = () => {
    // TODO: Implement save to client functionality
    console.log("Save to client")
  }

  const handleExportResults = () => {
    // TODO: Implement export functionality
    console.log("Export results")
  }

  const handleSelectPigment = (pigmentId: string) => {
    // TODO: Implement pigment selection
    console.log("Selected pigment:", pigmentId)
  }

  return (
    <div className="space-y-6">
      {/* Analysis Summary */}
      <ResultPanel
        title="Skin Analysis Results"
        description="AI-powered Fitzpatrick classification and undertone analysis"
        confidence={results.confidence}
        details={[
          {
            label: "Fitzpatrick Type",
            value: (
              <Badge variant="outline" className="font-medium">
                Type {results.fitzpatrick}
              </Badge>
            ),
          },
          {
            label: "Undertone",
            value: (
              <Badge variant="outline" className="font-medium capitalize">
                {results.undertone}
              </Badge>
            ),
          },
          {
            label: "Confidence Score",
            value: `${Math.round(results.confidence * 100)}%`,
          },
        ]}
        recommendations={[
          "Based on your Fitzpatrick type and undertones, we recommend starting with medium opacity pigments",
          "Consider patch testing before full procedure",
          "Monitor healing for 4-6 weeks to assess final color result",
        ]}
        actions={[
          {
            label: "Save to Client",
            onClick: handleSaveToClient,
            variant: "default",
            icon: <Save className="h-4 w-4" />,
          },
          {
            label: "Export Report",
            onClick: handleExportResults,
            variant: "outline",
            icon: <Download className="h-4 w-4" />,
          },
          {
            label: "Retake Photo",
            onClick: onRetake,
            variant: "outline",
            icon: <RotateCcw className="h-4 w-4" />,
          },
        ]}
      />

      {/* Photo Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Photo</CardTitle>
          <CardDescription>Reference photo used for this analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <img
              src={photo || "/placeholder.svg"}
              alt="Analysis reference"
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Photo captured on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  Good Quality
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Natural Lighting
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pigment Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Recommended Pigments</h3>
            <p className="text-sm text-muted-foreground">
              AI-selected pigments based on your Fitzpatrick type and undertones
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {results.recommendations.map((rec, index) => (
            <PigmentCard
              key={rec.pigmentId}
              pigment={{
                id: rec.pigmentId,
                name: rec.name,
                brand: rec.brand,
                baseTone: index === 0 ? "neutral" : index === 1 ? "warm" : "cool",
                hueNotes: index === 0 ? "balanced undertones" : index === 1 ? "golden base" : "ash undertones",
                opacity: "medium",
                idealFitz: `${results.fitzpatrick - 1}-${results.fitzpatrick + 1}`,
                tempShift: rec.expectedHealShift,
                useCase: "brows",
                hexPreview: index === 0 ? "#8B6914" : index === 1 ? "#A0522D" : "#696969",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              }}
              recommendation={{
                why: rec.why,
                expectedHealShift: rec.expectedHealShift,
              }}
              isRecommended={index === 0}
              onSelect={() => handleSelectPigment(rec.pigmentId)}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={onNewAnalysis} className="gap-2">
              <Plus className="h-4 w-4" />
              New Analysis
            </Button>
            <Button variant="outline" onClick={handleExportResults} className="gap-2 bg-transparent">
              <Share className="h-4 w-4" />
              Share Results
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
