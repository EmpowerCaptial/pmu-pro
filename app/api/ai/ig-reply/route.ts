import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Get authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Verify the JWT token and get user
    const user = await AuthService.verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // Get request data
    const { text, brandTone = "friendly, expert PMU instructor", service = "permanent makeup" } = await req.json();
    
    if (!text) {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
    }

    // Create AI prompt
    const prompt = `You are an AI assistant for a ${service} studio. Tone: ${brandTone}.
A potential client DM'd: "${text}".
Draft a concise, warm reply that:
- answers their question,
- offers to book or learn more,
- includes 1 follow-up question if helpful.
No emojis. 80-120 words.`;

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}` 
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      return NextResponse.json({ 
        error: "AI service error", 
        details: "Failed to generate reply suggestion" 
      }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() ?? "";

    if (!reply) {
      return NextResponse.json({ 
        error: "AI service error", 
        details: "No reply generated" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      reply,
      metadata: {
        model: "gpt-4o-mini",
        tokensUsed: data.usage?.total_tokens || 0,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("AI reply error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate reply suggestion", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    );
  }
}
