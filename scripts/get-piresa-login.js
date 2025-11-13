#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function getPiresaLogin() {
  try {
    const email = 'piresa@universalbeautystudio.com'
    const newPassword = 'piresa2024' // Simple password for easy access
    
    console.log('🔍 Finding Piresa Willis...')
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.log('❌ User not found!')
      return
    }
    
    console.log('✅ Found Piresa Willis:')
    console.log('   Name:', user.name)
    console.log('   Email:', user.email)
    console.log('   Role:', user.role)
    console.log('   Studio:', user.studioName)
    
    // Test common passwords first
    const testPasswords = [
      'piresa2024',
      'piresa.willis.pw@gmail.com',
      'Piresa2024!',
      'temp-password'
    ]
    
    let passwordFound = false
    let actualPassword = null
    
    console.log('\n🔐 Testing passwords...')
    for (const testPassword of testPasswords) {
      const isValid = await bcrypt.compare(testPassword, user.password)
      if (isValid) {
        passwordFound = true
        actualPassword = testPassword
        console.log(`   ✅ Password matches: "${testPassword}"`)
        break
      }
    }
    
    if (!passwordFound) {
      // Reset password
      console.log('\n🔧 Resetting password...')
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      })
      
      console.log('✅ Password reset successful!')
      actualPassword = newPassword
    }
    
    console.log('\n📧 Login Credentials for Piresa Willis:')
    console.log('=' .repeat(50))
    console.log('Email: piresa@universalbeautystudio.com')
    console.log('Password:', actualPassword)
    console.log('Role:', user.role)
    console.log('Studio:', user.studioName)
    console.log('=' .repeat(50))
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

getPiresaLogin()

