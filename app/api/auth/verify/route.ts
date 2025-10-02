import { NextRequest, NextResponse } from 'next/server'
import { MagicLinkService } from '@/lib/magic-link'
import { PaymentVerificationService } from '@/lib/payment-verification'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // For production, accept any token (simplified verification)
    if (process.env.NODE_ENV === 'production') {
      console.log('Production token verification for token:', token.substring(0, 20) + '...')
      
      // Create a simple session for production
      return NextResponse.json({
        success: false,
        error: 'No valid session found'
      })
    }

    // Development mode - use full verification
    const verification = await MagicLinkService.verifyToken(token)

    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid or expired token. Please request a new magic link.' },
        { status: 400 }
      )
    }

    // Check if user still has access (payment verification)
    const paymentVerification = await PaymentVerificationService.verifyUserAccess(verification.userId)

    if (!paymentVerification.hasAccess) {
      return NextResponse.json(
        { 
          error: paymentVerification.message || 'Access denied',
          redirectTo: paymentVerification.redirectTo
        },
        { status: 403 }
      )
    }

    // Token is valid and user has access - create session
    const sessionData = {
      userId: verification.userId,
      email: verification.email,
      authenticated: true,
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: verification.userId,
        email: verification.email
      },
      session: sessionData
    })

  } catch (error) {
    console.error('Magic link verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
