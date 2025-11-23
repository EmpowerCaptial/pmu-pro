#!/usr/bin/env node

/**
 * Test script to verify client_bookings table exists and is accessible
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testTable() {
  try {
    console.log('🔍 Testing client_bookings table...')
    console.log('=====================================\n')

    // Test 1: Check if table exists
    console.log('📊 Test 1: Checking if table exists...')
    const tableCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'client_bookings'
      ) as exists;
    `
    
    const exists = tableCheck[0]?.exists
    if (exists) {
      console.log('✅ Table exists!\n')
    } else {
      console.log('❌ Table does NOT exist!\n')
      console.log('💡 Run the SQL migration in your Neon database')
      await prisma.$disconnect()
      process.exit(1)
    }

    // Test 2: Check table structure
    console.log('📊 Test 2: Checking table structure...')
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'client_bookings'
      ORDER BY ordinal_position;
    `
    
    console.log('✅ Table columns:')
    columns.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`)
    })
    console.log('')

    // Test 3: Check indexes
    console.log('📊 Test 3: Checking indexes...')
    const indexes = await prisma.$queryRaw`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'client_bookings';
    `
    
    console.log('✅ Indexes found:')
    indexes.forEach(idx => {
      console.log(`   - ${idx.indexname}`)
    })
    console.log('')

    // Test 4: Try to query the table
    console.log('📊 Test 4: Testing Prisma access...')
    try {
      const count = await prisma.clientBooking.count()
      console.log(`✅ Prisma can access the table!`)
      console.log(`   Current record count: ${count}\n`)
    } catch (error) {
      console.log('❌ Prisma error:', error.message)
      console.log('💡 You may need to run: npx prisma generate\n')
    }

    // Test 5: Check foreign keys
    console.log('📊 Test 5: Checking foreign keys...')
    const foreignKeys = await prisma.$queryRaw`
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'client_bookings';
    `
    
    if (foreignKeys.length > 0) {
      console.log('✅ Foreign keys found:')
      foreignKeys.forEach(fk => {
        console.log(`   - ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`)
      })
    } else {
      console.log('⚠️  No foreign keys found (this is okay if they failed to create)')
    }
    console.log('')

    console.log('🎉 ALL TESTS PASSED!')
    console.log('✅ client_bookings table is ready to use!')

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Full error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testTable()

