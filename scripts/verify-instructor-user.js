#!/usr/bin/env node

/**
 * Verify Universal Beauty Studio Admin user setup
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function verifyInstructorUser() {
  console.log('🔍 Verifying Universal Beauty Studio Admin user...')
  
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: 'admin@universalbeautystudio.com' }
    })
    
    if (!user) {
      console.log('❌ User not found in database!')
      return
    }
    
    console.log('✅ User found in database:')
    console.log('   📧 Email:', user.email)
    console.log('   👤 Name:', user.name)
    console.log('   🏢 Business:', user.businessName)
    console.log('   📋 Role:', user.role)
    console.log('   💳 Plan:', user.selectedPlan)
    console.log('   ✅ License Verified:', user.isLicenseVerified)
    console.log('   ✅ Active Subscription:', user.hasActiveSubscription)
    console.log('   🔑 Password Hash:', user.password.substring(0, 20) + '...')
    
    // Test password verification
    const passwordTest = await bcrypt.compare('Tyronej22!', user.password)
    console.log('   🔐 Password Verification:', passwordTest ? '✅ CORRECT' : '❌ INCORRECT')
    
    if (!passwordTest) {
      console.log('\n🔧 Fixing password...')
      const newHashedPassword = await bcrypt.hash('Tyronej22!', 10)
      
      await prisma.user.update({
        where: { email: 'admin@universalbeautystudio.com' },
        data: { password: newHashedPassword }
      })
      
      console.log('✅ Password updated!')
      
      // Test again
      const newPasswordTest = await bcrypt.compare('Tyronej22!', newHashedPassword)
      console.log('   🔐 New Password Verification:', newPasswordTest ? '✅ CORRECT' : '❌ INCORRECT')
    }
    
  } catch (error) {
    console.error('❌ Error verifying user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyInstructorUser()






