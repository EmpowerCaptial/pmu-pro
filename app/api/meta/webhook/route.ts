import { NextRequest, NextResponse } from 'next/server'
import { getClientById, getClients } from '@/lib/client-storage'

// Meta Business webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  // Verify token should match your app's verify token
  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'pmu_pro_ai_2024'

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Meta webhook verified successfully')
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

// Handle incoming messages from Meta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Meta webhook received:', JSON.stringify(body, null, 2))

    // Handle different types of webhook events
    if (body.object === 'page') {
      for (const entry of body.entry) {
        const pageId = entry.id
        const timeOfEvent = entry.time

        // Handle messaging events
        if (entry.messaging) {
          for (const messagingEvent of entry.messaging) {
            await handleMessage(pageId, messagingEvent)
          }
        }

        // Handle postback events (button clicks)
        if (entry.postback) {
          for (const postbackEvent of entry.postback) {
            await handlePostback(pageId, postbackEvent)
          }
        }
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Error processing Meta webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Handle incoming messages
async function handleMessage(pageId: string, messagingEvent: any) {
  const senderId = messagingEvent.sender.id
  const recipientId = messagingEvent.recipient.id
  const timestamp = messagingEvent.timestamp
  const message = messagingEvent.message

  if (message && message.text) {
    const messageText = message.text
    console.log(`Received message from ${senderId}: ${messageText}`)

    // Process message with AI and generate response
    const response = await processMessageWithAI(pageId, senderId, messageText)
    
    // Send response back to user
    await sendMessage(senderId, response)
  }
}

// Handle postback events (button clicks)
async function handlePostback(pageId: string, postbackEvent: any) {
  const senderId = postbackEvent.sender.id
  const payload = postbackEvent.postback.payload
  const timestamp = postbackEvent.timestamp

  console.log(`Received postback from ${senderId}: ${payload}`)

  // Handle different postback payloads
  switch (payload) {
    case 'BOOK_APPOINTMENT':
      await handleBookingRequest(senderId)
      break
    case 'SERVICE_INFO':
      await handleServiceInfoRequest(senderId)
      break
    case 'BUSINESS_HOURS':
      await handleBusinessHoursRequest(senderId)
      break
    default:
      console.log(`Unknown postback payload: ${payload}`)
  }
}

// Process message with AI
async function processMessageWithAI(pageId: string, senderId: string, messageText: string) {
  try {
    // Get artist's AI settings based on pageId
    const artistSettings = await getArtistAISettings(pageId)
    
    if (!artistSettings || !artistSettings.isEnabled) {
      return "Thank you for your message! An artist will respond to you shortly."
    }

    // Use OpenAI/Groq to process the message
    const aiResponse = await generateAIResponse(messageText, artistSettings)
    
    return aiResponse
  } catch (error) {
    console.error('Error processing message with AI:', error)
    return "I'm having trouble processing your message right now. An artist will assist you shortly."
  }
}

// Generate AI response using OpenAI/Groq
async function generateAIResponse(messageText: string, artistSettings: any) {
  try {
    // This would integrate with OpenAI or Groq API
    // For now, return a basic response
    const lowerMessage = messageText.toLowerCase()
    
    if (lowerMessage.includes('book') || lowerMessage.includes('appointment') || lowerMessage.includes('schedule')) {
      // Check if artist has booking integration
      if (artistSettings.bookingIntegration) {
        const availableSlots = await getAvailableSlots(artistSettings.bookingIntegration)
        return `I'd be happy to help you book an appointment! Based on your calendar, I can see available slots: ${availableSlots.join(', ')}. Which time works best for you?`
      } else {
        return `I'd be happy to help you book an appointment! I can see available slots for ${artistSettings.services.join(', ')}. What service are you interested in and what date works best for you?`
      }
    }
    
    if (lowerMessage.includes('service') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return `Our services include ${artistSettings.services.join(', ')}. Each service is customized to your needs. Would you like to book a consultation to discuss pricing and options?`
    }
    
    if (lowerMessage.includes('hours') || lowerMessage.includes('time') || lowerMessage.includes('available')) {
      return `Our business hours are ${artistSettings.businessHours.start} - ${artistSettings.businessHours.end} ${artistSettings.businessHours.timezone}. When would you like to schedule your appointment?`
    }
    
    // Default response
    return artistSettings.customGreeting || "Hi! I'm your AI assistant. How can I help you today?"
  } catch (error) {
    console.error('Error generating AI response:', error)
    return "I'm here to help! What would you like to know about our services?"
  }
}

// Get available slots from booking integration
async function getAvailableSlots(bookingIntegration: any) {
  try {
    switch (bookingIntegration.platform) {
      case 'calendly':
        return await getCalendlySlots(bookingIntegration.apiKey, bookingIntegration.userId)
      case 'acuity':
        return await getAcuitySlots(bookingIntegration.apiKey, bookingIntegration.userId)
      case 'square':
        return await getSquareSlots(bookingIntegration.apiKey, bookingIntegration.locationId)
      case 'booksy':
        return await getBooksySlots(bookingIntegration.apiKey, bookingIntegration.businessId)
      default:
        return ['Tomorrow at 2 PM', 'Wednesday at 10 AM', 'Friday at 3 PM']
    }
  } catch (error) {
    console.error('Error fetching booking slots:', error)
    return ['Please check our calendar for availability']
  }
}

// Calendly integration
async function getCalendlySlots(apiKey: string, userId: string) {
  const response = await fetch(`https://api.calendly.com/scheduled_events?user=${userId}&status=active`, {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  })
  const data = await response.json()
  // Process and return available slots
  return ['Tuesday at 2 PM', 'Wednesday at 10 AM', 'Friday at 3 PM']
}

// Acuity integration
async function getAcuitySlots(apiKey: string, userId: string) {
  // Acuity API integration
  return ['Monday at 1 PM', 'Thursday at 11 AM', 'Saturday at 2 PM']
}

// Square integration
async function getSquareSlots(apiKey: string, locationId: string) {
  // Square Appointments API integration
  return ['Tuesday at 3 PM', 'Wednesday at 9 AM', 'Friday at 1 PM']
}

// Booksy integration
async function getBooksySlots(apiKey: string, businessId: string) {
  // Booksy API integration
  return ['Monday at 10 AM', 'Thursday at 2 PM', 'Saturday at 11 AM']
}

// Get artist AI settings based on pageId
async function getArtistAISettings(pageId: string) {
  // This would query your database for artist settings
  // For now, return mock settings
  return {
    isEnabled: true,
    mode: 'ai-assistant',
    businessHours: {
      start: '09:00',
      end: '17:00',
      timezone: 'America/New_York'
    },
    services: ['Microblading', 'Lip Blush', 'Eyebrow Enhancement'],
    customGreeting: "Hi! I'm your AI assistant. How can I help you today?"
  }
}

// Send message back to user
async function sendMessage(recipientId: string, messageText: string) {
  try {
    const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN
    
    if (!pageAccessToken) {
      console.error('No page access token configured')
      return
    }

    const response = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${pageAccessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: messageText }
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Error sending message:', error)
    } else {
      console.log(`Message sent successfully to ${recipientId}`)
    }
  } catch (error) {
    console.error('Error sending message:', error)
  }
}

// Handle booking request
async function handleBookingRequest(senderId: string) {
  const response = "Great! I'd be happy to help you book an appointment. What service are you interested in? I can see available slots for Microblading, Lip Blush, and Eyebrow Enhancement."
  await sendMessage(senderId, response)
}

// Handle service info request
async function handleServiceInfoRequest(senderId: string) {
  const response = "Our services include Microblading, Lip Blush, and Eyebrow Enhancement. Each service is customized to your needs and includes a consultation. Would you like to book an appointment?"
  await sendMessage(senderId, response)
}

// Handle business hours request
async function handleBusinessHoursRequest(senderId: string) {
  const response = "Our business hours are 9:00 AM - 5:00 PM Eastern Time, Monday through Friday. We also offer weekend appointments by special arrangement. When would you like to schedule your appointment?"
  await sendMessage(senderId, response)
}
