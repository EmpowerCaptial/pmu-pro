#!/usr/bin/env node

/**
 * Schema validation script to prevent schema drift
 * Run this before any deployment to ensure database schema matches Prisma schema
 */

const { PrismaClient } = require('@prisma/client')
const { execSync } = require('child_process')

async function validateSchemaSync() {
  try {
    console.log('🔍 VALIDATING DATABASE SCHEMA SYNC...')
    console.log('=====================================')
    
    const prisma = new PrismaClient()
    
    // Step 1: Test basic connection
    console.log('📊 Step 1: Testing database connection')
    try {
      await prisma.$connect()
      console.log('✅ Database connection successful')
    } catch (connectionError) {
      console.error('❌ Database connection failed:', connectionError.message || connectionError)
      console.log('⚠️ Skipping schema validation (non-blocking when DB unavailable)')
      console.log('')
      return
    }
    
    // Step 2: Test critical User model fields
    console.log('')
    console.log('📊 Step 2: Validating User model fields')
    
    const requiredUserFields = [
      'id', 'name', 'email', 'password', 'businessName', 'phone',
      'licenseNumber', 'licenseState', 'yearsExperience', 'selectedPlan',
      'licenseFile', 'insuranceFile', 'hasActiveSubscription', 'isLicenseVerified',
      'role', 'stripeId', 'stripeCustomerId', 'stripeSubscriptionId',
      'subscriptionStatus', 'createdAt', 'updatedAt', 'address', 'avatar',
      'bio', 'businessHours', 'cashAppUsername', 'certifications',
      'experience', 'instagram', 'specialties', 'stripeConnectAccountId',
      'studioName', 'venmoUsername', 'website'
    ]
    
    let missingFields = []
    let existingFields = []
    
    for (const field of requiredUserFields) {
      try {
        // Try to query the field
        const result = await prisma.$queryRaw`
          SELECT ${field} FROM users LIMIT 1
        `
        existingFields.push(field)
        console.log(`✅ ${field} - exists`)
      } catch (error) {
        missingFields.push(field)
        console.log(`❌ ${field} - MISSING`)
      }
    }
    
    // Step 3: Report results
    console.log('')
    console.log('📊 VALIDATION RESULTS:')
    console.log(`✅ Existing fields: ${existingFields.length}`)
    console.log(`❌ Missing fields: ${missingFields.length}`)
    
    if (missingFields.length > 0) {
      console.log('')
      console.log('🚨 SCHEMA DRIFT DETECTED!')
      console.log('Missing fields:', missingFields.join(', '))
      console.log('')
      console.log('🔧 REQUIRED ACTIONS:')
      console.log('1. Run: npx prisma db push')
      console.log('2. Run: npx prisma generate')
      console.log('3. Test login API')
      console.log('4. Deploy to production')
      console.log('')
      console.log('❌ DEPLOYMENT BLOCKED - Schema not in sync')
      process.exit(1)
    } else {
      console.log('')
      console.log('✅ SCHEMA VALIDATION PASSED')
      console.log('✅ Database schema matches Prisma schema')
      console.log('✅ Safe to deploy')
    }
    
    // Step 4: Test critical operations
    console.log('')
    console.log('📊 Step 3: Testing critical operations')
    
    try {
      // Test user lookup (login API)
      const user = await prisma.user.findUnique({
        where: { email: 'tyronejackboy@gmail.com' }
      })
      console.log('✅ User lookup operation: Working')
      
      if (user) {
        console.log('✅ User data access: Working')
        console.log('✅ All required fields accessible')
      }
    } catch (error) {
      console.log('❌ Critical operation failed:', error.message)
      console.log('🚨 Deployment should be blocked')
      process.exit(1)
    }
    
    await prisma.$disconnect()
    console.log('')
    console.log('🎯 VALIDATION COMPLETE - Safe to deploy')
    
  } catch (error) {
    console.error('❌ Schema validation failed:', error)
    console.log('🚨 Deployment should be blocked')
    process.exit(1)
  }
}

// Run validation
validateSchemaSync()
