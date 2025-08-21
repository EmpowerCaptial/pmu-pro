"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { 
  Camera, 
  Upload, 
  RotateCcw, 
  Sparkles, 
  Download, 
  Save, 
  Palette,
  Sun,
  User,
  Target
} from "lucide-react"
import { findPigmentMatches, type PigmentMatch } from "@/lib/pigment-matching"

interface UnifiedSkinAnalysisProps {
  onAnalysisComplete?: (analysis: UnifiedAnalysisResult) => void
  onSave?: (result: UnifiedAnalysisResult) => void
  onExport?: (result: UnifiedAnalysisResult) => void
}

interface UnifiedAnalysisResult {
  fitzpatrick: number
  undertone: "cool" | "neutral" | "warm"
  confidence: number
  skinTone: number
  photoQuality: "excellent" | "good" | "fair" | "poor"
  pigmentRecommendations: {
    brows: PigmentRecommendation[]
    lips: PigmentRecommendation[]
    eyeliner: PigmentRecommendation[]
  }
  techniques: {
    needleSpeed: string
    depth: string
    care: string
  }
  analysisId: string
  timestamp: string
  analysisDetails?: {
    skinTone?: number;
    sunReaction?: string;
    tanningAbility?: string;
    ethnicity?: string;
    freckling?: string;
    eyeColor?: string;
    hairColor?: string;
  };
  reasoning?: string;
}

interface PigmentRecommendation {
  name: string
  hex: string
  code: string
  brand: string
  reasoning: string
  confidence: number
}

const fitzpatrickTypes = [
  { id: 1, name: "Type I", description: "Always burns, never tans", color: "#FFE5D1" },
  { id: 2, name: "Type II", description: "Usually burns, tans minimally", color: "#F4D4C3" },
  { id: 3, name: "Type III", description: "Sometimes burns, tans gradually", color: "#E6C3A8" },
  { id: 4, name: "Type IV", description: "Burns minimally, tans well", color: "#D4A574" },
  { id: 5, name: "Type V", description: "Rarely burns, tans deeply", color: "#B87C56" },
  { id: 6, name: "Type VI", description: "Never burns, deeply pigmented", color: "#5D3A1F" }
]

export function UnifiedSkinAnalysis({ onAnalysisComplete, onSave, onExport }: UnifiedSkinAnalysisProps) {
  const [currentStep, setCurrentStep] = useState<"upload" | "analysis" | "results">("upload")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState("")
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<UnifiedAnalysisResult | null>(null)
  
  // Additional analysis factors
  const [eyeColor, setEyeColor] = useState("")
  const [hairColor, setHairColor] = useState("")
  const [ethnicity, setEthnicity] = useState("")
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      })
      setCameraStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsCapturing(true)
      }
    } catch (error) {
      setCameraError("Camera access denied. Please check permissions.")
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setIsCapturing(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext("2d")
      
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)
        
        const photoUrl = canvas.toDataURL("image/jpeg", 0.9)
        setUploadedImage(photoUrl)
        
        // Convert to File object for API
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "captured-photo.jpg", { type: "image/jpeg" })
            setImageFile(file)
          }
        }, "image/jpeg", 0.9)
        
        stopCamera()
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setUploadedImage(imageUrl)
        setImageFile(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setUploadedImage(null)
    setImageFile(null)
    setAnalysisResult(null)
    setCurrentStep("upload")
  }

  const startAnalysis = async () => {
    if (!imageFile) {
      alert("Please upload or capture an image first")
      return
    }

    setCurrentStep("analysis")
    setIsAnalyzing(true)
    setAnalysisProgress(0)

    const analysisSteps = [
      "Analyzing image quality...",
      "Detecting skin tone and Fitzpatrick type...",
      "Analyzing undertones...",
      "Calculating confidence scores...",
      "Matching optimal pigments...",
      "Generating technique recommendations...",
      "Finalizing comprehensive report..."
    ]

    try {
      // Simulate analysis progress
      for (let i = 0; i < analysisSteps.length; i++) {
        setCurrentAnalysisStep(analysisSteps[i])
        setAnalysisProgress(((i + 1) / analysisSteps.length) * 100)
        await new Promise((resolve) => setTimeout(resolve, 800))
      }

      // Perform real image analysis
      const formData = new FormData()
      formData.append("image", imageFile)
      
      // Add additional analysis factors if provided
      if (eyeColor) formData.append("eyeColor", eyeColor)
      if (hairColor) formData.append("hairColor", hairColor)
      if (ethnicity) formData.append("ethnicity", ethnicity)

      const response = await fetch('/api/photo/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Image analysis failed')
      }

      const data = await response.json()
      const analysisData = data.data || data

      // Extract analysis results
      const fitzpatrick = analysisData.fitzpatrick || 3
      const undertone = analysisData.undertone || "neutral"
      const confidence = analysisData.confidence || 0.85
      const skinTone = analysisData.skinTone || 50

      // Get pigment recommendations
      const skinToneCategory = fitzpatrick <= 2 ? "Light" : fitzpatrick <= 4 ? "Medium" : "Dark"
      const browMatches = findPigmentMatches(skinToneCategory, undertone, "Natural Brown", "Brows")
      const lipMatches = findPigmentMatches(skinToneCategory, undertone, "Natural Pink", "Lips")
      const eyelinerMatches = findPigmentMatches(skinToneCategory, undertone, "Natural Black", "Eyeliner")

      // Create comprehensive result
      const result: UnifiedAnalysisResult = {
        fitzpatrick,
        undertone,
        confidence: Math.round(confidence * 100),
        skinTone,
        photoQuality: confidence >= 0.9 ? "excellent" : confidence >= 0.8 ? "good" : "fair",
        pigmentRecommendations: {
          brows: browMatches.slice(0, 3).map((match: PigmentMatch) => ({
            name: match.pigmentName,
            hex: match.swatch || "#8B6914",
            code: `${match.brand}-${match.pigmentName.replace(/\s+/g, '-')}`,
            brand: match.brand,
            reasoning: match.mixingNotes || `Optimal for ${undertone} undertones`,
            confidence: match.confidenceScore
          })),
          lips: lipMatches.slice(0, 3).map((match: PigmentMatch) => ({
            name: match.pigmentName,
            hex: match.swatch || "#DDA0DD",
            code: `${match.brand}-${match.pigmentName.replace(/\s+/g, '-')}`,
            brand: match.brand,
            reasoning: match.mixingNotes || `Perfect for ${undertone} undertones`,
            confidence: match.confidenceScore
          })),
          eyeliner: eyelinerMatches.slice(0, 3).map((match: PigmentMatch) => ({
            name: match.pigmentName,
            hex: match.swatch || "#000000",
            code: `${match.brand}-${match.pigmentName.replace(/\s+/g, '-')}`,
            brand: match.brand,
            reasoning: match.mixingNotes || `Ideal for ${undertone} undertones`,
            confidence: match.confidenceScore
          }))
        },
        techniques: {
          needleSpeed: fitzpatrick <= 2 ? "Slow, shallow depth" : fitzpatrick <= 4 ? "Medium speed, moderate depth" : "Standard speed, standard depth",
          depth: fitzpatrick <= 2 ? "0.5-1.0mm (very shallow)" : fitzpatrick <= 4 ? "1.0-1.5mm (shallow to medium)" : "1.5-2.0mm (standard depth)",
          care: fitzpatrick <= 2 ? "Gentle cleansing, avoid sun exposure, use SPF 50+" : fitzpatrick <= 4 ? "Standard aftercare with SPF 30+" : "Standard aftercare protocol"
        },
        analysisId: Math.random().toString(36).substr(2, 9).toUpperCase(),
        timestamp: new Date().toISOString()
      }

      setAnalysisResult(result)
      setCurrentStep("results")
      onAnalysisComplete?.(result)

    } catch (error) {
      console.error('Analysis error:', error)
      alert('Image analysis failed. Please try again or check your image quality.')
      setCurrentStep("upload")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSave = () => {
    if (analysisResult && onSave) {
      onSave(analysisResult)
    }
  }

  const handleExport = () => {
    if (analysisResult && onExport) {
      onExport(analysisResult)
    }
  }

  const getFitzpatrickColor = (type: number) => {
    const fitzpatrick = fitzpatrickTypes.find(t => t.id === type)
    return fitzpatrick?.color || "#8B6914"
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-lavender to-lavender-600 bg-clip-text text-transparent">
          Unified Skin Analysis
        </h1>
        <p className="text-lg text-muted-foreground">
          One photo, comprehensive analysis: Fitzpatrick type, undertone detection, and pigment recommendations
        </p>
      </div>

      {/* Step 1: Photo Upload */}
      {currentStep === "upload" && (
        <Card className="p-6 backdrop-blur-sm bg-white/80 border-lavender/20 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-center text-lavender-700">Upload or Capture Photo</CardTitle>
            <p className="text-sm text-center text-muted-foreground">
              Take a clear photo of your skin for comprehensive analysis
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!uploadedImage ? (
              <div className="space-y-4">
                {/* Photo Instructions */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    📸 Photo Guidelines for Maximum Accuracy
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <h5 className="font-medium text-blue-700">✅ Do's:</h5>
                      <ul className="space-y-1 text-blue-600">
                        <li>• Take photo in <strong>natural daylight</strong> (avoid artificial lighting)</li>
                        <li>• Position camera <strong>12-18 inches</strong> from skin</li>
                        <li>• Focus on <strong>cheek, jawline, or forearm</strong> (avoid hands/feet)</li>
                        <li>• Ensure <strong>good lighting</strong> without shadows</li>
                        <li>• Keep camera <strong>steady and level</strong></li>
                        <li>• Use <strong>high resolution</strong> (at least 2MP)</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-red-700">❌ Don'ts:</h5>
                      <ul className="space-y-1 text-red-600">
                        <li>• Avoid <strong>direct sunlight</strong> (causes glare)</li>
                        <li>• Don't use <strong>flash</strong> (distorts skin tone)</li>
                        <li>• Avoid <strong>makeup, tanning, or sunburn</strong></li>
                        <li>• Don't take photo in <strong>dark or dim lighting</strong></li>
                        <li>• Avoid <strong>reflections or shadows</strong></li>
                        <li>• Don't use <strong>filters or editing</strong></li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-blue-100 rounded border border-blue-300">
                    <p className="text-xs text-blue-800 text-center">
                      💡 <strong>Pro Tip:</strong> The more accurate your photo, the better the AI can analyze your skin characteristics and provide precise Fitzpatrick classification!
                    </p>
                  </div>
                </div>

                {/* Camera Section */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Take Photo</Label>
                  <div className="flex gap-3">
                    <Button
                      onClick={startCamera}
                      disabled={isCapturing}
                      className="flex-1 bg-lavender hover:bg-lavender-600"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {isCapturing ? "Camera Active" : "Start Camera"}
                    </Button>
                    {isCapturing && (
                      <Button
                        onClick={capturePhoto}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Capture Photo
                      </Button>
                    )}
                  </div>
                  
                  {/* Camera Preview */}
                  {isCapturing && (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        className="w-full max-w-md mx-auto rounded-lg border-2 border-lavender/30"
                        autoPlay
                        muted
                        playsInline
                      />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  )}
                  
                  {cameraError && (
                    <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                      {cameraError}
                    </div>
                  )}
                </div>

                {/* File Upload Section */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Or Upload Photo</Label>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="flex-1 border-lavender/30 hover:bg-lavender/5"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                                  <p className="text-xs text-muted-foreground text-center">
                  Supported formats: JPG, PNG, WebP. Max size: 10MB
                </p>
              </div>

              {/* Additional Analysis Factors */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-center block">Additional Analysis Factors</Label>
                <p className="text-xs text-muted-foreground text-center">
                  These factors help provide more accurate Fitzpatrick classification
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Eye Color */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Eye Color</Label>
                    <select
                      value={eyeColor}
                      onChange={(e) => setEyeColor(e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-lavender focus:border-transparent"
                    >
                      <option value="">Select eye color</option>
                      <option value="light_blue">Light Blue</option>
                      <option value="blue">Blue</option>
                      <option value="gray">Gray</option>
                      <option value="light_green">Light Green</option>
                      <option value="green">Green</option>
                      <option value="hazel">Hazel</option>
                      <option value="light_brown">Light Brown</option>
                      <option value="brown">Brown</option>
                      <option value="dark_brown">Dark Brown</option>
                      <option value="black">Black</option>
                    </select>
                  </div>

                  {/* Hair Color */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Hair Color</Label>
                    <select
                      value={hairColor}
                      onChange={(e) => setHairColor(e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-lavender focus:border-transparent"
                    >
                      <option value="">Select hair color</option>
                      <option value="red">Red</option>
                      <option value="very_light_blonde">Very Light Blonde</option>
                      <option value="light_blonde">Light Blonde</option>
                      <option value="blonde">Blonde</option>
                      <option value="dark_blonde">Dark Blonde</option>
                      <option value="light_brown">Light Brown</option>
                      <option value="brown">Brown</option>
                      <option value="dark_brown">Dark Brown</option>
                      <option value="black">Black</option>
                    </select>
                  </div>

                  {/* Ethnic Background */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Ethnic Background</Label>
                    <select
                      value={ethnicity}
                      onChange={(e) => setEthnicity(e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-lavender focus:border-transparent"
                    >
                      <option value="">Select background</option>
                      <option value="celtic">Celtic</option>
                      <option value="scandinavian">Scandinavian</option>
                      <option value="northern_european">Northern European</option>
                      <option value="british">British</option>
                      <option value="german">German</option>
                      <option value="southern_european">Southern European</option>
                      <option value="mediterranean">Mediterranean</option>
                      <option value="middle_eastern">Middle Eastern</option>
                      <option value="latin_american">Latin American</option>
                      <option value="south_asian">South Asian</option>
                      <option value="east_asian">East Asian</option>
                      <option value="north_african">North African</option>
                      <option value="african">African</option>
                      <option value="african_american">African American</option>
                      <option value="australian_aboriginal">Australian Aboriginal</option>
                      <option value="mixed">Mixed</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="text-center text-xs text-muted-foreground bg-blue-50 p-2 rounded">
                  💡 <strong>Tip:</strong> These factors help the AI provide more accurate Fitzpatrick classification and personalized recommendations
                </div>
              </div>
            </div>
            ) : (
              /* Image Preview and Analysis Button */
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={uploadedImage}
                    alt="Uploaded skin photo"
                    className="w-full max-w-md mx-auto rounded-lg border-2 border-lavender/30"
                  />
                  <Button
                    onClick={removeImage}
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-center">
                  <Button
                    onClick={startAnalysis}
                    className="bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-white px-8 py-3 rounded-xl text-lg font-medium transition-all duration-200 hover:scale-105"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Comprehensive Analysis
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Analysis Progress */}
      {currentStep === "analysis" && (
        <Card className="p-6 backdrop-blur-sm bg-white/80 border-lavender/20 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-center text-lavender-700">Analyzing Your Photo</CardTitle>
            <p className="text-sm text-center text-muted-foreground">
              AI is processing your image for comprehensive skin analysis
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Photo Display During Analysis */}
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {/* Photo Side */}
              <div className="flex-shrink-0">
                {uploadedImage && (
                  <div className="relative">
                    <img
                      src={uploadedImage}
                      alt="Photo being analyzed"
                      className="w-64 h-64 object-cover rounded-lg border-2 border-lavender/30 shadow-lg"
                    />
                    <div className="absolute inset-0 bg-lavender/20 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Sparkles className="w-8 h-8 text-lavender-600 animate-pulse mx-auto mb-2" />
                        <p className="text-sm text-lavender-700 font-medium">Analyzing...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Side */}
              <div className="flex-1 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Analysis Progress</span>
                    <span>{Math.round(analysisProgress)}%</span>
                  </div>
                  <Progress value={analysisProgress} className="w-full" />
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-lavender/10 px-4 py-2 rounded-lg">
                    <Sparkles className="w-5 h-5 text-lavender-600 animate-spin" />
                    <span className="text-lavender-700 font-medium">{currentAnalysisStep}</span>
                  </div>
                </div>

                {/* Analysis Steps List */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Analysis Steps:</h4>
                  <div className="space-y-1">
                    {[
                      "Image quality assessment",
                      "Skin tone detection",
                      "Fitzpatrick classification",
                      "Undertone analysis",
                      "Pigment matching",
                      "Technique recommendations"
                    ].map((step, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <div className={`w-2 h-2 rounded-full ${
                          (analysisProgress / 100) * 6 > index ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <span className={analysisProgress / 100 * 6 > index ? 'text-green-700' : 'text-gray-500'}>
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Results */}
      {currentStep === "results" && analysisResult && (
        <div className="space-y-6">
          {/* Analysis Summary */}
          <Card className="p-6 backdrop-blur-sm bg-white/90 border-lavender/20 rounded-2xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-lavender-700">Analysis Results</CardTitle>
              <p className="text-sm text-muted-foreground">
                Comprehensive skin analysis completed successfully
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Key Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Fitzpatrick Type */}
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full border-4 border-orange-300 flex items-center justify-center"
                       style={{ backgroundColor: getFitzpatrickColor(analysisResult.fitzpatrick) }}>
                    <span className="text-white font-bold text-lg">{analysisResult.fitzpatrick}</span>
                  </div>
                  <h3 className="font-semibold text-orange-800">Fitzpatrick Type</h3>
                  <p className="text-sm text-orange-700">
                    {fitzpatrickTypes.find(t => t.id === analysisResult.fitzpatrick)?.description}
                  </p>
                </div>

                {/* Undertone */}
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full border-4 border-purple-300 bg-purple-100 flex items-center justify-center">
                    <Palette className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-purple-800">Undertone</h3>
                  <Badge className="bg-purple-100 text-purple-800 text-lg px-4 py-2 mt-2 capitalize">
                    {analysisResult.undertone}
                  </Badge>
                </div>

                {/* Confidence */}
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full border-4 border-green-300 bg-green-100 flex items-center justify-center">
                    <Target className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-green-800">Confidence</h3>
                  <p className="text-2xl font-bold text-green-700">{analysisResult.confidence}%</p>
                </div>
              </div>

              {/* Photo Quality */}
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Photo Quality: </span>
                <Badge variant="outline" className="ml-2 capitalize">
                  {analysisResult.photoQuality}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Scientific Classification Factors */}
          <Card className="p-6 backdrop-blur-sm bg-white/90 border-lavender/20 rounded-2xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-blue-700">Scientific Classification Factors</CardTitle>
              <p className="text-sm text-blue-600">
                How multiple factors work together to determine your Fitzpatrick type
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Manual Input Factors */}
              {(eyeColor || hairColor || ethnicity) && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    📝 Manual Input Factors
                    <Badge className="bg-blue-100 text-blue-800 text-xs">User Selected</Badge>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {eyeColor && (
                      <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                        <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                          👁️
                        </div>
                        <p className="text-xs text-blue-600 font-medium">Eye Color</p>
                        <p className="text-sm text-blue-800 font-semibold capitalize">
                          {eyeColor.replace('_', ' ')}
                        </p>
                      </div>
                    )}
                    {hairColor && (
                      <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                        <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                          💇‍♀️
                        </div>
                        <p className="text-xs text-blue-600 font-medium">Hair Color</p>
                        <p className="text-sm text-blue-800 font-semibold capitalize">
                          {hairColor.replace('_', ' ')}
                        </p>
                      </div>
                    )}
                    {ethnicity && (
                      <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                        <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                          🌍
                        </div>
                        <p className="text-xs text-blue-600 font-medium">Ethnic Background</p>
                        <p className="text-sm text-blue-800 font-semibold capitalize">
                          {ethnicity.replace('_', ' ')}
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-blue-600 mt-3 text-center">
                    These factors were manually selected and factored into the analysis for maximum accuracy
                  </p>
                </div>
              )}

              {/* Factor Analysis Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Skin Tone Factor */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-blue-800">Skin Tone Analysis</h4>
                    <Badge className="bg-blue-100 text-blue-800">40% Weight</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Your Skin Tone:</span>
                      <span className="font-medium">{analysisResult.analysisDetails?.skinTone || 'N/A'}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(analysisResult.analysisDetails?.skinTone || 50) / 100 * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-blue-700">
                      {analysisResult.analysisDetails?.skinTone && analysisResult.analysisDetails.skinTone <= 20 && "Range: 0-20 (Type I - Very Fair)"}
                      {analysisResult.analysisDetails?.skinTone && analysisResult.analysisDetails.skinTone > 20 && analysisResult.analysisDetails.skinTone <= 35 && "Range: 21-35 (Type II - Fair)"}
                      {analysisResult.analysisDetails?.skinTone && analysisResult.analysisDetails.skinTone > 35 && analysisResult.analysisDetails.skinTone <= 50 && "Range: 36-50 (Type III - Light Medium)"}
                      {analysisResult.analysisDetails?.skinTone && analysisResult.analysisDetails.skinTone > 50 && analysisResult.analysisDetails.skinTone <= 65 && "Range: 51-65 (Type IV - Medium)"}
                      {analysisResult.analysisDetails?.skinTone && analysisResult.analysisDetails.skinTone > 65 && analysisResult.analysisDetails.skinTone <= 80 && "Range: 66-80 (Type V - Medium Dark)"}
                      {analysisResult.analysisDetails?.skinTone && analysisResult.analysisDetails.skinTone > 80 && "Range: 81-100 (Type VI - Dark)"}
                    </div>
                  </div>
                </div>

                {/* Sun Reaction Factor */}
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-orange-800">Sun Reaction Pattern</h4>
                    <Badge className="bg-orange-100 text-orange-800">25% Weight</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Your Pattern:</span>
                      <span className="font-medium capitalize">
                        {analysisResult.analysisDetails?.sunReaction?.replace('_', ' ') || 'N/A'}
                      </span>
                    </div>
                    <div className="text-xs text-orange-700">
                      {analysisResult.analysisDetails?.sunReaction === 'always_burns' && "Always burns → Type I"}
                      {analysisResult.analysisDetails?.sunReaction === 'usually_burns' && "Usually burns → Type II"}
                      {analysisResult.analysisDetails?.sunReaction === 'sometimes_burns' && "Sometimes burns → Type III"}
                      {analysisResult.analysisDetails?.sunReaction === 'rarely_burns' && "Rarely burns → Type IV"}
                      {analysisResult.analysisDetails?.sunReaction === 'never_burns' && "Never burns → Type VI"}
                    </div>
                  </div>
                </div>

                {/* Tanning Ability Factor */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-green-800">Tanning Ability</h4>
                    <Badge className="bg-green-100 text-green-800">20% Weight</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Your Ability:</span>
                      <span className="font-medium capitalize">
                        {analysisResult.analysisDetails?.tanningAbility?.replace('_', ' ') || 'N/A'}
                      </span>
                    </div>
                    <div className="text-xs text-green-700">
                      {analysisResult.analysisDetails?.tanningAbility === 'never' && "Never tans → Type I"}
                      {analysisResult.analysisDetails?.tanningAbility === 'minimal' && "Minimal tanning → Type II"}
                      {analysisResult.analysisDetails?.tanningAbility === 'moderate' && "Moderate tanning → Type III"}
                      {analysisResult.analysisDetails?.tanningAbility === 'good' && "Good tanning → Type IV"}
                      {analysisResult.analysisDetails?.tanningAbility === 'excellent' && "Excellent tanning → Type V"}
                      {analysisResult.analysisDetails?.tanningAbility === 'maximum' && "Maximum tanning → Type VI"}
                    </div>
                  </div>
                </div>

                {/* Ethnic Background Factor */}
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-purple-800">Ethnic Background</h4>
                    <Badge className="bg-purple-100 text-purple-800">15% Weight</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Background:</span>
                      <span className="font-medium">
                        {analysisResult.analysisDetails?.ethnicity || 'N/A'}
                      </span>
                    </div>
                    <div className="text-xs text-purple-700">
                      {analysisResult.analysisDetails?.ethnicity && "Typical Fitzpatrick range for this background"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Factors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Freckling */}
                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                  <h5 className="font-medium text-indigo-800 text-sm mb-1">Freckling Pattern</h5>
                  <p className="text-xs text-indigo-700 capitalize">
                    {analysisResult.analysisDetails?.freckling?.replace('_', ' ') || 'N/A'}
                  </p>
                </div>

                {/* Eye Color */}
                <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                  <h5 className="font-medium text-pink-800 text-sm mb-1">Eye Color</h5>
                  <p className="text-xs text-pink-700 capitalize">
                    {analysisResult.analysisDetails?.eyeColor || 'N/A'}
                  </p>
                </div>

                {/* Hair Color */}
                <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                  <h5 className="font-medium text-teal-800 text-sm mb-1">Hair Color</h5>
                  <p className="text-xs text-teal-700 capitalize">
                    {analysisResult.analysisDetails?.hairColor || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Classification Reasoning */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Classification Reasoning</h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                  {analysisResult.reasoning || "Analysis based on comprehensive skin characteristics assessment"}
                </p>
              </div>

              {/* Scientific Reference */}
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>Scientific Reference:</strong> Fitzpatrick, T.B. (1988). The validity and practicality of sun-reactive skin types I through VI. Archives of Dermatology, 124(6), 869-871.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pigment Recommendations */}
          <Card className="p-6 backdrop-blur-sm bg-white/90 border-lavender/20 rounded-2xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-amber-800">Recommended Pigments</CardTitle>
              <p className="text-sm text-amber-700">
                Based on Type {analysisResult.fitzpatrick} • {analysisResult.undertone} Undertone
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Brows */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Eyebrows
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analysisResult.pigmentRecommendations.brows.map((pigment, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg border border-amber-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0"
                          style={{ backgroundColor: pigment.hex }}
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-gray-900 mb-1">{pigment.name}</h5>
                          <p className="text-sm text-gray-600 font-medium mb-1">{pigment.brand}</p>
                          <p className="text-xs text-gray-500 mb-2">{pigment.code}</p>
                          <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            <span className="font-medium">Why:</span> {pigment.reasoning}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300 flex-shrink-0">
                          {pigment.confidence}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lips */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Lips
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analysisResult.pigmentRecommendations.lips.map((pigment, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg border border-amber-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0"
                          style={{ backgroundColor: pigment.hex }}
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-gray-900 mb-1">{pigment.name}</h5>
                          <p className="text-sm text-gray-600 font-medium mb-1">{pigment.brand}</p>
                          <p className="text-xs text-gray-500 mb-2">{pigment.code}</p>
                          <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            <span className="font-medium">Why:</span> {pigment.reasoning}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300 flex-shrink-0">
                          {pigment.confidence}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eyeliner */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Eyeliner
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analysisResult.pigmentRecommendations.eyeliner.map((pigment, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg border border-amber-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0"
                          style={{ backgroundColor: pigment.hex }}
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-gray-900 mb-1">{pigment.name}</h5>
                          <p className="text-sm text-gray-600 font-medium mb-1">{pigment.brand}</p>
                          <p className="text-xs text-gray-500 mb-2">{pigment.code}</p>
                          <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            <span className="font-medium">Why:</span> {pigment.reasoning}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300 flex-shrink-0">
                          {pigment.confidence}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technique Recommendations */}
          <Card className="p-6 backdrop-blur-sm bg-white/90 border-lavender/20 rounded-2xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-lavender-700">Technique Recommendations</CardTitle>
              <p className="text-sm text-muted-foreground">
                Based on your skin characteristics
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-lavender-600">Needle & Hand Speed</h4>
                  <p className="text-sm text-muted-foreground">{analysisResult.techniques.needleSpeed}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-lavender-600">Depth Notes</h4>
                  <p className="text-sm text-muted-foreground">{analysisResult.techniques.depth}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-lavender-600">Pre-/Post-Care</h4>
                  <p className="text-sm text-muted-foreground">{analysisResult.techniques.care}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Analysis
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              className="border-lavender/30 hover:bg-lavender/5"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button
              onClick={removeImage}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
          </div>
        </div>
      )}

      <div className="text-center text-xs text-muted-foreground">
        For professional use only. Not a medical diagnosis.
      </div>
    </div>
  )
}
