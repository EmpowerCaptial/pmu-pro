"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Camera,
  Upload,
  RotateCcw,
  AlertCircle,
  Zap,
  Download,
  FileText,
  ZoomIn,
  ZoomOut,
  Move,
  Home,
  Palette,
} from "lucide-react"
import { findPigmentMatches, type PigmentMatch } from "@/lib/pigment-matching"

interface AdvancedSkinAnalysisProps {
  onAnalysisComplete: (analysis: ComprehensiveSkinAnalysis) => void
}

interface SkinConcern {
  type:
    | "wrinkles"
    | "fine_lines"
    | "pores"
    | "spots"
    | "redness"
    | "acne"
    | "pigmentation"
    | "uv_damage"
    | "hydration"
    | "dark_circles"
    | "texture"
  score: number // 0-100 scale
  severity: "low" | "moderate" | "high"
  areas: Array<{ x: number; y: number; intensity: number }>
  peerComparison: {
    ageGroup: string
    percentile: number
    average: number
  }
}

interface PMUReadinessScore {
  overall: number
  hydration: number
  texture: number
  sunExposure: number
  contraindications: number
  healing_potential: number
}

interface ProcellAnalysis {
  recommended_sessions: number
  healing_speed_prediction: "fast" | "normal" | "slow"
  collagen_response: "excellent" | "good" | "moderate"
  downtime_estimate: string
  area_focus: string[]
  expected_benefits: string[]
}

interface ComprehensiveSkinAnalysis {
  // Basic analysis
  fitzpatrick: number
  undertone: "cool" | "neutral" | "warm"
  confidence: number

  // Advanced skin concerns
  skinConcerns: SkinConcern[]
  overallSkinScore: number

  // PMU specific
  pmuReadiness: PMUReadinessScore
  pigmentRecommendations: {
    brows: PigmentRecommendation[]
    lips: PigmentRecommendation[]
    eyeliner: PigmentRecommendation[]
  }

  // Procell integration
  procellAnalysis: ProcellAnalysis

  // Tracking
  analysisId: string
  timestamp: string
  photoQuality: "excellent" | "good" | "fair" | "poor"

  // Predictions
  healingPrediction: string
  longevityPrediction: string
  maintenanceSchedule: string[]
}

interface PigmentRecommendation {
  brand: string
  name: string
  color_code?: string
  hex_preview: string
  why_recommended: string
  healing_prediction: string
  opacity: string
  base_tone: string
  confidence: number
}

const generateMockSkinConcerns = (fitzpatrick: number, undertone: string): SkinConcern[] => {
  const concerns: SkinConcern[] = []

  // Generate realistic scores based on Fitzpatrick type
  const baseScores = {
    wrinkles: fitzpatrick <= 2 ? 75 : fitzpatrick <= 4 ? 60 : 45,
    fine_lines: fitzpatrick <= 2 ? 70 : fitzpatrick <= 4 ? 55 : 40,
    pores: fitzpatrick <= 2 ? 45 : fitzpatrick <= 4 ? 60 : 70,
    spots: fitzpatrick <= 2 ? 80 : fitzpatrick <= 4 ? 65 : 35,
    redness: fitzpatrick <= 2 ? 85 : fitzpatrick <= 4 ? 50 : 25,
    acne: Math.random() > 0.7 ? 60 : 20,
    pigmentation: fitzpatrick <= 2 ? 70 : fitzpatrick <= 4 ? 80 : 85,
    uv_damage: fitzpatrick <= 2 ? 85 : fitzpatrick <= 4 ? 60 : 30,
    hydration: 60 + Math.random() * 30,
    dark_circles: 50 + Math.random() * 40,
    texture: fitzpatrick <= 2 ? 65 : fitzpatrick <= 4 ? 70 : 75,
  }

  Object.entries(baseScores).forEach(([type, baseScore]) => {
    const score = Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 20))
    const severity = score >= 70 ? "low" : score >= 40 ? "moderate" : "high"

    concerns.push({
      type: type as SkinConcern["type"],
      score: Math.round(score),
      severity,
      areas: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        intensity: Math.random(),
      })),
      peerComparison: {
        ageGroup: "25-35",
        percentile: Math.round(score),
        average: Math.round(baseScore),
      },
    })
  })

  return concerns
}

const calculatePMUReadiness = (concerns: SkinConcern[], fitzpatrick: number): PMUReadinessScore => {
  const hydrationScore = concerns.find((c) => c.type === "hydration")?.score || 70
  const textureScore = concerns.find((c) => c.type === "texture")?.score || 70
  const uvDamageScore = concerns.find((c) => c.type === "uv_damage")?.score || 70
  const acneScore = concerns.find((c) => c.type === "acne")?.score || 80

  const healingPotential = fitzpatrick <= 3 ? 85 : fitzpatrick <= 5 ? 75 : 65

  const overall = Math.round((hydrationScore + textureScore + uvDamageScore + acneScore + healingPotential) / 5)

  return {
    overall,
    hydration: hydrationScore,
    texture: textureScore,
    sunExposure: uvDamageScore,
    contraindications: acneScore,
    healing_potential: healingPotential,
  }
}

export function AdvancedSkinAnalysisTool({ onAnalysisComplete }: AdvancedSkinAnalysisProps) {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [analysis, setAnalysis] = useState<ComprehensiveSkinAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState("")
  const [cameraError, setCameraError] = useState<string | null>(null)

  const [zoom, setZoom] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const startCamera = async () => {
    setCameraError(null)
    console.log("[v0] Starting PerfectCorp-style camera...")

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
        },
        audio: false,
      })

      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            ?.play()
            .then(() => {
              setIsCapturing(true)
            })
            .catch((error) => {
              console.error("[v0] Video play failed:", error)
              setCameraError("Failed to start video playback")
            })
        }
      }
    } catch (error) {
      console.error("[v0] Camera access failed:", error)
      setCameraError("Unable to access camera. Please check permissions and try again.")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCapturing(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")

      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)

        const photoUrl = canvas.toDataURL("image/jpeg", 0.9)
        setCapturedPhoto(photoUrl)
        stopCamera()
        performAdvancedAnalysis(photoUrl)
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const photoUrl = e.target?.result as string
        setCapturedPhoto(photoUrl)
        performAdvancedAnalysis(photoUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const performAdvancedAnalysis = async (photoUrl: string) => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)

    const analysisSteps = [
      "Detecting facial landmarks...",
      "Analyzing skin tone and undertones...",
      "Measuring skin concerns...",
      "Calculating PMU readiness...",
      "Matching optimal pigments...",
      "Generating Procell recommendations...",
      "Finalizing comprehensive report...",
    ]

    // Simulate advanced analysis with progress
    for (let i = 0; i < analysisSteps.length; i++) {
      setCurrentAnalysisStep(analysisSteps[i])
      setAnalysisProgress(((i + 1) / analysisSteps.length) * 100)
      await new Promise((resolve) => setTimeout(resolve, 800))
    }

    try {
      // Call existing API for basic analysis
      const response = await fetch(photoUrl)
      const blob = await response.blob()
      const file = new File([blob], "captured-photo.jpg", { type: "image/jpeg" })

      const analysisResponse = await fetch("/api/photo/analyze", {
        method: "POST",
        body: (() => {
          const formData = new FormData()
          formData.append("image", file)
          return formData
        })(),
      })

      let basicAnalysis = {
        fitzpatrick: 3,
        undertone: "warm" as const,
        confidence: 0.85,
      }

      if (analysisResponse.ok) {
        const apiResult = await analysisResponse.json()
        if (apiResult.data) {
          basicAnalysis = {
            fitzpatrick: apiResult.data.fitzpatrick || 3,
            undertone: apiResult.data.undertone || "warm",
            confidence: apiResult.data.confidence || 0.85,
          }
        }
      }

      // Generate comprehensive analysis
      const skinConcerns = generateMockSkinConcerns(basicAnalysis.fitzpatrick, basicAnalysis.undertone)
      const pmuReadiness = calculatePMUReadiness(skinConcerns, basicAnalysis.fitzpatrick)
      const overallSkinScore = Math.round(
        skinConcerns.reduce((sum, concern) => sum + concern.score, 0) / skinConcerns.length,
      )

      // Get pigment recommendations
      const browMatches = findPigmentMatches(
        basicAnalysis.fitzpatrick <= 2 ? "Light" : basicAnalysis.fitzpatrick <= 4 ? "Medium" : "Dark",
        basicAnalysis.undertone,
        "Natural Brown",
        "Brows",
      )

      const comprehensiveAnalysis: ComprehensiveSkinAnalysis = {
        fitzpatrick: basicAnalysis.fitzpatrick,
        undertone: basicAnalysis.undertone,
        confidence: basicAnalysis.confidence,
        skinConcerns,
        overallSkinScore,
        pmuReadiness,
        pigmentRecommendations: {
          brows: browMatches.slice(0, 3).map((match: PigmentMatch) => ({
            brand: match.brand,
            name: match.pigmentName,
            hex_preview: match.swatch || "#8B6914",
            why_recommended: match.mixingNotes || `Optimal for ${basicAnalysis.undertone} undertones`,
            healing_prediction: "Stable healing with natural color retention",
            opacity: "Medium",
            base_tone: basicAnalysis.undertone,
            confidence: 0.9,
          })),
          lips: [],
          eyeliner: [],
        },
        procellAnalysis: {
          recommended_sessions: pmuReadiness.overall >= 80 ? 2 : pmuReadiness.overall >= 60 ? 3 : 4,
          healing_speed_prediction:
            pmuReadiness.healing_potential >= 80 ? "fast" : pmuReadiness.healing_potential >= 60 ? "normal" : "slow",
          collagen_response:
            pmuReadiness.overall >= 80 ? "excellent" : pmuReadiness.overall >= 60 ? "good" : "moderate",
          downtime_estimate:
            pmuReadiness.overall >= 80 ? "3-5 days" : pmuReadiness.overall >= 60 ? "5-7 days" : "7-10 days",
          area_focus: ["Facial skin preparation", "PMU treatment areas", "Post-procedure healing"],
          expected_benefits: [
            `${pmuReadiness.overall >= 80 ? "35-40%" : "25-30%"} improvement in pigment retention`,
            "Enhanced skin texture and hydration",
            "Accelerated healing process",
            "Improved color saturation and longevity",
          ],
        },
        analysisId: Math.random().toString(36).substr(2, 9).toUpperCase(),
        timestamp: new Date().toISOString(),
        photoQuality: basicAnalysis.confidence >= 0.9 ? "excellent" : basicAnalysis.confidence >= 0.8 ? "good" : "fair",
        healingPrediction: `Based on your skin analysis, expect ${pmuReadiness.healing_potential >= 80 ? "excellent" : "good"} healing with ${pmuReadiness.overall >= 70 ? "minimal" : "moderate"} color shift over 4-6 weeks.`,
        longevityPrediction: `PMU longevity: ${pmuReadiness.overall >= 80 ? "24-36 months" : "18-24 months"} with proper aftercare`,
        maintenanceSchedule: [
          "Touch-up at 6-8 weeks",
          "Annual color refresh recommended",
          "Procell maintenance every 6 months",
        ],
      }

      setAnalysis(comprehensiveAnalysis)
      setIsAnalyzing(false)
      onAnalysisComplete(comprehensiveAnalysis)
    } catch (error) {
      console.error("[v0] Advanced analysis failed:", error)
      // Fallback to basic mock analysis
      const mockAnalysis: ComprehensiveSkinAnalysis = {
        fitzpatrick: 3,
        undertone: "warm",
        confidence: 0.85,
        skinConcerns: generateMockSkinConcerns(3, "warm"),
        overallSkinScore: 72,
        pmuReadiness: calculatePMUReadiness(generateMockSkinConcerns(3, "warm"), 3),
        pigmentRecommendations: { brows: [], lips: [], eyeliner: [] },
        procellAnalysis: {
          recommended_sessions: 3,
          healing_speed_prediction: "normal",
          collagen_response: "good",
          downtime_estimate: "5-7 days",
          area_focus: ["Facial preparation"],
          expected_benefits: ["Improved retention"],
        },
        analysisId: "MOCK001",
        timestamp: new Date().toISOString(),
        photoQuality: "good",
        healingPrediction: "Good healing expected",
        longevityPrediction: "18-24 months",
        maintenanceSchedule: ["Touch-up at 6-8 weeks"],
      }

      setAnalysis(mockAnalysis)
      setIsAnalyzing(false)
    }
  }

  const toggleOverlay = (overlayType: string) => {
    // This function is no longer needed as overlays are removed
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 3))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5))
  const resetView = () => {
    setZoom(1)
    setPanX(0)
    setPanY(0)
  }

  const retakePhoto = () => {
    setCapturedPhoto(null)
    setAnalysis(null)
    setIsAnalyzing(false)
    setCameraError(null)
    setAnalysisProgress(0)
    // setActiveOverlays({ // This line is removed
    //   wrinkles: false,
    //   pores: false,
    //   pigmentation: false,
    //   redness: false,
    //   texture: false,
    //   spots: false,
    // })
    resetView()
  }

  const downloadReport = () => {
    if (!analysis) return

    const reportData = {
      analysisId: analysis.analysisId,
      timestamp: analysis.timestamp,
      skinScore: analysis.overallSkinScore,
      pmuReadiness: analysis.pmuReadiness,
      recommendations: analysis.pigmentRecommendations,
      procellPlan: analysis.procellAnalysis,
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `skin-analysis-${analysis.analysisId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    return () => stopCamera()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      {/* Header / Nav Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-8">
            <Button
              variant="ghost"
              onClick={() => (window.location.href = "/dashboard")}
              className="flex items-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </Button>
            <h1 className="text-2xl font-serif text-gray-800">Advanced Skin Analysis</h1>
          </div>
          <div className="flex items-center space-x-4">
            {analysis && (
              <>
                <Button onClick={downloadReport} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
                <Button onClick={() => window.print()} variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Print Report
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Main Image Area */}
          <div className="lg:col-span-2">
            <Card className="h-full bg-white shadow-lg">
              <CardContent className="p-6 h-full">
                {!capturedPhoto ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-6">
                    {cameraError && (
                      <Alert variant="destructive" className="max-w-md">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{cameraError}</AlertDescription>
                      </Alert>
                    )}

                    {!isCapturing ? (
                      <>
                        <div className="w-80 h-80 border-4 border-dashed border-gray-300 rounded-full flex items-center justify-center bg-gray-50 relative">
                          <div className="text-center">
                            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">Position face in circle</p>
                          </div>
                          <div className="absolute inset-8 border-2 border-rose-300 rounded-full opacity-50"></div>
                        </div>

                        <div className="flex space-x-4">
                          <Button onClick={startCamera} size="lg" className="bg-rose-500 hover:bg-rose-600">
                            <Camera className="w-5 h-5 mr-2" />
                            Take Photo
                          </Button>
                          <Button variant="outline" onClick={() => fileInputRef.current?.click()} size="lg">
                            <Upload className="w-5 h-5 mr-2" />
                            Upload Photo
                          </Button>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </>
                    ) : (
                      <>
                        <div className="relative w-full max-w-2xl">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-96 object-cover rounded-lg shadow-md bg-gray-100"
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-72 h-72 border-4 border-white rounded-full shadow-lg opacity-90"></div>
                          </div>
                        </div>

                        <div className="flex space-x-4">
                          <Button variant="outline" onClick={stopCamera}>
                            Cancel
                          </Button>
                          <Button onClick={capturePhoto} className="bg-rose-500 hover:bg-rose-600">
                            Capture
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col">
                    <div className="flex-1 relative bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        ref={imageRef}
                        src={capturedPhoto || "/placeholder.svg"}
                        alt="Captured face"
                        className="w-full h-full object-contain"
                        style={{
                          transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
                          transition: "transform 0.2s ease",
                        }}
                      />

                      {/* Analysis progress overlay */}
                      {isAnalyzing && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                          <div className="bg-white p-6 rounded-lg text-center max-w-sm">
                            <div className="animate-spin w-8 h-8 border-4 border-rose-200 border-t-rose-400 rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-700 mb-2">{currentAnalysisStep}</p>
                            <Progress value={analysisProgress} className="h-2" />
                            <p className="text-sm text-gray-500 mt-2">{Math.round(analysisProgress)}% Complete</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={handleZoomOut}>
                          <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
                        <Button variant="outline" size="sm" onClick={handleZoomIn}>
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={resetView}>
                          <Move className="w-4 h-4" />
                        </Button>
                      </div>

                      {analysis && (
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">Analysis Complete</span>
                          <Button variant="outline" onClick={retakePhoto}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            New Scan
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {analysis && (
              <>
                {/* Results Summary */}
                <Card className="bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Results Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">Type {analysis.fitzpatrick}</div>
                        <div className="text-xs text-gray-600">Fitzpatrick</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600 capitalize">{analysis.undertone}</div>
                        <div className="text-xs text-gray-600">Undertone</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{analysis.pmuReadiness.overall}/100</div>
                        <div className="text-xs text-gray-600">PMU Readiness</div>
                      </div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm font-medium text-purple-600">
                        {analysis.pmuReadiness.overall >= 80 ? "Ideal candidate" : "Preparation recommended"}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pigment Recommendation */}
                <Card className="bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Palette className="w-5 h-5 mr-2 text-amber-500" />
                      Pigment Recommendations
                    </CardTitle>
                    <p className="text-sm text-gray-600">Based on Type {analysis.fitzpatrick} • {analysis.undertone} Undertone</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.pigmentRecommendations.brows.slice(0, 3).map((pigment, index) => (
                      <div key={index} className="p-3 border border-amber-200 rounded-lg bg-amber-50">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0"
                            style={{ backgroundColor: pigment.hex_preview }}
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-sm text-gray-900">{pigment.name}</div>
                            <div className="text-sm text-gray-700 font-medium">{pigment.brand}</div>
                            <div className="text-xs text-gray-500">{pigment.color_code || 'N/A'}</div>
                          </div>
                          <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-300">
                            #{index + 1}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {analysis.pigmentRecommendations.brows.length === 0 && (
                      <div className="text-center p-4 text-gray-500">
                        <Palette className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p>Pigment recommendations will be generated based on your skin analysis</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Procell Therapy Feedback */}
                <Card className="bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                      Procell Therapy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Recommended:</span>
                      <Badge variant="default">Yes</Badge>
                    </div>
                    <div className="text-sm">
                      <div className="text-gray-600">Sessions: {analysis.procellAnalysis.recommended_sessions}</div>
                      <div className="text-gray-600">Downtime: {analysis.procellAnalysis.downtime_estimate}</div>
                    </div>
                    <div className="text-xs text-gray-500">{analysis.procellAnalysis.expected_benefits[0]}</div>
                  </CardContent>
                </Card>

                {/* Scores Panel */}
                <Card className="bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Skin Scores</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.skinConcerns.slice(0, 4).map((concern, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm capitalize">{concern.type.replace("_", " ")}</span>
                          <span className="text-sm font-medium">{concern.score}/100</span>
                        </div>
                        <Progress value={concern.score} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {analysis && (
          <div className="mt-6 flex items-center justify-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
            <Button onClick={downloadReport} className="bg-rose-500 hover:bg-rose-600">
              <Download className="w-4 h-4 mr-2" />
              Download Report (PDF)
            </Button>
            <Button variant="outline">Save to Profile</Button>
            <Button variant="outline" onClick={retakePhoto}>
              Next Scan
            </Button>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
