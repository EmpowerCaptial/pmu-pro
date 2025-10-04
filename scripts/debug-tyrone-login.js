#!/usr/bin/env node

/**
 * Script to debug Tyrone Jackson's login issues
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugTyroneLogin() {
  try {
    console.log('🔍 Debugging Tyrone Jackson login issues...')
    console.log('📧 Email: Tyronejackboy@gmail.com')
    console.log('🔑 Password: Tyronej22!')
    console.log('---')
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: 'tyronejackboy@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        businessName: true,
        selectedPlan: true,
        subscriptionStatus: true,
        hasActiveSubscription: true,
        isLicenseVerified: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      console.log('❌ USER NOT FOUND')
      console.log('💡 The email "tyronejackboy@gmail.com" does not exist in the database')
      console.log('💡 Possible issues:')
      console.log('  - Email case sensitivity')
      console.log('  - User may have registered with different email')
      console.log('  - Account may have been deleted')
      return
    }

    console.log('✅ USER FOUND:')
    console.log('  ID:', user.id)
    console.log('  Name:', user.name)
    console.log('  Email:', user.email)
    console.log('  Business:', user.businessName)
    console.log('  Plan:', user.selectedPlan)
    console.log('  Status:', user.subscriptionStatus)
    console.log('  Active Subscription:', user.hasActiveSubscription)
    console.log('  License Verified:', user.isLicenseVerified)
    console.log('  Role:', user.role)
    console.log('  Created:', user.createdAt.toISOString())
    console.log('  Updated:', user.updatedAt.toISOString())
    console.log('---')

    // Check password
    console.log('🔐 PASSWORD CHECK:')
    console.log('  Password hash exists:', user.password ? 'YES' : 'NO')
    console.log('  Password hash length:', user.password ? user.password.length : 0)
    console.log('  Password starts with $2b$ (bcrypt):', user.password ? user.password.startsWith('$2b$') : false)
    console.log('---')

    // Test password verification
    if (user.password) {
      try {
        const bcrypt = require('bcryptjs')
        const isPasswordValid = await bcrypt.compare('Tyronej22!', user.password)
        console.log('🔑 PASSWORD VERIFICATION:')
        console.log('  Provided password: "Tyronej22!"')
        console.log('  Password matches:', isPasswordValid ? 'YES' : 'NO')
        
        if (!isPasswordValid) {
          console.log('❌ PASSWORD MISMATCH')
          console.log('💡 Possible issues:')
          console.log('  - Password may have been changed')
          console.log('  - Case sensitivity in password')
          console.log('  - Special characters not matching')
          console.log('  - Password may need to be reset')
        }
      } catch (bcryptError) {
        console.log('❌ BCRYPT ERROR:', bcryptError.message)
      }
    }

    // Check for magic link tokens
    const magicTokens = await prisma.magicLinkToken.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    console.log('📧 MAGIC LINK TOKENS:')
    console.log('  Recent tokens:', magicTokens.length)
    magicTokens.forEach((token, index) => {
      console.log(`  ${index + 1}. Created: ${token.createdAt.toISOString()}`)
      console.log(`     Expires: ${token.expiresAt.toISOString()}`)
      console.log(`     Used: ${token.used}`)
      console.log(`     Expired: ${new Date() > token.expiresAt ? 'YES' : 'NO'}`)
    })
    console.log('---')

    // Recommendations
    console.log('💡 RECOMMENDATIONS:')
    if (!user.password) {
      console.log('  1. User has no password - needs to set one')
    } else if (user.password && !user.password.startsWith('$2b$')) {
      console.log('  1. Password format is incorrect - needs to be rehashed')
    } else {
      console.log('  1. Try password reset to generate new password')
      console.log('  2. Check if magic link login works')
      console.log('  3. Verify email case sensitivity')
    }
    
    console.log('  4. Ensure user is using exact email: tyronejackboy@gmail.com')
    console.log('  5. Check for typos in password')

  } catch (error) {
    console.error('❌ Error debugging login:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the debug
debugTyroneLogin()
  .then(() => {
    console.log('✅ Debug completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Debug failed:', error)
    process.exit(1)
  })
