#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function createPiresaAccount() {
  try {
    const email = 'piresa@universalbeautystudio.com'
    const name = 'Piresa Willis'
    const role = 'staff' // As you mentioned she's listed as staff
    const password = 'piresa2024' // Default password
    const studioName = 'Universal Beauty Studio Academy'
    
    console.log('🔍 Checking if Piresa already exists...')
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, role: true }
    })
    
    if (existingUser) {
      console.log('✅ Piresa already exists in database!')
      console.log(`   Name: ${existingUser.name}`)
      console.log(`   Email: ${existingUser.email}`)
      console.log(`   Role: ${existingUser.role}`)
      console.log(`   ID: ${existingUser.id}`)
      
      // Reset password
      console.log('\n🔧 Resetting password...')
      const hashedPassword = await bcrypt.hash(password, 12)
      
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      })
      
      console.log('✅ Password reset successfully!')
      console.log('\n📧 Login Credentials:')
      console.log('=' .repeat(50))
      console.log(`Email: ${email}`)
      console.log(`Password: ${password}`)
      console.log('=' .repeat(50))
      
      return
    }
    
    console.log('❌ Piresa not found. Creating new account...\n')
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Create the user account
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        selectedPlan: 'studio',
        hasActiveSubscription: true,
        subscriptionStatus: 'active',
        studioName,
        businessName: studioName,
        licenseNumber: 'N/A',
        licenseState: 'N/A'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studioName: true
      }
    })
    
    console.log('✅ Piresa Willis account created successfully!')
    console.log(`   Name: ${newUser.name}`)
    console.log(`   Email: ${newUser.email}`)
    console.log(`   Role: ${newUser.role}`)
    console.log(`   Studio: ${newUser.studioName}`)
    console.log(`   ID: ${newUser.id}`)
    
    console.log('\n📧 Login Credentials:')
    console.log('=' .repeat(50))
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log(`Role: ${role}`)
    console.log(`Studio: ${studioName}`)
    console.log('=' .repeat(50))
    console.log('\n💡 Note: The page will show Piresa from the database now after a refresh.')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.code === 'P2002') {
      console.error('   A user with this email already exists.')
    }
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

createPiresaAccount()

