#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function resetUserPassword() {
  const email = process.argv[2]
  const newPassword = process.argv[3]

  if (!email || !newPassword) {
    console.log('Usage: node scripts/reset-user-password.js <email> <newPassword>')
    console.log('Example: node scripts/reset-user-password.js user@example.com password123')
    process.exit(1)
  }

  try {
    console.log(`🔍 Finding user: ${email}...`)
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    if (!user) {
      console.log(`❌ User not found with email: ${email}`)
      process.exit(1)
    }

    console.log(`✅ Found user: ${user.name} (${user.email})`)
    console.log(`   Role: ${user.role}`)
    console.log(`\n🔧 Resetting password...`)

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    })

    console.log(`✅ Password reset successfully!`)
    console.log(`\n📧 Login Credentials:`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Password: ${newPassword}`)
    console.log(`   Role: ${user.role}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

resetUserPassword()

