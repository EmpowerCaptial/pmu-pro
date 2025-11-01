#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function getCareyLogin() {
  try {
    const email = 'careyagarciapm@gmail.com'
    const newPassword = 'careya2024' // Simple password for easy access
    
    console.log('🔍 Finding Careya Garcia...')
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.log('❌ User not found!')
      return
    }
    
    console.log('✅ Found Careya Garcia:')
    console.log('   Name:', user.name)
    console.log('   Email:', user.email)
    console.log('   Role:', user.role)
    console.log('   Studio:', user.studioName)
    
    // Reset password
    console.log('\n🔧 Resetting password...')
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    })
    
    console.log('✅ Password reset successful!')
    
    console.log('\n📧 Login Credentials for Careya Garcia:')
    console.log('=' .repeat(50))
    console.log('Email: careyagarciapm@gmail.com')
    console.log('Password: careya2024')
    console.log('Role: Student')
    console.log('Studio: Universal Beauty Studio Academy')
    console.log('=' .repeat(50))
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

getCareyLogin()

