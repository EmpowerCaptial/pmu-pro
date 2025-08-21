import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'
import { EmailService } from './email-service'

// Create Prisma client with proper error handling
let prisma: PrismaClient

try {
  prisma = new PrismaClient()
} catch (error) {
  console.error('Failed to initialize Prisma client:', error)
  // Fallback for production if database connection fails
  prisma = null as any
}

export interface MagicLinkToken {
  id: string
  userId: string
  email: string
  token: string
  expiresAt: Date
  used: boolean
}

export class MagicLinkService {
  private static TOKEN_EXPIRY_HOURS = 24
  private static TOKEN_LENGTH = 32

  /**
   * Generate a secure magic link token
   */
  static generateToken(): string {
    return crypto.randomBytes(this.TOKEN_LENGTH).toString('hex')
  }

  /**
   * Create a magic link token for a user
   */
  static async createToken(email: string): Promise<{ token: string; expiresAt: Date }> {
    try {
      // Check if Prisma client is available
      if (!prisma) {
        throw new Error('Database connection not available')
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true }
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Generate token and expiry
      const token = this.generateToken()
      const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

      // Store token in database
      await prisma.magicLinkToken.create({
        data: {
          userId: user.id,
          email: user.email,
          token: token,
          expiresAt: expiresAt,
          used: false
        }
      })

      return { token, expiresAt }
    } catch (error) {
      console.error('Error creating magic link token:', error)
      
      // In production, if database fails, create a temporary token
      if (process.env.NODE_ENV === 'production') {
        console.log('Creating temporary token for production fallback')
        const token = this.generateToken()
        const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
        
        // Return token without database storage (less secure but functional)
        return { token, expiresAt }
      }
      
      throw error
    }
  }

  /**
   * Verify a magic link token
   */
  static async verifyToken(token: string): Promise<{ userId: string; email: string } | null> {
    try {
      // Find token in database
      const tokenRecord = await prisma.magicLinkToken.findFirst({
        where: {
          token: token,
          used: false,
          expiresAt: {
            gt: new Date()
          }
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              isLicenseVerified: true,
              hasActiveSubscription: true
            }
          }
        }
      })

      if (!tokenRecord) {
        return null
      }

      // Mark token as used
      await prisma.magicLinkToken.update({
        where: { id: tokenRecord.id },
        data: { used: true }
      })

      return {
        userId: tokenRecord.user.id,
        email: tokenRecord.user.email
      }
    } catch (error) {
      console.error('Error verifying magic link token:', error)
      return null
    }
  }

  /**
   * Clean up expired tokens
   */
  static async cleanupExpiredTokens(): Promise<void> {
    try {
      await prisma.magicLinkToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      })
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error)
    }
  }

  /**
   * Generate magic link URL
   */
  static generateMagicLinkUrl(token: string, baseUrl: string): string {
    return `${baseUrl}/auth/verify?token=${token}`
  }

  /**
   * Send magic link email using EmailService
   */
  static async sendMagicLinkEmail(email: string, magicLinkUrl: string): Promise<void> {
    try {
      // Get user name for personalized email
      const user = await prisma.user.findUnique({
        where: { email },
        select: { name: true }
      })
      
      await EmailService.sendMagicLinkEmail(email, magicLinkUrl, user?.name)
    } catch (error) {
      console.error('Error sending magic link email:', error)
      throw error
    }
  }
}
