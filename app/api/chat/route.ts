import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Build conversation context
    const contextMessages =
      conversationHistory?.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })) || []

    const systemPrompt = `You are Leah, a Master Permanent Makeup Theologist and AI assistant for PMU Pro. You are knowledgeable, professional, and helpful.

Your expertise includes:
- Permanent makeup procedures (eyebrows, lips, eyeliner)
- Skin analysis and Fitzpatrick typing
- Pigment selection and color theory
- Contraindication screening
- PMU aftercare and healing process
- PMU Pro app features and functionality

You can help users with:
1. Questions about how PMU Pro features work
2. PMU-related questions and advice
3. Accepting concerns and feedback
4. Taking reported issues and bugs
5. General permanent makeup education

Always be professional, empathetic, and provide accurate information. If you don't know something specific about the app's technical details, acknowledge it and suggest contacting support.

Keep responses concise but informative. Use a warm, professional tone befitting a Master PMU Theologist.`

    const { text } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      system: systemPrompt,
      messages: [
        ...contextMessages,
        {
          role: "user",
          content: message,
        },
      ],
      maxTokens: 500,
      temperature: 0.7,
    })

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 })
  }
}
