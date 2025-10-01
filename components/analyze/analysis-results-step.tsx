"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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
  const handleSaveToClient = async () => {
    try {
      // Get current user email for authentication
      const userEmail = localStorage.getItem('demoUser') ? JSON.parse(localStorage.getItem('demoUser')!).email : null
      
      if (!userEmail) {
        alert('Please log in to save results')
        return
      }

      // For demo purposes, we'll save to a default client
      // In production, this would open a client selection dialog
      const response = await fetch('/api/client-tools/save-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail
        },
        body: JSON.stringify({
          clientId: 'demo-client-001', // This would be selected by user
          toolResult: {
            type: 'skin-analysis',
            toolName: 'Skin Analysis',
            data: results
          }
        })
      })

      if (response.ok) {
        alert('Results saved to client file successfully!')
      } else {
        alert('Failed to save results')
      }
    } catch (error) {
      console.error('Error saving to client:', error)
      alert('Error saving results')
    }
  }

  const handleExportResults = () => {
    try {
      // Create a downloadable JSON file with the results
      const dataStr = JSON.stringify(results, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `skin-analysis-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      alert('Results exported successfully!')
    } catch (error) {
      console.error('Error exporting results:', error)
      alert('Error exporting results')
    }
  }

  const handleSelectPigment = (pigmentId: string) => {
    // Store selected pigment in localStorage for later use
    const selectedPigments = JSON.parse(localStorage.getItem('selectedPigments') || '[]')
    if (!selectedPigments.includes(pigmentId)) {
      selectedPigments.push(pigmentId)
      localStorage.setItem('selectedPigments', JSON.stringify(selectedPigments))
    }
    
    alert(`Pigment ${pigmentId} added to your selection!`)
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
            <Card key={rec.pigmentId} className="p-4">
              <CardHeader>
                <CardTitle className="text-lg">{rec.name}</CardTitle>
                <CardDescription>{rec.brand}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Why:</strong> {rec.why}</p>
                  <p className="text-sm"><strong>Expected Heal Shift:</strong> {rec.expectedHealShift}</p>
                  {index === 0 && (
                    <Badge className="bg-green-100 text-green-800">Top Recommendation</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
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
