export interface ArtistApplication {
  id: string
  email: string
  name: string
  phone: string
  businessName: string
  businessAddress: string
  licenseNumber?: string
  licenseState?: string
  experience: string
  specialties: string[]
  portfolioUrl?: string
  socialMedia?: string[]
  submittedAt: string
  status: 'pending' | 'approved' | 'needs_info' | 'rejected'
  reviewedAt?: string
  reviewedBy?: string
  notes?: string
  issues?: string[]
  trialAccess: boolean
  trialStartDate?: string
  trialEndDate?: string
}

export interface ApplicationIssue {
  field: string
  message: string
  severity: 'warning' | 'error' | 'info'
  required: boolean
}

export class ArtistApplicationService {
  private static readonly STORAGE_KEY = 'artist_applications'
  private static readonly TRIAL_DURATION_DAYS = 30

  static submitApplication(applicationData: Omit<ArtistApplication, 'id' | 'submittedAt' | 'status' | 'trialAccess'>): ArtistApplication {
    const now = new Date()
    const trialEndDate = new Date(now.getTime() + (this.TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000))
    
    const application: ArtistApplication = {
      ...applicationData,
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      submittedAt: now.toISOString(),
      status: 'pending',
      trialAccess: true, // Grant immediate trial access
      trialStartDate: now.toISOString(),
      trialEndDate: trialEndDate.toISOString()
    }

    // Store application
    this.saveApplication(application)
    
    // Start trial immediately
    this.startTrialForApplication(application)
    
    return application
  }

  static getApplication(email: string): ArtistApplication | null {
    if (typeof window === 'undefined') return null
    
    try {
      const applications = this.getAllApplications()
      return applications.find(app => app.email === email) || null
    } catch (error) {
      console.error('Error loading application:', error)
      return null
    }
  }

  static getAllApplications(): ArtistApplication[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error parsing applications:', error)
      return []
    }
  }

  static updateApplicationStatus(
    applicationId: string, 
    status: ArtistApplication['status'], 
    reviewedBy: string,
    notes?: string,
    issues?: string[]
  ): ArtistApplication | null {
    const applications = this.getAllApplications()
    const applicationIndex = applications.findIndex(app => app.id === applicationId)
    
    if (applicationIndex === -1) return null
    
    applications[applicationIndex] = {
      ...applications[applicationIndex],
      status,
      reviewedAt: new Date().toISOString(),
      reviewedBy,
      notes,
      issues
    }

    this.saveApplications(applications)
    return applications[applicationIndex]
  }

  static validateApplication(application: ArtistApplication): ApplicationIssue[] {
    const issues: ApplicationIssue[] = []

    // Required fields validation
    if (!application.name.trim()) {
      issues.push({
        field: 'name',
        message: 'Full name is required',
        severity: 'error',
        required: true
      })
    }

    if (!application.email.trim() || !this.isValidEmail(application.email)) {
      issues.push({
        field: 'email',
        message: 'Valid email address is required',
        severity: 'error',
        required: true
      })
    }

    if (!application.phone.trim()) {
      issues.push({
        field: 'phone',
        message: 'Phone number is required',
        severity: 'error',
        required: true
      })
    }

    if (!application.businessName.trim()) {
      issues.push({
        field: 'businessName',
        message: 'Business name is required',
        severity: 'error',
        required: true
      })
    }

    if (!application.businessAddress.trim()) {
      issues.push({
        field: 'businessAddress',
        message: 'Business address is required',
        severity: 'error',
        required: true
      })
    }

    // License validation (warning, not error)
    if (!application.licenseNumber?.trim()) {
      issues.push({
        field: 'licenseNumber',
        message: 'License number helps verify your credentials',
        severity: 'warning',
        required: false
      })
    }

    // Experience validation
    if (!application.experience.trim()) {
      issues.push({
        field: 'experience',
        message: 'Please describe your PMU experience',
        severity: 'error',
        required: true
      })
    }

    // Portfolio validation (warning)
    if (!application.portfolioUrl?.trim()) {
      issues.push({
        field: 'portfolioUrl',
        message: 'Portfolio helps showcase your work quality',
        severity: 'warning',
        required: false
      })
    }

    return issues
  }

  static canAccessTrial(email: string): boolean {
    const application = this.getApplication(email)
    if (!application) return false

    // Check if trial is still active
    const now = new Date()
    const trialEndDate = new Date(application.trialEndDate || '')
    
    if (now > trialEndDate) return false

    // Check application status
    switch (application.status) {
      case 'approved':
        return true
      case 'pending':
        return true // Allow access during review
      case 'needs_info':
        return true // Allow access with grace period
      case 'rejected':
        return false
      default:
        return false
    }
  }

  static getTrialStatus(email: string): {
    hasAccess: boolean
    daysRemaining: number
    status: string
    issues?: string[]
    needsAction: boolean
  } {
    const application = this.getApplication(email)
    if (!application) {
      return {
        hasAccess: false,
        daysRemaining: 0,
        status: 'no_application',
        needsAction: true
      }
    }

    const now = new Date()
    const trialEndDate = new Date(application.trialEndDate || '')
    const daysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

    const hasAccess = this.canAccessTrial(email)

    return {
      hasAccess,
      daysRemaining,
      status: application.status,
      issues: application.issues,
      needsAction: application.status === 'needs_info' || application.status === 'rejected'
    }
  }

  private static saveApplication(application: ArtistApplication): void {
    const applications = this.getAllApplications()
    const existingIndex = applications.findIndex(app => app.id === application.id)
    
    if (existingIndex >= 0) {
      applications[existingIndex] = application
    } else {
      applications.push(application)
    }
    
    this.saveApplications(applications)
  }

  private static saveApplications(applications: ArtistApplication[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(applications))
  }

  private static startTrialForApplication(application: ArtistApplication): void {
    // This would integrate with the existing trial system
    // For now, we'll just log it
    console.log(`🎯 Trial started for application ${application.id}`)
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

