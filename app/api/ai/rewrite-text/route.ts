import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export const dynamic = "force-dynamic"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface RewriteRequest {
  text: string
  options: {
    tone: 'professional' | 'friendly' | 'urgent' | 'casual'
    length: 'concise' | 'detailed' | 'standard'
    context: 'follow-up' | 'reminder' | 'instructions' | 'marketing' | 'general'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, options }: RewriteRequest = await request.json()

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Create context-specific prompts
    const contextPrompts = {
      'follow-up': 'This is a follow-up message to a PMU client after their procedure.',
      'reminder': 'This is a reminder message for a PMU client about an upcoming appointment or aftercare.',
      'instructions': 'This is instructional content for a PMU client about aftercare or procedure preparation.',
      'marketing': 'This is marketing content for a PMU artist to promote their services.',
      'general': 'This is general communication from a PMU artist to a client.'
    }

    const toneInstructions = {
      'professional': 'Use a professional, business-like tone while remaining warm and approachable.',
      'friendly': 'Use a warm, friendly, and personal tone that builds rapport.',
      'urgent': 'Use a direct, urgent tone while remaining professional and helpful.',
      'casual': 'Use a casual, conversational tone while maintaining professionalism.'
    }

    const lengthInstructions = {
      'concise': 'Keep the message brief and to the point (1-2 sentences).',
      'standard': 'Use a standard length (2-4 sentences).',
      'detailed': 'Provide more detail and context (4+ sentences).'
    }

    const systemPrompt = `You are an AI assistant that helps PMU (Permanent Makeup) artists rewrite their messages to clients. 

Your task is to:
1. Maintain the original intent and key information
2. Use appropriate PMU terminology and industry language
3. Ensure the message is professional and client-friendly
4. Follow the specified tone, length, and context requirements
5. Make the message clear, engaging, and actionable

${contextPrompts[options.context]}
${toneInstructions[options.tone]}
${lengthInstructions[options.length]}

Guidelines:
- Use proper PMU terminology (e.g., "healing process", "touch-up", "pigment", "aftercare")
- Be encouraging and supportive
- Include actionable next steps when appropriate
- Maintain a professional yet warm tone
- Avoid medical advice unless it's standard aftercare instructions
- Keep language accessible to clients`

    const userPrompt = `Please rewrite this message for a PMU artist to send to their client:

"${text}"

Requirements:
- Tone: ${options.tone}
- Length: ${options.length}
- Context: ${options.context}

Make it sound natural, professional, and appropriate for the PMU industry.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const rewrittenText = completion.choices[0]?.message?.content?.trim()

    if (!rewrittenText) {
      return NextResponse.json(
        { error: 'Failed to generate rewritten text' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      rewrittenText,
      originalText: text,
      options
    })

  } catch (error) {
    console.error('Error rewriting text:', error)
    return NextResponse.json(
      { error: 'Failed to rewrite text' },
      { status: 500 }
    )
  }
}
