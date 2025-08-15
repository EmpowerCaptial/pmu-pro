"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Upload, RotateCcw, CheckCircle, AlertCircle, Zap, AlertTriangle } from "lucide-react"

interface EnhancedPhotoCaptureProps {
  onPhotoCapture: (photoUrl: string) => void
  capturedPhoto?: string | null
}

export function EnhancedPhotoCapture({ onPhotoCapture, capturedPhoto }: EnhancedPhotoCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [lightingQuality, setLightingQuality] = useState<"good" | "poor" | "checking">("checking")
  const [faceDistance, setFaceDistance] = useState<"good" | "too-close" | "too-far" | "checking">("checking")
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock lighting and face detection (in real app, this would use actual computer vision)
  const checkPhotoQuality = useCallback(() => {
    // Simulate quality checks
    setTimeout(() => {
      setLightingQuality(Math.random() > 0.3 ? "good" : "poor")
      setFaceDistance(Math.random() > 0.2 ? "good" : Math.random() > 0.5 ? "too-close" : "too-far")
    }, 1000)
  }, [])

  const startCamera = async () => {
    setIsLoading(true)
    setCameraError(null)

    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access is not supported in this browser")
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      })

      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          setIsCapturing(true)
          setIsLoading(false)
          checkPhotoQuality()
        }
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setIsLoading(false)
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          setCameraError("Camera access denied. Please allow camera permissions and try again.")
        } else if (error.name === "NotFoundError") {
          setCameraError("No camera found. Please connect a camera and try again.")
        } else if (error.name === "NotReadableError") {
          setCameraError("Camera is already in use by another application.")
        } else {
          setCameraError("Unable to access camera. Please check your camera settings.")
        }
      } else {
        setCameraError("Camera access failed. Please try again.")
      }
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
    setLightingQuality("checking")
    setFaceDistance("checking")
    setCameraError(null)
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
    if (lightingQuality !== "good" || faceDistance !== "good") {
      return
    }

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
        onPhotoCapture(photoUrl)
        stopCamera()

        // Final success beep
        playBeep(1000, 500)
      } else {
        setCameraError("Failed to capture photo. Please try again.")
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        setCameraError("Please select a valid image file.")
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        setCameraError("File too large. Please select an image under 10MB.")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const photoUrl = e.target?.result as string
        onPhotoCapture(photoUrl)
      }
      reader.onerror = () => {
        setCameraError("Failed to read image file. Please try again.")
      }
      reader.readAsDataURL(file)
    }
  }

  const retakePhoto = () => {
    onPhotoCapture("")
    setCameraError(null)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  if (capturedPhoto) {
    return (
      <Card className="border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-center font-serif">Photo Captured</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <img
              src={capturedPhoto || "/placeholder.svg"}
              alt="Captured photo"
              className="w-full max-w-md mx-auto rounded-lg shadow-md"
            />
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Ready for Analysis
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={retakePhoto}
            className="w-full bg-white/90 backdrop-blur-sm hover:bg-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Photo
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-center font-serif">Capture Client Photo</CardTitle>
        <p className="text-center text-sm text-muted-foreground">Position face in center frame with good lighting</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {cameraError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{cameraError}</AlertDescription>
          </Alert>
        )}

        {!isCapturing ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-lavender/20 to-lavender-600/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Camera className="w-12 h-12 text-lavender" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Take a clear, well-lit photo for accurate skin analysis
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={startCamera}
                disabled={isLoading}
                className="bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                {isLoading ? "Starting..." : "Use Camera"}
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/90 backdrop-blur-sm hover:bg-white border-lavender/30"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-md mx-auto rounded-lg shadow-md bg-gray-100"
                style={{ minHeight: "300px" }}
              />

              {/* Countdown Overlay */}
              {countdown && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <div className="text-6xl font-bold text-white animate-pulse">{countdown}</div>
                </div>
              )}

              {/* Quality Indicators */}
              <div className="absolute top-2 left-2 space-y-2">
                <Badge
                  variant={lightingQuality === "good" ? "default" : "destructive"}
                  className={
                    lightingQuality === "good" ? "bg-green-100 text-green-800" : "bg-white/90 backdrop-blur-sm"
                  }
                >
                  <Zap className="w-3 h-3 mr-1" />
                  {lightingQuality === "checking"
                    ? "Checking..."
                    : lightingQuality === "good"
                      ? "Good Lighting"
                      : "Poor Lighting"}
                </Badge>

                <Badge
                  variant={faceDistance === "good" ? "default" : "destructive"}
                  className={faceDistance === "good" ? "bg-green-100 text-green-800" : "bg-white/90 backdrop-blur-sm"}
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {faceDistance === "checking"
                    ? "Checking..."
                    : faceDistance === "good"
                      ? "Good Distance"
                      : faceDistance === "too-close"
                        ? "Move Back"
                        : "Move Closer"}
                </Badge>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={stopCamera}
                className="flex-1 bg-white/90 backdrop-blur-sm hover:bg-white border-lavender/30"
              >
                Cancel
              </Button>
              <Button
                onClick={startCountdown}
                disabled={lightingQuality !== "good" || faceDistance !== "good" || countdown !== null}
                className="flex-1 bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-white"
              >
                {countdown ? `${countdown}...` : "Capture Photo"}
              </Button>
            </div>

            {(lightingQuality === "poor" || faceDistance !== "good") && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  {lightingQuality === "poor" && "Please improve lighting conditions. "}
                  {faceDistance === "too-close" && "Please move further from camera. "}
                  {faceDistance === "too-far" && "Please move closer to camera. "}
                </p>
              </div>
            )}
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  )
}
