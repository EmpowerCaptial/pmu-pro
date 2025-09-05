"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, Camera, Ruler, Download, RotateCcw, Eye, EyeOff, Target, Zap, CheckCircle, AlertCircle, Home } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

interface MappingPoint {
  x: number
  y: number
  label: string
  color: string
}

export default function BrowMappingTool() {
  const [centerLine, setCenterLine] = useState(50)
  const [archLine, setArchLine] = useState(60)
  const [topHeadLine, setTopHeadLine] = useState(40)
  const [bottomHeadLine, setBottomHeadLine] = useState(70)
  const [browHeadLeft, setBrowHeadLeft] = useState(40)
  const [browHeadRight, setBrowHeadRight] = useState(60)
  const [opacity, setOpacity] = useState(0.8)
  const [color, setColor] = useState("rgb(147, 51, 234)")
  const [gridVisible, setGridVisible] = useState(true)
  const [symmetryScore, setSymmetryScore] = useState(95)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const colorOptions = [
    { value: "rgb(147, 51, 234)", label: "Purple", preview: "bg-purple-500" },
    { value: "rgb(239, 68, 68)", label: "Red", preview: "bg-red-500" },
    { value: "rgb(59, 130, 246)", label: "Blue", preview: "bg-blue-500" },
    { value: "rgb(34, 197, 94)", label: "Green", preview: "bg-green-500" },
    { value: "rgb(0, 0, 0)", label: "Black", preview: "bg-black" },
    { value: "rgb(255, 255, 255)", label: "White", preview: "bg-white border border-gray-300" }
  ]

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        setAnalysisComplete(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const runSymmetryAnalysis = () => {
    setIsAnalyzing(true)
    // Simulate AI analysis
    setTimeout(() => {
      const newScore = Math.floor(Math.random() * 20) + 80 // Random score between 80-100
      setSymmetryScore(newScore)
      setIsAnalyzing(false)
      setAnalysisComplete(true)
    }, 2000)
  }

  const resetMapping = () => {
    setCenterLine(50)
    setArchLine(60)
    setTopHeadLine(40)
    setBottomHeadLine(70)
    setBrowHeadLeft(40)
    setBrowHeadRight(60)
    setOpacity(0.8)
    setColor("rgb(147, 51, 234)")
    setAnalysisComplete(false)
  }

  const downloadMapping = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const link = document.createElement('a')
      link.download = 'brow-mapping.png'
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-lavender-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Target className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Brow Mapping Tool</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Professional eyebrow mapping and symmetry analysis tool. Upload a client photo and create precise mapping grids for perfect brow design.
          </p>
          
          {/* Return to Dashboard Button */}
          <div className="flex justify-center mb-6">
            <Link href="/dashboard">
              <Button variant="outline" className="border-lavender text-lavender hover:bg-lavender/5 bg-transparent">
                <Home className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {/* Left Controls Panel - Desktop */}
          <Card className="shadow-xl rounded-2xl border-0 bg-white/90 backdrop-blur-sm border border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-t-2xl border-b border-purple-200">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Ruler className="h-5 w-5" />
                Mapping Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Image Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">Upload Client Photo</Label>
                <div className="border-2 border-dashed border-purple-200 rounded-lg p-4 text-center hover:border-purple-300 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {uploadedImage ? (
                      <div className="space-y-2">
                        <img src={uploadedImage} alt="Uploaded" className="w-20 h-20 object-cover rounded-lg mx-auto" />
                        <p className="text-sm text-purple-600">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 text-purple-400 mx-auto" />
                        <p className="text-sm text-gray-600">Click to upload photo</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Mapping Controls */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-purple-700 mb-2 block">Center Line Position</Label>
                  <Slider 
                    value={[centerLine]} 
                    onValueChange={(val) => setCenterLine(val[0])} 
                    max={100} 
                    className="w-full [&>span:first-child]:bg-purple-200 [&>span:first-child]:h-3 [&>span:last-child]:bg-purple-600 [&>span:last-child]:border-2 [&>span:last-child]:border-white [&>span:last-child]:shadow-lg [&>span:last-child]:w-6 [&>span:last-child]:h-6"
                  />
                  <div className="flex justify-between text-xs text-purple-600 mt-1 font-medium">
                    <span>Left</span>
                    <span>Center</span>
                    <span>Right</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-purple-700 mb-2 block">Arch Height</Label>
                  <Slider 
                    value={[archLine]} 
                    onValueChange={(val) => setArchLine(val[0])} 
                    max={100} 
                    className="w-full [&>span:first-child]:bg-purple-200 [&>span:first-child]:h-3 [&>span:last-child]:bg-purple-600 [&>span:last-child]:border-2 [&>span:last-child]:border-white [&>span:last-child]:shadow-lg [&>span:last-child]:w-6 [&>span:last-child]:h-6"
                  />
                  <div className="flex justify-between text-xs text-purple-600 mt-1 font-medium">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-purple-700 mb-2 block">Brow Head Top</Label>
                  <Slider 
                    value={[topHeadLine]} 
                    onValueChange={(val) => setTopHeadLine(val[0])} 
                    max={100} 
                    className="w-full [&>span:first-child]:bg-purple-200 [&>span:first-child]:h-3 [&>span:last-child]:bg-purple-600 [&>span:last-child]:border-2 [&>span:last-child]:border-white [&>span:last-child]:shadow-lg [&>span:last-child]:w-6 [&>span:last-child]:h-6"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-purple-700 mb-2 block">Brow Head Bottom</Label>
                  <Slider 
                    value={[bottomHeadLine]} 
                    onValueChange={(val) => setBottomHeadLine(val[0])} 
                    max={100} 
                    className="w-full [&>span:first-child]:bg-purple-200 [&>span:first-child]:h-3 [&>span:last-child]:bg-purple-600 [&>span:last-child]:border-2 [&>span:last-child]:border-white [&>span:last-child]:shadow-lg [&>span:last-child]:w-6 [&>span:last-child]:h-6"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-purple-700 mb-2 block">Left Brow Head</Label>
                  <Slider 
                    value={[browHeadLeft]} 
                    onValueChange={(val) => setBrowHeadLeft(val[0])} 
                    max={100} 
                    className="w-full [&>span:first-child]:bg-purple-200 [&>span:first-child]:h-3 [&>span:last-child]:bg-purple-600 [&>span:last-child]:border-2 [&>span:last-child]:border-white [&>span:last-child]:shadow-lg [&>span:last-child]:w-6 [&>span:last-child]:h-6"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-purple-700 mb-2 block">Right Brow Head</Label>
                  <Slider 
                    value={[browHeadRight]} 
                    onValueChange={(val) => setBrowHeadRight(val[0])} 
                    max={100} 
                    className="w-full [&>span:first-child]:bg-purple-200 [&>span:first-child]:h-3 [&>span:last-child]:bg-purple-600 [&>span:last-child]:border-2 [&>span:last-child]:border-white [&>span:last-child]:shadow-lg [&>span:last-child]:w-6 [&>span:last-child]:h-6"
                  />
                </div>
              </div>

              {/* Visual Controls */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-purple-700 mb-2 block">Grid Opacity</Label>
                  <Slider 
                    value={[opacity * 100]} 
                    onValueChange={(val) => setOpacity(val[0] / 100)} 
                    max={100} 
                    className="w-full [&>span:first-child]:bg-purple-200 [&>span:first-child]:h-3 [&>span:last-child]:bg-purple-600 [&>span:last-child]:border-2 [&>span:last-child]:border-white [&>span:last-child]:shadow-lg [&>span:last-child]:w-6 [&>span:last-child]:h-6"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Grid Color</Label>
                  <Select value={color} onValueChange={setColor}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full ${option.preview}`}></div>
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGridVisible(!gridVisible)}
                    className="flex-1"
                  >
                    {gridVisible ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {gridVisible ? 'Hide Grid' : 'Show Grid'}
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t">
                <Button 
                  onClick={runSymmetryAnalysis} 
                  disabled={!uploadedImage || isAnalyzing}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Run AI Symmetry Check
                    </>
                  )}
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={resetMapping}
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={downloadMapping}
                    disabled={!uploadedImage}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Preview Panel */}
          <Card className="lg:col-span-2 shadow-xl rounded-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-purple-800">Mapping Preview</CardTitle>
                <div className="flex items-center gap-2">
                  {analysisComplete && (
                    <Badge variant={symmetryScore >= 90 ? "default" : "secondary"} className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Analysis Complete
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-purple-200 text-purple-700">
                    Symmetry: {symmetryScore}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 min-h-[600px] flex items-center justify-center">
                {uploadedImage ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={uploadedImage} 
                      alt="Client Photo" 
                      className="w-full h-full object-contain max-h-[600px]"
                    />
                    
                    {/* Mapping Grid Overlay */}
                    {gridVisible && (
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Center Line */}
                        <motion.div
                          className="absolute h-full w-0.5"
                          style={{ 
                            left: `${centerLine}%`, 
                            backgroundColor: color, 
                            opacity,
                            boxShadow: `0 0 8px ${color}`
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: opacity }}
                          transition={{ duration: 0.3 }}
                        />

                        {/* Horizontal Lines */}
                        <motion.div 
                          className="absolute w-full h-0.5" 
                          style={{ 
                            top: `${archLine}%`, 
                            backgroundColor: color, 
                            opacity,
                            boxShadow: `0 0 8px ${color}`
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: opacity }}
                          transition={{ duration: 0.3 }}
                        />
                        <motion.div 
                          className="absolute w-full h-0.5" 
                          style={{ 
                            top: `${topHeadLine}%`, 
                            backgroundColor: color, 
                            opacity,
                            boxShadow: `0 0 8px ${color}`
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: opacity }}
                          transition={{ duration: 0.3 }}
                        />
                        <motion.div 
                          className="absolute w-full h-0.5" 
                          style={{ 
                            top: `${bottomHeadLine}%`, 
                            backgroundColor: color, 
                            opacity,
                            boxShadow: `0 0 8px ${color}`
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: opacity }}
                          transition={{ duration: 0.3 }}
                        />

                        {/* Vertical Lines for Brow Heads */}
                        <motion.div 
                          className="absolute h-full w-0.5" 
                          style={{ 
                            left: `${browHeadLeft}%`, 
                            backgroundColor: color, 
                            opacity,
                            boxShadow: `0 0 8px ${color}`
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: opacity }}
                          transition={{ duration: 0.3 }}
                        />
                        <motion.div 
                          className="absolute h-full w-0.5" 
                          style={{ 
                            left: `${browHeadRight}%`, 
                            backgroundColor: color, 
                            opacity,
                            boxShadow: `0 0 8px ${color}`
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: opacity }}
                          transition={{ duration: 0.3 }}
                        />

                        {/* Mapping Points */}
                        <div className="absolute inset-0">
                          <div 
                            className="absolute w-3 h-3 rounded-full border-2 border-white shadow-lg"
                            style={{ 
                              left: `${centerLine}%`, 
                              top: `${archLine}%`,
                              backgroundColor: color,
                              transform: 'translate(-50%, -50%)'
                            }}
                          />
                          <div 
                            className="absolute w-3 h-3 rounded-full border-2 border-white shadow-lg"
                            style={{ 
                              left: `${browHeadLeft}%`, 
                              top: `${topHeadLine}%`,
                              backgroundColor: color,
                              transform: 'translate(-50%, -50%)'
                            }}
                          />
                          <div 
                            className="absolute w-3 h-3 rounded-full border-2 border-white shadow-lg"
                            style={{ 
                              left: `${browHeadRight}%`, 
                              top: `${topHeadLine}%`,
                              backgroundColor: color,
                              transform: 'translate(-50%, -50%)'
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Hidden Canvas for Download */}
                    <canvas ref={canvasRef} className="hidden" width={800} height={600} />
                  </div>
                ) : (
                  <div className="text-center space-y-4 p-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <Camera className="h-12 w-12 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Upload a Client Photo</h3>
                      <p className="text-gray-500 max-w-md">
                        Start by uploading a clear, front-facing photo of your client to begin the mapping process.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-6">
          {/* Image Upload - Mobile */}
          <Card className="shadow-xl rounded-2xl border-0 bg-white/90 backdrop-blur-sm border border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-t-2xl border-b border-purple-200">
              <CardTitle className="flex items-center gap-2 text-purple-800 text-center justify-center">
                <Upload className="h-5 w-5" />
                Upload Photo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="border-2 border-dashed border-purple-200 rounded-lg p-4 text-center hover:border-purple-300 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload-mobile"
                />
                <label htmlFor="image-upload-mobile" className="cursor-pointer">
                  {uploadedImage ? (
                    <div className="space-y-2">
                      <img src={uploadedImage} alt="Uploaded" className="w-16 h-16 object-cover rounded-lg mx-auto" />
                      <p className="text-sm text-purple-600">Tap to change image</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-6 w-6 text-purple-400 mx-auto" />
                      <p className="text-sm text-gray-600">Tap to upload photo</p>
                    </div>
                  )}
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Preview Panel - Mobile */}
          <Card className="shadow-xl rounded-2xl border-0 bg-white/90 backdrop-blur-sm border border-purple-200 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100 border-b border-purple-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-purple-800">Preview</CardTitle>
                <div className="flex items-center gap-2">
                  {analysisComplete && (
                    <Badge variant={symmetryScore >= 90 ? "default" : "secondary"} className="bg-green-100 text-green-800 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Done
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-purple-200 text-purple-700 text-xs">
                    {symmetryScore}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 min-h-[400px] flex items-center justify-center">
                {uploadedImage ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={uploadedImage} 
                      alt="Client Photo" 
                      className="w-full h-full object-contain max-h-[400px]"
                    />
                    
                    {/* Mapping Grid Overlay - Mobile */}
                    {gridVisible && (
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Center Line */}
                        <motion.div
                          className="absolute h-full w-1"
                          style={{ 
                            left: `${centerLine}%`, 
                            backgroundColor: color, 
                            opacity,
                            boxShadow: `0 0 6px ${color}`
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: opacity }}
                          transition={{ duration: 0.3 }}
                        />

                        {/* Horizontal Lines */}
                        <motion.div 
                          className="absolute w-full h-1" 
                          style={{ 
                            top: `${archLine}%`, 
                            backgroundColor: color, 
                            opacity,
                            boxShadow: `0 0 6px ${color}`
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: opacity }}
                          transition={{ duration: 0.3 }}
                        />
                        <motion.div 
                          className="absolute w-full h-1" 
                          style={{ 
                            top: `${topHeadLine}%`, 
                            backgroundColor: color, 
                            opacity,
                            boxShadow: `0 0 6px ${color}`
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: opacity }}
                          transition={{ duration: 0.3 }}
                        />
                        <motion.div 
                          className="absolute w-full h-1" 
                          style={{ 
                            top: `${bottomHeadLine}%`, 
                            backgroundColor: color, 
                            opacity,
                            boxShadow: `0 0 6px ${color}`
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: opacity }}
                          transition={{ duration: 0.3 }}
                        />

                        {/* Vertical Lines for Brow Heads */}
                        <motion.div 
                          className="absolute h-full w-1" 
                          style={{ 
                            left: `${browHeadLeft}%`, 
                            backgroundColor: color, 
                            opacity,
                            boxShadow: `0 0 6px ${color}`
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: opacity }}
                          transition={{ duration: 0.3 }}
                        />
                        <motion.div 
                          className="absolute h-full w-1" 
                          style={{ 
                            left: `${browHeadRight}%`, 
                            backgroundColor: color, 
                            opacity,
                            boxShadow: `0 0 6px ${color}`
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: opacity }}
                          transition={{ duration: 0.3 }}
                        />

                        {/* Mapping Points - Mobile */}
                        <div className="absolute inset-0">
                          <div 
                            className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg"
                            style={{ 
                              left: `${centerLine}%`, 
                              top: `${archLine}%`,
                              backgroundColor: color,
                              transform: 'translate(-50%, -50%)'
                            }}
                          />
                          <div 
                            className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg"
                            style={{ 
                              left: `${browHeadLeft}%`, 
                              top: `${topHeadLine}%`,
                              backgroundColor: color,
                              transform: 'translate(-50%, -50%)'
                            }}
                          />
                          <div 
                            className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg"
                            style={{ 
                              left: `${browHeadRight}%`, 
                              top: `${topHeadLine}%`,
                              backgroundColor: color,
                              transform: 'translate(-50%, -50%)'
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center space-y-4 p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <Camera className="h-8 w-8 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-700 mb-2">Upload Photo</h3>
                      <p className="text-gray-500 text-sm">
                        Start by uploading a client photo to begin mapping.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Controls Panel - Mobile (Under Image) */}
          <Card className="shadow-xl rounded-2xl border-0 bg-white/90 backdrop-blur-sm border border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-t-2xl border-b border-purple-200">
              <CardTitle className="flex items-center gap-2 text-purple-800 text-center justify-center">
                <Ruler className="h-5 w-5" />
                Mapping Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Mapping Controls - Mobile */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-purple-700 mb-2 block">Center Line</Label>
                  <Slider 
                    value={[centerLine]} 
                    onValueChange={(val) => setCenterLine(val[0])} 
                    max={100} 
                    className="w-full [&>span:first-child]:bg-purple-300 [&>span:first-child]:h-4 [&>span:last-child]:bg-purple-600 [&>span:last-child]:border-2 [&>span:last-child]:border-white [&>span:last-child]:shadow-lg [&>span:last-child]:w-7 [&>span:last-child]:h-7"
                  />
                  <div className="flex justify-between text-xs text-purple-600 mt-1 font-medium">
                    <span>Left</span>
                    <span>Center</span>
                    <span>Right</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-purple-700 mb-2 block">Arch Height</Label>
                  <Slider 
                    value={[archLine]} 
                    onValueChange={(val) => setArchLine(val[0])} 
                    max={100} 
                    className="w-full [&>span:first-child]:bg-purple-300 [&>span:first-child]:h-4 [&>span:last-child]:bg-purple-600 [&>span:last-child]:border-2 [&>span:last-child]:border-white [&>span:last-child]:shadow-lg [&>span:last-child]:w-7 [&>span:last-child]:h-7"
                  />
                  <div className="flex justify-between text-xs text-purple-600 mt-1 font-medium">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-purple-700 mb-2 block">Brow Head Top</Label>
                  <Slider 
                    value={[topHeadLine]} 
                    onValueChange={(val) => setTopHeadLine(val[0])} 
                    max={100} 
                    className="w-full [&>span:first-child]:bg-purple-300 [&>span:first-child]:h-4 [&>span:last-child]:bg-purple-600 [&>span:last-child]:border-2 [&>span:last-child]:border-white [&>span:last-child]:shadow-lg [&>span:last-child]:w-7 [&>span:last-child]:h-7"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-purple-700 mb-2 block">Brow Head Bottom</Label>
                  <Slider 
                    value={[bottomHeadLine]} 
                    onValueChange={(val) => setBottomHeadLine(val[0])} 
                    max={100} 
                    className="w-full [&>span:first-child]:bg-purple-300 [&>span:first-child]:h-4 [&>span:last-child]:bg-purple-600 [&>span:last-child]:border-2 [&>span:last-child]:border-white [&>span:last-child]:shadow-lg [&>span:last-child]:w-7 [&>span:last-child]:h-7"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-purple-700 mb-2 block">Left Brow Head</Label>
                  <Slider 
                    value={[browHeadLeft]} 
                    onValueChange={(val) => setBrowHeadLeft(val[0])} 
                    max={100} 
                    className="w-full [&>span:first-child]:bg-purple-300 [&>span:first-child]:h-4 [&>span:last-child]:bg-purple-600 [&>span:last-child]:border-2 [&>span:last-child]:border-white [&>span:last-child]:shadow-lg [&>span:last-child]:w-7 [&>span:last-child]:h-7"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-purple-700 mb-2 block">Right Brow Head</Label>
                  <Slider 
                    value={[browHeadRight]} 
                    onValueChange={(val) => setBrowHeadRight(val[0])} 
                    max={100} 
                    className="w-full [&>span:first-child]:bg-purple-300 [&>span:first-child]:h-4 [&>span:last-child]:bg-purple-600 [&>span:last-child]:border-2 [&>span:last-child]:border-white [&>span:last-child]:shadow-lg [&>span:last-child]:w-7 [&>span:last-child]:h-7"
                  />
                </div>
              </div>

              {/* Visual Controls - Mobile */}
              <div className="space-y-4 pt-4 border-t border-purple-200">
                <div>
                  <Label className="text-sm font-semibold text-purple-700 mb-2 block">Grid Opacity</Label>
                  <Slider 
                    value={[opacity * 100]} 
                    onValueChange={(val) => setOpacity(val[0] / 100)} 
                    max={100} 
                    className="w-full [&>span:first-child]:bg-purple-300 [&>span:first-child]:h-4 [&>span:last-child]:bg-purple-600 [&>span:last-child]:border-2 [&>span:last-child]:border-white [&>span:last-child]:shadow-lg [&>span:last-child]:w-7 [&>span:last-child]:h-7"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-purple-700 mb-2 block">Grid Color</Label>
                  <Select value={color} onValueChange={setColor}>
                    <SelectTrigger className="w-full border-purple-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full ${option.preview}`}></div>
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGridVisible(!gridVisible)}
                    className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    {gridVisible ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {gridVisible ? 'Hide Grid' : 'Show Grid'}
                  </Button>
                </div>
              </div>

              {/* Action Buttons - Mobile */}
              <div className="space-y-3 pt-4 border-t border-purple-200">
                <Button 
                  onClick={runSymmetryAnalysis} 
                  disabled={!uploadedImage || isAnalyzing}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Run AI Symmetry Check
                    </>
                  )}
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={resetMapping}
                    className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={downloadMapping}
                    disabled={!uploadedImage}
                    className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Results */}
        <AnimatePresence>
          {analysisComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <h3 className="text-xl font-semibold text-green-800">Symmetry Analysis Complete</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-green-600">{symmetryScore}%</div>
                      <div className="text-sm text-gray-600">Symmetry Score</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-lg font-semibold text-purple-600">
                        {symmetryScore >= 90 ? 'Excellent' : symmetryScore >= 80 ? 'Good' : 'Needs Attention'}
                      </div>
                      <div className="text-sm text-gray-600">Overall Assessment</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-lg font-semibold text-blue-600">
                        {symmetryScore >= 90 ? 'Proceed' : 'Review Required'}
                      </div>
                      <div className="text-sm text-gray-600">Recommendation</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
