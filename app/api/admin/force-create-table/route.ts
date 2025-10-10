import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = "force-dynamic"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { adminEmail } = await request.json()
    
    // Verify admin
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { role: true }
    })
    
    if (!admin || !['owner', 'admin'].includes(admin.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Use raw query with proper PostgreSQL syntax
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS service_assignments (
        id TEXT PRIMARY KEY DEFAULT ('cmg' || floor(random() * 1000000000)::text),
        "serviceId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        assigned BOOLEAN DEFAULT true,
        "assignedBy" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "service_assignments_serviceId_userId_key" 
      ON service_assignments("serviceId", "userId")
    `)

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "service_assignments_userId_idx" ON service_assignments("userId")
    `)

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "service_assignments_serviceId_idx" ON service_assignments("serviceId")
    `)

    // Test that it worked
    const testQuery = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM service_assignments`)
    
    return NextResponse.json({
      success: true,
      message: 'Table created successfully',
      tableExists: true,
      currentCount: (testQuery as any)[0]?.count || 0
    })

  } catch (error) {
    console.error('Error creating table:', error)
    return NextResponse.json({
      error: 'Failed to create table',
      details: error instanceof Error ? error.message : 'Unknown',
      hint: error instanceof Error && error.message.includes('permission denied') 
        ? 'Database user lacks CREATE TABLE permission. Contact Vercel/Neon support or use their dashboard.'
        : undefined
    }, { status: 500 })
  }
}

