import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("[v0] Photo analyze API called")
  try {
    console.log("[v0] Parsing form data...")
    const formData = await request.formData()
    const file = formData.get("image") as File
    console.log("[v0] File received:", file ? `${file.name} (${file.size} bytes, ${file.type})` : "null")

    if (!file) {
      console.log("[v0] No file provided")
      return NextResponse.json({ 
        success: false,
        error: "No image file provided" 
      }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      console.log("[v0] Invalid file type:", file.type)
      return NextResponse.json({ 
        success: false,
        error: "Invalid file type. Please upload an image." 
      }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      console.log("[v0] File too large:", file.size)
      return NextResponse.json({ 
        success: false,
        error: "File too large. Maximum size is 10MB." 
      }, { status: 400 })
    }

    console.log("[v0] Converting file to base64...")
    // Convert file to base64 for processing
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    console.log("[v0] Base64 conversion complete, length:", base64.length)
    
    console.log("[v0] Generating mock results...")
    // TODO: Implement actual AI analysis
    // For now, return mock results with proper structure
    const mockResults = {
      success: true,
      data: {
        fitzpatrick: Math.floor(Math.random() * 6) + 1,
        undertone: ["cool", "neutral", "warm"][Math.floor(Math.random() * 3)],
        confidence: Math.round((0.85 + Math.random() * 0.15) * 100) / 100, // 85-100%
        photoQuality: "good",
        timestamp: new Date().toISOString(),
        recommendations: [
          {
            pigmentId: "1",
            name: "Permablend Honey Magic",
            brand: "Permablend",
            why: "Perfect match for detected skin characteristics",
            expectedHealShift: "Slight warm heal, maintains golden base",
            confidence: 0.92
          },
          {
            pigmentId: "2",
            name: "Li Pigments Mocha",
            brand: "Li Pigments",
            why: "Warm alternative with rich brown tones",
            expectedHealShift: "Stable healing with minimal shift",
            confidence: 0.88
          },
          {
            pigmentId: "3",
            name: "Tina Davies Ash Brown",
            brand: "Tina Davies",
            why: "Cool alternative for versatile results",
            expectedHealShift: "May fade to soft gray undertones",
            confidence: 0.84
          },
        ],
      }
    }

    console.log("[v0] Simulating processing time...")
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log("[v0] Returning successful response")
    return NextResponse.json(mockResults, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error("[v0] Photo analysis error:", error)
    return NextResponse.json({ 
      success: false,
      error: "Analysis failed. Please try again.",
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}
