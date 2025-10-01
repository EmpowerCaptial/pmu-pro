import { TrialService } from './trial-service'

export class TrialSubscriptionBridge {
  /**
   * Sync trial user to database before subscription
   */
  static async syncTrialUserToDatabase(email: string, trialData?: any) {
    try {
      const response = await fetch('/api/trial/sync-to-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          trialData
        })
      })

      if (!response.ok) {
        throw new Error('Failed to sync trial user to database')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error syncing trial user to database:', error)
      throw error
    }
  }

  /**
   * Handle trial user subscription upgrade
   */
  static async handleTrialUpgrade(email: string, planId: string) {
    try {
      // Check if this is an expired trial user
      if (this.isExpiredTrialUser(email)) {
        const { ExpiredTrialHandler } = await import('./expired-trial-handler')
        return await ExpiredTrialHandler.handleExpiredTrialSubscription(email, planId)
      }

      // Handle active trial user
      const trialUser = TrialService.getTrialUser()
      await this.syncTrialUserToDatabase(email, trialUser)

      // Update trial user status
      TrialService.upgradeToPlan(planId as any)

      return { success: true }
    } catch (error) {
      console.error('Error handling trial upgrade:', error)
      throw error
    }
  }

  /**
   * Check if user is transitioning from trial to paid
   */
  static isTrialUser(email: string): boolean {
    const trialUser = TrialService.getTrialUser()
    return trialUser?.email === email && !trialUser?.plan
  }

  /**
   * Check if user is an expired trial user
   */
  static isExpiredTrialUser(email: string): boolean {
    const { ExpiredTrialHandler } = require('./expired-trial-handler')
    return ExpiredTrialHandler.isExpiredTrialUser(email)
  }

  /**
   * Get trial user data for subscription
   */
  static getTrialUserData() {
    return TrialService.getTrialUser()
  }

  /**
   * Clear trial data after successful subscription
   */
  static clearTrialData() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pmu_pro_trial')
      localStorage.removeItem('trial_banner_dismissed')
    }
  }
}
