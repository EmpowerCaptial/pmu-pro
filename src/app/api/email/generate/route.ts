import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Template prompts for different email types
const TEMPLATE_PROMPTS = {
  'holiday-promotion': {
    system: "You are a professional PMU artist writing holiday promotional emails. Create engaging, festive content that builds excitement while maintaining professionalism.",
    template: "Write a holiday promotional email for a PMU business. Include festive language, special offers, and call-to-action."
  },
  'anniversary': {
    system: "You are a professional PMU artist writing anniversary celebration emails. Focus on gratitude, milestones, and special offers for loyal clients.",
    template: "Write an anniversary celebration email for a PMU business. Emphasize gratitude, business milestones, and special client rewards."
  },
  'seasonal-update': {
    system: "You are a professional PMU artist writing seasonal service updates. Highlight seasonal trends, new techniques, and timely service offerings.",
    template: "Write a seasonal update email for a PMU business. Focus on seasonal trends, new services, and timely recommendations."
  },
  'grand-opening': {
    system: "You are a professional PMU artist writing grand opening announcements. Create excitement about new services, locations, or studio improvements.",
    template: "Write a grand opening announcement email for a PMU business. Build excitement about new offerings, improvements, or expansions."
  },
  'flash-sale': {
    system: "You are a professional PMU artist writing flash sale emails. Create urgency while maintaining trust and professionalism.",
    template: "Write a flash sale email for a PMU business. Create urgency with limited-time offers while maintaining professional credibility."
  },
  'loyalty-discount': {
    system: "You are a professional PMU artist writing loyalty reward emails. Show appreciation and offer exclusive benefits to returning clients.",
    template: "Write a loyalty rewards email for a PMU business. Show appreciation for returning clients and offer exclusive benefits."
  },
  'referral-bonus': {
    system: "You are a professional PMU artist writing referral program emails. Encourage referrals with attractive incentives and clear benefits.",
    template: "Write a referral program email for a PMU business. Encourage client referrals with clear benefits and attractive incentives."
  },
  'package-deal': {
    system: "You are a professional PMU artist writing package deal emails. Highlight value, savings, and convenience of bundled services.",
    template: "Write a package deal email for a PMU business. Emphasize value, savings, and convenience of bundled service offerings."
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      template, 
      businessName, 
      artistName, 
      serviceType, 
      keyPoints,
      customPrompt 
    } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    let systemPrompt = "You are a professional PMU (Permanent Makeup) artist and business owner. Write engaging, professional emails that build client relationships and drive business growth."
    let userPrompt = ""

    if (customPrompt) {
      // Custom email generation
      userPrompt = `
        Write a professional email for a PMU business based on these details:
        
        Business Name: ${businessName || 'PMU Studio'}
        Artist Name: ${artistName || 'Professional Artist'}
        Service Type: ${serviceType || 'Permanent Makeup Services'}
        
        Custom Requirements: ${customPrompt}
        
        Please create a professional, engaging email that:
        - Maintains a warm, professional tone
        - Includes a clear subject line
        - Has a compelling opening
        - Provides valuable information
        - Includes a strong call-to-action
        - Is formatted in HTML for email
        - Uses appropriate PMU industry terminology
        - Builds trust and credibility
      `
    } else if (template && template.id) {
      // Template-based generation
      const templateConfig = TEMPLATE_PROMPTS[template.id]
      if (templateConfig) {
        systemPrompt = templateConfig.system
        
        userPrompt = `
          ${templateConfig.template}
          
          Business Details:
          - Business Name: ${businessName || 'PMU Studio'}
          - Artist Name: ${artistName || 'Professional Artist'}
          - Service Type: ${serviceType || 'Permanent Makeup Services'}
          - Key Points: ${keyPoints || 'Special offer or announcement'}
          
          Please create a professional email that:
          - Matches the ${template.title} theme
          - Includes a compelling subject line
          - Has an engaging opening paragraph
          - Incorporates the key points naturally
          - Includes a clear call-to-action
          - Is formatted in HTML for email
          - Maintains professional PMU industry standards
          - Builds excitement and trust
          - Uses appropriate tone for the template type
        `
      }
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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
      max_tokens: 800,
      temperature: 0.7,
    })

    const emailContent = completion.choices[0]?.message?.content

    if (!emailContent) {
      throw new Error('No content generated')
    }

    // Format the email content for better display
    const formattedContent = emailContent
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')

    return NextResponse.json({
      content: formattedContent,
      template: template?.title || 'Custom Email'
    })

  } catch (error) {
    console.error('Error generating email:', error)
    return NextResponse.json(
      { error: 'Failed to generate email' },
      { status: 500 }
    )
  }
}
