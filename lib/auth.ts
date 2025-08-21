// Professional Authentication Service for PMU Pro
// Handles registration, login, and license verification

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import type { UserRegistration, UserLogin, User } from '@/lib/types'

const prisma = new PrismaClient()

export class AuthService {
  private static JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key'
  private static JWT_EXPIRES_IN = '7d'

  /**
   * Register a new PMU professional
   */
  static async register(userData: UserRegistration): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Check if license number is already registered
    const existingLicense = await prisma.user.findFirst({
      where: { 
        licenseNumber: userData.licenseNumber,
        licenseState: userData.licenseState
      }
    })

    if (existingLicense) {
      throw new Error('This license number is already registered')
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        businessName: userData.businessName,
        phone: userData.phone,
        licenseNumber: userData.licenseNumber,
        licenseState: userData.licenseState,
        yearsExperience: userData.yearsExperience,
        selectedPlan: userData.selectedPlan,
        // Files would be uploaded separately and paths stored here
        licenseFile: undefined, // Set after file upload
        insuranceFile: undefined, // Set after file upload
        hasActiveSubscription: false,
        isLicenseVerified: false, // Requires manual verification
        role: 'artist',
        subscriptionStatus: 'inactive'
      }
    })

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role,
        isVerified: user.isLicenseVerified 
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN } as jwt.SignOptions
    )

    // Remove password from response
    const { password, ...userResponse } = user

    return { user: userResponse as User, token }
  }

  /**
   * Login user
   */
  static async login(credentials: UserLogin): Promise<{ user: User; token: string }> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: credentials.email }
    })

    if (!user) {
      throw new Error('Invalid email or password')
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

    if (!isPasswordValid) {
      throw new Error('Invalid email or password')
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role,
        isVerified: user.isLicenseVerified,
        hasActiveSubscription: user.hasActiveSubscription
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN } as jwt.SignOptions
    )

    // Remove password from response
    const { password, ...userResponse } = user

    return { user: userResponse as User, token }
  }

  /**
   * Verify JWT token
   */
  static async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      })

      if (!user) return null

      const { password, ...userResponse } = user
      return userResponse as User
    } catch (error) {
      return null
    }
  }

  /**
   * Update user subscription status (called by Stripe webhooks)
   */
  static async updateSubscription(
    userId: string, 
    subscriptionData: {
      stripeCustomerId?: string
      stripeSubscriptionId?: string
      subscriptionStatus: string
      hasActiveSubscription: boolean
    }
  ): Promise<User> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        stripeCustomerId: subscriptionData.stripeCustomerId,
        stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
        subscriptionStatus: subscriptionData.subscriptionStatus,
        hasActiveSubscription: subscriptionData.hasActiveSubscription
      }
    })

    const { password, ...userResponse } = user
    return userResponse as User
  }

  /**
   * Verify license (admin function)
   */
  static async verifyLicense(userId: string, isVerified: boolean): Promise<User> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isLicenseVerified: isVerified }
    })

    const { password, ...userResponse } = user
    return userResponse as User
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) return null

    const { password, ...userResponse } = user
    return userResponse as User
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    // Remove sensitive fields that shouldn't be updated directly
    const { password, stripeCustomerId, stripeSubscriptionId, ...allowedUpdates } = updates

    const user = await prisma.user.update({
      where: { id: userId },
      data: allowedUpdates
    })

    const { password: _, ...userResponse } = user
    return userResponse as User
  }

  /**
   * Change password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect')
    }

    // Hash new password
    const saltRounds = 12
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    })
  }
}

export default AuthService
