// Point System Service for client engagement and rewards
import { 
  ClientPoints, 
  PointTransaction, 
  ReferralProgram, 
  ReferredFriend,
  CreditApplication,
  RewardRedemption
} from '@/types/client-portal'

// In-memory storage for point system data
let clientPoints: ClientPoints[] = []
let referralPrograms: ReferralProgram[] = []
let creditApplications: CreditApplication[] = []
let rewardRedemptions: RewardRedemption[] = []

// Point earning rules
const POINT_RULES = {
  // Service-based points
  SERVICE_COMPLETION: 100, // Base points for any service
  SERVICE_MULTIPLIER: 0.1, // 10% of service cost in points
  
  // Referral points
  REFERRAL_SIGNUP: 50, // Points when friend signs up
  REFERRAL_BOOKING: 100, // Points when friend books appointment
  REFERRAL_COMPLETION: 200, // Points when friend completes service
  
  // Engagement points
  REVIEW_SUBMISSION: 25,
  SOCIAL_MEDIA_SHARE: 10,
  BIRTHDAY_BONUS: 50,
  ANNIVERSARY_BONUS: 100,
  
  // Tier thresholds
  TIER_THRESHOLDS: {
    bronze: 0,
    silver: 500,
    gold: 1500,
    platinum: 3000
  },
  
  // Tier benefits
  TIER_BENEFITS: {
    bronze: { discount: 0, bonusPoints: 1 },
    silver: { discount: 0.05, bonusPoints: 1.1 },
    gold: { discount: 0.1, bonusPoints: 1.25 },
    platinum: { discount: 0.15, bonusPoints: 1.5 }
  }
}

// Initialize sample data
const initializePointSystemData = () => {
  // Sample client points
  clientPoints = [
    {
      id: 'points_1',
      clientId: '1',
      totalPoints: 1250,
      lifetimePoints: 1800,
      currentTier: 'gold',
      tierProgress: 75,
      nextTierPoints: 3000,
      pointsHistory: [
        {
          id: 'tx_1',
          clientId: '1',
          type: 'earned',
          category: 'service',
          points: 150,
          description: 'Microblading service completed',
          relatedService: 'Microblading',
          timestamp: new Date('2024-01-15')
        },
        {
          id: 'tx_2',
          clientId: '1',
          type: 'earned',
          category: 'referral',
          points: 200,
          description: 'Referral completed: Maria Garcia',
          relatedReferral: 'Maria Garcia',
          timestamp: new Date('2024-01-20')
        },
        {
          id: 'tx_3',
          clientId: '1',
          type: 'earned',
          category: 'review',
          points: 25,
          description: 'Review submitted',
          timestamp: new Date('2024-01-18')
        }
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: 'points_2',
      clientId: '2',
      totalPoints: 350,
      lifetimePoints: 450,
      currentTier: 'silver',
      tierProgress: 70,
      nextTierPoints: 1500,
      pointsHistory: [
        {
          id: 'tx_4',
          clientId: '2',
          type: 'earned',
          category: 'service',
          points: 120,
          description: 'Lip blush service completed',
          relatedService: 'Lip Blush',
          timestamp: new Date('2024-01-10')
        },
        {
          id: 'tx_5',
          clientId: '2',
          type: 'earned',
          category: 'referral',
          points: 50,
          description: 'Referral signup: Emma Wilson',
          relatedReferral: 'Emma Wilson',
          timestamp: new Date('2024-01-12')
        }
      ],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    }
  ]

  // Sample referral programs
  referralPrograms = [
    {
      id: 'ref_1',
      clientId: '1',
      referralCode: 'SARAH2024',
      totalReferrals: 3,
      totalEarnedPoints: 350,
      totalEarnedCredits: 35,
      isActive: true,
      referredFriends: [
        {
          id: 'friend_1',
          referralId: 'ref_1',
          friendName: 'Maria Garcia',
          friendEmail: 'maria.garcia@email.com',
          friendPhone: '+1-555-0124',
          status: 'completed',
          pointsEarned: 200,
          creditsEarned: 20,
          bookedService: 'Microblading',
          bookedDate: new Date('2024-01-05'),
          completedDate: new Date('2024-01-20'),
          createdAt: new Date('2024-01-01')
        },
        {
          id: 'friend_2',
          referralId: 'ref_1',
          friendName: 'Jessica Brown',
          friendEmail: 'jessica.brown@email.com',
          status: 'booked',
          pointsEarned: 100,
          creditsEarned: 10,
          bookedService: 'Lip Blush',
          bookedDate: new Date('2024-02-15'),
          createdAt: new Date('2024-01-15')
        }
      ],
      createdAt: new Date('2024-01-01')
    },
    {
      id: 'ref_2',
      clientId: '2',
      referralCode: 'MARIA2024',
      totalReferrals: 1,
      totalEarnedPoints: 50,
      totalEarnedCredits: 5,
      isActive: true,
      referredFriends: [
        {
          id: 'friend_3',
          referralId: 'ref_2',
          friendName: 'Emma Wilson',
          friendEmail: 'emma.wilson@email.com',
          status: 'pending',
          pointsEarned: 50,
          creditsEarned: 5,
          createdAt: new Date('2024-01-12')
        }
      ],
      createdAt: new Date('2024-01-01')
    }
  ]

  // Sample credit applications
  creditApplications = [
    {
      id: 'credit_1',
      clientId: '1',
      status: 'approved',
      personalInfo: {
        firstName: 'Sarah',
        lastName: 'Johnson',
        dateOfBirth: '1990-05-15',
        ssn: '123-45-6789',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-0123'
      },
      address: {
        currentAddress: {
          street: '123 Main St',
          city: 'Kansas City',
          state: 'MO',
          zipCode: '64111',
          timeAtAddress: '2 years 6 months',
          rentOwn: 'rent',
          monthlyPayment: 1200
        }
      },
      employment: {
        employerName: 'Tech Solutions Inc',
        jobTitle: 'Marketing Manager',
        employmentType: 'full_time',
        timeEmployed: '3 years 2 months',
        monthlyIncome: 4500,
        employerPhone: '+1-555-0100',
        employerAddress: {
          street: '456 Business Ave',
          city: 'Kansas City',
          state: 'MO',
          zipCode: '64112'
        }
      },
      financial: {
        monthlyRent: 1200,
        otherMonthlyObligations: 800,
        bankAccounts: [
          {
            id: 'bank_1',
            bankName: 'First National Bank',
            accountType: 'checking',
            accountNumber: '****1234',
            balance: 2500,
            openDate: '2018-03-15'
          }
        ],
        creditCards: [
          {
            id: 'cc_1',
            cardIssuer: 'Chase',
            cardType: 'Visa',
            creditLimit: 5000,
            currentBalance: 1200,
            monthlyPayment: 150,
            openDate: '2020-01-10'
          }
        ],
        loans: [],
        totalMonthlyObligations: 2150
      },
      procedure: {
        requestedAmount: 2500,
        procedureType: 'Microblading + Touch-up',
        estimatedCost: 2500,
        downPayment: 500,
        financingAmount: 2000,
        preferredTerm: 12,
        urgency: 'within_30_days'
      },
      consent: {
        creditCheck: true,
        termsAccepted: true,
        privacyPolicyAccepted: true,
        marketingConsent: true,
        electronicCommunication: true
      },
      submittedAt: new Date('2024-01-10'),
      approvedAt: new Date('2024-01-12'),
      creditLimit: 3000,
      interestRate: 0.1499,
      monthlyPayment: 180,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-12')
    }
  ]
}

// Initialize data on first load
if (typeof window !== 'undefined') {
  initializePointSystemData()
}

export class PointSystemService {
  private static instance: PointSystemService

  static getInstance(): PointSystemService {
    if (!PointSystemService.instance) {
      PointSystemService.instance = new PointSystemService()
    }
    return PointSystemService.instance
  }

  // Client Points Management
  getClientPoints(clientId: string): ClientPoints | null {
    return clientPoints.find(p => p.clientId === clientId) || null
  }

  addPoints(clientId: string, points: number, category: PointTransaction['category'], description: string, relatedService?: string, relatedReferral?: string): void {
    let clientPoint = clientPoints.find(p => p.clientId === clientId)
    
    if (!clientPoint) {
      clientPoint = {
        id: `points_${clientId}`,
        clientId,
        totalPoints: 0,
        lifetimePoints: 0,
        currentTier: 'bronze',
        tierProgress: 0,
        nextTierPoints: POINT_RULES.TIER_THRESHOLDS.silver,
        pointsHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      clientPoints.push(clientPoint)
    }

    // Add transaction
    const transaction: PointTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clientId,
      type: 'earned',
      category,
      points,
      description,
      relatedService,
      relatedReferral,
      timestamp: new Date()
    }

    clientPoint.pointsHistory.push(transaction)
    clientPoint.totalPoints += points
    clientPoint.lifetimePoints += points
    clientPoint.updatedAt = new Date()

    // Update tier
    this.updateClientTier(clientPoint)
  }

  private updateClientTier(clientPoint: ClientPoints): void {
    const { totalPoints } = clientPoint
    const { TIER_THRESHOLDS } = POINT_RULES

    if (totalPoints >= TIER_THRESHOLDS.platinum) {
      clientPoint.currentTier = 'platinum'
      clientPoint.tierProgress = 100
      clientPoint.nextTierPoints = TIER_THRESHOLDS.platinum
    } else if (totalPoints >= TIER_THRESHOLDS.gold) {
      clientPoint.currentTier = 'gold'
      clientPoint.tierProgress = ((totalPoints - TIER_THRESHOLDS.gold) / (TIER_THRESHOLDS.platinum - TIER_THRESHOLDS.gold)) * 100
      clientPoint.nextTierPoints = TIER_THRESHOLDS.platinum
    } else if (totalPoints >= TIER_THRESHOLDS.silver) {
      clientPoint.currentTier = 'silver'
      clientPoint.tierProgress = ((totalPoints - TIER_THRESHOLDS.silver) / (TIER_THRESHOLDS.gold - TIER_THRESHOLDS.silver)) * 100
      clientPoint.nextTierPoints = TIER_THRESHOLDS.gold
    } else {
      clientPoint.currentTier = 'bronze'
      clientPoint.tierProgress = (totalPoints / TIER_THRESHOLDS.silver) * 100
      clientPoint.nextTierPoints = TIER_THRESHOLDS.silver
    }
  }

  // Referral Program Management
  getReferralProgram(clientId: string): ReferralProgram | null {
    return referralPrograms.find(r => r.clientId === clientId) || null
  }

  createReferralProgram(clientId: string): ReferralProgram {
    const existingProgram = this.getReferralProgram(clientId)
    if (existingProgram) return existingProgram

    const referralCode = this.generateReferralCode()
    const program: ReferralProgram = {
      id: `ref_${clientId}`,
      clientId,
      referralCode,
      totalReferrals: 0,
      totalEarnedPoints: 0,
      totalEarnedCredits: 0,
      isActive: true,
      referredFriends: [],
      createdAt: new Date()
    }

    referralPrograms.push(program)
    return program
  }

  private generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  addReferral(clientId: string, friendName: string, friendEmail: string, friendPhone?: string): ReferredFriend {
    const program = this.getReferralProgram(clientId)
    if (!program) {
      throw new Error('Referral program not found')
    }

    const friend: ReferredFriend = {
      id: `friend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      referralId: program.id,
      friendName,
      friendEmail,
      friendPhone,
      status: 'pending',
      pointsEarned: 0,
      creditsEarned: 0,
      createdAt: new Date()
    }

    program.referredFriends.push(friend)
    program.totalReferrals += 1

    // Award initial referral points
    this.addPoints(clientId, POINT_RULES.REFERRAL_SIGNUP, 'referral', `Referral signup: ${friendName}`, undefined, friendName)
    program.totalEarnedPoints += POINT_RULES.REFERRAL_SIGNUP
    program.totalEarnedCredits += POINT_RULES.REFERRAL_SIGNUP / 10

    return friend
  }

  updateReferralStatus(referralId: string, friendId: string, status: ReferredFriend['status'], bookedService?: string): void {
    const program = referralPrograms.find(r => r.id === referralId)
    if (!program) return

    const friend = program.referredFriends.find(f => f.id === friendId)
    if (!friend) return

    const oldStatus = friend.status
    friend.status = status

    if (status === 'booked' && oldStatus !== 'booked') {
      friend.bookedService = bookedService
      friend.bookedDate = new Date()
      friend.pointsEarned += POINT_RULES.REFERRAL_BOOKING
      friend.creditsEarned += POINT_RULES.REFERRAL_BOOKING / 10
      
      this.addPoints(program.clientId, POINT_RULES.REFERRAL_BOOKING, 'referral', `Referral booked: ${friend.friendName}`, bookedService, friend.friendName)
      program.totalEarnedPoints += POINT_RULES.REFERRAL_BOOKING
      program.totalEarnedCredits += POINT_RULES.REFERRAL_BOOKING / 10
    }

    if (status === 'completed' && oldStatus !== 'completed') {
      friend.completedDate = new Date()
      friend.pointsEarned += POINT_RULES.REFERRAL_COMPLETION
      friend.creditsEarned += POINT_RULES.REFERRAL_COMPLETION / 10
      
      this.addPoints(program.clientId, POINT_RULES.REFERRAL_COMPLETION, 'referral', `Referral completed: ${friend.friendName}`, bookedService, friend.friendName)
      program.totalEarnedPoints += POINT_RULES.REFERRAL_COMPLETION
      program.totalEarnedCredits += POINT_RULES.REFERRAL_COMPLETION / 10
    }
  }

  // Credit Application Management
  getCreditApplication(clientId: string): CreditApplication | null {
    return creditApplications.find(c => c.clientId === clientId) || null
  }

  createCreditApplication(clientId: string): CreditApplication {
    const existingApp = this.getCreditApplication(clientId)
    if (existingApp) return existingApp

    const application: CreditApplication = {
      id: `credit_${clientId}`,
      clientId,
      status: 'draft',
      personalInfo: {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        ssn: '',
        email: '',
        phone: ''
      },
      address: {
        currentAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          timeAtAddress: '',
          rentOwn: 'rent'
        }
      },
      employment: {
        employerName: '',
        jobTitle: '',
        employmentType: 'full_time',
        timeEmployed: '',
        monthlyIncome: 0,
        employerPhone: '',
        employerAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        }
      },
      financial: {
        monthlyRent: 0,
        otherMonthlyObligations: 0,
        bankAccounts: [],
        creditCards: [],
        loans: [],
        totalMonthlyObligations: 0
      },
      procedure: {
        requestedAmount: 0,
        procedureType: '',
        estimatedCost: 0,
        downPayment: 0,
        financingAmount: 0,
        preferredTerm: 12,
        urgency: 'flexible'
      },
      consent: {
        creditCheck: false,
        termsAccepted: false,
        privacyPolicyAccepted: false,
        marketingConsent: false,
        electronicCommunication: false
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    creditApplications.push(application)
    return application
  }

  updateCreditApplication(clientId: string, updates: Partial<CreditApplication>): CreditApplication {
    const application = this.getCreditApplication(clientId)
    if (!application) {
      throw new Error('Credit application not found')
    }

    Object.assign(application, updates, { updatedAt: new Date() })
    return application
  }

  submitCreditApplication(clientId: string): CreditApplication {
    const application = this.getCreditApplication(clientId)
    if (!application) {
      throw new Error('Credit application not found')
    }

    application.status = 'submitted'
    application.submittedAt = new Date()
    application.updatedAt = new Date()

    return application
  }

  // Reward Redemption
  getAvailableRewards(clientId: string): RewardRedemption[] {
    const clientPoint = this.getClientPoints(clientId)
    if (!clientPoint) return []

    const availableRewards: RewardRedemption[] = [
      {
        id: 'reward_1',
        clientId,
        type: 'service_credit',
        pointsCost: 100,
        value: 10,
        description: '$10 Service Credit',
        status: 'pending',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        createdAt: new Date()
      },
      {
        id: 'reward_2',
        clientId,
        type: 'product_discount',
        pointsCost: 250,
        value: 25,
        description: '25% Off Next Service',
        status: 'pending',
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        createdAt: new Date()
      },
      {
        id: 'reward_3',
        clientId,
        type: 'free_service',
        pointsCost: 1000,
        value: 100,
        description: 'Free Touch-up Session',
        status: 'pending',
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        createdAt: new Date()
      }
    ]

    return availableRewards.filter(reward => clientPoint.totalPoints >= reward.pointsCost)
  }

  redeemReward(clientId: string, rewardId: string): RewardRedemption | null {
    const clientPoint = this.getClientPoints(clientId)
    if (!clientPoint) return null

    const reward = this.getAvailableRewards(clientId).find(r => r.id === rewardId)
    if (!reward) return null

    if (clientPoint.totalPoints < reward.pointsCost) return null

    // Deduct points
    clientPoint.totalPoints -= reward.pointsCost
    clientPoint.updatedAt = new Date()

    // Add redemption transaction
    const transaction: PointTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clientId,
      type: 'redeemed',
      category: 'promotion',
      points: -reward.pointsCost,
      description: `Redeemed: ${reward.description}`,
      timestamp: new Date()
    }

    clientPoint.pointsHistory.push(transaction)

    // Update reward status
    reward.status = 'redeemed'
    reward.redeemedAt = new Date()

    return reward
  }

  // Utility methods
  getPointRules() {
    return POINT_RULES
  }

  getTierBenefits(tier: ClientPoints['currentTier']) {
    return POINT_RULES.TIER_BENEFITS[tier]
  }
}

