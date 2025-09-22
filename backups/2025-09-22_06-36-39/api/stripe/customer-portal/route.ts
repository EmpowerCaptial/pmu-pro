import { NextRequest, NextResponse } from 'next/server'
import { PaymentVerificationService } from '@/lib/payment-verification'

export async function POST(request: NextRequest) {
  try {
    const { userId, returnUrl } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user's subscription details
    const subscription = await PaymentVerificationService.getSubscriptionDetails(userId)

    if (!subscription?.customer) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    // Create customer portal session
    const session = await PaymentVerificationService.createCustomerPortalSession(
      subscription.customer as string,
      returnUrl || '/dashboard'
    )

    if (!session?.url) {
      return NextResponse.json(
        { error: 'Failed to create customer portal session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url: session.url
    })

  } catch (error) {
    console.error('Customer portal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
