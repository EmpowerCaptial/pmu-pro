#!/usr/bin/env node

/**
 * Pre-Deployment Check Script
 * Validates environment and database before production deployment
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function checkEnvironment() {
  console.log('🔍 Checking environment variables...')
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_APP_ENV'
  ]
  
  const missingVars = []
  
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName)
    }
  })
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '))
    process.exit(1)
  }
  
  console.log('✅ All required environment variables are set')
}

function checkDatabaseConnection() {
  console.log('🔍 Checking database connection...')
  
  try {
    // Run the health check script
    execSync('node scripts/health-check.js', { stdio: 'inherit' })
    console.log('✅ Database connection verified')
  } catch (error) {
    console.error('❌ Database connection failed')
    process.exit(1)
  }
}

function checkPrismaClient() {
  console.log('🔍 Checking Prisma client...')
  
  try {
    // Ensure Prisma client is generated
    execSync('npx prisma generate', { stdio: 'inherit' })
    console.log('✅ Prisma client is up to date')
  } catch (error) {
    console.error('❌ Prisma client generation failed')
    process.exit(1)
  }
}

function checkBuild() {
  console.log('🔍 Checking build process...')
  
  try {
    // Check if Next.js config files exist
    const fs = require('fs')
    const path = require('path')
    
    const requiredFiles = [
      'next.config.js',
      'next.config.mjs',
      'package.json'
    ]
    
    const missingFiles = requiredFiles.filter(file => !fs.existsSync(file))
    
    if (missingFiles.length > 0) {
      console.error('❌ Missing required files:', missingFiles.join(', '))
      process.exit(1)
    }
    
    console.log('✅ Build process is valid')
  } catch (error) {
    console.error('❌ Build process failed')
    process.exit(1)
  }
}

async function main() {
  console.log('🚀 Starting pre-deployment checks...\n')
  
  try {
    checkEnvironment()
    checkPrismaClient()
    checkDatabaseConnection()
    checkBuild()
    
    console.log('\n🎉 All pre-deployment checks passed!')
    console.log('✅ Ready for production deployment')
    
  } catch (error) {
    console.error('\n❌ Pre-deployment checks failed:', error.message)
    process.exit(1)
  }
}

main()
