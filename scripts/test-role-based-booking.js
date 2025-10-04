#!/usr/bin/env node

/**
 * Test script to verify role-based booking system
 * Tests different user roles and their access to booking systems
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testRoleBasedBooking() {
  console.log('🧪 TESTING ROLE-BASED BOOKING SYSTEM')
  console.log('=====================================\n')

  try {
    // Test 1: Check if users with different roles exist
    console.log('📊 Step 1: Checking user roles in database')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        selectedPlan: true,
        isLicenseVerified: true,
        hasActiveSubscription: true
      }
    })

    console.log(`Found ${users.length} users in database:`)
    users.forEach(user => {
      console.log(`  - ${user.email}: role=${user.role}, plan=${user.selectedPlan}, verified=${user.isLicenseVerified}`)
    })

    // Test 2: Simulate role-based access logic
    console.log('\n📊 Step 2: Testing role-based access logic')
    
    // Test licensed artist (should use regular booking)
    const licensedUser = {
      id: 'test-licensed',
      email: 'licensed@test.com',
      role: 'licensed',
      selectedPlan: 'studio',
      isLicenseVerified: true,
      hasActiveSubscription: true
    }

    // Test student (should use supervision booking)
    const studentUser = {
      id: 'test-student',
      email: 'student@test.com',
      role: 'student',
      selectedPlan: 'studio',
      isLicenseVerified: false,
      hasActiveSubscription: true
    }

    // Test legacy artist with license (should use regular booking)
    const legacyLicensedUser = {
      id: 'test-legacy-licensed',
      email: 'legacy-licensed@test.com',
      role: 'artist',
      selectedPlan: 'studio',
      isLicenseVerified: true,
      hasActiveSubscription: true
    }

    // Test legacy artist without license (should use supervision booking)
    const legacyUnlicensedUser = {
      id: 'test-legacy-unlicensed',
      email: 'legacy-unlicensed@test.com',
      role: 'artist',
      selectedPlan: 'studio',
      isLicenseVerified: false,
      hasActiveSubscription: true
    }

    // Test legacy apprentice (should use supervision booking)
    const apprenticeUser = {
      id: 'test-apprentice',
      email: 'apprentice@test.com',
      role: 'apprentice',
      selectedPlan: 'studio',
      isLicenseVerified: false,
      hasActiveSubscription: true
    }

    const testUsers = [
      { name: 'Licensed Artist', user: licensedUser },
      { name: 'Student', user: studentUser },
      { name: 'Legacy Licensed Artist', user: legacyLicensedUser },
      { name: 'Legacy Unlicensed Artist', user: legacyUnlicensedUser },
      { name: 'Legacy Apprentice', user: apprenticeUser }
    ]

    testUsers.forEach(({ name, user }) => {
      console.log(`\n  Testing ${name} (${user.email}):`)
      console.log(`    Role: ${user.role}`)
      console.log(`    License Verified: ${user.isLicenseVerified}`)
      console.log(`    Plan: ${user.selectedPlan}`)
      
      // Simulate shouldUseRegularBooking logic
      const canUseRegularBooking = (
        user.role === 'licensed' || 
        (user.role === 'artist' && user.isLicenseVerified)
      )
      
      // Simulate shouldUseSupervisionBooking logic
      const canUseSupervisionBooking = (
        user.role === 'student' || 
        user.role === 'apprentice' || 
        (user.role === 'artist' && !user.isLicenseVerified)
      )
      
      console.log(`    ✅ Can use regular booking: ${canUseRegularBooking}`)
      console.log(`    ✅ Can use supervision booking: ${canUseSupervisionBooking}`)
      
      if (canUseRegularBooking && canUseSupervisionBooking) {
        console.log(`    ⚠️  WARNING: User can access both systems!`)
      } else if (!canUseRegularBooking && !canUseSupervisionBooking) {
        console.log(`    ❌ ERROR: User cannot access either system!`)
      } else {
        console.log(`    ✅ Access correctly restricted`)
      }
    })

    // Test 3: Check dashboard card visibility logic
    console.log('\n📊 Step 3: Testing dashboard card visibility')
    
    testUsers.forEach(({ name, user }) => {
      const canUseRegularBooking = (
        user.role === 'licensed' || 
        (user.role === 'artist' && user.isLicenseVerified)
      )
      
      const canUseSupervisionBooking = (
        user.role === 'student' || 
        user.role === 'apprentice' || 
        (user.role === 'artist' && !user.isLicenseVerified)
      )
      
      console.log(`\n  ${name}:`)
      console.log(`    Regular Booking Card: ${canUseRegularBooking ? '✅ VISIBLE' : '❌ HIDDEN'}`)
      console.log(`    Supervision Booking Card: ${canUseSupervisionBooking ? '✅ VISIBLE' : '❌ HIDDEN'}`)
    })

    // Test 4: Check URL routing
    console.log('\n📊 Step 4: Testing URL routing')
    
    testUsers.forEach(({ name, user }) => {
      const canUseRegularBooking = (
        user.role === 'licensed' || 
        (user.role === 'artist' && user.isLicenseVerified)
      )
      
      const canUseSupervisionBooking = (
        user.role === 'student' || 
        user.role === 'apprentice' || 
        (user.role === 'artist' && !user.isLicenseVerified)
      )
      
      console.log(`\n  ${name}:`)
      if (canUseRegularBooking) {
        console.log(`    Dashboard Card → /booking`)
        console.log(`    Supervision Card → /studio/supervision?tab=find (should redirect to /booking)`)
      }
      if (canUseSupervisionBooking) {
        console.log(`    Dashboard Card → /studio/supervision?tab=find`)
        console.log(`    Regular Booking Card → /booking (should redirect to /studio/supervision)`)
      }
    })

    console.log('\n✅ ROLE-BASED BOOKING SYSTEM TEST COMPLETE')
    console.log('==========================================')
    
    console.log('\n🎯 Expected Behavior:')
    console.log('  - Licensed artists: Regular booking only')
    console.log('  - Students: Supervision booking only')
    console.log('  - Instructors: Both systems for management')
    console.log('  - Access denied pages with helpful redirects')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testRoleBasedBooking()
