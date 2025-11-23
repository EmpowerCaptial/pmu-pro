#!/usr/bin/env node

// Quick database connection check with timeout
const { PrismaClient } = require('@prisma/client')

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL

console.log('🔍 Database Connection Diagnostic')
console.log('=====================================')
console.log(`DATABASE_URL set: ${DATABASE_URL ? '✅ Yes' : '❌ No'}`)
if (DATABASE_URL) {
  // Mask password in URL for display
  const maskedUrl = DATABASE_URL.replace(/:[^:@]+@/, ':****@')
  console.log(`Database URL: ${maskedUrl.substring(0, 80)}...`)
}

if (!DATABASE_URL) {
  console.log('\n❌ ERROR: DATABASE_URL is not set!')
  console.log('Please set DATABASE_URL or NEON_DATABASE_URL in your environment.')
  process.exit(1)
}

console.log('\n⏳ Attempting to connect (5 second timeout)...')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
})

// Set a timeout
const timeout = setTimeout(async () => {
  console.log('\n❌ Connection timeout after 5 seconds')
  console.log('This usually means:')
  console.log('  1. Database is not accessible from your network')
  console.log('  2. Database URL is incorrect')
  console.log('  3. Firewall/network blocking the connection')
  await prisma.$disconnect()
  process.exit(1)
}, 5000)

async function testConnection() {
  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1 as test`
    clearTimeout(timeout)
    console.log('✅ Database connection successful!')
    
    // Check if client_bookings table exists
    try {
      const tableCheck = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'client_bookings'
        ) as exists;
      `
      const exists = tableCheck[0]?.exists
      console.log(`\n📊 client_bookings table: ${exists ? '✅ Exists' : '❌ Missing'}`)
      
      if (!exists) {
        console.log('\n💡 To create the table, you can:')
        console.log('   1. Run: npx prisma migrate deploy')
        console.log('   2. Or call: POST /api/admin/create-client-bookings-table')
      } else {
        // Try to count records
        try {
          const count = await prisma.clientBooking.count()
          console.log(`   Records: ${count}`)
        } catch (err) {
          console.log(`   ⚠️  Prisma model not accessible: ${err.message}`)
          console.log('   💡 Try: npx prisma generate')
        }
      }
    } catch (err) {
      console.log(`\n⚠️  Could not check table: ${err.message}`)
    }
    
    await prisma.$disconnect()
    process.exit(0)
  } catch (error) {
    clearTimeout(timeout)
    console.log(`\n❌ Connection failed: ${error.message}`)
    await prisma.$disconnect()
    process.exit(1)
  }
}

testConnection()

