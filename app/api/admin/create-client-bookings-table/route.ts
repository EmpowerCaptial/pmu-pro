import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// This endpoint creates the client_bookings table if it doesn't exist
// It's safe to run multiple times (uses IF NOT EXISTS)
export async function POST(request: NextRequest) {
  try {
    // Allow in production or with auth token
    const authHeader = request.headers.get('authorization')
    const adminSecret = process.env.ADMIN_SECRET || 'admin-secret'
    const isAuthorized = authHeader === `Bearer ${adminSecret}` || process.env.NODE_ENV === 'production'
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🚀 Creating client_bookings table...')

    // Step 1: Create the table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "client_bookings" (
        "id" TEXT NOT NULL,
        "clientName" TEXT NOT NULL,
        "bookingType" TEXT NOT NULL,
        "bookingDate" TIMESTAMP(3) NOT NULL,
        "procedureDate" TIMESTAMP(3) NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'scheduled',
        "isPromo" BOOLEAN NOT NULL DEFAULT false,
        "notes" TEXT,
        "contactId" TEXT,
        "staffId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "client_bookings_pkey" PRIMARY KEY ("id")
      );
    `)
    console.log('✅ Table created!')
    
    // Step 1.5: Add isPromo column if table exists but column doesn't
    try {
      const columnCheck = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'client_bookings' 
        AND column_name = 'isPromo'
      ` as any[]
      
      if (!columnCheck || columnCheck.length === 0) {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "client_bookings" 
          ADD COLUMN IF NOT EXISTS "isPromo" BOOLEAN NOT NULL DEFAULT false;
        `)
        console.log('✅ isPromo column added!')
      }
    } catch (error: any) {
      console.log('⚠️  isPromo column check:', error?.message?.substring(0, 60))
    }

    // Step 2: Create indexes
    const indexes = [
      `CREATE INDEX IF NOT EXISTS "client_bookings_bookingDate_idx" ON "client_bookings"("bookingDate");`,
      `CREATE INDEX IF NOT EXISTS "client_bookings_procedureDate_idx" ON "client_bookings"("procedureDate");`,
      `CREATE INDEX IF NOT EXISTS "client_bookings_status_idx" ON "client_bookings"("status");`,
      `CREATE INDEX IF NOT EXISTS "client_bookings_contactId_idx" ON "client_bookings"("contactId");`
    ]

    for (const idx of indexes) {
      try {
        await prisma.$executeRawUnsafe(idx)
        console.log('✅ Index created')
      } catch (error: any) {
        if (!error?.message?.includes('already exists')) {
          console.log('⚠️  Index creation:', error?.message?.substring(0, 60))
        }
      }
    }

    // Step 3: Add foreign keys
    try {
      const fkCheck1 = await prisma.$queryRaw`
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'client_bookings_contactId_fkey';
      ` as any[]

      if (!fkCheck1 || fkCheck1.length === 0) {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "client_bookings" 
          ADD CONSTRAINT "client_bookings_contactId_fkey" 
          FOREIGN KEY ("contactId") 
          REFERENCES "Contact"("id") 
          ON DELETE SET NULL 
          ON UPDATE CASCADE;
        `)
        console.log('✅ Foreign key (contactId) added')
      }
    } catch (error: any) {
      console.log('⚠️  Foreign key (contactId):', error?.message?.substring(0, 60))
    }

    try {
      const fkCheck2 = await prisma.$queryRaw`
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'client_bookings_staffId_fkey';
      ` as any[]

      if (!fkCheck2 || fkCheck2.length === 0) {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "client_bookings" 
          ADD CONSTRAINT "client_bookings_staffId_fkey" 
          FOREIGN KEY ("staffId") 
          REFERENCES "Staff"("id") 
          ON DELETE SET NULL 
          ON UPDATE CASCADE;
        `)
        console.log('✅ Foreign key (staffId) added')
      }
    } catch (error: any) {
      console.log('⚠️  Foreign key (staffId):', error?.message?.substring(0, 60))
    }

    // Step 4: Verify table exists
    const tableCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'client_bookings'
      ) as exists;
    ` as any[]

    if (tableCheck[0]?.exists) {
      const count = await prisma.clientBooking.count().catch(() => 0)
      return NextResponse.json({
        success: true,
        message: 'client_bookings table created successfully!',
        recordCount: count
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Table was not created successfully'
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('❌ Error creating table:', error)
    return NextResponse.json({
      success: false,
      error: error?.message || 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 })
  }
}

