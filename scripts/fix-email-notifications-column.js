#!/usr/bin/env node

/**
 * Fix emailNotifications column issue in production database
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixEmailNotificationsColumn() {
  try {
    console.log('🔧 FIXING EMAIL NOTIFICATIONS COLUMN...')
    console.log('=====================================\n')

    // Check if column exists
    console.log('📊 Step 1: Checking if emailNotifications column exists')
    const columnExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'emailNotifications'
      );
    `
    
    const exists = columnExists[0].exists
    console.log('📊 emailNotifications column exists:', exists)

    if (!exists) {
      console.log('\n🔧 Step 2: Adding emailNotifications column')
      
      // Add the column with default value
      await prisma.$executeRaw`
        ALTER TABLE users 
        ADD COLUMN "emailNotifications" JSONB 
        DEFAULT '{"subscription": true, "payments": true, "settings": true}'::jsonb;
      `
      
      console.log('✅ emailNotifications column added successfully')
      
      // Update existing users with default notifications
      console.log('\n📊 Step 3: Updating existing users with default notifications')
      const result = await prisma.$executeRaw`
        UPDATE users 
        SET "emailNotifications" = '{"subscription": true, "payments": true, "settings": true}'::jsonb
        WHERE "emailNotifications" IS NULL;
      `
      
      console.log(`✅ Updated ${result} users with default email notifications`)
      
    } else {
      console.log('✅ emailNotifications column already exists')
    }

    // Test the fix
    console.log('\n🧪 Step 4: Testing user creation with emailNotifications')
    try {
      const testUser = await prisma.user.create({
        data: {
          email: 'test-email-notifications@example.com',
          name: 'Test Email Notifications',
          password: 'hashedpassword123',
          role: 'artist',
          selectedPlan: 'starter',
          hasActiveSubscription: false,
          isLicenseVerified: false,
          businessName: 'Test Business',
          studioName: 'Test Studio',
          licenseNumber: 'TEST123',
          licenseState: 'CA'
        },
        select: {
          id: true,
          email: true,
          emailNotifications: true
        }
      })
      
      console.log('✅ Test user created successfully:', testUser)
      
      // Clean up
      await prisma.user.delete({
        where: { id: testUser.id }
      })
      console.log('✅ Test user cleaned up')
      
    } catch (testError) {
      console.error('❌ Test user creation failed:', testError)
      throw testError
    }

    console.log('\n🎯 EMAIL NOTIFICATIONS COLUMN FIX COMPLETE!')
    console.log('✅ Column exists and user creation works')
    console.log('✅ Instructor invitations should now work')

  } catch (error) {
    console.error('❌ Failed to fix emailNotifications column:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the fix
fixEmailNotificationsColumn()
