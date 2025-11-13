#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function findPiresa() {
  try {
    console.log('🔍 Searching for Piresa accounts...\n')
    
    // Search by email
    const emailSearches = [
      'piresa@universalbeautystudio.com',
      'piresa.willis.pw@gmail.com',
      'piresa.willis@',
      'piresa@'
    ]
    
    for (const emailSearch of emailSearches) {
      const users = await prisma.user.findMany({
        where: {
          email: {
            contains: emailSearch.includes('@') ? emailSearch.split('@')[0] : emailSearch,
            mode: 'insensitive'
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          studioName: true
        }
      })
      
      if (users.length > 0) {
        console.log(`📧 Found users with email containing "${emailSearch}":`)
        users.forEach(user => {
          console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}, Studio: ${user.studioName}`)
        })
        console.log('')
      }
    }
    
    // Search by name
    const nameUsers = await prisma.user.findMany({
      where: {
        name: {
          contains: 'Piresa',
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studioName: true
      }
    })
    
    if (nameUsers.length > 0) {
      console.log(`👤 Found users with name containing "Piresa":`)
      nameUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}, Studio: ${user.studioName}`)
      })
      console.log('')
    }
    
    // If no results, list all studio team members
    if (nameUsers.length === 0 && emailSearches.every(s => true)) {
      console.log('📋 Listing all studio team members from Universal Beauty Studio...')
      const studioMembers = await prisma.user.findMany({
        where: {
          studioName: {
            contains: 'Universal',
            mode: 'insensitive'
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          studioName: true
        },
        orderBy: {
          name: 'asc'
        }
      })
      
      if (studioMembers.length > 0) {
        studioMembers.forEach(member => {
          console.log(`   - ${member.name} (${member.email}) - Role: ${member.role}`)
        })
      } else {
        console.log('   No studio members found.')
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

findPiresa()

