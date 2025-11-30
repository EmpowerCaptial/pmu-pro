const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addIsPromoColumn() {
  try {
    console.log('🚀 Adding isPromo column to client_bookings table...')
    
    // Check if column already exists
    const checkColumn = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'client_bookings' 
      AND column_name = 'isPromo'
    `
    
    if (Array.isArray(checkColumn) && checkColumn.length > 0) {
      console.log('✅ isPromo column already exists')
      return
    }
    
    // Add the column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "client_bookings" 
      ADD COLUMN IF NOT EXISTS "isPromo" BOOLEAN NOT NULL DEFAULT false;
    `)
    
    console.log('✅ isPromo column added successfully!')
    
  } catch (error) {
    console.error('❌ Error adding isPromo column:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

addIsPromoColumn()
  .then(() => {
    console.log('✅ Migration completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  })

