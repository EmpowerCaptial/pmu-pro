#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function listAllUsersCredentials() {
  try {
    console.log('🔍 Fetching all users from database...\n')
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studioName: true,
        businessName: true,
        password: true,
        selectedPlan: true,
        hasActiveSubscription: true,
        createdAt: true
      },
      orderBy: [
        { role: 'asc' },
        { name: 'asc' }
      ]
    })
    
    console.log(`📋 Found ${users.length} total users\n`)
    console.log('=' .repeat(80))
    
    // Filter for artists and staff
    const artistStaffRoles = ['artist', 'staff', 'instructor', 'director', 'manager', 'hr', 'owner', 'student', 'licensed']
    const artistAndStaff = users.filter(user => {
      const role = (user.role || '').toLowerCase()
      return artistStaffRoles.includes(role)
    })
    
    // Group by role
    const grouped = artistAndStaff.reduce((acc, user) => {
      const role = user.role?.toLowerCase() || 'unknown'
      if (!acc[role]) {
        acc[role] = []
      }
      acc[role].push(user)
      return acc
    }, {})
    
    // Display grouped by role
    Object.keys(grouped).sort().forEach(role => {
      const usersInRole = grouped[role]
      console.log(`\n📌 ${role.toUpperCase()} (${usersInRole.length} users)`)
      console.log('-' .repeat(80))
      
      usersInRole.forEach((user, index) => {
        const hasPassword = user.password && user.password.length > 0
        const passwordStatus = hasPassword ? '✅ SET' : '❌ NOT SET'
        
        console.log(`\n${index + 1}. ${user.name}`)
        console.log(`   Email (Username): ${user.email}`)
        console.log(`   Role: ${user.role || 'N/A'}`)
        console.log(`   Studio: ${user.studioName || 'N/A'}`)
        console.log(`   Business: ${user.businessName || 'N/A'}`)
        console.log(`   Plan: ${user.selectedPlan || 'N/A'}`)
        console.log(`   Active Subscription: ${user.hasActiveSubscription ? 'Yes' : 'No'}`)
        console.log(`   Password: ${passwordStatus}`)
        console.log(`   Created: ${user.createdAt.toLocaleDateString()}`)
        console.log(`   ID: ${user.id}`)
      })
    })
    
    // Summary table
    console.log('\n\n' + '=' .repeat(80))
    console.log('📊 SUMMARY TABLE')
    console.log('=' .repeat(80))
    console.log('\n')
    console.log('Username (Email)'.padEnd(40) + ' | ' + 'Role'.padEnd(15) + ' | ' + 'Password Status')
    console.log('-'.repeat(80))
    
    artistAndStaff.forEach(user => {
      const hasPassword = user.password && user.password.length > 0
      const passwordStatus = hasPassword ? '✅ SET' : '❌ NOT SET'
      const email = user.email.padEnd(38)
      const role = (user.role || 'N/A').padEnd(13)
      console.log(`${email} | ${role} | ${passwordStatus}`)
    })
    
    console.log('\n\n' + '=' .repeat(80))
    console.log('ℹ️  NOTE: Passwords are stored as bcrypt hashes and cannot be retrieved.')
    console.log('    To reset a password, use: node scripts/reset-user-password.js <email> <newPassword>')
    console.log('=' .repeat(80))
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

listAllUsersCredentials()

