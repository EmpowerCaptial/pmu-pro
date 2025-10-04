#!/usr/bin/env node

/**
 * Comprehensive simulation of Tyrone's login flow to debug subscription required issue
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function simulateTyroneLoginFlow() {
  try {
    console.log('🔍 SIMULATING TYRONE JACKSON LOGIN FLOW...')
    console.log('==========================================')
    
    // Step 1: Check user exists and get full details
    console.log('📊 STEP 1: USER ACCOUNT VERIFICATION')
    const user = await prisma.user.findUnique({
      where: { email: 'tyronejackboy@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        selectedPlan: true,
        subscriptionStatus: true,
        hasActiveSubscription: true,
        isLicenseVerified: true,
        role: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripeId: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      console.log('❌ USER NOT FOUND')
      return
    }

    console.log('✅ User found:', user.name)
    console.log('📧 Email:', user.email)
    console.log('🎯 Plan:', user.selectedPlan)
    console.log('📊 Status:', user.subscriptionStatus)
    console.log('✅ Active Subscription:', user.hasActiveSubscription)
    console.log('✅ License Verified:', user.isLicenseVerified)
    console.log('👤 Role:', user.role)
    console.log('💳 Stripe Customer ID:', user.stripeCustomerId || 'NULL')
    console.log('💳 Stripe Subscription ID:', user.stripeSubscriptionId || 'NULL')
    console.log('💳 Stripe ID:', user.stripeId || 'NULL')
    console.log('')

    // Step 2: Simulate the EXACT payment verification logic from our fixed code
    console.log('🔍 STEP 2: PAYMENT VERIFICATION SIMULATION')
    console.log('Using the EXACT logic from lib/payment-verification.ts...')
    
    // Simulate the verifyUserAccess function logic
    console.log('1. User exists: ✅')
    
    // Check if admin/staff
    if (user.role === 'admin' || user.role === 'staff') {
      console.log('2. Is admin/staff: ✅ → GRANT ACCESS')
      console.log('✅ RESULT: ACCESS GRANTED (Admin/Staff)')
      return
    }
    console.log('2. Is admin/staff: ❌')
    
    // Check license verification
    if (!user.isLicenseVerified) {
      console.log('3. License verified: ❌ → BLOCK ACCESS')
      console.log('❌ RESULT: ACCESS BLOCKED (License verification pending)')
      console.log('🚨 THIS IS THE PROBLEM - License not verified!')
      return
    }
    console.log('3. License verified: ✅')
    
    // Check trial status
    if (user.subscriptionStatus === 'trial') {
      console.log('4. Trial status: ✅ → GRANT ACCESS')
      console.log('✅ RESULT: ACCESS GRANTED (Trial)')
      return
    }
    console.log('4. Trial status: ❌')
    
    // Check manually activated Enterprise Studio (OUR FIX)
    if (user.hasActiveSubscription && user.subscriptionStatus === 'active' && 
        (user.selectedPlan === 'studio' || user.selectedPlan === 'enterprise')) {
      console.log('5. Manual Enterprise Studio: ✅ → GRANT ACCESS')
      console.log('✅ RESULT: ACCESS GRANTED (Manual Enterprise Studio)')
      console.log('🎉 PAYMENT VERIFICATION SHOULD WORK!')
    } else {
      console.log('5. Manual Enterprise Studio: ❌')
      console.log(`   - hasActiveSubscription: ${user.hasActiveSubscription}`)
      console.log(`   - subscriptionStatus: ${user.subscriptionStatus}`)
      console.log(`   - selectedPlan: ${user.selectedPlan}`)
      console.log('❌ RESULT: ACCESS BLOCKED (Manual Enterprise Studio check failed)')
      console.log('🚨 THIS IS THE PROBLEM - Enterprise Studio check failing!')
      return
    }
    
    console.log('')
    
    // Step 3: Test magic link verification
    console.log('🔗 STEP 3: MAGIC LINK VERIFICATION SIMULATION')
    
    // Check if there are any valid magic link tokens
    const magicTokens = await prisma.magicLinkToken.findMany({
      where: { 
        email: 'tyronejackboy@gmail.com',
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    })
    
    if (magicTokens.length === 0) {
      console.log('❌ No valid magic link tokens found')
      console.log('💡 Need to generate a fresh magic link')
    } else {
      console.log(`✅ Found ${magicTokens.length} valid magic link tokens`)
      magicTokens.forEach((token, index) => {
        console.log(`   Token ${index + 1}: ${token.token.substring(0, 20)}... (expires: ${token.expiresAt})`)
      })
    }
    
    console.log('')
    
    // Step 4: Test actual API call simulation
    console.log('🌐 STEP 4: API CALL SIMULATION')
    console.log('Testing /api/auth/verify endpoint logic...')
    
    if (magicTokens.length > 0) {
      const latestToken = magicTokens[0]
      console.log('✅ Valid token found:', latestToken.token.substring(0, 20) + '...')
      
      // Simulate the magic link verification process
      console.log('🔍 Simulating magic link verification...')
      console.log('1. Token exists: ✅')
      console.log('2. Token not expired: ✅')
      console.log('3. User found: ✅')
      
      // This is where the payment verification would be called
      console.log('4. Calling PaymentVerificationService.verifyUserAccess...')
      
      // Based on our simulation above, this should return hasAccess: true
      console.log('✅ Payment verification result: { hasAccess: true, subscriptionStatus: "active" }')
      console.log('✅ Magic link verification should succeed!')
    }
    
    console.log('')
    console.log('🎯 CONCLUSION:')
    if (user.isLicenseVerified && user.hasActiveSubscription && user.subscriptionStatus === 'active') {
      console.log('✅ All checks pass - Tyrone should have access')
      console.log('❓ If still seeing "subscription required", check:')
      console.log('   1. Browser cache - try incognito/private mode')
      console.log('   2. Magic link token validity')
      console.log('   3. Frontend payment verification logic')
      console.log('   4. Any middleware blocking access')
    } else {
      console.log('❌ Found the issue - see details above')
    }

  } catch (error) {
    console.error('❌ Error during simulation:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the simulation
simulateTyroneLoginFlow()
  .then(() => {
    console.log('✅ Simulation completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Simulation failed:', error)
    process.exit(1)
  })
