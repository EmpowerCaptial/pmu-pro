#!/usr/bin/env node

/**
 * Setup script to protect against schema drift
 * This should be run once to set up the protection system
 */

const fs = require('fs')
const path = require('path')

function setupSchemaProtection() {
  try {
    console.log('🛡️ SETTING UP SCHEMA DRIFT PROTECTION...')
    console.log('=========================================')
    
    // 1. Add pre-commit hook
    console.log('📊 Step 1: Setting up pre-commit hook')
    const preCommitHook = `#!/bin/sh
# Schema drift protection
echo "🔍 Validating database schema before commit..."
npm run validate-schema
if [ $? -ne 0 ]; then
  echo "❌ Schema validation failed. Commit blocked."
  echo "🔧 Run: npm run validate-schema to see issues"
  exit 1
fi
echo "✅ Schema validation passed. Proceeding with commit."
`
    
    const hookPath = '.git/hooks/pre-commit'
    fs.writeFileSync(hookPath, preCommitHook)
    fs.chmodSync(hookPath, '755')
    console.log('✅ Pre-commit hook installed')
    
    // 2. Create GitHub Actions workflow
    console.log('')
    console.log('📊 Step 2: Creating GitHub Actions workflow')
    const workflowsDir = '.github/workflows'
    if (!fs.existsSync(workflowsDir)) {
      fs.mkdirSync(workflowsDir, { recursive: true })
    }
    
    const workflowContent = `name: Schema Validation

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  validate-schema:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Validate database schema
      run: npm run validate-schema
      env:
        DATABASE_URL: \${{ secrets.DATABASE_URL }}
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
`
    
    const workflowPath = path.join(workflowsDir, 'schema-validation.yml')
    fs.writeFileSync(workflowPath, workflowContent)
    console.log('✅ GitHub Actions workflow created')
    
    // 3. Create Vercel deployment hook
    console.log('')
    console.log('📊 Step 3: Creating Vercel deployment validation')
    const vercelConfig = {
      "buildCommand": "npm run validate-schema && npm run build",
      "devCommand": "npm run dev",
      "installCommand": "npm ci"
    }
    
    const vercelPath = 'vercel.json'
    let existingConfig = {}
    if (fs.existsSync(vercelPath)) {
      existingConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'))
    }
    
    const newConfig = { ...existingConfig, ...vercelConfig }
    fs.writeFileSync(vercelPath, JSON.stringify(newConfig, null, 2))
    console.log('✅ Vercel configuration updated')
    
    // 4. Create emergency recovery script
    console.log('')
    console.log('📊 Step 4: Creating emergency recovery script')
    const emergencyScript = `#!/usr/bin/env node

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
`
    
    fs.writeFileSync('scripts/emergency-schema-recovery.js', emergencyScript)
    fs.chmodSync('scripts/emergency-schema-recovery.js', '755')
    console.log('✅ Emergency recovery script created')
    
    // 5. Update package.json with emergency script
    console.log('')
    console.log('📊 Step 5: Adding emergency scripts to package.json')
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    
    packageJson.scripts['emergency-schema-recovery'] = 'node scripts/emergency-schema-recovery.js'
    packageJson.scripts['deploy-safe'] = 'npm run validate-schema && npm run build && git push origin main'
    
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2))
    console.log('✅ Emergency scripts added to package.json')
    
    console.log('')
    console.log('🎯 SCHEMA PROTECTION SETUP COMPLETE!')
    console.log('')
    console.log('✅ Protection measures installed:')
    console.log('   - Pre-commit hook validates schema')
    console.log('   - GitHub Actions validates on push/PR')
    console.log('   - Vercel validates before build')
    console.log('   - Emergency recovery script ready')
    console.log('')
    console.log('🔧 Usage:')
    console.log('   - Normal deployment: npm run deploy-safe')
    console.log('   - Emergency recovery: npm run emergency-schema-recovery')
    console.log('   - Schema validation: npm run validate-schema')
    console.log('')
    console.log('🛡️ Schema drift protection is now active!')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

setupSchemaProtection()
