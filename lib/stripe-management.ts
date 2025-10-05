import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface StudioStripeSettings {
  ownerStripeAccountId: string | null
  allowArtistStripeAccounts: boolean
  defaultTransactionMode: 'owner' | 'artist'
}

export interface ArtistStripePermission {
  artistId: string
  artistName: string
  artistEmail: string
  hasStripeAccount: boolean
  stripeAccountId: string | null
  canProcessPayments: boolean
}

/**
 * Get studio owner's Stripe settings
 */
export async function getStudioStripeSettings(ownerEmail: string): Promise<StudioStripeSettings | null> {
  try {
    const owner = await prisma.user.findUnique({
      where: { email: ownerEmail },
      select: {
        id: true,
        role: true,
        selectedPlan: true,
        hasActiveSubscription: true,
        stripeConnectAccountId: true,
        businessName: true,
        studioName: true
      }
    })

    if (!owner || owner.role !== 'owner' || owner.selectedPlan !== 'studio') {
      return null
    }

    // Get studio settings from localStorage or database
    // For now, we'll use default settings
    return {
      ownerStripeAccountId: owner.stripeConnectAccountId,
      allowArtistStripeAccounts: false, // Default to false
      defaultTransactionMode: 'owner' // Default to owner
    }
  } catch (error) {
    console.error('Error getting studio Stripe settings:', error)
    return null
  }
}

/**
 * Update studio Stripe settings
 */
export async function updateStudioStripeSettings(
  ownerEmail: string, 
  settings: Partial<StudioStripeSettings>
): Promise<{ success: boolean; message: string }> {
  try {
    const owner = await prisma.user.findUnique({
      where: { email: ownerEmail },
      select: {
        id: true,
        role: true,
        selectedPlan: true,
        hasActiveSubscription: true
      }
    })

    if (!owner || owner.role !== 'owner' || owner.selectedPlan !== 'studio') {
      return { success: false, message: 'Access denied. Owner with Studio plan required.' }
    }

    // In a real implementation, you'd save these to a database table
    // For now, we'll simulate saving to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`studio-stripe-settings-${owner.id}`, JSON.stringify(settings))
    }

    return { success: true, message: 'Stripe settings updated successfully' }
  } catch (error) {
    console.error('Error updating studio Stripe settings:', error)
    return { success: false, message: 'Failed to update settings' }
  }
}

/**
 * Get all artists in the studio with their Stripe permissions
 */
export async function getStudioArtists(ownerEmail: string): Promise<ArtistStripePermission[]> {
  try {
    const owner = await prisma.user.findUnique({
      where: { email: ownerEmail },
      select: {
        id: true,
        role: true,
        selectedPlan: true,
        hasActiveSubscription: true,
        studioName: true
      }
    })

    if (!owner || owner.role !== 'owner' || owner.selectedPlan !== 'studio') {
      return []
    }

    // Find all users in the same studio
    const artists = await prisma.user.findMany({
      where: {
        studioName: owner.studioName,
        role: { in: ['artist', 'licensed', 'instructor'] },
        id: { not: owner.id } // Exclude owner
      },
      select: {
        id: true,
        name: true,
        email: true,
        stripeConnectAccountId: true,
        role: true
      }
    })

    return artists.map(artist => ({
      artistId: artist.id,
      artistName: artist.name || 'Unknown',
      artistEmail: artist.email,
      hasStripeAccount: !!artist.stripeConnectAccountId,
      stripeAccountId: artist.stripeConnectAccountId,
      canProcessPayments: !!artist.stripeConnectAccountId
    }))
  } catch (error) {
    console.error('Error getting studio artists:', error)
    return []
  }
}

/**
 * Determine which Stripe account to use for a transaction
 */
export async function getTransactionStripeAccount(
  userEmail: string,
  transactionType: 'checkout' | 'deposit' | 'subscription' = 'checkout'
): Promise<{ 
  stripeAccountId: string | null
  isOwnerAccount: boolean
  error?: string 
}> {
  try {
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
      return { stripeAccountId: null, isOwnerAccount: false, error: 'User not found' }
    }

    // For Enterprise Studio users, check if they're the owner
    if (user.selectedPlan === 'studio' && user.role === 'owner') {
      return { 
        stripeAccountId: user.stripeConnectAccountId, 
        isOwnerAccount: true 
      }
    }

    // For Enterprise Studio artists, check studio settings
    if (user.selectedPlan === 'studio' && user.role !== 'owner') {
      const studioSettings = await getStudioStripeSettings(userEmail)
      
      if (!studioSettings) {
        return { stripeAccountId: null, isOwnerAccount: false, error: 'Studio settings not found' }
      }

      // Default to owner's account unless artist has permission and own account
      if (studioSettings.defaultTransactionMode === 'owner') {
        return { 
          stripeAccountId: studioSettings.ownerStripeAccountId, 
          isOwnerAccount: true 
        }
      }

      // If artist mode is allowed and artist has account
      if (studioSettings.allowArtistStripeAccounts && user.stripeConnectAccountId) {
        return { 
          stripeAccountId: user.stripeConnectAccountId, 
          isOwnerAccount: false 
        }
      }

      // Fallback to owner account
      return { 
        stripeAccountId: studioSettings.ownerStripeAccountId, 
        isOwnerAccount: true 
      }
    }

    // For non-Enterprise Studio users, use their own account
    return { 
      stripeAccountId: user.stripeConnectAccountId, 
      isOwnerAccount: false 
    }

  } catch (error) {
    console.error('Error determining Stripe account:', error)
    return { stripeAccountId: null, isOwnerAccount: false, error: 'Internal error' }
  }
}

/**
 * Check if user has Enterprise Studio access
 */
export function hasEnterpriseStudioAccess(user: any): boolean {
  return user?.selectedPlan === 'studio' && user?.hasActiveSubscription === true
}

/**
 * Check if user is studio owner
 */
export function isStudioOwner(user: any): boolean {
  return user?.role === 'owner' && user?.selectedPlan === 'studio'
}

/**
 * Check if user can manage Stripe settings
 */
export function canManageStripeSettings(user: any): boolean {
  return isStudioOwner(user) && hasEnterpriseStudioAccess(user)
}
