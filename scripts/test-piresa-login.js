#!/usr/bin/env node

/**
 * Comprehensive test for Piresa Willis login and password reset
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testPiresaLogin() {
  try {
    console.log('🔍 TESTING PIRESA WILLIS LOGIN & PASSWORD RESET')
    console.log('================================================\n')

    const email = 'piresa@universalbeautystudio.com'
    const testPasswords = [
      'piresa2024',
      'Piresa2024!',
      'piresa.willis.pw@gmail.com',
      'temp-password'
    ]

    // Step 1: Find user
    console.log('📊 Step 1: Finding user in database...')
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        createdAt: true
      }
    })

    if (!user) {
      console.log('❌ User NOT FOUND in database!')
      console.log(`   Email searched: ${email}\n`)
      
      // Search for similar emails
      console.log('🔍 Searching for similar emails...')
      const similarUsers = await prisma.user.findMany({
        where: {
          OR: [
            { email: { contains: 'piresa', mode: 'insensitive' } },
            { name: { contains: 'Piresa', mode: 'insensitive' } }
          ]
        },
        select: {
          email: true,
          name: true,
          id: true
        }
      })

      if (similarUsers.length > 0) {
        console.log(`\n✅ Found ${similarUsers.length} similar user(s):`)
        similarUsers.forEach(u => {
          console.log(`   - ${u.email} (${u.name})`)
        })
      } else {
        console.log('❌ No similar users found')
      }
      
      await prisma.$disconnect()
      process.exit(1)
    }

    console.log('✅ User found!')
    console.log(`   ID: ${user.id}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Created: ${user.createdAt}\n`)

    // Step 2: Check password hash
    console.log('📊 Step 2: Analyzing password hash...')
    console.log(`   Hash length: ${user.password.length} characters`)
    console.log(`   Hash starts with: ${user.password.substring(0, 10)}...`)
    
    // Check if it's a temp password
    const isTempPassword = await bcrypt.compare('temp-password', user.password)
    if (isTempPassword) {
      console.log('⚠️  Password is set to temporary password!')
      console.log('   User needs to set up their password first.\n')
    } else {
      console.log('✅ Password is not a temporary password\n')
    }

    // Step 3: Test login with various passwords
    console.log('📊 Step 3: Testing login with different passwords...')
    for (const testPassword of testPasswords) {
      const isValid = await bcrypt.compare(testPassword, user.password)
      console.log(`   "${testPassword}": ${isValid ? '✅ VALID' : '❌ Invalid'}`)
    }
    console.log('')

    // Step 4: Check for password reset tokens
    console.log('📊 Step 4: Checking for password reset tokens...')
    const resetTokens = await prisma.magicLinkToken.findMany({
      where: {
        userId: user.id,
        used: false
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    if (resetTokens.length > 0) {
      console.log(`✅ Found ${resetTokens.length} active reset token(s):`)
      resetTokens.forEach((token, idx) => {
        const isExpired = new Date() > token.expiresAt
        console.log(`   ${idx + 1}. Token: ${token.token.substring(0, 20)}...`)
        console.log(`      Created: ${token.createdAt.toISOString()}`)
        console.log(`      Expires: ${token.expiresAt.toISOString()}`)
        console.log(`      Status: ${isExpired ? '❌ EXPIRED' : '✅ Active'}`)
        console.log(`      Used: ${token.used ? 'Yes' : 'No'}`)
      })
    } else {
      console.log('❌ No active reset tokens found')
      console.log('   This might be why password reset is not working\n')
    }
    console.log('')

    // Step 5: Test password reset flow
    console.log('📊 Step 5: Testing password reset functionality...')
    console.log('   To test password reset:')
    console.log('   1. Go to: https://thepmuguide.com/auth/forgot-password')
    console.log(`   2. Enter email: ${email}`)
    console.log('   3. Check for reset email')
    console.log('   4. Use the reset link\n')

    // Step 6: Recommendations
    console.log('💡 RECOMMENDATIONS:')
    console.log('===================\n')
    
    if (isTempPassword) {
      console.log('1. User needs to set up password via setup-password page')
      console.log(`   URL: https://thepmuguide.com/auth/setup-password?email=${encodeURIComponent(email)}\n`)
    } else {
      const anyPasswordWorks = testPasswords.some(async p => {
        return await bcrypt.compare(p, user.password)
      })
      
      if (!anyPasswordWorks) {
        console.log('1. Reset password using admin endpoint:')
        console.log('   POST /api/admin/reset-password')
        console.log('   Body: { email, newPassword, adminEmail }\n')
      }
    }

    console.log('2. Or use the reset script:')
    console.log('   node scripts/reset-piresa-password.js\n')

    console.log('✅ TEST COMPLETE')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Full error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testPiresaLogin()

