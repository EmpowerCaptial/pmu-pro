"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, Lightbulb, CheckCircle, AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface PhotoCaptureStepProps {
  onPhotoCapture: (photoUrl: string) => void
  capturedPhoto?: string | null
}

const photoGuidelines = [
  { text: "Face a window for natural light", icon: CheckCircle, type: "success" as const },
  { text: "Remove all makeup", icon: CheckCircle, type: "success" as const },
  { text: "Ensure face is well-lit and in focus", icon: CheckCircle, type: "success" as const },
  { text: "Avoid overhead lighting", icon: AlertTriangle, type: "warning" as const },
  { text: "No shadows on the face", icon: AlertTriangle, type: "warning" as const },
]

export function PhotoCaptureStep({ onPhotoCapture, capturedPhoto }: PhotoCaptureStepProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [photoQuality, setPhotoQuality] = useState<"good" | "fair" | "poor" | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const photoUrl = e.target?.result as string
        // Mock photo quality assessment
        const quality = Math.random() > 0.3 ? "good" : "fair"
        setPhotoQuality(quality)
        onPhotoCapture(photoUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  if (capturedPhoto) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Photo Captured
            </CardTitle>
            <CardDescription>Review your photo before proceeding with analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <img
                src={capturedPhoto || "/placeholder.svg"}
                alt="Captured for analysis"
                className="w-full max-w-md mx-auto rounded-lg"
              />
              {photoQuality && (
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={photoQuality === "good" ? "default" : "secondary"}
                    className={cn(
                      photoQuality === "good" && "bg-green-100 text-green-800",
                      photoQuality === "fair" && "bg-yellow-100 text-yellow-800",
                      photoQuality === "poor" && "bg-red-100 text-red-800",
                    )}
                  >
                    {photoQuality === "good" && "Good Quality"}
                    {photoQuality === "fair" && "Fair Quality"}
                    {photoQuality === "poor" && "Poor Quality"}
                  </Badge>
                </div>
              )}
            </div>

            {photoQuality === "fair" && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Photo quality is fair. For best results, consider retaking with better lighting or focus.
                </AlertDescription>
              </Alert>
            )}

            {photoQuality === "poor" && (
              <Alert variant="destructive">
                <X className="h-4 w-4" />
                <AlertDescription>
                  Photo quality is poor. Please retake with better lighting and focus for accurate analysis.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setPhotoQuality(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                  }
                }}
                className="bg-transparent"
              >
                Retake Photo
              </Button>
              <Button onClick={() => onPhotoCapture(capturedPhoto)} disabled={photoQuality === "poor"}>
                Proceed with Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Photo Guidelines
          </CardTitle>
          <CardDescription>Follow these guidelines for the most accurate skin analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {photoGuidelines.map((guideline, index) => (
              <div key={index} className="flex items-center gap-3">
                <guideline.icon
                  className={cn(
                    "h-4 w-4",
                    guideline.type === "success" && "text-green-600",
                    guideline.type === "warning" && "text-yellow-600",
                  )}
                />
                <span className="text-sm">{guideline.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Photo Capture */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer hover:border-primary/50",
          isDragOver && "border-primary bg-primary/5",
        )}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 rounded-full bg-primary/10 p-6">
            <Camera className="h-12 w-12 text-primary" />
          </div>
          <h3 className="mb-3 text-xl font-semibold">Capture or Upload Photo</h3>
          <p className="mb-6 text-muted-foreground max-w-md">
            Take a photo with your device camera or upload an existing image for skin analysis
          </p>
          <div className="flex gap-3">
            <Button size="lg" className="gap-2">
              <Camera className="h-5 w-5" />
              Take Photo
            </Button>
            <Button variant="outline" size="lg" className="gap-2 bg-transparent">
              <Upload className="h-5 w-5" />
              Upload Image
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Supports JPG, PNG, and HEIC formats • Max file size: 10MB
          </p>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  )
}
