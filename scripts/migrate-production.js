const { PrismaClient } = require('@prisma/client');

async function migrateProduction() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  try {
    console.log('🔄 Running production database migration...');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

    // Run raw SQL to add missing columns
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN
        -- Add venmoUsername if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='users' AND column_name='venmoUsername'
        ) THEN
          ALTER TABLE users ADD COLUMN "venmoUsername" TEXT;
          RAISE NOTICE 'Added venmoUsername column';
        ELSE
          RAISE NOTICE 'venmoUsername column already exists';
        END IF;

        -- Add cashAppUsername if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='users' AND column_name='cashAppUsername'
        ) THEN
          ALTER TABLE users ADD COLUMN "cashAppUsername" TEXT;
          RAISE NOTICE 'Added cashAppUsername column';
        ELSE
          RAISE NOTICE 'cashAppUsername column already exists';
        END IF;

        -- Add stripeConnectAccountId if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='users' AND column_name='stripeConnectAccountId'
        ) THEN
          ALTER TABLE users ADD COLUMN "stripeConnectAccountId" TEXT UNIQUE;
          RAISE NOTICE 'Added stripeConnectAccountId column';
        ELSE
          RAISE NOTICE 'stripeConnectAccountId column already exists';
        END IF;
      END $$;
    `);

    console.log('✅ Migration completed successfully!');
    
    // Verify columns exist
    const result = await prisma.$queryRawUnsafe(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('venmoUsername', 'cashAppUsername', 'stripeConnectAccountId')
      ORDER BY column_name;
    `);
    
    console.log('✅ Verified columns:', result);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateProduction()
  .then(() => {
    console.log('🎉 Migration complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration error:', error);
    process.exit(1);
  });

