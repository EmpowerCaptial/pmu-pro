#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function resetAllPasswordsToDefault() {
  try {
    console.log('🔍 Fetching all users...\n')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: [
        { role: 'asc' },
        { name: 'asc' }
      ]
    })

    console.log(`📋 Found ${users.length} users\n`)
    console.log('=' .repeat(80))
    console.log('🔧 Resetting all passwords to default format: <name>2024')
    console.log('=' .repeat(80))
    console.log('\n')

    const credentials = []

    for (const user of users) {
      try {
        // Generate default password: first name + 2024
        const firstName = user.name.split(' ')[0].toLowerCase()
        const defaultPassword = `${firstName}2024`
        
        console.log(`🔄 Resetting password for ${user.name} (${user.email})...`)
        
        const hashedPassword = await bcrypt.hash(defaultPassword, 12)
        
        await prisma.user.update({
          where: { email: user.email },
          data: { password: hashedPassword }
        })

        credentials.push({
          name: user.name,
          email: user.email,
          role: user.role,
          password: defaultPassword
        })

        console.log(`   ✅ Password set to: ${defaultPassword}`)
      } catch (error) {
        console.error(`   ❌ Error resetting ${user.email}: ${error.message}`)
      }
    }

    console.log('\n\n' + '=' .repeat(80))
    console.log('📊 LOGIN CREDENTIALS')
    console.log('=' .repeat(80))
    console.log('\n')

    // Group by role
    const grouped = credentials.reduce((acc, cred) => {
      const role = (cred.role || 'unknown').toLowerCase()
      if (!acc[role]) {
        acc[role] = []
      }
      acc[role].push(cred)
      return acc
    }, {})

    Object.keys(grouped).sort().forEach(role => {
      const usersInRole = grouped[role]
      console.log(`\n📌 ${role.toUpperCase()}`)
      console.log('-' .repeat(80))
      
      usersInRole.forEach((cred, index) => {
        console.log(`${index + 1}. ${cred.name}`)
        console.log(`   Email: ${cred.email}`)
        console.log(`   Password: ${cred.password}`)
        console.log('')
      })
    })

    console.log('\n' + '=' .repeat(80))
    console.log('📋 SUMMARY TABLE')
    console.log('=' .repeat(80))
    console.log('')
    console.log('Name'.padEnd(25) + ' | ' + 'Email (Username)'.padEnd(40) + ' | ' + 'Password')
    console.log('-'.repeat(90))
    
    credentials.forEach(cred => {
      const name = cred.name.padEnd(23)
      const email = cred.email.padEnd(38)
      const password = cred.password
      console.log(`${name} | ${email} | ${password}`)
    })

    console.log('\n' + '=' .repeat(80))

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

resetAllPasswordsToDefault()

