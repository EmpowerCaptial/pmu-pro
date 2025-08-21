"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Sun, Download, Save, Sparkles, Upload, Camera, RotateCcw } from "lucide-react"
import { findPigmentMatches, type PigmentMatch } from "@/lib/pigment-matching"

interface FitzpatrickType {
  id: string
  name: string
  description: string
  image: string
}

interface AnalysisResult {
  type: string
  confidence: number
  pigments: Array<{
    name: string
    hex: string
    code: string
    brand: string
    reasoning: string
  }>
  techniques: {
    needleSpeed: string
    depth: string
    care: string
  }
  reasoning: string
}

interface Props {
  onAnalyze: (formState: any) => Promise<AnalysisResult>
  onSave: (result: AnalysisResult) => void
  onExport: (result: AnalysisResult) => void
}

const fitzpatrickTypes: FitzpatrickType[] = [
  {
    id: "I",
    name: "Type I",
    description: "Always burns, never tans",
    image: "/pale-skin-portrait.png",
  },
  {
    id: "II",
    name: "Type II",
    description: "Usually burns, tans minimally",
    image: "/fair-skin-portrait.png",
  },
  {
    id: "III",
    name: "Type III",
    description: "Sometimes burns, tans gradually",
    image: "/light-medium-skin-portrait.png",
  },
  {
    id: "IV",
    name: "Type IV",
    description: "Burns minimally, tans well",
    image: "/medium-skin-portrait.png",
  },
  {
    id: "V",
    name: "Type V",
    description: "Rarely burns, tans deeply",
    image: "/medium-dark-skin-portrait.png",
  },
  {
    id: "VI",
    name: "Type VI",
    description: "Never burns, deeply pigmented",
    image: "/dark-skin-portrait.png",
  },
]

export default function FitzpatrickProSelector({ onAnalyze, onSave, onExport }: Props) {
  const [selectedType, setSelectedType] = useState<string>("")
  const [tone, setTone] = useState([50])
  const [undertone, setUndertone] = useState("neutral")
  const [sunResponse, setSunResponse] = useState("sometimes")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Helper function to get position on color meter for Fitzpatrick type
  const getTonePosition = (fitzpatrickType: string) => {
    const typeIndex = fitzpatrickTypes.findIndex(type => type.id === fitzpatrickType)
    if (typeIndex === -1) return 50 // Default to middle if type not found
    
    // Map each type to a specific position on the color meter
    const typePositions: { [key: string]: number } = {
      'I': 8,    // Very light - start of gradient
      'II': 25,  // Light
      'III': 42, // Light medium
      'IV': 58,  // Medium
      'V': 75,   // Medium dark
      'VI': 92   // Dark - end of gradient
    }
    
    return typePositions[fitzpatrickType] || 50
  }

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
    setResult(null)
  }

  const handleAnalyze = async () => {
    if (!imageFile) {
      alert("Please upload or capture an image first")
      return
    }

    setIsAnalyzing(true)
    try {
      // Perform real image analysis using the photo/analyze API
      const formData = new FormData()
      formData.append("image", imageFile)

      const response = await fetch('/api/photo/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Image analysis failed')
      }

      const data = await response.json()
      
      // Extract real analysis results
      const analysisData = data.data || data
      const realFitzpatrick = analysisData.fitzpatrick || selectedType
      const realUndertone = analysisData.undertone || undertone
      const realConfidence = analysisData.confidence || 0.85

      // Get real pigment recommendations based on analysis
      const skinToneCategory = realFitzpatrick <= 2 ? "Light" : realFitzpatrick <= 4 ? "Medium" : "Dark"
      const pigmentMatches = findPigmentMatches(
        skinToneCategory,
        realUndertone,
        "Natural Brown",
        "Brows"
      )

      // Transform to expected format
      const analysisResult: AnalysisResult = {
        type: realFitzpatrick.toString(),
        confidence: Math.round(realConfidence * 100),
        pigments: pigmentMatches.slice(0, 3).map((match: PigmentMatch) => ({
          name: match.pigmentName,
          hex: match.swatch || "#8B6914",
          code: `${match.brand}-${match.pigmentName.replace(/\s+/g, '-')}`,
          brand: match.brand,
          reasoning: match.mixingNotes || `Optimal for ${realUndertone} undertones and ${skinToneCategory} skin`
        })),
        techniques: {
          needleSpeed: realFitzpatrick <= 2 ? "Slow, shallow depth" : realFitzpatrick <= 4 ? "Medium speed, moderate depth" : "Standard speed, standard depth",
          depth: realFitzpatrick <= 2 ? "0.5-1.0mm (very shallow)" : realFitzpatrick <= 4 ? "1.0-1.5mm (shallow to medium)" : "1.5-2.0mm (standard depth)",
          care: realFitzpatrick <= 2 ? "Gentle cleansing, avoid sun exposure, use SPF 50+" : realFitzpatrick <= 4 ? "Standard aftercare with SPF 30+" : "Standard aftercare protocol"
        },
        reasoning: `Analysis based on uploaded image showing Fitzpatrick Type ${realFitzpatrick} with ${realUndertone} undertones. Pigment recommendations optimized for your skin characteristics.`
      }
      
      setResult(analysisResult)
      setUndertone(realUndertone)
      setSelectedType(realFitzpatrick.toString())
      
      // Update tone based on Fitzpatrick type
      const toneMap: { [key: string]: number } = {
        'I': 15, 'II': 30, 'III': 45, 'IV': 60, 'V': 75, 'VI': 90
      }
      if (toneMap[realFitzpatrick.toString()]) {
        setTone([toneMap[realFitzpatrick.toString()]])
      }
      
    } catch (error) {
      console.error('Analysis error:', error)
      alert('Image analysis failed. Please try again or check your image quality.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSaveToProfile = async () => {
    if (!result) return
    
    try {
      // Save the analysis result to the user's profile
      const analysisData = {
        timestamp: new Date().toISOString(),
        fitzpatrickType: result.type,
        confidence: result.confidence,
        skinTone: tone[0],
        sunResponse,
        pigments: result.pigments,
        techniques: result.techniques,
        reasoning: result.reasoning
      }
      
      // In a real app, this would save to the database
      localStorage.setItem('lastSkinAnalysis', JSON.stringify(analysisData))
      
      // Prompt for client information if starting with skin analysis
      const clientName = prompt('Enter client name for this analysis:')
      if (clientName) {
        const clientData = {
          ...analysisData,
          clientName,
          clientEmail: prompt('Enter client email (optional):') || '',
          clientPhone: prompt('Enter client phone (optional):') || '',
          notes: prompt('Additional notes (optional):') || ''
        }
        
        // Save client data
        localStorage.setItem(`client_${clientName}`, JSON.stringify(clientData))
        
        // Show success message
        alert(`Analysis saved for client: ${clientName}`)
        
        // Call the onSave prop if provided
        if (onSave) {
          onSave(result)
        }
      }
    } catch (error) {
      console.error('Failed to save analysis:', error)
      alert('Failed to save analysis. Please try again.')
    }
  }



  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4 transform transition-transform duration-300 hover:scale-[1.02]">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-lavender to-lavender-600 bg-clip-text text-transparent">
          Fitzpatrick Pro Selector
        </h1>
        <p className="text-lg text-muted-foreground">AI-guided skin typing with pro pigment guidance</p>
      </div>

      {/* Image Upload Section */}
      <Card className="p-6 backdrop-blur-sm bg-white/80 border-lavender/20 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-center text-lavender-700">Upload or Capture Photo</CardTitle>
          <p className="text-sm text-center text-muted-foreground">
            Upload a clear photo of your skin or use the camera for real-time analysis
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!uploadedImage ? (
            <div className="space-y-4">
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
            </div>
          ) : (
            /* Image Preview and Analysis */
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
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-white px-8 py-3 rounded-xl text-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 animate-spin" />
                      Analyzing Image...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Analyze Photo
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="p-6 backdrop-blur-sm bg-white/80 border-lavender/20 rounded-2xl shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {fitzpatrickTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                selectedType === type.id
                  ? "border-lavender bg-lavender/20 shadow-lg ring-2 ring-lavender/30"
                  : "border-gray-300 hover:border-lavender/50 bg-white/90"
              }`}
              aria-label={`Select ${type.name}: ${type.description}`}
            >
              <img
                src={type.image || "/placeholder.svg"}
                alt={`${type.name} skin type example`}
                className="w-full h-24 object-cover rounded-lg mb-3"
              />
              <div className="text-center">
                <div className={`font-semibold ${selectedType === type.id ? 'text-lavender-700' : 'text-gray-700'}`}>
                  {type.name}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{type.description}</div>
                {selectedType === type.id && (
                  <div className="mt-2 text-xs text-lavender-600 font-medium">✓ Selected</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6 backdrop-blur-sm bg-white/80 border-lavender/20 rounded-2xl shadow-lg space-y-6">
        {/* Visual Skin Tone Color Meter */}
        <div className="space-y-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            Skin Tone - Visual Reference
            <span className="text-xs text-muted-foreground font-normal">
              (Click on the color bar or use the slider below)
            </span>
          </Label>
          <div className="space-y-3">
            {/* Color Gradient Bar */}
            <div className="relative">
              <div 
                className="h-12 rounded-lg overflow-hidden shadow-inner cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const clickX = e.clientX - rect.left
                  const percentage = (clickX / rect.width) * 100
                  setTone([Math.round(percentage)])
                }}
                title="Click to select skin tone"
              >
                <div className="h-full w-full bg-gradient-to-r from-[#FFE5D1] via-[#F4D4C3] via-[#E6C3A8] via-[#D4A574] via-[#B87C56] via-[#8B5A3C] via-[#5D3A1F] to-[#3D2814]"></div>
              </div>
              
              {/* Fitzpatrick Type Markers */}
              <div className="absolute top-0 left-0 w-full h-full">
                {/* Type I - Very Light */}
                <div className="absolute top-0 left-[8%] transform -translate-x-1/2">
                  <div className="w-0.5 h-12 bg-white shadow-sm"></div>
                  <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 bg-white px-1 rounded">
                    I
                  </div>
                </div>
                
                {/* Type II - Light */}
                <div className="absolute top-0 left-[25%] transform -translate-x-1/2">
                  <div className="w-0.5 h-12 bg-white shadow-sm"></div>
                  <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 bg-white px-1 rounded">
                    II
                  </div>
                </div>
                
                {/* Type III - Light Medium */}
                <div className="absolute top-0 left-[42%] transform -translate-x-1/2">
                  <div className="w-0.5 h-12 bg-white shadow-sm"></div>
                  <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 bg-white px-1 rounded">
                    III
                  </div>
                </div>
                
                {/* Type IV - Medium */}
                <div className="absolute top-0 left-[58%] transform -translate-x-1/2">
                  <div className="w-0.5 h-12 bg-white shadow-sm"></div>
                  <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 bg-white px-1 rounded">
                    IV
                  </div>
                </div>
                
                {/* Type V - Medium Dark */}
                <div className="absolute top-0 left-[75%] transform -translate-x-1/2">
                  <div className="w-0.5 h-12 bg-white shadow-sm"></div>
                  <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 bg-white px-1 rounded">
                    V
                  </div>
                </div>
                
                {/* Type VI - Dark */}
                <div className="absolute top-0 left-[92%] transform -translate-x-1/2">
                  <div className="w-0.5 h-12 bg-white shadow-sm"></div>
                  <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 bg-white px-1 rounded">
                    VI
                  </div>
                </div>
              </div>
              
              {/* Current Selection Indicator */}
              <div 
                className="absolute top-0 w-1 h-12 bg-lavender-600 shadow-lg transform -translate-x-1/2 z-10"
                style={{ 
                  left: `${selectedType ? getTonePosition(selectedType) : tone[0]}%`,
                  transition: 'left 0.3s ease'
                }}
              >
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-lavender-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  {selectedType ? `Type ${selectedType}` : tone[0]}
                </div>
              </div>
            </div>
            
            {/* Fitzpatrick Type Descriptions */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-600">
              <div className="text-center">
                <div className="font-medium">Type I</div>
                <div className="text-[10px]">Very Fair</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Type II</div>
                <div className="text-[10px]">Fair</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Type III</div>
                <div className="text-[10px]">Light Medium</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Type IV</div>
                <div className="text-[10px]">Medium</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Type V</div>
                <div className="text-[10px]">Medium Dark</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Type VI</div>
                <div className="text-[10px]">Dark</div>
              </div>
            </div>
            
            {/* Help Text */}
            <div className="text-center text-xs text-muted-foreground bg-gray-50 p-2 rounded-lg">
              💡 <strong>Tip:</strong> Click directly on the color bar above to select your skin tone, or use the Fitzpatrick type buttons above for quick selection
            </div>
          </div>
        </div>

        {/* Enhanced Tone Slider with Visual Feedback */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Fine-tune Skin Tone</Label>
          <div className="space-y-2">
            <Slider 
              value={tone} 
              onValueChange={setTone} 
              max={100} 
              step={1} 
              className="w-full" 
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Very Light</span>
              <span className="font-medium">Value: {tone[0]}</span>
              <span>Very Dark</span>
            </div>
          </div>
        </div>

                    {/* Undertone Detection - From Image Analysis */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Undertone (From Image Analysis)</Label>
              <div className="p-4 bg-lavender/10 rounded-lg border border-lavender/30">
                {result ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Undertone detected from your uploaded photo
                    </p>
                    <Badge className="bg-purple-100 text-purple-800 text-sm capitalize">
                      {undertone}
                    </Badge>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Undertone will be automatically detected from your uploaded photo during analysis.
                  </p>
                )}
              </div>
            </div>

        {/* Sun Response */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Sun Response</Label>
          <RadioGroup value={sunResponse} onValueChange={setSunResponse} className="flex gap-6">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="burns" id="burns" />
              <Label htmlFor="burns" className="flex items-center gap-1">
                <Sun className="w-4 h-4 text-red-500" />
                Burns easily
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sometimes" id="sometimes" />
              <Label htmlFor="sometimes" className="flex items-center gap-1">
                <Sun className="w-4 h-4 text-orange-500" />
                Sometimes burns
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rarely" id="rarely" />
              <Label htmlFor="rarely" className="flex items-center gap-1">
                <Sun className="w-4 h-4 text-yellow-500" />
                Rarely burns
              </Label>
            </div>
          </RadioGroup>
        </div>
      </Card>



      {result && (
        <Card className="p-6 backdrop-blur-sm bg-white/90 border-lavender/20 rounded-2xl shadow-xl animate-in slide-in-from-bottom-4 duration-300">
          <div className="space-y-6">
            {/* Result Badge */}
            <div className="flex items-center justify-between">
              <Badge className="bg-lavender text-white px-3 py-1 text-sm">
                Type {result.type} • {result.confidence}% confidence
              </Badge>
              <div className="text-xs text-muted-foreground bg-green-50 px-2 py-1 rounded">
                📸 From Image Analysis
              </div>
            </div>

            {/* Undertone and Pigment Recommendations - Desktop View */}
            <div className="hidden md:block space-y-6">
              {/* Undertone Display */}
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-purple-800">Detected Undertone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Your skin undertone has been analyzed as:</p>
                      <p className="text-lg font-semibold text-purple-800 mt-1">{undertone}</p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800 text-lg px-4 py-2">
                      {undertone}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Pigment Recommendations - Desktop */}
              {result.pigments && result.pigments.length > 0 && (
                <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-amber-800">Recommended Pigments</CardTitle>
                    <p className="text-sm text-amber-700">Based on Type {result.type} • {undertone} Undertone</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.pigments.map((pigment, index) => (
                        <div key={index} className="p-4 bg-white rounded-lg border border-amber-200 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3">
                            <div 
                              className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0"
                              style={{ backgroundColor: pigment.hex }}
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 mb-1">{pigment.name}</h4>
                              <p className="text-sm text-gray-600 font-medium mb-1">{pigment.brand}</p>
                              <p className="text-xs text-gray-500 mb-2">{pigment.code}</p>
                              {pigment.reasoning && (
                                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                  <span className="font-medium">Why:</span> {pigment.reasoning}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300 flex-shrink-0">
                              #{index + 1}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Mobile-Friendly Analysis Results */}
            <div className="md:hidden space-y-4">
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-blue-800">Analysis Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Fitzpatrick Type:</span>
                    <Badge className="bg-blue-100 text-blue-800 text-sm">
                      Type {result.type}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Undertone:</span>
                    <Badge className="bg-purple-100 text-purple-800 text-sm">
                      {undertone}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Confidence:</span>
                    <Badge className="bg-green-100 text-green-800 text-sm">
                      {result.confidence}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Pigment Recommendations */}
              {result.pigments && result.pigments.length > 0 && (
                <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-amber-800">Recommended Pigments</CardTitle>
                    <p className="text-sm text-amber-700">Based on Type {result.type} • {undertone} Undertone</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.pigments.map((pigment, index) => (
                        <div key={index} className="p-3 bg-white rounded-lg border border-amber-200">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div 
                                  className="w-4 h-4 rounded-full border-2 border-gray-300"
                                  style={{ backgroundColor: pigment.hex }}
                                />
                                <h4 className="font-semibold text-sm text-gray-900">{pigment.name}</h4>
                              </div>
                              <p className="text-xs text-gray-600 font-medium">{pigment.brand}</p>
                              <p className="text-xs text-gray-500">{pigment.code}</p>
                            </div>
                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300">
                              {index + 1}
                            </Badge>
                          </div>
                          {pigment.reasoning && (
                            <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                              <span className="font-medium">Why:</span> {pigment.reasoning}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Save to Profile Button */}
              <Button 
                onClick={handleSaveToProfile}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                size="lg"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Analysis to Profile
              </Button>
            </div>

            {/* Technique Callouts */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-lavender-600">Needle & Hand Speed</h4>
                <p className="text-sm text-muted-foreground">{result.techniques.needleSpeed}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-lavender-600">Depth Notes</h4>
                <p className="text-sm text-muted-foreground">{result.techniques.depth}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-lavender-600">Pre-/Post-Care Flags</h4>
                <p className="text-sm text-muted-foreground">{result.techniques.care}</p>
              </div>
            </div>

            {/* Reasoning */}
            <div className="bg-lavender/5 rounded-lg p-4">
              <h4 className="font-medium text-sm text-lavender-600 mb-2">Why we chose this</h4>
              <p className="text-sm text-muted-foreground">{result.reasoning}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => onExport(result)}
                variant="outline"
                className="flex items-center gap-2 border-lavender/30 hover:bg-lavender/5"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
              <Button
                onClick={() => onSave(result)}
                variant="outline"
                className="flex items-center gap-2 border-lavender/30 hover:bg-lavender/5"
              >
                <Save className="w-4 h-4" />
                Save to Client
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="text-center text-xs text-muted-foreground">
        For professional use only. Not a medical diagnosis.
      </div>
    </div>
  )
}

function ToneSphere({ tone, undertone }: { tone: number; undertone: string }) {
  const getPosition = () => {
    const angle = undertone === "cool" ? -60 : undertone === "warm" ? 60 : 0
    const radius = (tone / 100) * 30
    const x = 40 + Math.cos((angle * Math.PI) / 180) * radius
    const y = 40 + Math.sin((angle * Math.PI) / 180) * radius
    return { x, y }
  }

  const position = getPosition()

  return (
    <div className="relative w-20 h-20">
      <svg width="80" height="80" className="absolute inset-0">
        <circle cx="40" cy="40" r="35" fill="none" stroke="#e5e7eb" strokeWidth="2" />
        <circle cx={position.x} cy={position.y} r="4" fill="#b19cd9" className="animate-in zoom-in duration-500" />
      </svg>
    </div>
  )
}
