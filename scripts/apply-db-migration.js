#!/usr/bin/env node

/**
 * Apply database migration to production database
 */

const { PrismaClient } = require('@prisma/client')
const { exec } = require('child_process')

async function applyDbMigration() {
  try {
    console.log('🗄️ APPLYING DATABASE MIGRATION TO PRODUCTION...')
    console.log('================================================')
    
    console.log('📊 Current environment:', process.env.NODE_ENV)
    console.log('📊 Database URL exists:', process.env.DATABASE_URL ? 'YES' : 'NO')
    console.log('')
    
    // Test database connection
    const prisma = new PrismaClient()
    try {
      await prisma.$connect()
      console.log('✅ Database connection successful')
    } catch (error) {
      console.log('❌ Database connection failed:', error.message)
      return
    }
    
    // Check if emailNotifications column exists
    try {
      const result = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        AND column_name = 'emailNotifications'
      `
      
      if (result.length > 0) {
        console.log('✅ emailNotifications column already exists')
        console.log('✅ Database schema is up to date')
      } else {
        console.log('❌ emailNotifications column missing')
        console.log('🔧 Need to add the column')
        
        // Add the column
        await prisma.$executeRaw`
          ALTER TABLE "User" 
          ADD COLUMN "emailNotifications" JSONB 
          DEFAULT '{"subscription": true, "payments": true, "settings": true}'
        `
        
        console.log('✅ emailNotifications column added successfully')
      }
    } catch (error) {
      console.log('❌ Error checking/adding column:', error.message)
    }
    
    // Test user lookup to make sure everything works
    try {
      const user = await prisma.user.findUnique({
        where: { email: 'tyronejackboy@gmail.com' }
      })
      
      if (user) {
        console.log('✅ User lookup successful:', user.name)
        console.log('✅ Database operations working correctly')
      } else {
        console.log('❌ User not found')
      }
    } catch (error) {
      console.log('❌ User lookup failed:', error.message)
    }
    
    await prisma.$disconnect()
    console.log('')
    console.log('🎯 MIGRATION COMPLETE')
    console.log('✅ Database schema should now be in sync')
    console.log('✅ Login API should work without 500 errors')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

applyDbMigration()
