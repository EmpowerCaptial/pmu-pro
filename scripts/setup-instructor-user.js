#!/usr/bin/env node

/**
 * Setup Universal Beauty Studio Admin as Enterprise Studio Instructor
 * Creates/updates admin@universalbeautystudio.com with Studio subscription and instructor access
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function setupInstructorUser() {
  console.log('🏢 Setting up Universal Beauty Studio Admin as Enterprise Studio Instructor...')
  
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('Tyronej22!', 10)
    
    // Create or update the user with Studio subscription and instructor access
    const user = await prisma.user.upsert({
      where: { email: 'admin@universalbeautystudio.com' },
      update: {
        // Update password if needed
        password: hashedPassword,
        // Ensure Studio subscription
        selectedPlan: 'studio',
        hasActiveSubscription: true,
        subscriptionStatus: 'active',
        // Ensure license verification
        isLicenseVerified: true,
        // Ensure artist role (becomes INSTRUCTOR in supervision system)
        role: 'artist',
        // Update business info
        businessName: 'Universal Beauty Studio',
        name: 'Universal Beauty Studio Admin',
        licenseNumber: 'UBS001',
        licenseState: 'CA'
      },
      create: {
        email: 'admin@universalbeautystudio.com',
        name: 'Universal Beauty Studio Admin',
        password: hashedPassword,
        businessName: 'Universal Beauty Studio',
        licenseNumber: 'UBS001',
        licenseState: 'CA',
        role: 'artist', // This becomes INSTRUCTOR in supervision system
        selectedPlan: 'studio', // Required for Enterprise Studio features
        hasActiveSubscription: true, // Required for access
        isLicenseVerified: true, // Required for supervision features
        subscriptionStatus: 'active'
      }
    })
    
    console.log('✅ Universal Beauty Studio Admin user created/updated:')
    console.log('   📧 Email:', user.email)
    console.log('   👤 Name:', user.name)
    console.log('   🏢 Business:', user.businessName)
    console.log('   📋 Role:', user.role)
    console.log('   💳 Plan:', user.selectedPlan)
    console.log('   ✅ License Verified:', user.isLicenseVerified)
    console.log('   ✅ Active Subscription:', user.hasActiveSubscription)
    
    // Test the supervision access
    console.log('\n🔍 Testing Enterprise Studio Supervision Access...')
    
    // Import the supervision gate function
    const { checkStudioSupervisionAccess } = require('../lib/studio-supervision-gate.ts')
    
    const accessResult = checkStudioSupervisionAccess({
      id: user.id,
      email: user.email,
      role: user.role,
      selectedPlan: user.selectedPlan,
      isLicenseVerified: user.isLicenseVerified,
      hasActiveSubscription: user.hasActiveSubscription
    })
    
    console.log('   🎯 Access Result:')
    console.log('   - Can Access:', accessResult.canAccess ? '✅ YES' : '❌ NO')
    console.log('   - Is Enterprise Studio:', accessResult.isEnterpriseStudio ? '✅ YES' : '❌ NO')
    console.log('   - User Role:', accessResult.userRole)
    if (accessResult.message) {
      console.log('   - Message:', accessResult.message)
    }
    
    if (accessResult.canAccess && accessResult.userRole === 'INSTRUCTOR') {
      console.log('\n🎉 SUCCESS! User is now an Enterprise Studio Instructor!')
      console.log('   🔗 Access URL: https://thepmuguide.com/studio/supervision')
      console.log('   📧 Login: admin@universalbeautystudio.com')
      console.log('   🔑 Password: Tyronej22!')
    } else {
      console.log('\n❌ ERROR: User setup incomplete. Check the access result above.')
    }
    
  } catch (error) {
    console.error('❌ Error setting up instructor user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the setup
setupInstructorUser()
  .catch((error) => {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  })
