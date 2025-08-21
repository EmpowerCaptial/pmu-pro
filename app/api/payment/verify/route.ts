import { NextRequest, NextResponse } from 'next/server'
import { PaymentVerificationService } from '@/lib/payment-verification'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verify user's payment status
    const verification = await PaymentVerificationService.verifyUserAccess(userId)

    return NextResponse.json({
      success: true,
      ...verification
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        hasAccess: false,
        subscriptionStatus: 'error'
      },
      { status: 500 }
    )
  }
}
