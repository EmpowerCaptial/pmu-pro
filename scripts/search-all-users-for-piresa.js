#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function searchAllUsersForPiresa() {
  try {
    console.log('🔍 Searching ALL users in database for Piresa Willis...\n')
    
    // Search by email containing piresa
    const emailSearch = await prisma.user.findMany({
      where: {
        email: {
          contains: 'piresa',
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studioName: true,
        businessName: true,
        password: true,
        createdAt: true
      }
    })
    
    // Search by name containing Piresa or Willis
    const nameSearch = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: 'Piresa', mode: 'insensitive' } },
          { name: { contains: 'Willis', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studioName: true,
        businessName: true,
        password: true,
        createdAt: true
      }
    })
    
    // Combine and deduplicate
    const allMatches = [...emailSearch, ...nameSearch]
    const uniqueMatches = Array.from(
      new Map(allMatches.map(user => [user.id, user])).values()
    )
    
    if (uniqueMatches.length > 0) {
      console.log(`✅ Found ${uniqueMatches.length} user(s) matching Piresa:\n`)
      
      uniqueMatches.forEach(user => {
        const hasPassword = user.password && user.password.length > 0
        console.log(`   👤 ${user.name}`)
        console.log(`      Email: ${user.email}`)
        console.log(`      Role: ${user.role}`)
        console.log(`      Studio: ${user.studioName || 'N/A'}`)
        console.log(`      Business: ${user.businessName || 'N/A'}`)
        console.log(`      Password: ${hasPassword ? 'SET' : 'NOT SET'}`)
        console.log(`      Created: ${user.createdAt}`)
        console.log(`      ID: ${user.id}`)
        console.log('')
      })
      
      // Also check what studio names exist
      console.log('\n📋 All unique studio names in database:')
      const allUsers = await prisma.user.findMany({
        select: { studioName: true },
        distinct: ['studioName']
      })
      
      const studioNames = allUsers
        .map(u => u.studioName)
        .filter(Boolean)
        .sort()
      
      studioNames.forEach(studio => {
        console.log(`   - ${studio}`)
      })
      
    } else {
      console.log('❌ No users found matching Piresa in the entire database.\n')
      
      // List all users to help debug
      console.log('📋 Listing ALL users in database:\n')
      const allUsers = await prisma.user.findMany({
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
      
      allUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}, Studio: ${user.studioName || 'N/A'}`)
      })
    }
    
  } catch (error) {
    console.error('Error:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

searchAllUsersForPiresa()

