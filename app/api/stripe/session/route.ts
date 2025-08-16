import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    return NextResponse.json({
      id: session.id,
      status: session.status,
      customer_email: session.customer_details?.email,
      subscription_id: session.subscription,
      metadata: session.metadata,
    })
  } catch (error) {
    console.error("Error retrieving session:", error)
    return NextResponse.json(
      { error: "Failed to retrieve session" }, 
      { status: 500 }
    )
  }
}
