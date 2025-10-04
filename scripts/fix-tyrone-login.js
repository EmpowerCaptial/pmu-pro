#!/usr/bin/env node

/**
 * Comprehensive script to fix Tyrone's login issues
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function fixTyroneLogin() {
  try {
    console.log('🔧 Fixing Tyrone Jackson login issues...')
    console.log('---')

    // 1. Verify account status
    const user = await prisma.user.findUnique({
      where: { email: 'tyronejackboy@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        selectedPlan: true,
        subscriptionStatus: true,
        hasActiveSubscription: true,
        isLicenseVerified: true,
        role: true
      }
    })

    if (!user) {
      console.log('❌ User not found - this should not happen')
      return
    }

    console.log('✅ Account Status:')
    console.log(`  Name: ${user.name}`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Plan: ${user.selectedPlan}`)
    console.log(`  Status: ${user.subscriptionStatus}`)
    console.log(`  Active Subscription: ${user.hasActiveSubscription}`)
    console.log(`  License Verified: ${user.isLicenseVerified}`)
    console.log(`  Role: ${user.role}`)
    console.log('---')

    // 2. Test password verification
    const passwordTest = await bcrypt.compare('Tyronej22!', user.password)
    console.log(`🔑 Password Test: ${passwordTest ? 'PASS' : 'FAIL'}`)
    console.log('---')

    // 3. Generate a fresh magic link token
    console.log('📧 Generating fresh magic link...')
    
    // Delete any existing tokens for this user
    await prisma.magicLinkToken.deleteMany({
      where: { userId: user.id }
    })

    // Create a new magic link token
    const token = require('crypto').randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hours from now

    await prisma.magicLinkToken.create({
      data: {
        userId: user.id,
        email: user.email,
        token: token,
        expiresAt: expiresAt
      }
    })

    console.log('✅ Magic link token created')
    console.log(`🔗 Magic Link: https://thepmuguide.com/auth/verify?token=${token}`)
    console.log(`⏰ Expires: ${expiresAt.toISOString()}`)
    console.log('---')

    // 4. Provide login instructions
    console.log('📋 LOGIN INSTRUCTIONS FOR TYRONE:')
    console.log('')
    console.log('🎯 METHOD 1 - Regular Login:')
    console.log('  1. Go to: https://thepmuguide.com/auth/login')
    console.log('  2. Email: tyronejackboy@gmail.com')
    console.log('  3. Password: Tyronej22!')
    console.log('  4. Click "Sign In"')
    console.log('')
    console.log('🎯 METHOD 2 - Magic Link (if password fails):')
    console.log('  1. Go to: https://thepmuguide.com/auth/login')
    console.log('  2. Click "Forgot Password?"')
    console.log('  3. Enter: tyronejackboy@gmail.com')
    console.log('  4. Check email for magic link')
    console.log('  5. Click the link to sign in')
    console.log('')
    console.log('🎯 METHOD 3 - Direct Magic Link (immediate):')
    console.log(`  1. Click this link: https://thepmuguide.com/auth/verify?token=${token}`)
    console.log('  2. Should automatically log you in')
    console.log('')
    console.log('🔍 TROUBLESHOOTING:')
    console.log('  - Make sure you use EXACTLY: tyronejackboy@gmail.com')
    console.log('  - Make sure password is EXACTLY: Tyronej22!')
    console.log('  - Check for extra spaces in email/password fields')
    console.log('  - Try clearing browser cache/cookies')
    console.log('  - Try incognito/private browsing mode')
    console.log('  - Make sure you are on: https://thepmuguide.com')
    console.log('')

  } catch (error) {
    console.error('❌ Error fixing login:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the fix
fixTyroneLogin()
  .then(() => {
    console.log('✅ Fix completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error)
    process.exit(1)
  })
