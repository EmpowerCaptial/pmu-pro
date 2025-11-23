#!/usr/bin/env node

/**
 * Test Piresa's login through the actual API endpoint
 * This simulates what happens when logging in through the website
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testApiLogin() {
  try {
    console.log('🔍 TESTING PIRESA LOGIN VIA API')
    console.log('================================\n')

    const email = 'piresa@universalbeautystudio.com'
    const testPasswords = [
      'piresa2024',
      'Piresa2024!',
      'piresa.willis.pw@gmail.com'
    ]

    // Step 1: Find user exactly as the API does
    console.log('📊 Step 1: Finding user (API method)...')
    const user = await prisma.user.findUnique({
      where: { email },
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
      console.log('❌ User NOT FOUND!')
      console.log(`   Email searched: ${email}`)
      console.log('\n💡 Checking for case sensitivity or extra spaces...')
      
      // Try case-insensitive search
      const allUsers = await prisma.user.findMany({
        where: {
          email: {
            contains: 'piresa',
            mode: 'insensitive'
          }
        },
        select: {
          email: true,
          name: true
        }
      })
      
      if (allUsers.length > 0) {
        console.log(`\n✅ Found ${allUsers.length} user(s) with similar email:`)
        allUsers.forEach(u => {
          console.log(`   - "${u.email}" (${u.name})`)
          console.log(`     Exact match: ${u.email === email ? 'YES' : 'NO'}`)
          console.log(`     Lowercase match: ${u.email.toLowerCase() === email.toLowerCase() ? 'YES' : 'NO'}`)
        })
      }
      
      await prisma.$disconnect()
      process.exit(1)
    }

    console.log('✅ User found!')
    console.log(`   Email: "${user.email}"`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Role: ${user.role}\n`)

    // Step 2: Check for temp password (as API does)
    console.log('📊 Step 2: Checking for temp password...')
    const isTempPassword = await bcrypt.compare('temp-password', user.password)
    if (isTempPassword) {
      console.log('⚠️  User has temp password - needs setup!')
      console.log('   This would return: needsPasswordSetup: true\n')
    } else {
      console.log('✅ Not a temp password\n')
    }

    // Step 3: Test password comparison (exactly as API does)
    console.log('📊 Step 3: Testing password comparison (API method)...')
    for (const testPassword of testPasswords) {
      const isValid = await bcrypt.compare(testPassword, user.password)
      console.log(`   Testing: "${testPassword}"`)
      console.log(`   Result: ${isValid ? '✅ VALID - Would login successfully' : '❌ INVALID - Would fail'}`)
      
      if (isValid) {
        console.log(`\n✅ CORRECT PASSWORD FOUND: "${testPassword}"`)
        console.log(`\n📧 Login Credentials:`)
        console.log(`   Email: ${email}`)
        console.log(`   Password: ${testPassword}\n`)
        break
      }
      console.log('')
    }

    // Step 4: Check email format issues
    console.log('📊 Step 4: Checking for email format issues...')
    console.log(`   Stored email: "${user.email}"`)
    console.log(`   Email length: ${user.email.length}`)
    console.log(`   Has spaces: ${user.email.includes(' ') ? 'YES ⚠️' : 'NO ✅'}`)
    console.log(`   Has newlines: ${user.email.includes('\\n') ? 'YES ⚠️' : 'NO ✅'}`)
    console.log(`   Trimmed: "${user.email.trim()}"`)
    console.log(`   Lowercase: "${user.email.toLowerCase()}"\n`)

    // Step 5: Show what the API would return
    console.log('📊 Step 5: What the API would return...')
    const testPassword = 'piresa2024'
    const isValid = await bcrypt.compare(testPassword, user.password)
    
    if (isValid) {
      console.log('✅ Login would succeed!')
      console.log('   The API would return user data\n')
    } else {
      console.log('❌ Login would fail!')
      console.log('   The API would return: { error: "Invalid email or password" }\n')
      console.log('💡 RECOMMENDATION: Reset the password')
      console.log('   Run: node scripts/reset-piresa-password.js\n')
    }

    // Step 6: Check if we need to reset
    if (!isValid) {
      console.log('🔧 RESETTING PASSWORD...')
      const newPassword = 'piresa2024'
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      })
      
      // Verify it works now
      const updatedUser = await prisma.user.findUnique({
        where: { email },
        select: { password: true }
      })
      
      const nowValid = await bcrypt.compare(newPassword, updatedUser.password)
      if (nowValid) {
        console.log('✅ Password reset successful!')
        console.log(`\n📧 NEW LOGIN CREDENTIALS:`)
        console.log(`   Email: ${email}`)
        console.log(`   Password: ${newPassword}\n`)
      } else {
        console.log('❌ Password reset failed verification!')
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Full error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testApiLogin()

