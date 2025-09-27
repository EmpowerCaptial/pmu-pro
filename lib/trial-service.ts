export interface TrialUser {
  email: string
  trialStartDate: string
  trialEndDate: string
  isActive: boolean
  plan?: 'starter' | 'professional' | 'studio'
  clientCount: number
  maxClients: number
}

export interface PricingPlan {
  id: 'starter' | 'professional' | 'studio'
  name: string
  price: number
  maxClients: number
  features: string[]
  description: string
  popular?: boolean
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 10,
    maxClients: 50,
    description: 'Perfect for new PMU artists',
    features: [
      'Up to 50 clients',
      'Consent form management',
      'Client CRM',
      'Document upload & signatures',
      'Portfolio management',
      'Basic analytics',
      'Email support'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 49,
    maxClients: -1, // Unlimited
    description: 'For established PMU artists',
    features: [
      'Unlimited clients',
      'All Starter features',
      'Advanced analytics',
      'Custom branding',
      'Priority support',
      'API access',
      'Advanced reporting'
    ],
    popular: true
  },
  {
    id: 'studio',
    name: 'Studio',
    price: 99,
    maxClients: -1, // Unlimited
    description: 'For multi-artist studios',
    features: [
      'All Professional features',
      'Multi-artist management',
      'Team collaboration tools',
      'Advanced scheduling',
      'White-label options',
      'Dedicated account manager',
      'Custom integrations'
    ]
  }
]

export class TrialService {
  private static readonly TRIAL_DURATION_DAYS = 30
  private static readonly STORAGE_KEY = 'pmu_pro_trial'

  static startTrial(email: string): TrialUser {
    const now = new Date()
    const trialEndDate = new Date(now.getTime() + (this.TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000))
    
    const trialUser: TrialUser = {
      email,
      trialStartDate: now.toISOString(),
      trialEndDate: trialEndDate.toISOString(),
      isActive: true,
      clientCount: 0,
      maxClients: -1 // Unlimited during trial
    }

    // Save to localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trialUser))
    
    return trialUser
  }

  static getTrialUser(): TrialUser | null {
    if (typeof window === 'undefined') return null
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null
      
      const trialUser = JSON.parse(stored) as TrialUser
      
      // Check if trial is still active
      const now = new Date()
      const trialEndDate = new Date(trialUser.trialEndDate)
      
      if (now > trialEndDate) {
        trialUser.isActive = false
        this.updateTrialUser(trialUser)
      }
      
      return trialUser
    } catch (error) {
      console.error('Error loading trial user:', error)
      return null
    }
  }

  static updateTrialUser(trialUser: TrialUser): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trialUser))
  }

  static getTrialDaysRemaining(): number {
    const trialUser = this.getTrialUser()
    if (!trialUser || !trialUser.isActive) return 0

    const now = new Date()
    const trialEndDate = new Date(trialUser.trialEndDate)
    const diffTime = trialEndDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return Math.max(0, diffDays)
  }

  static isTrialActive(): boolean {
    const trialUser = this.getTrialUser()
    return trialUser?.isActive || false
  }

  static isTrialExpired(): boolean {
    const trialUser = this.getTrialUser()
    if (!trialUser) return false
    
    const now = new Date()
    const trialEndDate = new Date(trialUser.trialEndDate)
    return now > trialEndDate
  }

  static upgradeToPlan(planId: 'starter' | 'professional' | 'studio'): TrialUser | null {
    const trialUser = this.getTrialUser()
    if (!trialUser) return null

    const plan = PRICING_PLANS.find(p => p.id === planId)
    if (!plan) return null

    trialUser.plan = planId
    trialUser.maxClients = plan.maxClients
    trialUser.isActive = true // Keep active after upgrade

    this.updateTrialUser(trialUser)
    return trialUser
  }

  static getClientLimit(): number {
    const trialUser = this.getTrialUser()
    if (!trialUser) return 0
    
    if (trialUser.plan) {
      const plan = PRICING_PLANS.find(p => p.id === trialUser.plan)
      return plan?.maxClients || 0
    }
    
    // During trial, unlimited
    return -1
  }

  static canAddClient(): boolean {
    const trialUser = this.getTrialUser()
    if (!trialUser) return false
    
    // If trial expired and no plan, can't add clients
    if (this.isTrialExpired() && !trialUser.plan) {
      return false
    }
    
    // If unlimited clients
    if (trialUser.maxClients === -1) {
      return true
    }
    
    // Check client count
    return trialUser.clientCount < trialUser.maxClients
  }

  static incrementClientCount(): void {
    const trialUser = this.getTrialUser()
    if (!trialUser) return
    
    trialUser.clientCount++
    this.updateTrialUser(trialUser)
  }

  static decrementClientCount(): void {
    const trialUser = this.getTrialUser()
    if (!trialUser) return
    
    trialUser.clientCount = Math.max(0, trialUser.clientCount - 1)
    this.updateTrialUser(trialUser)
  }

  static getTrialProgress(): { daysUsed: number; daysTotal: number; percentage: number } {
    const trialUser = this.getTrialUser()
    if (!trialUser) return { daysUsed: 0, daysTotal: 30, percentage: 0 }

    const startDate = new Date(trialUser.trialStartDate)
    const endDate = new Date(trialUser.trialEndDate)
    const now = new Date()
    
    const totalDays = this.TRIAL_DURATION_DAYS
    const daysUsed = Math.min(totalDays, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    const percentage = (daysUsed / totalDays) * 100
    
    return { daysUsed, daysTotal: totalDays, percentage }
  }

  static clearTrial(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.STORAGE_KEY)
  }
}


