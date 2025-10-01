import { stripe } from './stripe'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface PaymentVerificationResult {
  hasAccess: boolean
  subscriptionStatus: 'active' | 'inactive' | 'past_due' | 'canceled' | 'unpaid' | 'trial'
  redirectTo?: string
  message?: string
}

export class PaymentVerificationService {
  /**
   * Verify if a user has active payment and access to the site
   */
  static async verifyUserAccess(userId: string): Promise<PaymentVerificationResult> {
    try {
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
          subscriptionStatus: true,
          hasActiveSubscription: true,
          isLicenseVerified: true,
          role: true
        }
      })

      if (!user) {
        return {
          hasAccess: false,
          subscriptionStatus: 'inactive',
          redirectTo: '/auth/login',
          message: 'User not found'
        }
      }

      // If user is admin/staff, grant access
      if (user.role === 'admin' || user.role === 'staff') {
        return {
          hasAccess: true,
          subscriptionStatus: 'active'
        }
      }

      // Check if license is verified
      if (!user.isLicenseVerified) {
        return {
          hasAccess: false,
          subscriptionStatus: 'inactive',
          redirectTo: '/auth/verification-pending',
          message: 'License verification pending'
        }
      }

      // Allow trial users to access the app (they can upgrade during trial)
      if (user.subscriptionStatus === 'trial') {
        return {
          hasAccess: true,
          subscriptionStatus: 'trial'
        }
      }

      // If no Stripe customer ID, redirect to pricing
      if (!user.stripeCustomerId) {
        return {
          hasAccess: false,
          subscriptionStatus: 'inactive',
          redirectTo: '/pricing',
          message: 'Subscription required to access PMU Pro'
        }
      }

      // Check subscription status with Stripe
      if (user.stripeSubscriptionId) {
        try {
          const subscription = await stripe?.subscriptions.retrieve(user.stripeSubscriptionId)
          
          if (subscription) {
            const status = subscription.status as any
            
            if (status === 'active' || status === 'trialing') {
              return {
                hasAccess: true,
                subscriptionStatus: 'active'
              }
            } else if (status === 'past_due' || status === 'unpaid') {
              return {
                hasAccess: false,
                subscriptionStatus: status,
                redirectTo: '/pricing',
                message: 'Payment past due. Please update your payment method.'
              }
            } else if (status === 'canceled') {
              return {
                hasAccess: false,
                subscriptionStatus: 'canceled',
                redirectTo: '/pricing',
                message: 'Subscription canceled. Please renew to continue access.'
              }
            }
          }
        } catch (error) {
          console.error('Error checking Stripe subscription:', error)
        }
      }

      // If we get here, no active subscription found
      return {
        hasAccess: false,
        subscriptionStatus: 'inactive',
        redirectTo: '/pricing',
        message: 'Active subscription required to access PMU Pro'
      }

    } catch (error) {
      console.error('Payment verification error:', error)
      return {
        hasAccess: false,
        subscriptionStatus: 'inactive',
        redirectTo: '/pricing',
        message: 'Error verifying payment status'
      }
    }
  }

  /**
   * Check if a user can access a specific feature
   */
  static async checkFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const verification = await this.verifyUserAccess(userId)
    
    if (!verification.hasAccess) {
      return false
    }

    // Add feature-specific checks here if needed
    // For example, premium features vs basic features
    
    return true
  }

  /**
   * Get user's current subscription details
   */
  static async getSubscriptionDetails(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          stripeCustomerId: true,
          stripeSubscriptionId: true,
          subscriptionStatus: true,
          hasActiveSubscription: true,
          selectedPlan: true
        }
      })

      if (!user?.stripeSubscriptionId) {
        return null
      }

      const subscription = await stripe?.subscriptions.retrieve(user.stripeSubscriptionId)
      return subscription
    } catch (error) {
      console.error('Error getting subscription details:', error)
      return null
    }
  }

  /**
   * Create or update customer portal session for billing management
   */
  static async createCustomerPortalSession(customerId: string, returnUrl: string) {
    try {
      const session = await stripe?.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      })
      return session
    } catch (error) {
      console.error('Error creating customer portal session:', error)
      throw error
    }
  }
}
