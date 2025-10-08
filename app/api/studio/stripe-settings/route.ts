import { NextRequest, NextResponse } from 'next/server'
import { 
  getStudioStripeSettings, 
  updateStudioStripeSettings, 
  getStudioArtists,
  canManageStripeSettings,
  hasEnterpriseStudioAccess
} from '@/lib/stripe-management'
import { prisma } from '@/lib/prisma'

// GET /api/studio/stripe-settings - Get studio Stripe settings
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        role: true,
        selectedPlan: true,
        hasActiveSubscription: true,
        stripeConnectAccountId: true,
        studioName: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check Enterprise Studio access
    if (!hasEnterpriseStudioAccess(user)) {
      return NextResponse.json({ 
        error: 'Enterprise Studio subscription required',
        requiresUpgrade: true 
      }, { status: 403 })
    }

    // Check if user can manage settings (owner only)
    if (!canManageStripeSettings(user)) {
      return NextResponse.json({ 
        error: 'Only studio owners can manage Stripe settings' 
      }, { status: 403 })
    }

    // Get current settings
    const settings = await getStudioStripeSettings(userEmail)
    const artists = await getStudioArtists(userEmail)

    return NextResponse.json({
      success: true,
      settings,
      artists,
      user: {
        id: user.id,
        role: user.role,
        studioName: user.studioName,
        hasStripeAccount: !!user.stripeConnectAccountId
      }
    })

  } catch (error) {
    console.error('Error getting studio Stripe settings:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }}

// POST /api/studio/stripe-settings - Update studio Stripe settings
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    const body = await request.json()
    const { allowArtistStripeAccounts, defaultTransactionMode } = body

    // Get user info
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        role: true,
        selectedPlan: true,
        hasActiveSubscription: true,
        studioName: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check Enterprise Studio access
    if (!hasEnterpriseStudioAccess(user)) {
      return NextResponse.json({ 
        error: 'Enterprise Studio subscription required',
        requiresUpgrade: true 
      }, { status: 403 })
    }

    // Check if user can manage settings (owner only)
    if (!canManageStripeSettings(user)) {
      return NextResponse.json({ 
        error: 'Only studio owners can manage Stripe settings' 
      }, { status: 403 })
    }

    // Validate settings
    if (typeof allowArtistStripeAccounts !== 'boolean') {
      return NextResponse.json({ 
        error: 'allowArtistStripeAccounts must be a boolean' 
      }, { status: 400 })
    }

    if (defaultTransactionMode && !['owner', 'artist'].includes(defaultTransactionMode)) {
      return NextResponse.json({ 
        error: 'defaultTransactionMode must be "owner" or "artist"' 
      }, { status: 400 })
    }

    // Update settings
    const result = await updateStudioStripeSettings(userEmail, {
      allowArtistStripeAccounts,
      defaultTransactionMode
    })

    if (!result.success) {
      return NextResponse.json({ 
        error: result.message 
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      settings: {
        allowArtistStripeAccounts,
        defaultTransactionMode
      }
    })

  } catch (error) {
    console.error('Error updating studio Stripe settings:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }}
