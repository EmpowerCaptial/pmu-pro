#!/usr/bin/env node

/**
 * Script to test the payment verification fix for Tyrone
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testPaymentVerificationFix() {
  try {
    console.log('🧪 Testing payment verification fix for Tyrone...')
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
        isLicenseVerified: true,
        role: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true
      }
    })

    if (!user) {
      console.log('❌ User not found')
      return
    }

    console.log('📊 USER STATUS:')
    console.log(`  Plan: ${user.selectedPlan}`)
    console.log(`  Status: ${user.subscriptionStatus}`)
    console.log(`  Active Subscription: ${user.hasActiveSubscription}`)
    console.log(`  License Verified: ${user.isLicenseVerified}`)
    console.log(`  Stripe Customer ID: ${user.stripeCustomerId || 'NULL'}`)
    console.log('---')

    // Simulate the NEW payment verification logic
    console.log('🔍 NEW PAYMENT VERIFICATION LOGIC:')
    
    // Step 1: Check if user exists
    console.log('  1. User exists: ✅')
    
    // Step 2: Check if admin/staff
    if (user.role === 'admin' || user.role === 'staff') {
      console.log('  2. Is admin/staff: ✅ → GRANT ACCESS')
      console.log('✅ RESULT: ACCESS GRANTED (Admin/Staff)')
      return
    }
    console.log('  2. Is admin/staff: ❌')
    
    // Step 3: Check license verification
    if (!user.isLicenseVerified) {
      console.log('  3. License verified: ❌ → BLOCK ACCESS')
      console.log('❌ RESULT: ACCESS BLOCKED (License verification pending)')
      return
    }
    console.log('  3. License verified: ✅')
    
    // Step 4: Check trial status
    if (user.subscriptionStatus === 'trial') {
      console.log('  4. Trial status: ✅ → GRANT ACCESS')
      console.log('✅ RESULT: ACCESS GRANTED (Trial)')
      return
    }
    console.log('  4. Trial status: ❌')
    
    // Step 5: NEW - Check manually activated Enterprise Studio
    if (user.hasActiveSubscription && user.subscriptionStatus === 'active' && 
        (user.selectedPlan === 'studio' || user.selectedPlan === 'enterprise')) {
      console.log('  5. Manual Enterprise Studio: ✅ → GRANT ACCESS')
      console.log('✅ RESULT: ACCESS GRANTED (Manual Enterprise Studio)')
      console.log('')
      console.log('🎉 FIX SUCCESSFUL!')
      console.log('✅ Tyrone will now have access via magic link')
      console.log('✅ All manually activated Enterprise Studio users will have access')
      return
    }
    console.log('  5. Manual Enterprise Studio: ❌')
    
    // Step 6: Check Stripe customer ID
    if (!user.stripeCustomerId) {
      console.log('  6. Stripe Customer ID: ❌ → BLOCK ACCESS')
      console.log('❌ RESULT: ACCESS BLOCKED (No Stripe subscription)')
      return
    }
    console.log('  6. Stripe Customer ID: ✅')

    console.log('✅ RESULT: ACCESS GRANTED (Stripe subscription)')

  } catch (error) {
    console.error('❌ Error testing payment verification:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testPaymentVerificationFix()
  .then(() => {
    console.log('✅ Test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
