#!/usr/bin/env node

/**
 * DATABASE HEALTH MONITOR
 * Prevents database discrepancies and monitors schema consistency
 */

const { PrismaClient } = require('@prisma/client');
const https = require('https');

class DatabaseHealthMonitor {
  constructor() {
    this.prisma = new PrismaClient();
    this.criticalTables = ['users', 'clients', 'appointments', 'services'];
    this.requiredUserFields = [
      'id', 'name', 'email', 'password', 'businessName', 'phone',
      'licenseNumber', 'licenseState', 'yearsExperience', 'selectedPlan',
      'licenseFile', 'insuranceFile', 'hasActiveSubscription', 'isLicenseVerified',
      'role', 'stripeId', 'stripeCustomerId', 'stripeSubscriptionId',
      'subscriptionStatus', 'createdAt', 'updatedAt', 'address', 'avatar',
      'bio', 'businessHours', 'cashAppUsername', 'certifications',
      'experience', 'instagram', 'specialties', 'stripeConnectAccountId',
      'studioName', 'venmoUsername', 'website', 'emailNotifications'
    ];
  }

  async runHealthCheck() {
    console.log('🔍 DATABASE HEALTH MONITOR STARTING...');
    console.log('=====================================');
    
    try {
      // Check 1: Schema Validation
      await this.validateSchema();
      
      // Check 2: Critical User Data
      await this.validateCriticalUsers();
      
      // Check 3: API Endpoint Health
      await this.testAPIEndpoints();
      
      // Check 4: Database Connection Health
      await this.checkConnectionHealth();
      
      console.log('\n✅ ALL HEALTH CHECKS PASSED!');
      console.log('Database is healthy and consistent.');
      
    } catch (error) {
      console.error('\n❌ HEALTH CHECK FAILED:', error.message);
      console.error('IMMEDIATE ATTENTION REQUIRED!');
      process.exit(1);
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async validateSchema() {
    console.log('\n📋 STEP 1: Validating Database Schema...');
    
    for (const field of this.requiredUserFields) {
      try {
        await this.prisma.$queryRaw`SELECT ${field} FROM users LIMIT 1`;
        console.log(`  ✅ Field '${field}' exists`);
      } catch (error) {
        console.log(`  ❌ Field '${field}' MISSING:`, error.message);
        throw new Error(`Schema mismatch: Missing field '${field}'`);
      }
    }
    
    console.log('  ✅ All required fields present');
  }

  async validateCriticalUsers() {
    console.log('\n👤 STEP 2: Validating Critical User Data...');
    
    const criticalUsers = [
      { email: 'Tyronejackboy@gmail.com', expectedRole: 'owner' },
      { email: 'admin@universalbeautystudio.com', expectedRole: 'admin' }
    ];
    
    for (const user of criticalUsers) {
      try {
        const dbUser = await this.prisma.user.findUnique({
          where: { email: user.email },
          select: {
            email: true,
            role: true,
            selectedPlan: true,
            hasActiveSubscription: true,
            isLicenseVerified: true
          }
        });
        
        if (!dbUser) {
          console.log(`  ❌ User '${user.email}' NOT FOUND`);
          throw new Error(`Critical user missing: ${user.email}`);
        }
        
        if (dbUser.role !== user.expectedRole) {
          console.log(`  ❌ User '${user.email}' has wrong role: ${dbUser.role} (expected: ${user.expectedRole})`);
          throw new Error(`Role mismatch for ${user.email}`);
        }
        
        console.log(`  ✅ User '${user.email}' validated: role=${dbUser.role}, plan=${dbUser.selectedPlan}`);
        
      } catch (error) {
        if (error.message.includes('missing') || error.message.includes('wrong role')) {
          throw error;
        }
        console.log(`  ❌ Error validating user '${user.email}':`, error.message);
        throw new Error(`User validation failed for ${user.email}`);
      }
    }
  }

  async testAPIEndpoints() {
    console.log('\n🌐 STEP 3: Testing API Endpoint Health...');
    
    const endpoints = [
      { path: '/api/auth/login', method: 'POST', requiresAuth: false },
      { path: '/api/clients', method: 'GET', requiresAuth: true },
      { path: '/api/appointments', method: 'GET', requiresAuth: true }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await this.makeAPIRequest(endpoint);
        if (response.status >= 200 && response.status < 400) {
          console.log(`  ✅ ${endpoint.method} ${endpoint.path} - Status: ${response.status}`);
        } else {
          console.log(`  ❌ ${endpoint.method} ${endpoint.path} - Status: ${response.status}`);
          throw new Error(`API endpoint failing: ${endpoint.path}`);
        }
      } catch (error) {
        console.log(`  ❌ ${endpoint.method} ${endpoint.path} - Error: ${error.message}`);
        throw new Error(`API endpoint error: ${endpoint.path}`);
      }
    }
  }

  async checkConnectionHealth() {
    console.log('\n🔌 STEP 4: Checking Database Connection Health...');
    
    try {
      // Test basic query
      const userCount = await this.prisma.user.count();
      console.log(`  ✅ Database connected - ${userCount} users found`);
      
      // Test complex query
      const activeUsers = await this.prisma.user.findMany({
        where: { hasActiveSubscription: true },
        select: { email: true, role: true, selectedPlan: true }
      });
      console.log(`  ✅ Complex queries working - ${activeUsers.length} active users`);
      
    } catch (error) {
      console.log(`  ❌ Database connection issue:`, error.message);
      throw new Error('Database connection unhealthy');
    }
  }

  makeAPIRequest(endpoint) {
    return new Promise((resolve, reject) => {
      const postData = endpoint.method === 'POST' ? JSON.stringify({
        email: 'Tyronejackboy@gmail.com',
        password: 'Tyronej22!'
      }) : null;
      
      const options = {
        hostname: 'thepmuguide.com',
        port: 443,
        path: endpoint.path,
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (endpoint.requiresAuth) {
        options.headers['x-user-email'] = 'Tyronejackboy@gmail.com';
      }
      
      if (postData) {
        options.headers['Content-Length'] = Buffer.byteLength(postData);
      }
      
      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          resolve({ status: res.statusCode, data: responseData });
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  }
}

// Run the health check
if (require.main === module) {
  const monitor = new DatabaseHealthMonitor();
  monitor.runHealthCheck().catch(console.error);
}

module.exports = DatabaseHealthMonitor;
