#!/usr/bin/env node

/**
 * Database Connection Verification Script
 * 
 * This script verifies that you're connected to the correct production database (Neon)
 * and displays all data counts to ensure data integrity.
 * 
 * Run this anytime you're unsure about your database connection:
 *   node scripts/verify-database-connection.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyDatabaseConnection() {
  console.log('\n🔍 DATABASE CONNECTION VERIFICATION');
  console.log('='.repeat(70));
  
  try {
    // Get connection info
    const dbUrl = process.env.DATABASE_URL || '';
    
    console.log('\n📊 Current Database:');
    
    if (dbUrl.includes('neon.tech')) {
      console.log('✅ CORRECT: Neon Database (Production)');
      console.log('   URL:', dbUrl.substring(0, 60) + '...');
    } else if (dbUrl.includes('prisma.io')) {
      console.log('⚠️  WARNING: Old Prisma.io Database (DEPRECATED)');
      console.log('   URL:', dbUrl.substring(0, 60) + '...');
      console.log('\n❌ ACTION REQUIRED:');
      console.log('   Update DATABASE_URL in .env.local to use NEON_DATABASE_URL');
      console.log('   The old Prisma.io database is no longer in use.');
      await prisma.$disconnect();
      process.exit(1);
    } else {
      console.log('❓ Unknown database');
      console.log('   URL:', dbUrl.substring(0, 60) + '...');
    }
    
    // Test connection
    console.log('\n🔌 Testing connection...');
    await prisma.$connect();
    console.log('✅ Connected successfully');
    
    // Count all data
    console.log('\n📈 Data Summary:');
    
    const users = await prisma.user.count();
    console.log('   👥 Users:', users);
    
    const services = await prisma.service.count();
    console.log('   📋 Services:', services);
    
    const clients = await prisma.client.count();
    console.log('   💼 Clients:', clients);
    
    const messages = await prisma.teamMessage.count();
    console.log('   💬 Team Messages:', messages);
    
    const appointments = await prisma.appointment.count();
    console.log('   📅 Appointments:', appointments);
    
    const deposits = await prisma.depositPayment.count();
    console.log('   💰 Deposit Payments:', deposits);
    
    const commissions = await prisma.commissionTransaction.count();
    console.log('   💵 Commission Transactions:', commissions);
    
    // Expected minimum counts
    console.log('\n📊 Data Validation:');
    
    if (users >= 5) {
      console.log('   ✅ Users: Expected 5, found', users);
    } else {
      console.log('   ⚠️  Users: Expected 5, found', users);
    }
    
    if (services >= 7) {
      console.log('   ✅ Services: Expected 7+, found', services);
    } else {
      console.log('   ⚠️  Services: Expected 7+, found', services);
    }
    
    if (clients >= 9) {
      console.log('   ✅ Clients: Expected 9+, found', clients);
    } else {
      console.log('   ⚠️  Clients: Expected 9+, found', clients);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ Database verification complete!\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nPlease check your DATABASE_URL in .env.local');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabaseConnection();
