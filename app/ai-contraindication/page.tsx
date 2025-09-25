"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Stethoscope, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Loader2,
  ArrowLeft,
  FileText,
  Pill,
  Heart
} from "lucide-react"
import Link from "next/link"
import { NavBar } from "@/components/ui/navbar"

interface ContraindicationResult {
  status: 'safe' | 'precaution' | 'contraindicated'
  confidence: number
  reasoning: string
  recommendations: string[]
  riskFactors: string[]
}

export default function AIContraindicationPage() {
  const [clientName, setClientName] = useState("")
  const [medicalConditions, setMedicalConditions] = useState("")
  const [medications, setMedications] = useState("")
  const [prescriptions, setPrescriptions] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<ContraindicationResult | null>(null)
  const [error, setError] = useState("")

  const handleAnalysis = async () => {
    if (!clientName.trim()) {
      setError("Please enter the client's name")
      return
    }

    if (!medicalConditions.trim() && !medications.trim() && !prescriptions.trim()) {
      setError("Please enter at least one medical condition, medication, or prescription")
      return
    }

    setIsAnalyzing(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch('/api/ai/contraindication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName: clientName.trim(),
          medicalConditions: medicalConditions.trim(),
          medications: medications.trim(),
          prescriptions: prescriptions.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze contraindications')
      }

      const data = await response.json()
      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'precaution':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'contraindicated':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Stethoscope className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'precaution':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'contraindicated':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'safe':
        return 'Safe to Proceed'
      case 'precaution':
        return 'Proceed with Caution'
      case 'contraindicated':
        return 'Not Recommended'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <NavBar currentPath="/ai-contraindication" />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 bg-lavender rounded-full flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-serif">AI Contraindication Check</h1>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Enter client medical information to get AI-powered safety recommendations for PMU procedures
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Input Form */}
          <Card className="border-lavender/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-lavender" />
                Client Medical Information
              </CardTitle>
              <CardDescription>
                Provide client details and medical information for AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Client Name *
                </label>
                <Input
                  placeholder="Enter client's full name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="border-lavender/30 focus:border-lavender"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Medical Conditions
                </label>
                <Textarea
                  placeholder="e.g., Diabetes, High blood pressure, Autoimmune disorders, Skin conditions, etc."
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  className="border-lavender/30 focus:border-lavender min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Current Medications
                </label>
                <Textarea
                  placeholder="e.g., Blood thinners, Steroids, Accutane, Retinoids, etc."
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  className="border-lavender/30 focus:border-lavender min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Prescription Medications
                </label>
                <Textarea
                  placeholder="e.g., Specific prescription names, dosages, duration of use, etc."
                  value={prescriptions}
                  onChange={(e) => setPrescriptions(e.target.value)}
                  className="border-lavender/30 focus:border-lavender min-h-[100px]"
                />
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleAnalysis}
                disabled={isAnalyzing}
                className="w-full bg-lavender hover:bg-lavender/90 text-white gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Stethoscope className="h-4 w-4" />
                    Analyze Contraindications
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card className="border-lavender/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  Analysis Results
                </CardTitle>
                <CardDescription>
                  AI-powered safety assessment for {clientName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status Badge */}
                <div className="flex items-center gap-3">
                  <Badge className={`${getStatusColor(result.status)} text-sm font-semibold px-3 py-1`}>
                    {getStatusText(result.status)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Confidence: {result.confidence}%
                  </span>
                </div>

                {/* Reasoning */}
                <div>
                  <h4 className="font-semibold text-foreground mb-2">AI Analysis</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {result.reasoning}
                  </p>
                </div>

                {/* Recommendations */}
                {result.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Recommendations
                    </h4>
                    <ul className="space-y-1">
                      {result.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Risk Factors */}
                {result.riskFactors.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      Risk Factors Identified
                    </h4>
                    <ul className="space-y-1">
                      {result.riskFactors.map((risk, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => {
                      setResult(null)
                      setClientName("")
                      setMedicalConditions("")
                      setMedications("")
                      setPrescriptions("")
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    New Analysis
                  </Button>
                  <Button
                    onClick={() => {
                      // Copy results to clipboard
                      const resultsText = `AI Contraindication Analysis for ${clientName}\n\nStatus: ${getStatusText(result.status)}\nConfidence: ${result.confidence}%\n\nAnalysis: ${result.reasoning}\n\nRecommendations:\n${result.recommendations.map(r => `• ${r}`).join('\n')}\n\nRisk Factors:\n${result.riskFactors.map(r => `• ${r}`).join('\n')}`
                      navigator.clipboard.writeText(resultsText)
                    }}
                    className="flex-1 bg-lavender hover:bg-lavender/90 text-white"
                  >
                    Copy Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
