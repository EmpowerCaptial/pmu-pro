#!/usr/bin/env node

/**
 * Fix production database directly
 * This script connects to the production database and updates Tyrone's user
 */

const { PrismaClient } = require('@prisma/client');

async function fixProductionDatabase() {
  // Use production database URL
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://neondb_owner:npg_GkIxgEB2sQO3@ep-muddy-sound-aepxhw40-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
      }
    }
  });
  
  try {
    console.log('🔧 FIXING PRODUCTION DATABASE...');
    console.log('=================================');
    
    // Find Tyrone's user
    const user = await prisma.user.findUnique({
      where: { email: 'Tyronejackboy@gmail.com' }
    });
    
    if (!user) {
      console.log('❌ User not found in production database');
      
      // List all users to see what's there
      const allUsers = await prisma.user.findMany({
        select: {
          email: true,
          name: true,
          role: true,
          selectedPlan: true
        }
      });
      
      console.log('📊 All users in production database:');
      allUsers.forEach((u, index) => {
        console.log(`${index + 1}. ${u.email} - ${u.name} - ${u.role} - ${u.selectedPlan}`);
      });
      
      return;
    }
    
    console.log('📊 Current user data:');
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

fixProductionDatabase();
