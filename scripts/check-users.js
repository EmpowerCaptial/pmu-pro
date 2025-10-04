#!/usr/bin/env node

/**
 * Script to check existing users in the database
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('🔍 Checking all users in database...')
    
    const users = await prisma.user.findMany({
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
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`📊 Found ${users.length} users:`)
    console.log('---')

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`)
      console.log(`   Business: ${user.businessName}`)
      console.log(`   Plan: ${user.selectedPlan}`)
      console.log(`   Status: ${user.subscriptionStatus}`)
      console.log(`   Active: ${user.hasActiveSubscription}`)
      console.log(`   License Verified: ${user.isLicenseVerified}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Created: ${user.createdAt.toISOString().split('T')[0]}`)
      console.log('---')
    })

    // Check for similar emails
    const tyroneVariations = ['tyrone', 'jackboy', 'jack', 'tyronejack']
    const similarUsers = users.filter(user => 
      tyroneVariations.some(variation => 
        user.email.toLowerCase().includes(variation) || 
        user.name.toLowerCase().includes(variation)
      )
    )

    if (similarUsers.length > 0) {
      console.log('🔍 Found potentially similar users:')
      similarUsers.forEach(user => {
        console.log(`  - ${user.name} (${user.email})`)
      })
    } else {
      console.log('🔍 No similar users found')
    }

  } catch (error) {
    console.error('❌ Error checking users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the check
checkUsers()
  .then(() => {
    console.log('✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
