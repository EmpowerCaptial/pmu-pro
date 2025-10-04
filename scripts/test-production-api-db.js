#!/usr/bin/env node

/**
 * Test production database connection from API perspective
 * This script simulates what the login API does
 */

const { PrismaClient } = require('@prisma/client');

async function testProductionApiDatabase() {
  console.log('🔍 TESTING PRODUCTION API DATABASE CONNECTION...');
  console.log('===============================================');
  
  // Use the same Prisma client as the API
  const prisma = new PrismaClient();
  
  try {
    console.log('📊 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    console.log('📊 Testing user lookup...');
    const user = await prisma.user.findUnique({
      where: { email: 'Tyronejackboy@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        businessName: true,
        selectedPlan: true,
        hasActiveSubscription: true,
        isLicenseVerified: true,
        role: true,
        studioName: true,
        createdAt: true
      }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:');
    console.log('- ID:', user.id);
    console.log('- Name:', user.name);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- Selected Plan:', user.selectedPlan);
    console.log('- Has Active Subscription:', user.hasActiveSubscription);
    console.log('- Is License Verified:', user.isLicenseVerified);
    console.log('- Business Name:', user.businessName);
    console.log('- Studio Name:', user.studioName);
    console.log('- Created At:', user.createdAt);
    
    console.log('');
    console.log('🔍 This is what the login API should return:');
    console.log(JSON.stringify({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        businessName: user.businessName,
        selectedPlan: user.selectedPlan,
        hasActiveSubscription: user.hasActiveSubscription,
        isLicenseVerified: user.isLicenseVerified,
        role: user.role,
        createdAt: user.createdAt
      }
    }, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testProductionApiDatabase();
