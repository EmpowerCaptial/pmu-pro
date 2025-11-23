#!/usr/bin/env node

/**
 * Simulate Piresa Willis login - tests the complete login flow
 * This simulates exactly what happens when Piresa logs in through the website
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function simulateLogin() {
  try {
    console.log('🔐 SIMULATING PIRESA WILLIS LOGIN')
    console.log('==================================\n')

    const email = 'piresa@universalbeautystudio.com'
    const password = 'piresa2024'

    console.log('📧 Email:', email)
    console.log('🔑 Password:', password)
    console.log('')

    // Step 1: Simulate frontend normalization (what the form does)
    console.log('📊 Step 1: Frontend form submission...')
    const normalizedEmail = email.trim().toLowerCase()
    console.log(`   Normalized email: "${normalizedEmail}"`)
    console.log('')

    // Step 2: Simulate API endpoint (what /api/auth/login does)
    console.log('📊 Step 2: API endpoint processing...')
    console.log('   POST /api/auth/login')
    console.log('   Body:', JSON.stringify({ email: normalizedEmail, password: '***' }))
    console.log('')

    // Step 3: Database lookup (exactly as API does)
    console.log('📊 Step 3: Database lookup...')
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        businessName: true,
        studioName: true,
        licenseNumber: true,
        licenseState: true,
        selectedPlan: true,
        hasActiveSubscription: true,
        subscriptionStatus: true,
        isLicenseVerified: true,
        role: true,
        createdAt: true,
      }
    })

    if (!user) {
      console.log('❌ USER NOT FOUND')
      console.log('   This would return: { error: "Invalid email or password" }')
      console.log('   Status: 401')
      await prisma.$disconnect()
      process.exit(1)
    }

    console.log('✅ User found!')
    console.log(`   ID: ${user.id}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Role: ${user.role}`)
    console.log('')

    // Step 4: Check for temp password
    console.log('📊 Step 4: Checking for temp password...')
    const isTempPassword = await bcrypt.compare('temp-password', user.password)
    if (isTempPassword) {
      console.log('⚠️  TEMP PASSWORD DETECTED')
      console.log('   This would return: { error: "Please set up your password first", needsPasswordSetup: true }')
      console.log('   Status: 400')
      await prisma.$disconnect()
      process.exit(1)
    }
    console.log('✅ Not a temp password')
    console.log('')

    // Step 5: Verify password
    console.log('📊 Step 5: Verifying password...')
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      console.log('❌ PASSWORD INVALID')
      console.log('   This would return: { error: "Invalid email or password" }')
      console.log('   Status: 401')
      console.log('')
      console.log('💡 RECOMMENDATION: Reset password')
      console.log('   Run: node scripts/reset-piresa-password.js')
      await prisma.$disconnect()
      process.exit(1)
    }

    console.log('✅ Password valid!')
    console.log('')

    // Step 6: Simulate successful login response
    console.log('📊 Step 6: Successful login response...')
    const { password: _, ...userWithoutPassword } = user
    const loginResponse = {
      success: true,
      user: {
        id: userWithoutPassword.id,
        name: userWithoutPassword.name,
        email: userWithoutPassword.email,
        businessName: userWithoutPassword.businessName,
        studioName: userWithoutPassword.studioName,
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

    console.log('✅ LOGIN SUCCESSFUL!')
    console.log('   Status: 200')
    console.log('   Response:', JSON.stringify(loginResponse, null, 2))
    console.log('')

    // Step 7: Simulate frontend behavior
    console.log('📊 Step 7: Frontend behavior simulation...')
    console.log('   ✅ User data saved to localStorage')
    console.log('   ✅ Redirecting to /dashboard')
    console.log('   ✅ User session established')
    console.log('')

    // Step 8: Summary
    console.log('🎉 LOGIN SIMULATION COMPLETE')
    console.log('============================')
    console.log('✅ All steps passed!')
    console.log('✅ Login would work on the website')
    console.log('')
    console.log('📋 User Details:')
    console.log(`   Name: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Studio: ${user.studioName || 'N/A'}`)
    console.log(`   Business: ${user.businessName || 'N/A'}`)
    console.log('')
    console.log('💡 If login still fails on the website:')
    console.log('   1. Clear browser cache and cookies')
    console.log('   2. Try incognito/private mode')
    console.log('   3. Check browser console for errors')
    console.log('   4. Verify the deployment includes the login fixes')

  } catch (error) {
    console.error('❌ SIMULATION ERROR:', error.message)
    console.error('Full error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

simulateLogin()

