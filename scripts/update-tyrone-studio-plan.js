#!/usr/bin/env node

/**
 * Script to update Tyron Jackson's user to have Studio plan access
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updateTyroneStudioPlan() {
  try {
    console.log('🔄 Updating Tyron Jackson to Studio plan...')
    
    const email = 'tyronejackboy@gmail.com'
    
    // Update the user
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        selectedPlan: 'studio',
        hasActiveSubscription: true,
        subscriptionStatus: 'active'
      },
      select: {
        id: true,
        name: true,
        email: true,
        selectedPlan: true,
        hasActiveSubscription: true,
        subscriptionStatus: true,
        role: true
      }
    })
    
    console.log('✅ Successfully updated user:')
    console.log('   Name:', updatedUser.name)
    console.log('   Email:', updatedUser.email)
    console.log('   Plan:', updatedUser.selectedPlan)
    console.log('   Active Subscription:', updatedUser.hasActiveSubscription)
    console.log('   Subscription Status:', updatedUser.subscriptionStatus)
    console.log('   Role:', updatedUser.role)
    console.log('')
    console.log('🎉 Tyron Jackson now has Studio plan access!')
    console.log('   This provides access to ALL features (25 total):')
    console.log('   - 7 Basic features')
    console.log('   - 10 Premium features')
    console.log('   - 8 Enterprise Studio features')
    
  } catch (error) {
    console.error('❌ Error updating user:', error)
    
    if (error.code === 'P2025') {
      console.error('   User not found with email: tyronejackboy@gmail.com')
    }
  } finally {
    await prisma.$disconnect()
  }
}

updateTyroneStudioPlan()
