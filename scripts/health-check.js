#!/usr/bin/env node

/**
 * Database Health Check Script
 * Ensures database connection is working before deployment
 */

const { PrismaClient } = require('@prisma/client')

async function healthCheck() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Checking database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Test a simple query
    const userCount = await prisma.user.count()
    console.log(`✅ Database query successful (${userCount} users found)`)
    
    // Test Prisma client generation
    const clientInfo = await prisma.$queryRaw`SELECT version()`
    console.log('✅ Prisma client is properly generated')
    
    console.log('🎉 All health checks passed!')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Health check failed:', error.message)
    console.error('Full error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run health check
healthCheck()
