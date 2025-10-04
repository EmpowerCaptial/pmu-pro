#!/usr/bin/env node

/**
 * Script to generate a fresh magic link for Tyrone after the payment verification fix
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function generateFreshMagicLink() {
  try {
    console.log('🔗 Generating fresh magic link for Tyrone after payment verification fix...')
    console.log('---')

    const user = await prisma.user.findUnique({
      where: { email: 'tyronejackboy@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        selectedPlan: true,
        subscriptionStatus: true,
        hasActiveSubscription: true,
        isLicenseVerified: true
      }
    })

    if (!user) {
      console.log('❌ User not found')
      return
    }

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

    console.log('✅ Fresh magic link generated!')
    console.log('')
    console.log('🎯 TYRONE\'S NEW LOGIN LINK:')
    console.log(`🔗 https://thepmuguide.com/auth/verify?token=${token}`)
    console.log('')
    console.log('📋 ACCOUNT CONFIRMATION:')
    console.log(`  Name: ${user.name}`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Plan: ${user.selectedPlan} (Enterprise Studio)`)
    console.log(`  Status: ${user.subscriptionStatus}`)
    console.log(`  Active Subscription: ${user.hasActiveSubscription}`)
    console.log(`  License Verified: ${user.isLicenseVerified}`)
    console.log('')
    console.log('🎉 EXPECTED RESULT:')
    console.log('✅ Magic link should work immediately')
    console.log('✅ No "subscription required" screen')
    console.log('✅ Direct access to Enterprise Studio features')
    console.log('✅ Full dashboard access')
    console.log('')
    console.log('⏰ Token expires:', expiresAt.toISOString())
    console.log('')

  } catch (error) {
    console.error('❌ Error generating magic link:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the generation
generateFreshMagicLink()
  .then(() => {
    console.log('✅ Magic link generation completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Magic link generation failed:', error)
    process.exit(1)
  })
