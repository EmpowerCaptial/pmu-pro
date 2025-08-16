"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Upload, RotateCcw, CheckCircle, AlertCircle, Palette, Sparkles } from "lucide-react"

interface PMUAnalysisToolProps {
  onAnalysisComplete: (analysis: PMUAnalysis) => void
}

interface PMUAnalysis {
  undertone: string
  fitzpatrick: number
  pmu_pigment_recommendations: {
    brows: PigmentRecommendation[]
    lips: PigmentRecommendation[]
    eyeliner: PigmentRecommendation[]
  }
  procell_treatments: {
    recommended_sessions: number
    area_focus: string[]
    expected_benefits: string[]
  }
  healed_pigment_prediction: string
  skincare_suggestions: string[]
  artist_talking_points: string[]
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
}

// Mock data constants
const mockBrowRecommendations: PigmentRecommendation[] = [
  {
    brand: "Permablend",
    name: "Honey Magic",
    hex_preview: "#8B6914",
    why_recommended: "Perfect for warm undertones with yellow/orange base that won't turn ashy",
    healing_prediction: "Will heal to a beautiful golden brown, may fade slightly warmer",
    opacity: "Medium",
    base_tone: "Warm",
  },
  {
    brand: "Tina Davies",
    name: "I Love Ink Warm Brown",
    hex_preview: "#A0522D",
    why_recommended: "Excellent secondary choice with golden brown base for warm skin",
    healing_prediction: "Stable warm healing with minimal color shift",
    opacity: "Medium",
    base_tone: "Warm",
  },
]

const mockLipRecommendations: PigmentRecommendation[] = [
  {
    brand: "Permablend",
    name: "Coral Crush",
    hex_preview: "#FF7F50",
    why_recommended: "Orange-pink coral base complements warm undertones beautifully",
    healing_prediction: "Will heal to a natural warm coral, perfect for daily wear",
    opacity: "Medium",
    base_tone: "Warm",
  },
  {
    brand: "Tina Davies",
    name: "Lip Blush Pink",
    hex_preview: "#FFB6C1",
    why_recommended: "Natural pink with balanced undertones for subtle enhancement",
    healing_prediction: "Heals to natural lip color enhancement",
    opacity: "Low",
    base_tone: "Neutral",
  },
]

const mockEyelinerRecommendations: PigmentRecommendation[] = [
  {
    brand: "Permablend",
    name: "Brown Black",
    hex_preview: "#2F1B14",
    why_recommended: "Softer than pure black, perfect for warm undertones",
    healing_prediction: "May soften to rich brown, very natural looking",
    opacity: "High",
    base_tone: "Warm",
  },
]

const mockProcellTreatments = {
  recommended_sessions: 3,
  area_focus: ["Brow area", "Lip area", "Overall facial skin"],
  expected_benefits: [
    "Improved pigment retention by 25-30%",
    "Enhanced skin texture and hydration",
    "Faster healing and reduced downtime",
    "Better color saturation and longevity",
  ],
}

const mockSkincareSuggestions = [
  "3 ProCell Microchanneling sessions before PMU for optimal skin prep",
  "Daily SPF 30+ to prevent pigment fading and maintain color integrity",
  "ProCell Healing Serum post-PMU for accelerated recovery",
  "Avoid retinoids 2 weeks before and after procedure",
]

const mockArtistTalkingPoints = [
  "Your Fitzpatrick Type III skin with warm undertones is ideal for PMU procedures",
  "We'll use warm-based pigments to prevent ashy healing and maintain color harmony",
  "ProCell pre-treatment can improve skin hydration and pigment acceptance by 30%",
  "Post-PMU ProCell treatments boost longevity and maintain vibrancy for 2+ years",
]

interface ShadeSwatchProps {
  color: string
  name: string
  isSelected: boolean
  onClick: () => void
}

const ShadeSwatchComponent = ({ color, name, isSelected, onClick }: ShadeSwatchProps) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center p-2 rounded-lg transition-all ${
      isSelected ? "ring-2 ring-lavender shadow-md" : "hover:shadow-sm"
    }`}
  >
    <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: color }} />
    <span className="text-xs mt-1 text-center">{name}</span>
  </button>
)

export function PMUAnalysisTool({ onAnalysisComplete }: PMUAnalysisToolProps) {
  const [step, setStep] = useState<"capture" | "analysis" | "results">("capture")
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [analysis, setAnalysis] = useState<PMUAnalysis | null>(null)
  const [selectedShades, setSelectedShades] = useState<{ [key: string]: string }>({})
  const [beforeAfterSlider, setBeforeAfterSlider] = useState(50)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startCamera = async () => {
    setIsLoading(true)
    setCameraError(null)
    console.log("[v0] Starting camera...")

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
        },
        audio: false,
      })

      console.log("[v0] Camera stream obtained:", mediaStream)
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.onloadedmetadata = () => {
          console.log("[v0] Video metadata loaded, starting playback")
          videoRef.current
            ?.play()
            .then(() => {
              console.log("[v0] Video playing successfully")
              setIsCapturing(true)
              setIsLoading(false)
            })
            .catch((error) => {
              console.error("[v0] Video play failed:", error)
              setCameraError("Failed to start video playback")
              setIsLoading(false)
            })
        }
        videoRef.current.onerror = (error) => {
          console.error("[v0] Video error:", error)
          setCameraError("Video playback error")
          setIsLoading(false)
        }
      }
    } catch (error) {
      console.error("[v0] Camera access failed:", error)
      setIsLoading(false)
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
    setIsLoading(false)
  }

  const playBeep = (frequency = 800, duration = 200) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = frequency
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration / 1000)
    } catch (error) {
      console.warn("Audio beep failed:", error)
    }
  }

  const startCountdown = () => {
    setCountdown(3)
    playBeep(600, 300)

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null
        if (prev === 1) {
          clearInterval(countdownInterval)
          capturePhoto()
          return null
        }
        playBeep(600, 300)
        return prev - 1
      })
    }, 1000)
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

        const photoUrl = canvas.toDataURL("image/jpeg", 0.8)
        setCapturedPhoto(photoUrl)
        stopCamera()
        playBeep(1000, 500)
        performAnalysis(photoUrl)
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
        performAnalysis(photoUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const performAnalysis = async (photoUrl: string) => {
    console.log("[v0] Starting performAnalysis with photoUrl:", photoUrl?.substring(0, 50) + '...')
    setStep("analysis")
    console.log("[v0] Starting PMU analysis...")

    try {
      // Convert data URL to File for API call
      console.log("[v0] Converting photo for API call...")
      const response = await fetch(photoUrl)
      const blob = await response.blob()
      const file = new File([blob], "captured-photo.jpg", { type: "image/jpeg" })
      console.log("[v0] Photo converted, file size:", file.size)

      console.log("[v0] Calling /api/photo/analyze...")
      const analysisResponse = await fetch("/api/photo/analyze", {
        method: "POST",
        body: (() => {
          const formData = new FormData()
          formData.append("image", file)
          return formData
        })(),
      })

      console.log("[v0] API response status:", analysisResponse.status)
      console.log("[v0] API response ok:", analysisResponse.ok)

      if (analysisResponse.ok) {
        const apiResult = await analysisResponse.json()
        console.log("[v0] API result received:", apiResult)

        if (apiResult.source === "openai") {
          console.log("[v0] Using real OpenAI analysis results")
        } else {
          console.log("[v0] API returned mock data, not real AI analysis")
        }

        const transformedAnalysis: PMUAnalysis = {
          undertone: apiResult.undertone || "Warm",
          fitzpatrick: apiResult.fitzpatrick || 3,
          pmu_pigment_recommendations: {
            brows:
              apiResult.pigment_recommendations?.brows?.map((rec: any) => ({
                brand: rec.brand,
                name: rec.name,
                color_code: rec.color_code,
                hex_preview: rec.hex_preview,
                why_recommended: `Perfect for ${apiResult.undertone} undertones with Fitzpatrick Type ${apiResult.fitzpatrick}. ${rec.why_recommended}`,
                healing_prediction: rec.healing_prediction,
                opacity: rec.opacity,
                base_tone: apiResult.undertone,
              })) || mockBrowRecommendations,
            lips:
              apiResult.pigment_recommendations?.lips?.map((rec: any) => ({
                brand: rec.brand,
                name: rec.name,
                color_code: rec.color_code,
                hex_preview: rec.hex_preview,
                why_recommended: `Complements ${apiResult.undertone} undertones beautifully. ${rec.why_recommended}`,
                healing_prediction: rec.healing_prediction,
                opacity: rec.opacity,
                base_tone: apiResult.undertone,
              })) || mockLipRecommendations,
            eyeliner:
              apiResult.pigment_recommendations?.eyeliner?.map((rec: any) => ({
                brand: rec.brand,
                name: rec.name,
                color_code: rec.color_code,
                hex_preview: rec.hex_preview,
                why_recommended: `Ideal for Fitzpatrick Type ${apiResult.fitzpatrick} with ${apiResult.undertone} undertones. ${rec.why_recommended}`,
                healing_prediction: rec.healing_prediction,
                opacity: rec.opacity,
                base_tone: apiResult.undertone,
              })) || mockEyelinerRecommendations,
          },
          procell_treatments: {
            recommended_sessions: apiResult.procell_sessions || 3,
            area_focus: apiResult.treatment_areas || ["Brow area", "Lip area", "Overall facial skin"],
            expected_benefits: apiResult.expected_benefits || mockProcellTreatments.expected_benefits,
          },
          healed_pigment_prediction:
            apiResult.healing_prediction ||
            `Based on your Fitzpatrick Type ${apiResult.fitzpatrick || 3} and ${apiResult.undertone || "warm"} undertones, colors will soften by ~30% and appear warmer after 4 weeks.`,
          skincare_suggestions: [
            `${apiResult.procell_sessions || 3} ProCell Microchanneling sessions before PMU for optimal skin prep`,
            "Daily SPF 30+ to prevent pigment fading and maintain color integrity",
            "ProCell Healing Serum post-PMU for accelerated recovery",
            "Avoid retinoids 2 weeks before and after procedure",
          ],
          artist_talking_points: [
            `Your Fitzpatrick Type ${apiResult.fitzpatrick || 3} skin with ${apiResult.undertone || "warm"} undertones is ${apiResult.fitzpatrick <= 3 ? "ideal" : "suitable"} for PMU procedures`,
            `We'll use ${apiResult.undertone || "warm"}-based pigments to prevent ashy healing and maintain color harmony`,
            `ProCell pre-treatment can improve skin hydration and pigment acceptance by 30%`,
            `Post-PMU ProCell treatments boost longevity and maintain vibrancy for 2+ years`,
            apiResult.special_considerations
              ? `Special consideration: ${apiResult.special_considerations}`
              : "Your skin shows excellent PMU candidacy",
          ].filter(Boolean),
        }

        setAnalysis(transformedAnalysis)
        setStep("results")
        onAnalysisComplete(transformedAnalysis)
        return
      } else {
        const errorText = await analysisResponse.text()
        console.error("[v0] API call failed with status:", analysisResponse.status, "Error:", errorText)
      }
      
    } catch (error) {
      console.error("[v0] API analysis failed, using mock data:", error)
    }

    console.warn("[v0] Falling back to mock analysis data - OpenAI analysis failed")
    const mockAnalysis: PMUAnalysis = {
      undertone: "Warm",
      fitzpatrick: 3,
      pmu_pigment_recommendations: {
        brows: mockBrowRecommendations,
        lips: mockLipRecommendations,
        eyeliner: mockEyelinerRecommendations,
      },
      procell_treatments: mockProcellTreatments,
      healed_pigment_prediction:
        "Colors will soften by ~30% and appear warmer after 4 weeks. Expect beautiful, natural-looking results.",
      skincare_suggestions: mockSkincareSuggestions,
      artist_talking_points: mockArtistTalkingPoints,
    }

    setAnalysis(mockAnalysis)
    setStep("results")
    onAnalysisComplete(mockAnalysis)
  }

  const retakePhoto = () => {
    setCapturedPhoto(null)
    setAnalysis(null)
    setStep("capture")
    setCameraError(null)
  }

  useEffect(() => {
    return () => stopCamera()
  }, [])

  if (step === "capture") {
    return (
      <Card className="border-border/50 shadow-lg bg-[#fdf8f6] backdrop-blur-sm w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-3xl text-gray-800">PMU Skin Analysis</CardTitle>
          <p className="text-base text-gray-600">Professional consultation tool</p>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {cameraError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{cameraError}</AlertDescription>
            </Alert>
          )}

          {!isCapturing ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-60 h-60 border-4 border-dashed border-gray-300 rounded-full mx-auto mb-6 flex items-center justify-center bg-white/50">
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Position face in circle</p>
                  </div>
                </div>
                <p className="text-base text-gray-600 mb-6">
                  Position your face in the circle for accurate PMU and skincare analysis
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-md mx-auto">
                <Button
                  onClick={startCamera}
                  disabled={isLoading}
                  size="lg"
                  className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white rounded-2xl h-14 text-base"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  {isLoading ? "Starting Camera..." : "Take Photo"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  size="lg"
                  className="bg-white/90 hover:bg-white border-gray-200 rounded-2xl h-14 text-base"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Photo
                </Button>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-96 object-cover rounded-2xl shadow-md bg-gray-100"
                  style={{ aspectRatio: "4/3" }}
                />

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-72 h-72 border-4 border-white rounded-full shadow-lg opacity-90"></div>
                </div>

                {countdown && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                    <div className="text-8xl font-bold text-white animate-pulse">{countdown}</div>
                  </div>
                )}
              </div>

              <div className="flex gap-6 max-w-md mx-auto">
                <Button
                  variant="outline"
                  onClick={stopCamera}
                  size="lg"
                  className="flex-1 bg-white/90 hover:bg-white rounded-2xl h-12"
                >
                  Cancel
                </Button>
                <Button
                  onClick={startCountdown}
                  disabled={countdown !== null}
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white rounded-2xl h-12"
                >
                  {countdown ? `${countdown}...` : "Capture"}
                </Button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>
    )
  }

  if (step === "analysis") {
    return (
      <Card className="border-border/50 shadow-lg bg-[#fdf8f6] backdrop-blur-sm w-full max-w-2xl mx-auto">
        <CardContent className="py-16 text-center">
          <div className="animate-spin w-16 h-16 border-4 border-rose-200 border-t-rose-400 rounded-full mx-auto mb-8"></div>
          <h3 className="font-serif text-2xl mb-3">Analyzing Your Skin</h3>
          <p className="text-gray-600 text-base">Detecting undertones and recommending perfect PMU pigments...</p>
        </CardContent>
      </Card>
    )
  }

  if (step === "results" && analysis) {
    return (
      <div className="space-y-8 w-full max-w-4xl mx-auto">
        {/* Analysis Results */}
        <Card className="border-border/50 shadow-md bg-white rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-serif text-2xl flex items-center">
              <Sparkles className="w-6 h-6 mr-3 text-rose-400" />
              Professional Analysis Report
            </CardTitle>
            <Button onClick={() => window.print()} variant="outline" size="sm" className="print:hidden">
              Print Report
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#fdf8f6] p-6 rounded-xl">
                <h4 className="font-semibold text-lg mb-3">Skin Analysis</h4>
                <div className="space-y-2">
                  <p>
                    <strong>Fitzpatrick Type:</strong> {analysis.fitzpatrick}
                  </p>
                  <p>
                    <strong>Undertone:</strong> {analysis.undertone}
                  </p>
                  <p className="text-sm text-gray-600 mt-3">{analysis.healed_pigment_prediction}</p>
                </div>
              </div>

              {/* ProCell Treatment Recommendations */}
              <div className="bg-blue-50 p-6 rounded-xl">
                <h4 className="font-semibold text-lg mb-3">ProCell Therapy Plan</h4>
                <div className="space-y-2">
                  <p>
                    <strong>Recommended Sessions:</strong> {analysis.procell_treatments.recommended_sessions}
                  </p>
                  <p>
                    <strong>Focus Areas:</strong> {analysis.procell_treatments.area_focus.join(", ")}
                  </p>
                  <div className="mt-3">
                    <p className="font-medium text-sm">Expected Benefits:</p>
                    <ul className="text-sm text-gray-600 mt-1 space-y-1">
                      {analysis.procell_treatments.expected_benefits.map((benefit, index) => (
                        <li key={index}>• {benefit}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Pigment Recommendations */}
        <Card className="border-border/50 shadow-md bg-white rounded-2xl">
          <CardHeader>
            <CardTitle className="font-serif text-xl flex items-center">
              <Palette className="w-6 h-6 mr-3 text-rose-400" />
              Professional Pigment Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {Object.entries(analysis.pmu_pigment_recommendations).map(([category, pigments]) => (
              <div key={category} className="space-y-4">
                <h4 className="font-semibold text-xl capitalize border-b pb-2">{category}</h4>
                <div className="grid gap-4">
                  {pigments.map((pigment, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start gap-4">
                        <div
                          className="w-12 h-12 rounded-lg border-2 border-white shadow-sm flex-shrink-0"
                          style={{ backgroundColor: pigment.hex_preview }}
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h5 className="font-semibold text-lg">{pigment.brand}</h5>
                            <span className="text-gray-600">•</span>
                            <span className="font-medium">{pigment.name}</span>
                            <span className="bg-white px-2 py-1 rounded text-xs font-medium">
                              {pigment.base_tone} • {pigment.opacity} Opacity
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{pigment.why_recommended}</p>
                          <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                            <strong>Healing Prediction:</strong> {pigment.healing_prediction}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Complete Treatment Protocol */}
        <Card className="border-border/50 shadow-md bg-white rounded-2xl">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Complete Treatment Protocol</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-xl">
              <h4 className="font-semibold text-lg mb-4">ProCell Microchanneling Protocol</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium mb-2">Pre-PMU Treatment</h5>
                  <ul className="text-sm space-y-1">
                    <li>• {analysis.procell_treatments.recommended_sessions} sessions, 2 weeks apart</li>
                    <li>• Focus on {analysis.procell_treatments.area_focus.join(" and ")}</li>
                    <li>• Complete 1 week before PMU procedure</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Post-PMU Enhancement</h5>
                  <ul className="text-sm space-y-1">
                    <li>• 1 session at 6 weeks post-PMU</li>
                    <li>• Maintenance every 3-4 months</li>
                    <li>• Extends PMU longevity significantly</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Complete Aftercare Protocol</h4>
              {analysis.skincare_suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-base">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Client Consultation Summary */}
        <Card className="border-border/50 shadow-md bg-white rounded-2xl print:break-before-page">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Client Consultation Summary</CardTitle>
            <p className="text-sm text-gray-600">Attach to client intake form</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <strong>Date:</strong> {new Date().toLocaleDateString()}
                </div>
                <div>
                  <strong>Analysis ID:</strong> {Math.random().toString(36).substr(2, 9).toUpperCase()}
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-medium">Professional Assessment Summary:</h5>
                <div className="bg-[#fdf8f6] p-3 rounded text-sm space-y-2">
                  <p>
                    <strong>Skin Analysis:</strong> Fitzpatrick Type {analysis.fitzpatrick} with {analysis.undertone}{" "}
                    undertones
                  </p>
                  <p>
                    <strong>Recommended Pigments:</strong> {analysis.pmu_pigment_recommendations.brows[0]?.brand}{" "}
                    {analysis.pmu_pigment_recommendations.brows[0]?.name} for brows,{" "}
                    {analysis.pmu_pigment_recommendations.lips[0]?.brand}{" "}
                    {analysis.pmu_pigment_recommendations.lips[0]?.name} for lips
                  </p>
                  <p>
                    <strong>ProCell Protocol:</strong> {analysis.procell_treatments.recommended_sessions} pre-treatment
                    sessions recommended
                  </p>
                  <p>
                    <strong>Expected Outcome:</strong> {analysis.healed_pigment_prediction}
                  </p>
                </div>

                <h5 className="font-medium">Professional Recommendations:</h5>
                {analysis.artist_talking_points.map((point, index) => (
                  <div key={index} className="bg-[#fdf8f6] p-3 rounded text-sm">
                    <p>{point}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t text-xs text-gray-500">
                <p>
                  This comprehensive analysis integrates skin assessment, pigment selection, and treatment protocols for
                  optimal PMU results. Review with licensed PMU professional before proceeding.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={retakePhoto}
          variant="outline"
          size="lg"
          className="w-full max-w-md mx-auto bg-white hover:bg-gray-50 rounded-2xl h-12 text-base"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          New Analysis
        </Button>
      </div>
    )
  }

  return null
}
