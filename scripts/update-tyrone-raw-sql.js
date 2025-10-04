#!/usr/bin/env node

/**
 * Update Tyrone's role using raw SQL to avoid schema issues
 */

const { PrismaClient } = require('@prisma/client');

async function updateTyroneRawSQL() {
  // Use the ACTUAL production database URL that the API uses
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgres://5890c2e407a85b65bf7dc0b6b8713ba23b23197329c65c44bcd9b99cbf6b1db3:sk_tY0xAe_zsUcKhA6HPxSz2@db.prisma.io:5432/postgres?sslmode=require"
      }
    }
  });
  
  try {
    console.log('🔧 UPDATING TYRONE WITH RAW SQL...');
    console.log('=================================');
    
    // First, let's check current data
    const currentData = await prisma.$queryRaw`
      SELECT id, email, name, role, "selectedPlan", "hasActiveSubscription", "isLicenseVerified", "businessName", "studioName"
      FROM users 
      WHERE email = 'Tyronejackboy@gmail.com'
    `;
    
    console.log('📊 Current data:', currentData);
    
    // Update using raw SQL
    const updateResult = await prisma.$executeRaw`
      UPDATE users 
      SET role = 'owner', "studioName" = 'Universal Beauty Studio Academy'
      WHERE email = 'Tyronejackboy@gmail.com'
    `;
    
    console.log('✅ Update result:', updateResult);
    
    // Verify the update
    const updatedData = await prisma.$queryRaw`
      SELECT id, email, name, role, "selectedPlan", "hasActiveSubscription", "isLicenseVerified", "businessName", "studioName"
      FROM users 
      WHERE email = 'Tyronejackboy@gmail.com'
    `;
    
    console.log('🔍 Updated data:', updatedData);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

updateTyroneRawSQL();
