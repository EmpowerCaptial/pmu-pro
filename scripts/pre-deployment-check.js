#!/usr/bin/env node

/**
 * PRE-DEPLOYMENT VALIDATION
 * Ensures database consistency before deployment
 */

const { execSync } = require('child_process');
const DatabaseHealthMonitor = require('./database-health-monitor');

class PreDeploymentValidator {
  constructor() {
    this.criticalChecks = [
      'schema-consistency',
      'critical-user-data',
      'api-endpoints',
      'database-connection'
    ];
  }

  async runValidation() {
    console.log('🚀 PRE-DEPLOYMENT VALIDATION STARTING...');
    console.log('======================================');
    
    try {
      // Check 1: Run database health monitor
      console.log('\n📋 Running database health checks...');
      const monitor = new DatabaseHealthMonitor();
      await monitor.runHealthCheck();
      
      // Check 2: Validate critical files
      await this.validateCriticalFiles();
      
      // Check 3: Test build process
      await this.testBuild();
      
      // Check 4: Verify environment variables
      await this.verifyEnvironment();
      
      console.log('\n🎉 ALL PRE-DEPLOYMENT CHECKS PASSED!');
      console.log('✅ Safe to deploy to production');
      
    } catch (error) {
      console.error('\n❌ PRE-DEPLOYMENT VALIDATION FAILED!');
      console.error('🚫 DEPLOYMENT BLOCKED:', error.message);
      console.error('\n🔧 Fix the issues above before deploying!');
      process.exit(1);
    }
  }

  async validateCriticalFiles() {
    console.log('\n📁 Validating critical files...');
    
    const criticalFiles = [
      'lib/studio-supervision-gate.ts',
      'app/api/auth/login/route.ts',
      'app/api/clients/route.ts',
      'app/api/appointments/route.ts'
    ];
    
    for (const file of criticalFiles) {
      try {
        require('fs').accessSync(file);
        console.log(`  ✅ ${file} exists`);
      } catch (error) {
        console.log(`  ❌ ${file} missing`);
        throw new Error(`Critical file missing: ${file}`);
      }
    }
  }

  async testBuild() {
    console.log('\n🔨 Testing build process...');
    
    try {
      execSync('npm run build', { stdio: 'pipe' });
      console.log('  ✅ Build successful');
    } catch (error) {
      console.log('  ❌ Build failed');
      throw new Error('Build process failed');
    }
  }

  async verifyEnvironment() {
    console.log('\n🌍 Verifying environment...');
    
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'STRIPE_SECRET_KEY'
    ];
    
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        console.log(`  ✅ ${envVar} is set`);
      } else {
        console.log(`  ❌ ${envVar} missing`);
        throw new Error(`Environment variable missing: ${envVar}`);
      }
    }
  }
}

// Run validation
if (require.main === module) {
  const validator = new PreDeploymentValidator();
  validator.runValidation().catch(console.error);
}

module.exports = PreDeploymentValidator;
