import { TrialService } from './trial-service'

export class ExpiredTrialHandler {
  /**
   * Check if user is an expired trial user
   */
  static isExpiredTrialUser(email: string): boolean {
    const trialUser = TrialService.getTrialUser()
    if (!trialUser || trialUser.email !== email) return false
    
    return TrialService.isTrialExpired() && !trialUser.plan
  }

  /**
   * Get expired trial user data
   */
  static getExpiredTrialData() {
    const trialUser = TrialService.getTrialUser()
    if (!trialUser || !TrialService.isTrialExpired()) return null
    
    return {
      email: trialUser.email,
      trialStartDate: trialUser.trialStartDate,
      trialEndDate: trialUser.trialEndDate,
      daysExpired: Math.floor((Date.now() - new Date(trialUser.trialEndDate).getTime()) / (1000 * 60 * 60 * 24)),
      clientCount: trialUser.clientCount,
      maxClients: trialUser.maxClients
    }
  }

  /**
   * Handle expired trial user subscription
   */
  static async handleExpiredTrialSubscription(email: string, planId: string) {
    try {
      // Get expired trial data
      const trialData = this.getExpiredTrialData()
      if (!trialData) {
        throw new Error('No expired trial data found')
      }

      // Sync expired trial user to database
      const { TrialSubscriptionBridge } = await import('./trial-subscription-bridge')
      await TrialSubscriptionBridge.syncTrialUserToDatabase(email, trialData)

      // Clear trial data from localStorage
      TrialSubscriptionBridge.clearTrialData()

      return { success: true, trialData }
    } catch (error) {
      console.error('Error handling expired trial subscription:', error)
      throw error
    }
  }

  /**
   * Check if user can still subscribe after trial expiration
   */
  static canSubscribeAfterExpiration(email: string): boolean {
    const trialData = this.getExpiredTrialData()
    if (!trialData) return false

    // Allow subscription up to 90 days after trial expiration
    const maxDaysAfterExpiration = 90
    return trialData.daysExpired <= maxDaysAfterExpiration
  }

  /**
   * Get grace period status
   */
  static getGracePeriodStatus(email: string): {
    canSubscribe: boolean
    daysExpired: number
    daysRemaining: number
    message: string
  } {
    const trialData = this.getExpiredTrialData()
    if (!trialData) {
      return {
        canSubscribe: false,
        daysExpired: 0,
        daysRemaining: 0,
        message: 'No trial data found'
      }
    }

    const maxDaysAfterExpiration = 90
    const daysRemaining = maxDaysAfterExpiration - trialData.daysExpired
    const canSubscribe = daysRemaining > 0

    let message = ''
    if (canSubscribe) {
      message = `Your trial expired ${trialData.daysExpired} days ago. You can still subscribe for ${daysRemaining} more days to preserve your data.`
    } else {
      message = `Your trial expired ${trialData.daysExpired} days ago. The grace period has ended.`
    }

    return {
      canSubscribe,
      daysExpired: trialData.daysExpired,
      daysRemaining,
      message
    }
  }
}
