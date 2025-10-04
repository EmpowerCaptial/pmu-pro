#!/usr/bin/env node

/**
 * Simulate Tyrone Jackson's actual login attempt to debug "invalid username and password" error
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function simulateTyroneLogin() {
  try {
    console.log('🔍 SIMULATING TYRONE JACKSON LOGIN ATTEMPT...')
    console.log('==============================================')
    
    // Step 1: Get Tyrone's account details
    console.log('📊 STEP 1: GETTING TYRONE\'S ACCOUNT DETAILS')
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
        role: true,
        createdAt: true
      }
    })

    if (!user) {
      console.log('❌ USER NOT FOUND IN DATABASE')
      console.log('🚨 This would cause "invalid username and password" error')
      return
    }

    console.log('✅ User found:', user.name)
    console.log('📧 Email:', user.email)
    console.log('🎯 Plan:', user.selectedPlan)
    console.log('📊 Status:', user.subscriptionStatus)
    console.log('✅ Active Subscription:', user.hasActiveSubscription)
    console.log('✅ License Verified:', user.isLicenseVerified)
    console.log('👤 Role:', user.role)
    console.log('🔐 Password hash exists:', user.password ? 'YES' : 'NO')
    console.log('📅 Account created:', user.createdAt)
    console.log('')

    // Step 2: Test password verification
    console.log('🔐 STEP 2: TESTING PASSWORD VERIFICATION')
    const testPassword = 'Tyronej22!'
    console.log('🔑 Testing password:', testPassword)
    
    if (!user.password) {
      console.log('❌ NO PASSWORD SET - This would cause login failure')
      console.log('🚨 User needs to set up password first')
      return
    }

    // Check if it's a temp password
    const isTempPassword = await bcrypt.compare('temp-password', user.password)
    if (isTempPassword) {
      console.log('⚠️ TEMP PASSWORD DETECTED')
      console.log('🚨 User needs to set up their password first')
      console.log('💡 This would return "Please set up your password first" error')
      return
    }

    // Test the actual password
    const isValidPassword = await bcrypt.compare(testPassword, user.password)
    console.log('🔍 Password verification result:', isValidPassword ? '✅ VALID' : '❌ INVALID')
    
    if (!isValidPassword) {
      console.log('❌ PASSWORD MISMATCH - This would cause "invalid username and password" error')
      console.log('🚨 The password Tyronej22! does not match the stored hash')
      
      // Let's see what passwords might work
      console.log('')
      console.log('🔍 TESTING COMMON PASSWORDS:')
      const commonPasswords = [
        'Tyronej22',
        'Tyrone22!',
        'Tyronej22@',
        'Tyronej22#',
        'tyronej22!',
        'TYRONEJ22!',
        'Tyronej22',
        'Tyrone22',
        'password',
        'temp-password'
      ]
      
      for (const password of commonPasswords) {
        const matches = await bcrypt.compare(password, user.password)
        if (matches) {
          console.log(`✅ FOUND MATCHING PASSWORD: "${password}"`)
          break
        } else {
          console.log(`❌ "${password}" - no match`)
        }
      }
      return
    }

    console.log('✅ Password verification successful!')
    console.log('')

    // Step 3: Simulate the login API call
    console.log('🌐 STEP 3: SIMULATING LOGIN API CALL')
    console.log('Testing /api/auth/login endpoint logic...')
    
    console.log('1. Email provided: ✅')
    console.log('2. Password provided: ✅')
    console.log('3. User found in database: ✅')
    console.log('4. Not temp password: ✅')
    console.log('5. Password matches: ✅')
    console.log('')
    
    // Simulate the response data that would be returned
    const { password: _, ...userWithoutPassword } = user
    const loginResponse = {
      success: true,
      user: {
        id: userWithoutPassword.id,
        name: userWithoutPassword.name,
        email: userWithoutPassword.email,
        businessName: userWithoutPassword.businessName,
        licenseNumber: userWithoutPassword.licenseNumber,
        licenseState: userWithoutPassword.licenseState,
        selectedPlan: userWithoutPassword.selectedPlan,
        hasActiveSubscription: userWithoutPassword.hasActiveSubscription,
        subscriptionStatus: userWithoutPassword.subscriptionStatus,
        isLicenseVerified: userWithoutPassword.isLicenseVerified,
        role: userWithoutPassword.role,
        createdAt: userWithoutPassword.createdAt,
        studios: [{
          id: 'default-studio',
          name: userWithoutPassword.businessName || userWithoutPassword.name || 'Default Studio',
          slug: 'default-studio',
          role: 'owner',
          status: 'active'
        }]
      }
    }
    
    console.log('✅ LOGIN API RESPONSE WOULD BE:')
    console.log('Status: 200 OK')
    console.log('Success: true')
    console.log('User data: Complete with Enterprise Studio access')
    console.log('')
    
    // Step 4: Check what might be causing frontend issues
    console.log('🔍 STEP 4: FRONTEND LOGIN ISSUES CHECK')
    console.log('If backend is working but frontend shows "invalid username and password":')
    console.log('')
    console.log('1. 🔍 Check browser console for JavaScript errors')
    console.log('2. 🔍 Check network tab for API call failures')
    console.log('3. 🔍 Check if API endpoint is being called correctly')
    console.log('4. 🔍 Check for CORS issues')
    console.log('5. 🔍 Check for rate limiting or blocking')
    console.log('6. 🔍 Try incognito/private browsing mode')
    console.log('7. 🔍 Clear browser cache and cookies')
    console.log('')
    
    console.log('🎯 CONCLUSION:')
    if (isValidPassword) {
      console.log('✅ Backend login should work fine')
      console.log('❓ Issue is likely on the frontend or network level')
      console.log('💡 Tyrone should try:')
      console.log('   - Incognito/private browsing')
      console.log('   - Different browser')
      console.log('   - Clear cache and cookies')
      console.log('   - Check for typos in email/password')
    } else {
      console.log('❌ Backend password verification fails')
      console.log('🚨 Tyrone needs to reset his password')
    }

  } catch (error) {
    console.error('❌ Error during login simulation:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the simulation
simulateTyroneLogin()
  .then(() => {
    console.log('✅ Login simulation completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Login simulation failed:', error)
    process.exit(1)
  })
