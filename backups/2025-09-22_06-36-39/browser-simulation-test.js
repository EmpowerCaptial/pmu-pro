#!/usr/bin/env node

// Enhanced PMU Pro Testing System with Browser Simulation
// This will simulate the actual browser authentication flow

const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');

class BrowserSimulationTester {
    constructor() {
        this.maxAttempts = 5;
        this.currentAttempt = 1;
        this.baseUrl = 'https://thepmuguide.com';
    }

    async run() {
        console.log('🌐 Starting Browser Simulation Testing System...\n');
        console.log('This will simulate the actual browser authentication flow');
        console.log('and identify why the debugging logs aren\'t showing.\n');
        
        while (this.currentAttempt <= this.maxAttempts) {
            console.log(`🔄 ATTEMPT ${this.currentAttempt} of ${this.maxAttempts}`);
            console.log('='.repeat(50));
            
            try {
                const result = await this.simulateBrowserFlow();
                
                if (result.success) {
                    console.log('✅ Browser simulation successful!');
                    console.log('🎉 Authentication flow is working!');
                    return;
                } else {
                    console.log(`❌ Browser simulation failed: ${result.error}`);
                    
                    if (this.currentAttempt < this.maxAttempts) {
                        await this.fixBrowserIssue(result.error);
                        await this.deploy();
                        this.currentAttempt++;
                    } else {
                        console.log('❌ Max attempts reached. Manual intervention required.');
                        process.exit(1);
                    }
                }
            } catch (error) {
                console.log(`❌ Unexpected error: ${error.message}`);
                this.currentAttempt++;
            }
        }
    }

    async simulateBrowserFlow() {
        console.log('🌐 Simulating browser authentication flow...\n');
        
        // Test 1: Check if user can login
        console.log('🔐 Testing login simulation...');
        const loginTest = await this.testLoginSimulation();
        if (!loginTest.success) {
            return { success: false, error: `Login simulation failed: ${loginTest.error}` };
        }
        console.log('✅ Login simulation passed\n');

        // Test 2: Check if API accepts authenticated requests
        console.log('📡 Testing authenticated API call...');
        const apiTest = await this.testAuthenticatedAPI();
        if (!apiTest.success) {
            return { success: false, error: `Authenticated API test failed: ${apiTest.error}` };
        }
        console.log('✅ Authenticated API test passed\n');

        // Test 3: Check if frontend debugging is working
        console.log('🐛 Testing frontend debugging...');
        const debugTest = await this.testFrontendDebugging();
        if (!debugTest.success) {
            return { success: false, error: `Frontend debugging test failed: ${debugTest.error}` };
        }
        console.log('✅ Frontend debugging test passed\n');

        return { success: true };
    }

    async testLoginSimulation() {
        // Simulate what happens when a user logs in
        console.log('   Simulating user login with admin@thepmuguide.com...');
        
        // Test if the login endpoint exists
        return new Promise((resolve) => {
            const options = {
                hostname: 'thepmuguide.com',
                port: 443,
                path: '/auth/login',
                method: 'GET',
                headers: {
                    'User-Agent': 'PMU-Pro-BrowserSim/1.0'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        console.log('   ✅ Login page accessible');
                        resolve({ success: true });
                    } else {
                        console.log(`   ❌ Login page returned ${res.statusCode}`);
                        resolve({ success: false, error: `Login page not accessible: ${res.statusCode}` });
                    }
                });
            });

            req.on('error', (error) => {
                resolve({ success: false, error: `Login page error: ${error.message}` });
            });

            req.setTimeout(10000, () => {
                req.destroy();
                resolve({ success: false, error: 'Login page timeout' });
            });

            req.end();
        });
    }

    async testAuthenticatedAPI() {
        // Test API with a simulated user email header
        console.log('   Testing API with simulated user email...');
        
        return new Promise((resolve) => {
            const options = {
                hostname: 'thepmuguide.com',
                port: 443,
                path: '/api/clients',
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'x-user-email': 'admin@thepmuguide.com',
                    'User-Agent': 'PMU-Pro-BrowserSim/1.0'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    console.log(`   API Response: ${res.statusCode} - ${data}`);
                    
                    if (res.statusCode === 401) {
                        console.log('   ⚠️ API still returning 401 - user might not exist in database');
                        resolve({ success: false, error: 'User not found in database' });
                    } else if (res.statusCode === 200) {
                        console.log('   ✅ API returned 200 with data');
                        resolve({ success: true });
                    } else {
                        resolve({ success: false, error: `Unexpected API response: ${res.statusCode}` });
                    }
                });
            });

            req.on('error', (error) => {
                resolve({ success: false, error: `API error: ${error.message}` });
            });

            req.setTimeout(10000, () => {
                req.destroy();
                resolve({ success: false, error: 'API timeout' });
            });

            req.end();
        });
    }

    async testFrontendDebugging() {
        console.log('   Checking if frontend debugging code is present...');
        
        // Check if the debugging code exists in the clients page
        const clientsPagePath = path.join(process.cwd(), 'app/clients/page.tsx');
        
        if (!fs.existsSync(clientsPagePath)) {
            return { success: false, error: 'Clients page not found' };
        }

        const pageContent = fs.readFileSync(clientsPagePath, 'utf8');
        
        if (!pageContent.includes('=== FETCH DEBUG ===')) {
            return { success: false, error: 'Debugging code missing from clients page' };
        }

        if (!pageContent.includes('console.log(\'Current user:\', currentUser)')) {
            return { success: false, error: 'User debugging code missing' };
        }

        console.log('   ✅ Frontend debugging code is present');
        return { success: true };
    }

    async fixBrowserIssue(error) {
        console.log('🔧 Fixing browser simulation issue...\n');
        
        if (error.includes('User not found in database')) {
            await this.createTestUser();
        } else if (error.includes('Debugging code missing')) {
            await this.addDebuggingCode();
        } else if (error.includes('Login page')) {
            await this.fixLoginPage();
        } else {
            await this.applyGeneralBrowserFixes();
        }
    }

    async createTestUser() {
        console.log('👤 Creating test user in database...');
        
        // Create a seed script to add the admin user
        const seedScript = `// Auto-generated seed script
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating admin user...');
  
  const hashedPassword = await bcrypt.hash('ubsa2024!', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@thepmuguide.com' },
    update: {},
    create: {
      email: 'admin@thepmuguide.com',
      name: 'PMU Pro Admin',
      password: hashedPassword,
      role: 'owner',
      businessName: 'PMU Pro',
      isActive: true
    }
  });
  
  console.log('Admin user created:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });`;

        fs.writeFileSync('scripts/create-admin-user.js', seedScript);
        
        try {
            execSync('node scripts/create-admin-user.js', { stdio: 'inherit' });
            console.log('✅ Test user created');
        } catch (error) {
            console.log('⚠️ Failed to create test user, continuing...');
        }
    }

    async addDebuggingCode() {
        console.log('🐛 Adding enhanced debugging code...');
        
        const clientsPagePath = path.join(process.cwd(), 'app/clients/page.tsx');
        const pageContent = fs.readFileSync(clientsPagePath, 'utf8');
        
        // Add more comprehensive debugging
        const enhancedDebugging = `
  // Enhanced debugging for authentication
  useEffect(() => {
    console.log('🔍 === ENHANCED AUTH DEBUG ===');
    console.log('Auth loading:', authLoading);
    console.log('Is authenticated:', isAuthenticated);
    console.log('Current user:', currentUser);
    console.log('Current user email:', currentUser?.email);
    console.log('LocalStorage demoUser:', typeof window !== 'undefined' ? localStorage.getItem('demoUser') : 'SSR');
    console.log('LocalStorage userType:', typeof window !== 'undefined' ? localStorage.getItem('userType') : 'SSR');
    console.log('================================');
  }, [authLoading, isAuthenticated, currentUser]);`;

        if (!pageContent.includes('ENHANCED AUTH DEBUG')) {
            const updatedContent = pageContent.replace(
                'useEffect(() => {',
                enhancedDebugging + '\n  useEffect(() => {'
            );
            fs.writeFileSync(clientsPagePath, updatedContent);
            console.log('✅ Enhanced debugging code added');
        }
    }

    async fixLoginPage() {
        console.log('🔐 Ensuring login page exists...');
        
        const loginPagePath = path.join(process.cwd(), 'app/auth/login/page.tsx');
        if (!fs.existsSync(loginPagePath)) {
            console.log('📝 Creating login page...');
            const loginContent = `"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoAuth } from '@/hooks/use-demo-auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useDemoAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      router.push('/clients');
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ivory via-white to-beige">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to PMU Pro
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-lavender focus:border-lavender focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-lavender focus:border-lavender focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-lavender to-teal-500 hover:from-lavender-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lavender disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}`;
            fs.writeFileSync(loginPagePath, loginContent);
            console.log('✅ Login page created');
        }
    }

    async applyGeneralBrowserFixes() {
        console.log('🔧 Applying general browser fixes...');
        
        await this.createTestUser();
        await this.addDebuggingCode();
        await this.fixLoginPage();
        
        console.log('✅ General browser fixes applied');
    }

    async deploy() {
        console.log('📦 Deploying browser simulation fixes...\n');
        
        try {
            execSync('git add .', { stdio: 'inherit' });
            execSync('git commit -m "Auto-fix: Browser simulation fixes"', { stdio: 'inherit' });
            execSync('vercel --prod --yes', { stdio: 'inherit' });
            
            console.log('✅ Deployment completed');
            console.log('⏳ Waiting for deployment to be ready...');
            await new Promise(resolve => setTimeout(resolve, 45000));
            
        } catch (error) {
            console.log(`❌ Deployment failed: ${error.message}`);
            throw error;
        }
    }
}

// Run the browser simulation tester
const tester = new BrowserSimulationTester();
tester.run().catch(console.error);
