const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkTable() {
  try {
    console.log('🔍 Checking if client_bookings table exists...')
    
    // Try to query the table structure
    const tableInfo = await prisma.$queryRaw`
      SELECT 
        column_name, 
        data_type, 
        is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'client_bookings'
      ORDER BY ordinal_position;
    `
    
    if (tableInfo && tableInfo.length > 0) {
      console.log('✅ Table EXISTS!')
      console.log('📊 Table structure:')
      tableInfo.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
      })
      
      // Check indexes
      const indexes = await prisma.$queryRaw`
        SELECT indexname, indexdef 
        FROM pg_indexes 
        WHERE tablename = 'client_bookings';
      `
      
      if (indexes && indexes.length > 0) {
        console.log('\n📌 Indexes:')
        indexes.forEach(idx => {
          console.log(`   - ${idx.indexname}`)
        })
      }
      
      // Check foreign keys
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
      
      if (foreignKeys && foreignKeys.length > 0) {
        console.log('\n🔗 Foreign Keys:')
        foreignKeys.forEach(fk => {
          console.log(`   - ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`)
        })
      }
      
      // Try a test query
      try {
        const count = await prisma.clientBooking.count()
        console.log(`\n✅ Table is accessible! Current record count: ${count}`)
      } catch (error) {
        console.log(`\n⚠️  Table exists but Prisma client may need regeneration: ${error.message}`)
      }
      
    } else {
      console.log('❌ Table does NOT exist!')
      console.log('📝 Run the migration script: node scripts/run-client-bookings-migration.js')
    }
    
  } catch (error) {
    console.error('❌ Error checking table:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkTable()
