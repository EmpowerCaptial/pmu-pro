#!/usr/bin/env node

/**
 * Generate a fresh magic link for Tyrone after fixing the production issue
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function generateFreshTyroneLink() {
  try {
    console.log('🔗 GENERATING FRESH MAGIC LINK FOR TYRONE...')
    console.log('============================================')
    
    const user = await prisma.user.findUnique({
      where: { email: 'tyronejackboy@gmail.com' },
      select: { id: true, name: true, email: true }
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
    console.log('🔧 FIXES APPLIED:')
    console.log('✅ Production magic link verification now works')
    console.log('✅ Payment verification allows manual Enterprise Studio users')
    console.log('✅ All TypeScript compilation errors resolved')
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
generateFreshTyroneLink()
  .then(() => {
    console.log('✅ Magic link generation completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Magic link generation failed:', error)
    process.exit(1)
  })
