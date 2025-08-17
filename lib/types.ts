// PMU Pro Type Definitions

export interface User {
  id: string
  name: string
  email: string
  password: string
  businessName: string
  phone?: string
  licenseNumber: string
  licenseState: string
  yearsExperience?: string
  selectedPlan: string
  licenseFile?: string
  insuranceFile?: string
  hasActiveSubscription: boolean
  isLicenseVerified: boolean
  role: string
  stripeId?: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  subscriptionStatus: string
  createdAt: Date
  updatedAt: Date
}

// Registration/signup interface
export interface UserRegistration {
  name: string
  email: string
  password: string
  businessName: string
  phone?: string
  licenseNumber: string
  licenseState: string
  yearsExperience?: string
  selectedPlan: string
  licenseFile?: File
  insuranceFile?: File
}

// Login interface
export interface UserLogin {
  email: string
  password: string
}

// Subscription status types
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing'

// Plan types
export type PlanType = 'basic' | 'pro' | 'premium'

export interface Client {
  id: string
  userId: string
  name: string
  email?: string
  phone?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Photo {
  id: string
  clientId: string
  url: string
  filename?: string
  lighting?: "natural" | "artificial" | "mixed"
  quality?: "good" | "fair" | "poor"
  createdAt: Date
}

export interface Intake {
  id: string
  clientId: string
  conditions: string[]
  medications: string[]
  notes?: string
  result?: "safe" | "precaution" | "not_recommended"
  rationale?: string
  flaggedItems: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Analysis {
  id: string
  clientId: string
  photoId?: string
  fitzpatrick?: number // 1-6
  undertone?: "cool" | "neutral" | "warm"
  confidence?: number // 0.0-1.0
  recommendation?: PigmentRecommendation
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Pigment {
  id: string
  brand: string
  name: string
  baseTone: "warm" | "cool" | "neutral"
  hueNotes: string
  opacity: "low" | "medium" | "high"
  idealFitz: string
  tempShift?: string
  useCase: "brows" | "lips" | "liner" | "all"
  hexPreview?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PigmentRecommendation {
  best: {
    pigmentId: string
    pigment?: Pigment
    why: string
    expectedHealShift?: string
  }
  warmAlt: {
    pigmentId: string
    pigment?: Pigment
    why: string
    expectedHealShift?: string
  }
  coolAlt: {
    pigmentId: string
    pigment?: Pigment
    why: string
    expectedHealShift?: string
  }
}

export interface ContraindicationResult {
  result: "safe" | "precaution" | "not_recommended"
  rationale: string
  flaggedItems: string[]
  recommendations?: string[]
}

export interface SkinAnalysisResult {
  fitzpatrick: number
  undertone: "cool" | "neutral" | "warm"
  confidence: number
  recommendations?: string[]
}
