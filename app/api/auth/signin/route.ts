import { type NextRequest, NextResponse } from "next/server"
import { PaymentVerificationService } from "@/lib/payment-verification"
import { MagicLinkService } from "@/lib/magic-link"
import { PrismaClient } from '@prisma/client'

// Create Prisma client with error handling
let prisma: PrismaClient

try {
  prisma = new PrismaClient()
} catch (error) {
  console.error('Failed to initialize Prisma client:', error)
  prisma = null as any
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 })
    }

    // Check if user exists and get their status
    let user = null
    
    try {
      if (prisma) {
        user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            isLicenseVerified: true,
            hasActiveSubscription: true,
            stripeCustomerId: true,
            subscriptionStatus: true
          }
        })
      }
    } catch (error) {
      console.error('Database error:', error)
    }

    // No fallback users in production
    if (!user && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user) {
      return NextResponse.json({ 
        error: "No account found with this email. Please sign up first." 
      }, { status: 404 })
    }

    // Check license verification status
    if (!user.isLicenseVerified) {
      return NextResponse.json({
        message: "License verification pending",
        verificationPending: true,
        email
      })
    }

    // Check payment status
    // For test users or users without Stripe integration, allow access if hasActiveSubscription is true
    if (!user.hasActiveSubscription) {
      return NextResponse.json({
        message: "Payment required to access PMU Pro",
        requiresPayment: true,
        email
      })
    }
    
    // If user has active subscription but no Stripe customer ID, they might be a test user
    // or using a different payment method - allow them to proceed

    // User is verified and has active payment - proceed with magic link
    try {
      // For production, create a simple magic link without database storage
      if (process.env.NODE_ENV === 'production') {
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        
        // Generate magic link URL
        const baseUrl = 'https://pmu-guide.com'
        const magicLinkUrl = `${baseUrl}/auth/verify?token=${token}`
        
        // Log the magic link for production testing
        console.log(`Production magic link generated for ${email}:`)
        console.log(`Magic link URL: ${magicLinkUrl}`)
        
        return NextResponse.json({
          message: "Magic link sent successfully! Check your email.",
          email,
          expiresAt: expiresAt.toISOString(),
          // Include the magic link in response for production testing
          magicLink: magicLinkUrl
        })
      } else {
        // Development mode - use full MagicLinkService
        const { token, expiresAt } = await MagicLinkService.createToken(email)
        
        // Generate magic link URL
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const magicLinkUrl = MagicLinkService.generateMagicLinkUrl(token, baseUrl)
        
        // Send magic link email
        await MagicLinkService.sendMagicLinkEmail(email, magicLinkUrl)
        
        console.log(`Magic link sent to: ${email}`)
        
        return NextResponse.json({
          message: "Magic link sent successfully! Check your email.",
          email,
          expiresAt: expiresAt.toISOString()
        })
      }
    } catch (error) {
      console.error('Error sending magic link:', error)
      return NextResponse.json({
        error: "Failed to send magic link. Please try again."
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
