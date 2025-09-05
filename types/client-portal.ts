// Client portal types and interfaces
export interface ClientPortalUser {
  id: string
  clientId: string
  email: string
  accessToken: string
  lastLogin: Date
  isActive: boolean
  permissions: ClientPortalPermission[]
  createdAt: Date
  updatedAt: Date
}

export interface ClientPortalPermission {
  id: string
  name: 'view_profile' | 'view_appointments' | 'view_documents' | 'view_aftercare' | 'make_payments' | 'book_appointments'
  granted: boolean
  grantedAt: Date
}

export interface ClientPortalSession {
  id: string
  clientId: string
  accessToken: string
  expiresAt: Date
  ipAddress: string
  userAgent: string
  createdAt: Date
}

export interface ClientPortalActivity {
  id: string
  clientId: string
  action: 'login' | 'view_profile' | 'view_appointment' | 'download_document' | 'make_payment' | 'book_appointment'
  details: string
  timestamp: Date
  ipAddress: string
}

export interface ClientPortalDocument {
  id: string
  clientId: string
  type: 'consent_form' | 'aftercare_instructions' | 'invoice' | 'photo' | 'consultation_notes'
  title: string
  description: string
  fileUrl: string
  fileSize: number
  uploadedAt: Date
  isPublic: boolean
  downloadCount: number
}

export interface ClientPortalAppointment {
  id: string
  clientId: string
  type: string
  scheduledDate: Date
  duration: number
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
  notes: string
  reminderSent: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ClientPortalPayment {
  id: string
  clientId: string
  amount: number
  type: 'deposit' | 'full_payment' | 'installment' | 'refund'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  method: 'credit_card' | 'bank_transfer' | 'cash' | 'check'
  transactionId?: string
  description: string
  dueDate?: Date
  paidAt?: Date
  createdAt: Date
}

export interface ClientPortalMessage {
  id: string
  clientId: string
  sender: 'client' | 'artist' | 'system'
  subject: string
  content: string
  timestamp: Date
  isRead: boolean
  attachments?: string[]
}

// Point System Types
export interface ClientPoints {
  id: string
  clientId: string
  totalPoints: number
  lifetimePoints: number
  pointsHistory: PointTransaction[]
  currentTier: 'bronze' | 'silver' | 'gold' | 'platinum'
  tierProgress: number
  nextTierPoints: number
  createdAt: Date
  updatedAt: Date
}

export interface PointTransaction {
  id: string
  clientId: string
  type: 'earned' | 'redeemed' | 'expired' | 'bonus'
  category: 'service' | 'referral' | 'booking' | 'review' | 'social_media' | 'birthday' | 'anniversary' | 'promotion'
  points: number
  description: string
  relatedService?: string
  relatedReferral?: string
  expiresAt?: Date
  timestamp: Date
}

export interface ReferralProgram {
  id: string
  clientId: string
  referralCode: string
  referredFriends: ReferredFriend[]
  totalReferrals: number
  totalEarnedPoints: number
  totalEarnedCredits: number
  isActive: boolean
  createdAt: Date
}

export interface ReferredFriend {
  id: string
  referralId: string
  friendName: string
  friendEmail: string
  friendPhone?: string
  status: 'pending' | 'contacted' | 'booked' | 'completed' | 'expired'
  pointsEarned: number
  creditsEarned: number
  bookedService?: string
  bookedDate?: Date
  completedDate?: Date
  createdAt: Date
}

// Credit Application Types
export interface CreditApplication {
  id: string
  clientId: string
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'denied' | 'expired'
  
  // Personal Information
  personalInfo: {
    firstName: string
    lastName: string
    middleName?: string
    dateOfBirth: string
    ssn: string
    email: string
    phone: string
    alternatePhone?: string
  }
  
  // Address Information
  address: {
    currentAddress: {
      street: string
      city: string
      state: string
      zipCode: string
      timeAtAddress: string // years and months
      rentOwn: 'rent' | 'own'
      monthlyPayment?: number
    }
    previousAddress?: {
      street: string
      city: string
      state: string
      zipCode: string
      timeAtAddress: string
    }
  }
  
  // Employment Information
  employment: {
    employerName: string
    jobTitle: string
    employmentType: 'full_time' | 'part_time' | 'self_employed' | 'unemployed' | 'retired'
    timeEmployed: string // years and months
    monthlyIncome: number
    employerPhone: string
    employerAddress: {
      street: string
      city: string
      state: string
      zipCode: string
    }
  }
  
  // Financial Information
  financial: {
    monthlyRent: number
    otherMonthlyObligations: number
    bankAccounts: BankAccount[]
    creditCards: CreditCard[]
    loans: Loan[]
    totalMonthlyObligations: number
  }
  
  // Procedure Information
  procedure: {
    requestedAmount: number
    procedureType: string
    estimatedCost: number
    downPayment: number
    financingAmount: number
    preferredTerm: 6 | 12 | 18 | 24 | 36
    urgency: 'immediate' | 'within_30_days' | 'within_90_days' | 'flexible'
  }
  
  // Consent and Authorization
  consent: {
    creditCheck: boolean
    termsAccepted: boolean
    privacyPolicyAccepted: boolean
    marketingConsent: boolean
    electronicCommunication: boolean
  }
  
  submittedAt?: Date
  reviewedAt?: Date
  approvedAt?: Date
  deniedAt?: Date
  denialReason?: string
  creditLimit?: number
  interestRate?: number
  monthlyPayment?: number
  createdAt: Date
  updatedAt: Date
}

export interface BankAccount {
  id: string
  bankName: string
  accountType: 'checking' | 'savings'
  accountNumber: string
  balance: number
  openDate: string
}

export interface CreditCard {
  id: string
  cardIssuer: string
  cardType: string
  creditLimit: number
  currentBalance: number
  monthlyPayment: number
  openDate: string
}

export interface Loan {
  id: string
  lenderName: string
  loanType: string
  originalAmount: number
  currentBalance: number
  monthlyPayment: number
  openDate: string
  remainingPayments: number
}

// Rewards and Redemptions
export interface RewardRedemption {
  id: string
  clientId: string
  type: 'service_credit' | 'product_discount' | 'free_service' | 'gift_card'
  pointsCost: number
  value: number
  description: string
  status: 'pending' | 'approved' | 'redeemed' | 'expired'
  expiresAt: Date
  redeemedAt?: Date
  createdAt: Date
}
