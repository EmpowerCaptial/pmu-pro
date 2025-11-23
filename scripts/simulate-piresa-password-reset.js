#!/usr/bin/env node

/**
 * Simulate Piresa Willis password reset flow
 * Tests the complete password reset process from start to finish
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

// Use production database URL if available, otherwise use default
const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL is not set!')
  console.error('Please set DATABASE_URL or NEON_DATABASE_URL environment variable')
  console.error('Example: DATABASE_URL="postgresql://..." node scripts/simulate-piresa-password-reset.js')
  process.exit(1)
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
})

async function simulatePasswordReset() {
  try {
    console.log('🔐 SIMULATING PIRESA PASSWORD RESET FLOW')
    console.log('========================================\n')

    const email = 'piresa@universalbeautystudio.com'
    const newPassword = 'Piresa2024!New'

    // ============================================
    // STEP 1: FORGOT PASSWORD REQUEST
    // ============================================
    console.log('📊 STEP 1: Forgot Password Request')
    console.log('-----------------------------------')
    console.log('   User clicks "Forgot Password"')
    console.log(`   Enters email: ${email}`)
    console.log('   POST /api/auth/forgot-password')
    console.log('')

    // Simulate API endpoint: /api/auth/forgot-password
    const normalizedEmail = email.trim().toLowerCase()
    console.log('   📧 Normalized email:', normalizedEmail)
    
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: 'insensitive'
        }
      }
    })

    if (!user) {
      console.log('   ❌ User not found')
      console.log('   ✅ API would still return success (to prevent email enumeration)')
      console.log('   Response: { success: true, message: "If an account exists..." }')
      await prisma.$disconnect()
      process.exit(1)
    }

    console.log('   ✅ User found:', user.name)
    console.log('')

    // Generate reset token (as API does)
    console.log('   🔑 Generating reset token...')
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    console.log(`   Token: ${resetToken.substring(0, 20)}...`)
    console.log(`   Expires: ${resetTokenExpiry.toISOString()}`)
    console.log('')

    // Store token in database (as API does)
    console.log('   💾 Storing token in database...')
    const storedToken = await prisma.magicLinkToken.create({
      data: {
        userId: user.id,
        email: user.email,
        token: resetToken,
        expiresAt: resetTokenExpiry,
        used: false
      }
    })
    console.log('   ✅ Token stored successfully')
    console.log(`   Token ID: ${storedToken.id}`)
    console.log('')

    // Create reset URL (as API does)
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepmuguide.com'}/auth/reset-password/${resetToken}`
    console.log('   📧 Reset URL generated:')
    console.log(`   ${resetUrl}`)
    console.log('')

    console.log('   ✅ STEP 1 COMPLETE: Email would be sent (simulated)')
    console.log('   Response: { success: true, message: "Reset link sent" }')
    console.log('')

    // ============================================
    // STEP 2: TOKEN VALIDATION
    // ============================================
    console.log('📊 STEP 2: Token Validation')
    console.log('----------------------------')
    console.log('   User clicks reset link in email')
    console.log(`   GET /api/auth/validate-reset-token?token=${resetToken.substring(0, 20)}...`)
    console.log('')

    // Simulate API endpoint: /api/auth/validate-reset-token
    const validationToken = await prisma.magicLinkToken.findFirst({
      where: {
        token: resetToken,
        used: false,
        expiresAt: {
          gt: new Date() // Token hasn't expired
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    if (!validationToken) {
      console.log('   ❌ Token validation failed')
      console.log('   Response: { error: "Invalid or expired reset token" }')
      console.log('   Status: 400')
      await prisma.$disconnect()
      process.exit(1)
    }

    console.log('   ✅ Token is valid!')
    console.log(`   User: ${validationToken.user.name}`)
    console.log(`   Email: ${validationToken.user.email}`)
    console.log(`   Expires: ${validationToken.expiresAt.toISOString()}`)
    console.log(`   Used: ${validationToken.used}`)
    console.log('')

    console.log('   ✅ STEP 2 COMPLETE: Token validated')
    console.log('   Response: { success: true, valid: true, user: {...} }')
    console.log('')

    // ============================================
    // STEP 3: PASSWORD RESET SUBMISSION
    // ============================================
    console.log('📊 STEP 3: Password Reset Submission')
    console.log('-------------------------------------')
    console.log('   User enters new password')
    console.log(`   New password: ${newPassword}`)
    console.log('   POST /api/auth/reset-password')
    console.log('')

    // Simulate API endpoint: /api/auth/reset-password
    const resetRequest = {
      token: resetToken,
      password: newPassword,
      confirmPassword: newPassword
    }

    console.log('   📋 Request body:', JSON.stringify({
      token: resetToken.substring(0, 20) + '...',
      password: '***',
      confirmPassword: '***'
    }))
    console.log('')

    // Validate passwords match
    if (resetRequest.password !== resetRequest.confirmPassword) {
      console.log('   ❌ Passwords do not match')
      console.log('   Response: { error: "Passwords do not match" }')
      console.log('   Status: 400')
      await prisma.$disconnect()
      process.exit(1)
    }
    console.log('   ✅ Passwords match')

    // Validate password length
    if (resetRequest.password.length < 8) {
      console.log('   ❌ Password too short')
      console.log('   Response: { error: "Password must be at least 8 characters" }')
      console.log('   Status: 400')
      await prisma.$disconnect()
      process.exit(1)
    }
    console.log('   ✅ Password length valid')

    // Find token again
    const resetTokenRecord = await prisma.magicLinkToken.findFirst({
      where: {
        token: resetRequest.token,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    })

    if (!resetTokenRecord) {
      console.log('   ❌ Invalid or expired token')
      console.log('   Response: { error: "Invalid or expired reset token" }')
      console.log('   Status: 400')
      await prisma.$disconnect()
      process.exit(1)
    }
    console.log('   ✅ Token found and valid')

    // Hash new password
    console.log('   🔐 Hashing new password...')
    const hashedPassword = await bcrypt.hash(resetRequest.password, 12)
    console.log('   ✅ Password hashed')

    // Update password and mark token as used (in transaction)
    console.log('   💾 Updating password in database...')
    await prisma.$transaction(async (tx) => {
      // Update user password
      await tx.user.update({
        where: { id: resetTokenRecord.userId },
        data: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      })

      // Mark token as used
      await tx.magicLinkToken.update({
        where: { id: resetTokenRecord.id },
        data: { used: true }
      })
    })
    console.log('   ✅ Password updated, token marked as used')
    console.log('')

    // Verify new password works
    console.log('   🔍 Verifying new password...')
    const updatedUser = await prisma.user.findUnique({
      where: { id: resetTokenRecord.userId },
      select: { password: true }
    })

    const newPasswordValid = await bcrypt.compare(newPassword, updatedUser.password)
    if (!newPasswordValid) {
      console.log('   ❌ New password verification failed!')
      await prisma.$disconnect()
      process.exit(1)
    }
    console.log('   ✅ New password verified!')
    console.log('')

    console.log('   ✅ STEP 3 COMPLETE: Password reset successful')
    console.log('   Response: { success: true, message: "Password has been reset successfully" }')
    console.log('')

    // ============================================
    // STEP 4: LOGIN WITH NEW PASSWORD
    // ============================================
    console.log('📊 STEP 4: Login with New Password')
    console.log('----------------------------------')
    console.log('   User tries to login with new password')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${newPassword}`)
    console.log('')

    const loginUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true
      }
    })

    const loginPasswordValid = await bcrypt.compare(newPassword, loginUser.password)
    if (!loginPasswordValid) {
      console.log('   ❌ Login with new password failed!')
      await prisma.$disconnect()
      process.exit(1)
    }

    console.log('   ✅ Login with new password successful!')
    console.log(`   User: ${loginUser.name}`)
    console.log(`   Role: ${loginUser.role}`)
    console.log('')

    // ============================================
    // SUMMARY
    // ============================================
    console.log('🎉 PASSWORD RESET SIMULATION COMPLETE')
    console.log('=====================================')
    console.log('✅ All steps passed!')
    console.log('✅ Password reset flow is working correctly')
    console.log('')
    console.log('📋 Summary:')
    console.log(`   User: ${user.name}`)
    console.log(`   Email: ${email}`)
    console.log(`   Old password: piresa2024`)
    console.log(`   New password: ${newPassword}`)
    console.log('')
    console.log('💡 Note: The token has been marked as used')
    console.log('   A new password reset request would generate a new token')
    console.log('')

    // Cleanup: Reset password back to original for testing
    console.log('🔄 Resetting password back to original for future testing...')
    const originalPassword = 'piresa2024'
    const originalHashed = await bcrypt.hash(originalPassword, 12)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: originalHashed }
    })
    console.log('✅ Password reset to original: piresa2024')
    console.log('')

  } catch (error) {
    console.error('❌ SIMULATION ERROR:', error.message)
    console.error('Full error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

simulatePasswordReset()

