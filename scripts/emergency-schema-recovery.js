#!/usr/bin/env node

/**
 * Emergency schema recovery script
 * Use this if schema drift is detected in production
 */

const { execSync } = require('child_process')

console.log('🚨 EMERGENCY SCHEMA RECOVERY')
console.log('============================')

try {
  console.log('1. Applying schema changes to production...')
  execSync('npx prisma db push', { stdio: 'inherit' })
  
  console.log('2. Regenerating Prisma client...')
  execSync('npx prisma generate', { stdio: 'inherit' })
  
  console.log('3. Validating schema sync...')
  execSync('npm run validate-schema', { stdio: 'inherit' })
  
  console.log('✅ Emergency recovery complete')
  console.log('✅ Schema should now be in sync')
  console.log('✅ Safe to deploy')
  
} catch (error) {
  console.error('❌ Emergency recovery failed:', error.message)
  console.log('🔧 Manual intervention required')
  process.exit(1)
}
