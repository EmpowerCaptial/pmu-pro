#!/usr/bin/env node

/**
 * Fix production user role and studio name
 * This script directly updates the production database
 */

const { PrismaClient } = require('@prisma/client');

async function fixProductionUser() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 FIXING PRODUCTION USER...');
    console.log('============================');
    
    // Find Tyrone's user
    const user = await prisma.user.findUnique({
      where: { email: 'Tyronejackboy@gmail.com' }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('📊 Current user data:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- Studio Name:', user.studioName);
    
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
  } finally {
    await prisma.$disconnect();
  }
}

fixProductionUser();
