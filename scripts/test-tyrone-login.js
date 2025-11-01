#!/usr/bin/env node

/**
 * Script to test Tyron Jackson's login credentials
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function testTyroneLogin() {
  try {
    console.log('🧪 Testing Tyron Jackson Login...\n')
    
    const email = 'tyronejackboy@gmail.com'
    const password = 'tyrone2024'
    
    // Step 1: Find the user
    console.log('1️⃣ Looking up user in database...')
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.log('❌ User not found in database!')
      console.log('   Email:', email)
      return
    }
    
    console.log('✅ User found:')
    console.log('   ID:', user.id)
    console.log('   Name:', user.name)
    console.log('   Email:', user.email)
    console.log('   Role:', user.role)
    console.log('   Plan:', user.selectedPlan)
    console.log('   Password hash:', user.password.substring(0, 20) + '...')
    
    // Step 2: Check password
    console.log('\n2️⃣ Testing password verification...')
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      console.log('❌ Password verification FAILED!')
      console.log('   Expected password:', password)
      console.log('   Password hash in DB:', user.password.substring(0, 30) + '...')
      
      // Try to create a new hash and compare
      console.log('\n   Trying to hash new password...')
      const testHash = await bcrypt.hash(password, 12)
      console.log('   New hash:', testHash.substring(0, 30) + '...')
      
      // Try older bcrypt rounds
      console.log('\n   Trying with different rounds...')
      for (const rounds of [10, 12]) {
        const testHash2 = await bcrypt.hash(password, rounds)
        const testMatch = await bcrypt.compare(password, testHash2)
        console.log(`   Rounds ${rounds}: ${testMatch ? '✅' : '❌'}`)
      }
      
    } else {
      console.log('✅ Password verification SUCCESS!')
      console.log('   Password:', password)
    }
    
    // Step 3: Summary
    console.log('\n📊 Summary:')
    console.log('   Email:', email)
    console.log('   Password:', password)
    console.log('   Login Status:', isValidPassword ? '✅ CAN LOGIN' : '❌ CANNOT LOGIN')
    
    if (!isValidPassword) {
      console.log('\n🔧 Fixing password...')
      const newHash = await bcrypt.hash(password, 12)
      
      await prisma.user.update({
        where: { email },
        data: { password: newHash }
      })
      
      console.log('✅ Password reset!')
      console.log('   Try logging in again with:')
      console.log('   Email:', email)
      console.log('   Password:', password)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testTyroneLogin()
