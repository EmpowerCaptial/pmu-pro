import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { adminEmail } = await request.json()
    
    if (!adminEmail) {
      return NextResponse.json({ error: 'Admin email required' }, { status: 400 })
    }
    
    // Verify admin
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { role: true }
    })
    
    if (!admin || !['owner', 'admin'].includes(admin.role)) {
      return NextResponse.json({ error: 'Unauthorized - admin only' }, { status: 403 })
    }

    const results = []

    // Create service_assignments table using raw SQL
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS service_assignments (
          id VARCHAR PRIMARY KEY,
          "serviceId" VARCHAR NOT NULL,
          "userId" VARCHAR NOT NULL,
          assigned BOOLEAN DEFAULT true,
          "assignedBy" VARCHAR NOT NULL,
          "createdAt" TIMESTAMP DEFAULT NOW(),
          "updatedAt" TIMESTAMP DEFAULT NOW(),
          CONSTRAINT "service_assignments_serviceId_userId_key" UNIQUE ("serviceId", "userId")
        )
      `
      results.push('✅ Created service_assignments table')
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        results.push('ℹ️ service_assignments table already exists')
      } else {
        throw error
      }
    }

    // Create indexes
    try {
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "service_assignments_userId_idx" ON service_assignments("userId")
      `
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "service_assignments_serviceId_idx" ON service_assignments("serviceId")
      `
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "service_assignments_assignedBy_idx" ON service_assignments("assignedBy")
      `
      results.push('✅ Created indexes')
    } catch (error) {
      results.push('ℹ️ Indexes may already exist')
    }

    // Add foreign key constraints
    try {
      await prisma.$executeRaw`
        ALTER TABLE service_assignments
        ADD CONSTRAINT IF NOT EXISTS "service_assignments_serviceId_fkey" 
        FOREIGN KEY ("serviceId") REFERENCES services(id) ON DELETE CASCADE
      `
      results.push('✅ Added service foreign key')
    } catch (error) {
      results.push('ℹ️ Service foreign key may already exist')
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE service_assignments
        ADD CONSTRAINT IF NOT EXISTS "service_assignments_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
      `
      results.push('✅ Added user foreign key')
    } catch (error) {
      results.push('ℹ️ User foreign key may already exist')
    }

    try {
      await prisma.$executeRaw`
        ALTER TABLE service_assignments
        ADD CONSTRAINT IF NOT EXISTS "service_assignments_assignedBy_fkey" 
        FOREIGN KEY ("assignedBy") REFERENCES users(id) ON DELETE CASCADE
      `
      results.push('✅ Added assignedBy foreign key')
    } catch (error) {
      results.push('ℹ️ AssignedBy foreign key may already exist')
    }

    return NextResponse.json({
      success: true,
      message: 'Database setup complete',
      results
    })

  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json({
      error: 'Database setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

