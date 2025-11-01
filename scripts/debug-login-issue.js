#!/usr/bin/env node

/**
 * Debug login issue for Universal Beauty Studio Admin
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function debugLoginIssue() {
  console.log('🔍 Debugging login issue for admin@universalbeautystudio.com...')
  
  const prisma = new PrismaClient()
  
  try {
    // 1. Check if user exists
    console.log('\n1️⃣ Checking if user exists...')
    const user = await prisma.user.findUnique({
      where: { email: 'admin@universalbeautystudio.com' }
    })
    
    if (!user) {
      console.log('❌ User not found in database!')
      
      // List all users to see what's in the database
      console.log('\n📋 All users in database:')
      const allUsers = await prisma.user.findMany({
        select: { email: true, name: true, role: true }
      })
      allUsers.forEach(u => console.log(`   - ${u.email} (${u.name}) [${u.role}]`))
      
      return
    }
    
    console.log('✅ User found!')
    console.log('   📧 Email:', user.email)
    console.log('   👤 Name:', user.name)
    console.log('   🔑 Password Hash:', user.password.substring(0, 20) + '...')
    
    // 2. Test password verification
    console.log('\n2️⃣ Testing password verification...')
    const passwordTest = await bcrypt.compare('Tyronej22!', user.password)
    console.log('   🔐 Password Verification:', passwordTest ? '✅ CORRECT' : '❌ INCORRECT')
    
    if (!passwordTest) {
      console.log('\n🔧 Password is incorrect. Let me fix it...')
      
      // Re-hash the password
      const newHashedPassword = await bcrypt.hash('Tyronej22!', 10)
      
      // Update the user
      await prisma.user.update({
        where: { email: 'admin@universalbeautystudio.com' },
        data: { password: newHashedPassword }
      })
      
      console.log('✅ Password updated!')
      
      // Test again
      const newPasswordTest = await bcrypt.compare('Tyronej22!', newHashedPassword)
      console.log('   🔐 New Password Verification:', newPasswordTest ? '✅ CORRECT' : '❌ INCORRECT')
    }
    
    // 3. Check all user fields
    console.log('\n3️⃣ User details:')
    console.log('   📧 Email:', user.email)
    console.log('   👤 Name:', user.name)
    console.log('   🏢 Business:', user.businessName)
    console.log('   📋 Role:', user.role)
    console.log('   💳 Plan:', user.selectedPlan)
    console.log('   ✅ License Verified:', user.isLicenseVerified)
    console.log('   ✅ Active Subscription:', user.hasActiveSubscription)
    console.log('   📅 Created:', user.createdAt)
    console.log('   🔄 Updated:', user.updatedAt)
    
    // 4. Test the exact login flow
    console.log('\n4️⃣ Testing exact login flow...')
    
    // Simulate the login API logic
    const testEmail = 'admin@universalbeautystudio.com'
    const testPassword = 'Tyronej22!'
    
    // Find user by email (like the API does)
    const apiUser = await prisma.user.findUnique({
      where: { email: testEmail }
    })
    
    if (!apiUser) {
      console.log('❌ API would return: User not found')
      return
    }
    
    console.log('✅ API would find user')
    
    // Check for temp password
    const isTempPassword = await bcrypt.compare('temp-password', apiUser.password)
    if (isTempPassword) {
      console.log('❌ API would return: Please set up your password first')
      return
    }
    
    console.log('✅ Not a temp password')
    
    // Verify password
    const isValidPassword = await bcrypt.compare(testPassword, apiUser.password)
    if (!isValidPassword) {
      console.log('❌ API would return: Invalid email or password')
      return
    }
    
    console.log('✅ Password verification successful!')
    console.log('✅ API would return: Login successful')
    
    // 5. Check database connection
    console.log('\n5️⃣ Database connection info:')
    console.log('   🔗 Database URL:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'Not set')
    console.log('   🌍 Environment:', process.env.NODE_ENV || 'Not set')
    
  } catch (error) {
    console.error('❌ Error during debug:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugLoginIssue()











