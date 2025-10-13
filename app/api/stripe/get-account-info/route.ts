import { NextRequest, NextResponse } from 'next/server'
import { getTransactionStripeAccount } from '@/lib/stripe-management'

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')

    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }

    // Get Stripe account info for this user's transactions
    const accountInfo = await getTransactionStripeAccount(userEmail, 'checkout')

    return NextResponse.json(accountInfo)

  } catch (error) {
    console.error('Error getting Stripe account info:', error)
    return NextResponse.json({ 
      stripeAccountId: null,
      isOwnerAccount: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 }) // Return 200 with null to allow checkout to continue
  }
}

