#!/usr/bin/env node

/**
 * Fix the CORRECT production database that the API actually uses
 */

const { PrismaClient } = require('@prisma/client');

async function fixCorrectProductionDatabase() {
  // Use the ACTUAL production database URL that the API uses
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgres://5890c2e407a85b65bf7dc0b6b8713ba23b23197329c65c44bcd9b99cbf6b1db3:sk_tY0xAe_zsUcKhA6HPxSz2@db.prisma.io:5432/postgres?sslmode=require"
      }
    }
  });
  
  try {
    console.log('🔧 FIXING CORRECT PRODUCTION DATABASE...');
    console.log('=======================================');
    
    // First, let's see what users exist in this database
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        selectedPlan: true,
        hasActiveSubscription: true,
        isLicenseVerified: true,
        businessName: true,
        studioName: true
      }
    });
    
    console.log('📊 All users in CORRECT production database:');
    allUsers.forEach((u, index) => {
      console.log(`${index + 1}. ${u.email}`);
      console.log(`   - Name: ${u.name}`);
      console.log(`   - Role: ${u.role}`);
      console.log(`   - Plan: ${u.selectedPlan}`);
      console.log(`   - Active: ${u.hasActiveSubscription}`);
      console.log(`   - License: ${u.isLicenseVerified}`);
      console.log(`   - Business: ${u.businessName}`);
      console.log(`   - Studio: ${u.studioName}`);
      console.log('');
    });
    
    // Find Tyrone's user (avoid schema issues by selecting specific fields)
    const user = await prisma.user.findUnique({
      where: { email: 'Tyronejackboy@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        selectedPlan: true,
        hasActiveSubscription: true,
        isLicenseVerified: true,
        businessName: true,
        studioName: true
      }
    });
    
    if (!user) {
      console.log('❌ Tyrone not found in this database');
      console.log('🔧 Need to create or find the correct user');
      return;
    }
    
    console.log('📊 Current Tyrone data:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Name:', user.name);
    console.log('- Role:', user.role);
    console.log('- Selected Plan:', user.selectedPlan);
    console.log('- Studio Name:', user.studioName);
    console.log('- Business Name:', user.businessName);
    
    // Update the user
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        role: 'owner',
        studioName: 'Universal Beauty Studio Academy'
      }
    });
    
    console.log('✅ User updated successfully:');
    console.log('- Role:', updated.role);
    console.log('- Studio Name:', updated.studioName);
    
    // Verify the update
    const verification = await prisma.user.findUnique({
      where: { email: 'Tyronejackboy@gmail.com' }
    });
    
    console.log('🔍 Verification:');
    console.log('- Role:', verification.role);
    console.log('- Studio Name:', verification.studioName);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

fixCorrectProductionDatabase();
