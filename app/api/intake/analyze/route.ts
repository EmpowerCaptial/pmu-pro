import { type NextRequest, NextResponse } from "next/server"
import { aiClient } from "@/lib/ai-client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conditions, medications, notes } = body

    if (!conditions || !medications) {
      return NextResponse.json({ error: "Conditions and medications are required" }, { status: 400 })
    }

    // Validate input arrays
    if (!Array.isArray(conditions) || !Array.isArray(medications)) {
      return NextResponse.json({ error: "Conditions and medications must be arrays" }, { status: 400 })
    }

    // Analyze contraindications using AI client
    const result = await aiClient.analyzeIntake({
      conditions,
      medications,
      notes,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Intake analysis error:", error)
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 })
  }
}
