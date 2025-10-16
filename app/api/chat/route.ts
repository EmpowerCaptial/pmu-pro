import { NextRequest, NextResponse } from 'next/server'

// PMU Knowledge Base for LEAH
const PMU_KNOWLEDGE = {
  general: {
    "what is pmu": "Permanent Makeup (PMU) is a cosmetic tattooing technique that deposits pigment into the dermal layer of the skin to create long-lasting makeup effects. It's used for eyebrows, eyeliner, lip color, and other cosmetic enhancements.",
    "how long does pmu last": "PMU typically lasts 1-3 years, depending on factors like skin type, lifestyle, sun exposure, and the area treated. Touch-ups are usually needed every 12-18 months to maintain optimal results.",
    "is pmu painful": "Most clients report minimal discomfort during PMU procedures. Topical anesthetics are used to numb the area, and the sensation is often described as a light scratching or vibration.",
    "what areas can be treated": "Common PMU areas include eyebrows (microblading, powder brows), eyeliner (top, bottom, or both), lip color/liner, beauty marks, and scalp micropigmentation for hair loss.",
    "how long is recovery": "Initial healing takes 7-14 days, with some redness and swelling. Full healing and color settling takes 6-8 weeks. During this time, avoid sun exposure, swimming, and certain skincare products."
  },
  site_information: {
    "contact": "You can contact us at admin@thepmuguide.com for any questions, support, or inquiries about our PMU Pro system.",
    "support": "For technical support or questions about using the PMU Pro platform, please email admin@thepmuguide.com. Our team is here to help!",
    "help": "I'm Leah, your PMU Pro AI assistant! I can help with PMU questions, site navigation, and general information. For technical support, contact admin@thepmuguide.com.",
    "website": "PMU Pro is a comprehensive platform for PMU artists to manage clients, analyze skin types, access pigment libraries, and maintain professional resources. Visit thepmuguide.com to learn more.",
    "features": "PMU Pro features include: Client Management, Skin Analysis, Pigment Library, Resource Library, Color Correction Tools, and Professional Forms. Each feature is designed to enhance your PMU practice.",
    "dashboard": "The dashboard is your central hub for accessing all PMU Pro features. From there you can manage clients, access tools, and navigate to different sections of the platform.",
    "clients": "The client management system allows you to store client information, track procedures, manage documents, and maintain consultation records. You can add new clients, view profiles, and track their PMU journey.",
    "pigment library": "Our pigment library contains professional pigment recommendations from top brands like Permablend, Evenflo, LI Pigments, and Quantum. Each pigment includes Fitzpatrick type recommendations and undertone matching.",
    "resources": "The resource library provides downloadable forms, guides, and templates including aftercare instructions, consultation forms, consent waivers, and professional checklists.",
    "skin analysis": "Our skin analysis tools help determine Fitzpatrick skin type, undertone analysis, and provide pigment recommendations based on individual characteristics for optimal PMU results."
  },
  eyebrows: {
    "microblading": "Microblading creates natural-looking hair strokes using fine blades. Ideal for sparse or over-plucked brows. Results last 1-2 years with proper care.",
    "powder brows": "Powder brows create a soft, filled-in appearance using a shading technique. Great for those who want a more defined, makeup-like look.",
    "brow shape": "Brow shape should complement your face shape. Oval faces suit most shapes, round faces benefit from angular brows, and square faces look great with soft, rounded brows.",
    "brow color": "Brow color should be 1-2 shades darker than your natural hair color for natural results. Consider your skin undertone when selecting pigment."
  },
  aftercare: {
    "healing process": "Days 1-3: Keep area clean and dry. Days 4-7: Apply healing ointment sparingly. Days 8-14: Moisturize as needed. Avoid sun, swimming, and makeup until fully healed.",
    "what to avoid": "Avoid sun exposure, swimming, saunas, excessive sweating, picking scabs, and using harsh skincare products during healing.",
    "when to touch up": "Schedule your touch-up appointment 6-8 weeks after the initial procedure to ensure proper healing and color settling.",
    "long term care": "Use SPF daily, avoid excessive sun exposure, and schedule annual touch-ups to maintain your PMU results."
  },
  skin_types: {
    "fitzpatrick scale": "The Fitzpatrick Scale classifies skin types I-VI based on sun response and pigmentation. Type I always burns, Type VI never burns. This helps determine PMU technique and pigment selection.",
    "oily skin": "Oily skin may require more frequent touch-ups as excess oil can break down pigment faster. Powder technique often works better than microblading for oily skin.",
    "dry skin": "Dry skin typically holds pigment well but may need extra moisturizing during healing. Hydration helps with color retention.",
    "sensitive skin": "Sensitive skin may experience more redness and swelling. Patch testing is recommended, and gentle aftercare products should be used."
  },
  techniques: {
    "microblading": "Uses fine blades to create hair-like strokes. Best for natural-looking brows on normal to dry skin types.",
    "powder brows": "Uses a shading technique for a filled-in, makeup-like appearance. Works well on all skin types.",
    "combination brows": "Combines microblading strokes with powder shading for the best of both techniques.",
    "machine technique": "Uses a tattoo machine for precise pigment placement. Often used for eyeliner and lip procedures."
  }
}

// AI Response Generator
function generateResponse(userMessage: string, conversationHistory: any[]): string {
  const message = userMessage.toLowerCase().trim()
  
  // Check for greetings
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return "Hello! I'm Leah, your PMU Pro assistant. I'm here to help you with any questions about permanent makeup, techniques, aftercare, or skin analysis. What would you like to know today?"
  }
  
  // Check for specific PMU topics
  for (const [category, topics] of Object.entries(PMU_KNOWLEDGE)) {
    for (const [key, response] of Object.entries(topics)) {
      if (message.includes(key) || key.includes(message)) {
        return response
      }
    }
  }
  
  // Check for site information questions
  if (message.includes('contact') || message.includes('email') || message.includes('support')) {
    return "You can contact us at admin@thepmuguide.com for any questions, support, or inquiries about our PMU Pro system. Our team is here to help!"
  }
  
  if (message.includes('website') || message.includes('platform') || message.includes('system')) {
    return "PMU Pro is a comprehensive platform for PMU artists to manage clients, analyze skin types, access pigment libraries, and maintain professional resources. Visit thepmuguide.com to access all features."
  }
  
  if (message.includes('features') || message.includes('tools') || message.includes('what can you do')) {
    return "PMU Pro features include: Client Management, Skin Analysis, Pigment Library, Resource Library, Color Correction Tools, and Professional Forms. Each feature is designed to enhance your PMU practice. I can help you navigate and use any of these tools!"
  }
  
  if (message.includes('dashboard') || message.includes('navigate') || message.includes('where to go')) {
    return "The dashboard is your central hub for accessing all PMU Pro features. From there you can manage clients, access tools, and navigate to different sections of the platform. Use the navigation menu to explore all available features."
  }
  
  if (message.includes('clients') || message.includes('client management')) {
    return "The client management system allows you to store client information, track procedures, manage documents, and maintain consultation records. You can add new clients, view profiles, and track their PMU journey. Access it from the dashboard under 'Clients'."
  }
  
  if (message.includes('pigment') || message.includes('colors') || message.includes('brands')) {
    return "Our pigment library contains professional pigment recommendations from top brands like Permablend, Evenflo, LI Pigments, and Quantum. Each pigment includes Fitzpatrick type recommendations and undertone matching. Access it from the dashboard under 'Pigment Library'."
  }
  
  if (message.includes('resources') || message.includes('forms') || message.includes('downloads')) {
    return "The resource library provides downloadable forms, guides, and templates including aftercare instructions, consultation forms, consent waivers, and professional checklists. Access it from the dashboard under 'Resource Library'."
  }
  
  if (message.includes('skin analysis') || message.includes('fitzpatrick') || message.includes('undertone')) {
    return "Our skin analysis tools help determine Fitzpatrick skin type, undertone analysis, and provide pigment recommendations based on individual characteristics for optimal PMU results. Access it from the dashboard under 'Skin Analysis'."
  }
  
  // Check for common PMU questions
  if (message.includes('pain') || message.includes('hurt')) {
    return "PMU procedures are generally well-tolerated with minimal discomfort. Topical anesthetics are used to numb the area, and most clients describe the sensation as light scratching or vibration. The discomfort level varies by individual and area treated."
  }
  
  if (message.includes('cost') || message.includes('price')) {
    return "PMU pricing varies by location, artist experience, and procedure type. Generally, microblading ranges from $300-800, powder brows $400-900, and eyeliner $300-600. Touch-ups are typically 30-50% of the initial cost. I recommend consulting with local artists for specific pricing."
  }
  
  if (message.includes('risks') || message.includes('side effects')) {
    return "Common side effects include temporary redness, swelling, and tenderness. Rare complications may include infection, allergic reactions, or unsatisfactory results. Choosing a qualified, licensed artist and following proper aftercare significantly reduces these risks."
  }
  
  if (message.includes('healing') || message.includes('recovery')) {
    return "Initial healing takes 7-14 days with some redness and swelling. Full healing and color settling takes 6-8 weeks. During this time, avoid sun exposure, swimming, and certain skincare products. Proper aftercare is crucial for optimal results."
  }
  
  // Default response for unrecognized questions
  return "I'm Leah, your PMU Pro AI assistant! I can help with PMU questions, site navigation, and general information. For technical support, contact admin@thepmuguide.com. What would you like to know about PMU procedures or using the PMU Pro platform?"
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json()
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }
    
    // Generate AI response
    const response = generateResponse(message, conversationHistory || [])
    
    // Simulate processing time for more realistic AI behavior
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
    
    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
      messageId: Date.now().toString()
    })
    
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
