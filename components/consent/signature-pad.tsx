"use client"

import React, { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Undo2, RotateCcw } from "lucide-react"

interface SignaturePadProps {
  onSignature: (signature: string) => void
  value?: string
  width?: number
  height?: number
}

export function SignaturePad({ onSignature, value, width = 400, height = 200 }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = width
    canvas.height = height

    // Set drawing styles
    ctx.strokeStyle = "#1f2937"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    setContext(ctx)
  }, [width, height])

  // Separate effect for loading signature to prevent infinite re-renders
  useEffect(() => {
    if (value && context && canvasRef.current) {
      loadSignature(value)
    }
  }, [value, context])

  const loadSignature = (signatureData: string) => {
    if (!context || !canvasRef.current) return

    const img = new Image()
    img.onload = () => {
      context.clearRect(0, 0, width, height)
      context.drawImage(img, 0, 0, width, height)
      // Don't set hasSignature here to prevent re-render loops
      // setHasSignature(true)
    }
    img.src = signatureData
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!context) return

    setIsDrawing(true)
    const rect = canvasRef.current!.getBoundingClientRect()
    let clientX: number, clientY: number

    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = clientX - rect.left
    const y = clientY - rect.top

    context.beginPath()
    context.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return

    const rect = canvasRef.current!.getBoundingClientRect()
    let clientX: number, clientY: number

    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = clientX - rect.left
    const y = clientY - rect.top

    context.lineTo(x, y)
    context.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawing) return

    setIsDrawing(false)
    setHasSignature(true)
    
    // Convert canvas to data URL and send to parent
    if (canvasRef.current) {
      const signatureData = canvasRef.current.toDataURL("image/png")
      onSignature(signatureData)
    }
  }

  const clearSignature = () => {
    if (!context || !canvasRef.current) return

    context.clearRect(0, 0, width, height)
    setHasSignature(false)
    onSignature("")
  }

  const undoLastStroke = () => {
    // For simplicity, we'll just clear the entire signature
    // In a more advanced implementation, you could track individual strokes
    clearSignature()
  }

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => startDrawing(e)
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => draw(e)
  const handleMouseUp = () => stopDrawing()
  const handleMouseLeave = () => stopDrawing()

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    startDrawing(e)
  }
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    draw(e)
  }
  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    stopDrawing()
  }

  return (
    <div className="space-y-3">
      <Card className="border-2 border-dashed border-lavender/300 hover:border-lavender/500 transition-colors bg-white shadow-sm">
        <CardContent className="p-4">
          <canvas
            ref={canvasRef}
            className="border-2 border-lavender/200 rounded-lg cursor-crosshair touch-none bg-white"
            style={{ width: `${width}px`, height: `${height}px` }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={undoLastStroke}
            disabled={!hasSignature}
            className="text-xs bg-white border-2 border-lavender/200 text-lavender hover:bg-lavender/10 hover:border-lavender/300"
          >
            <Undo2 className="h-3 w-3 mr-1" />
            Undo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearSignature}
            disabled={!hasSignature}
            className="text-xs bg-white border-2 border-lavender/200 text-lavender hover:bg-lavender/10 hover:border-lavender/300"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>

        {hasSignature && (
          <div className="text-xs text-green-600 font-medium">
            ✓ Signature captured
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        Sign above using your mouse or touch screen
      </p>
    </div>
  )
}
