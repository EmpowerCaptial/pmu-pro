#!/usr/bin/env node

/**
 * Script to activate Tyronejackboy@gmail.com Enterprise Studio subscription
 * This will set up his account with full Enterprise Studio access without payment
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function activateTyroneEnterprise() {
  try {
    console.log('🔍 Looking for user: tyronejackboy@gmail.com')
    
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: 'tyronejackboy@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        businessName: true,
        selectedPlan: true,
        subscriptionStatus: true,
        hasActiveSubscription: true,
        isLicenseVerified: true,
        role: true,
        createdAt: true
      }
    })

    if (!user) {
      console.log('❌ User not found: tyronejackboy@gmail.com')
      console.log('💡 Make sure the user has registered first')
      return
    }

    console.log('✅ User found:', {
      id: user.id,
      name: user.name,
      email: user.email,
      businessName: user.businessName,
      currentPlan: user.selectedPlan,
      currentStatus: user.subscriptionStatus,
      hasActiveSubscription: user.hasActiveSubscription,
      isLicenseVerified: user.isLicenseVerified,
      role: user.role
    })

    // Update user to Enterprise Studio with full access
    const updatedUser = await prisma.user.update({
      where: { email: 'tyronejackboy@gmail.com' },
      data: {
        selectedPlan: 'studio',           // Enterprise Studio plan
        subscriptionStatus: 'active',     // Active subscription
        hasActiveSubscription: true,      // Has active subscription
        isLicenseVerified: true,          // License verified
        role: 'artist',                   // Artist role (can access supervision features)
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        businessName: true,
        selectedPlan: true,
        subscriptionStatus: true,
        hasActiveSubscription: true,
        isLicenseVerified: true,
        role: true,
        updatedAt: true
      }
    })

    console.log('🎉 Successfully activated Enterprise Studio subscription!')
    console.log('📊 Updated user data:', {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      businessName: updatedUser.businessName,
      newPlan: updatedUser.selectedPlan,
      newStatus: updatedUser.subscriptionStatus,
      hasActiveSubscription: updatedUser.hasActiveSubscription,
      isLicenseVerified: updatedUser.isLicenseVerified,
      role: updatedUser.role,
      updatedAt: updatedUser.updatedAt
    })

    console.log('🔑 Access granted:')
    console.log('  ✅ Enterprise Studio supervision features')
    console.log('  ✅ Instructor booking system')
    console.log('  ✅ Advanced client management')
    console.log('  ✅ All premium features')
    console.log('  ✅ No payment required')

    console.log('📧 Next step: Send activation email to user')

  } catch (error) {
    console.error('❌ Error activating Enterprise Studio subscription:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the activation
activateTyroneEnterprise()
  .then(() => {
    console.log('✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
