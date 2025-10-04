#!/usr/bin/env node

/**
 * Script to check Tyrone's Stripe status and payment verification
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkTyroneStripeStatus() {
  try {
    console.log('🔍 Checking Tyrone\'s Stripe status and payment verification...')
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
        stripeSubscriptionId: true,
        stripeId: true
      }
    })

    if (!user) {
      console.log('❌ User not found')
      return
    }

    console.log('📊 USER ACCOUNT STATUS:')
    console.log(`  Name: ${user.name}`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Plan: ${user.selectedPlan}`)
    console.log(`  Status: ${user.subscriptionStatus}`)
    console.log(`  Active Subscription: ${user.hasActiveSubscription}`)
    console.log(`  License Verified: ${user.isLicenseVerified}`)
    console.log(`  Role: ${user.role}`)
    console.log('---')

    console.log('💳 STRIPE STATUS:')
    console.log(`  Stripe Customer ID: ${user.stripeCustomerId || 'NULL'}`)
    console.log(`  Stripe Subscription ID: ${user.stripeSubscriptionId || 'NULL'}`)
    console.log(`  Stripe ID: ${user.stripeId || 'NULL'}`)
    console.log('---')

    // Simulate the payment verification logic
    console.log('🔍 PAYMENT VERIFICATION LOGIC:')
    console.log('  1. User exists: ✅')
    console.log(`  2. Is admin/staff: ${user.role === 'admin' || user.role === 'staff' ? '✅' : '❌'}`)
    console.log(`  3. License verified: ${user.isLicenseVerified ? '✅' : '❌'}`)
    console.log(`  4. Trial status: ${user.subscriptionStatus === 'trial' ? '✅' : '❌'}`)
    console.log(`  5. Stripe Customer ID: ${user.stripeCustomerId ? '✅' : '❌'}`)
    console.log(`  6. Stripe Subscription ID: ${user.stripeSubscriptionId ? '✅' : '❌'}`)
    console.log('---')

    console.log('🚨 ISSUE IDENTIFIED:')
    if (!user.stripeCustomerId) {
      console.log('❌ PROBLEM: No Stripe Customer ID')
      console.log('💡 The payment verification system requires a Stripe Customer ID')
      console.log('💡 Tyrone\'s Enterprise Studio subscription was activated manually')
      console.log('💡 But the payment verification system is still checking Stripe')
      console.log('')
      console.log('🔧 SOLUTION: Update payment verification to allow manual Enterprise Studio subscriptions')
    }

    if (!user.stripeSubscriptionId) {
      console.log('❌ PROBLEM: No Stripe Subscription ID')
      console.log('💡 The payment verification system requires a Stripe Subscription ID')
      console.log('💡 This blocks access even for manually activated Enterprise Studio users')
    }

  } catch (error) {
    console.error('❌ Error checking Stripe status:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the check
checkTyroneStripeStatus()
  .then(() => {
    console.log('✅ Check completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Check failed:', error)
    process.exit(1)
  })
