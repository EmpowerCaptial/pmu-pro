#!/usr/bin/env node

/**
 * Debug database connection issues that might be causing login API 500 errors
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugDatabaseConnection() {
  try {
    console.log('🔍 DEBUGGING DATABASE CONNECTION ISSUES...')
    console.log('==========================================')
    
    // Test basic database connection
    console.log('📊 STEP 1: TESTING DATABASE CONNECTION')
    try {
      await prisma.$connect()
      console.log('✅ Database connection successful')
    } catch (error) {
      console.log('❌ Database connection failed:', error.message)
      return
    }
    
    // Test user lookup (same as login API)
    console.log('')
    console.log('📊 STEP 2: TESTING USER LOOKUP (Same as Login API)')
    try {
      const user = await prisma.user.findUnique({
        where: { email: 'tyronejackboy@gmail.com' }
      })
      
      if (user) {
        console.log('✅ User found:', user.name)
        console.log('📧 Email:', user.email)
        console.log('🔐 Has password:', user.password ? 'YES' : 'NO')
        console.log('📅 Created:', user.createdAt)
      } else {
        console.log('❌ User not found')
      }
    } catch (error) {
      console.log('❌ User lookup failed:', error.message)
      console.log('🚨 This would cause 500 error in login API')
      return
    }
    
    // Test bcrypt operations (same as login API)
    console.log('')
    console.log('📊 STEP 3: TESTING BCRYPT OPERATIONS')
    try {
      const bcrypt = require('bcryptjs')
      
      // Test temp password check
      const user = await prisma.user.findUnique({
        where: { email: 'tyronejackboy@gmail.com' }
      })
      
      if (user && user.password) {
        const isTempPassword = await bcrypt.compare('temp-password', user.password)
        console.log('✅ Temp password check:', isTempPassword ? 'IS TEMP' : 'NOT TEMP')
        
        const isValidPassword = await bcrypt.compare('Tyronej22!', user.password)
        console.log('✅ Password verification:', isValidPassword ? 'VALID' : 'INVALID')
      } else {
        console.log('❌ No user or password found for bcrypt test')
      }
    } catch (error) {
      console.log('❌ Bcrypt operations failed:', error.message)
      console.log('🚨 This would cause 500 error in login API')
      return
    }
    
    // Test environment variables
    console.log('')
    console.log('📊 STEP 4: CHECKING ENVIRONMENT VARIABLES')
    console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined')
    console.log('DATABASE_URL exists:', process.env.DATABASE_URL ? 'YES' : 'NO')
    console.log('DATABASE_URL length:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0)
    
    // Test Prisma client status
    console.log('')
    console.log('📊 STEP 5: PRISMA CLIENT STATUS')
    try {
      const result = await prisma.$queryRaw`SELECT 1 as test`
      console.log('✅ Raw query test:', result)
    } catch (error) {
      console.log('❌ Raw query failed:', error.message)
      console.log('🚨 Database query issues detected')
    }
    
    console.log('')
    console.log('🎯 CONCLUSION:')
    console.log('If all tests pass but API still returns 500:')
    console.log('1. 🔍 Check Vercel deployment logs')
    console.log('2. 🔍 Check environment variables in Vercel')
    console.log('3. 🔍 Check database connection limits')
    console.log('4. 🔍 Check for memory/timeout issues')
    console.log('5. 🔍 Check for Prisma client initialization issues')

  } catch (error) {
    console.error('❌ Database debug error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the debug
debugDatabaseConnection()
  .then(() => {
    console.log('✅ Database debug completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Database debug failed:', error)
    process.exit(1)
  })
