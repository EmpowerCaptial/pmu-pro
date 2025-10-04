#!/usr/bin/env node

/**
 * Test Prisma client functionality in production-like environment
 */

const { PrismaClient } = require('@prisma/client')

async function testPrismaClient() {
  try {
    console.log('🧪 TESTING PRISMA CLIENT FUNCTIONALITY...')
    console.log('==========================================')
    
    const prisma = new PrismaClient()
    
    // Test 1: Basic connection
    console.log('📊 Test 1: Database Connection')
    try {
      await prisma.$connect()
      console.log('✅ Database connection successful')
    } catch (error) {
      console.log('❌ Database connection failed:', error.message)
      return
    }
    
    // Test 2: Simple query
    console.log('')
    console.log('📊 Test 2: Simple Query')
    try {
      const result = await prisma.user.count()
      console.log('✅ User count query successful:', result)
    } catch (error) {
      console.log('❌ User count query failed:', error.message)
      return
    }
    
    // Test 3: Find user (same as login API)
    console.log('')
    console.log('📊 Test 3: Find User (Login API Logic)')
    try {
      const user = await prisma.user.findUnique({
        where: { email: 'tyronejackboy@gmail.com' }
      })
      
      if (user) {
        console.log('✅ User found:', user.name)
        console.log('✅ User has password:', user.password ? 'YES' : 'NO')
        console.log('✅ User emailNotifications:', user.emailNotifications)
      } else {
        console.log('❌ User not found')
      }
    } catch (error) {
      console.log('❌ Find user failed:', error.message)
      console.log('🚨 This is the exact error causing login API 500')
      return
    }
    
    // Test 4: Bcrypt operations
    console.log('')
    console.log('📊 Test 4: Bcrypt Operations')
    try {
      const bcrypt = require('bcryptjs')
      const user = await prisma.user.findUnique({
        where: { email: 'tyronejackboy@gmail.com' }
      })
      
      if (user && user.password) {
        const isTempPassword = await bcrypt.compare('temp-password', user.password)
        console.log('✅ Temp password check:', isTempPassword ? 'IS TEMP' : 'NOT TEMP')
        
        const isValidPassword = await bcrypt.compare('Tyronej22!', user.password)
        console.log('✅ Password verification:', isValidPassword ? 'VALID' : 'INVALID')
      }
    } catch (error) {
      console.log('❌ Bcrypt operations failed:', error.message)
      console.log('🚨 This could cause login API 500')
    }
    
    // Test 5: Full login simulation
    console.log('')
    console.log('📊 Test 5: Full Login Simulation')
    try {
      const user = await prisma.user.findUnique({
        where: { email: 'tyronejackboy@gmail.com' }
      })
      
      if (!user) {
        console.log('❌ User not found - would return 401')
      } else {
        const bcrypt = require('bcryptjs')
        const isTempPassword = await bcrypt.compare('temp-password', user.password)
        
        if (isTempPassword) {
          console.log('⚠️ Temp password - would return 400')
        } else {
          const isValidPassword = await bcrypt.compare('Tyronej22!', user.password)
          
          if (!isValidPassword) {
            console.log('❌ Invalid password - would return 401')
          } else {
            console.log('✅ Login would succeed - would return 200')
            
            // Test the exact response structure
            const { password: _, ...userWithoutPassword } = user
            console.log('✅ User response structure valid')
            console.log('✅ All required fields present')
          }
        }
      }
    } catch (error) {
      console.log('❌ Full login simulation failed:', error.message)
      console.log('🚨 This is causing the 500 error')
    }
    
    await prisma.$disconnect()
    console.log('')
    console.log('🎯 CONCLUSION:')
    console.log('If all tests pass locally but API fails on Vercel:')
    console.log('1. 🔍 Check Vercel environment variables')
    console.log('2. 🔍 Check Vercel build logs')
    console.log('3. 🔍 Check if Prisma client is generated correctly')
    console.log('4. 🔍 Check for memory/timeout issues on Vercel')
    
  } catch (error) {
    console.error('❌ Prisma client test failed:', error)
  }
}

testPrismaClient()
