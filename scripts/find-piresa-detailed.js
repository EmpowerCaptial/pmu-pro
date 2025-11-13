#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function findPiresaDetailed() {
  try {
    console.log('🔍 Searching for Piresa Willis in Universal Beauty Studio...\n')
    
    // First, get all users from Universal Beauty Studio
    const studioUsers = await prisma.user.findMany({
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
        studioName: true,
        password: true
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    console.log(`📋 Found ${studioUsers.length} users in Universal Beauty Studio:\n`)
    
    studioUsers.forEach(user => {
      const hasPassword = user.password && user.password.length > 0
      console.log(`   👤 ${user.name}`)
      console.log(`      Email: ${user.email}`)
      console.log(`      Role: ${user.role}`)
      console.log(`      Password: ${hasPassword ? 'SET' : 'NOT SET'}`)
      console.log('')
    })
    
    // Now search specifically for Piresa
    const piresaUsers = studioUsers.filter(user => 
      user.name?.toLowerCase().includes('piresa') || 
      user.email?.toLowerCase().includes('piresa')
    )
    
    if (piresaUsers.length > 0) {
      console.log('\n✅ Found Piresa Willis:')
      piresaUsers.forEach(user => {
        console.log(`   Name: ${user.name}`)
        console.log(`   Email: ${user.email}`)
        console.log(`   Role: ${user.role}`)
        console.log(`   ID: ${user.id}`)
        console.log(`   Password: ${user.password ? 'SET' : 'NOT SET'}`)
      })
    } else {
      console.log('\n❌ Piresa Willis not found in Universal Beauty Studio team members.')
      console.log('\n💡 Note: If you see Piresa on the studio/team page, the account might exist but with a different name or email format.')
    }
    
  } catch (error) {
    console.error('Error:', error.message)
    console.error(error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

findPiresaDetailed()

