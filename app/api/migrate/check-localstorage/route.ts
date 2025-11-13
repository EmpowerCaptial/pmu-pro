import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

/**
 * GET /api/migrate/check-localstorage
 * 
 * This endpoint helps diagnose what's in localStorage by accepting the data from the client
 * and comparing it with what's in the database.
 */
export async function POST(request: NextRequest) {
  try {
    const ownerEmail = request.headers.get('x-user-email')
    if (!ownerEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const owner = await prisma.user.findUnique({
      where: { email: ownerEmail },
      select: { id: true, studioName: true, role: true }
    })

    if (!owner || !['owner', 'director', 'manager', 'admin'].includes(owner.role?.toLowerCase() || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { teamMembers = [] } = body

    // Get all users in the database for this studio
    const dbUsers = await prisma.user.findMany({
      where: {
        studioName: owner.studioName
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    const dbEmails = new Set(dbUsers.map(u => u.email?.toLowerCase()))

    // Find members in localStorage that aren't in database
    const membersToMigrate = teamMembers.filter((m: any) => {
      const email = m.email?.toLowerCase()
      return email && !dbEmails.has(email)
    })

    // Analyze by role
    const analysis = {
      localStorageTotal: teamMembers.length,
      databaseTotal: dbUsers.length,
      needsMigration: membersToMigrate.length,
      byRole: {} as Record<string, { localStorage: number; database: number; toMigrate: number }>
    }

    // Count by role
    teamMembers.forEach((m: any) => {
      const role = (m.role || 'unknown').toLowerCase()
      if (!analysis.byRole[role]) {
        analysis.byRole[role] = { localStorage: 0, database: 0, toMigrate: 0 }
      }
      analysis.byRole[role].localStorage++
    })

    dbUsers.forEach((u) => {
      const role = (u.role || 'unknown').toLowerCase()
      if (!analysis.byRole[role]) {
        analysis.byRole[role] = { localStorage: 0, database: 0, toMigrate: 0 }
      }
      analysis.byRole[role].database++
    })

    membersToMigrate.forEach((m: any) => {
      const role = (m.role || 'unknown').toLowerCase()
      if (!analysis.byRole[role]) {
        analysis.byRole[role] = { localStorage: 0, database: 0, toMigrate: 0 }
      }
      analysis.byRole[role].toMigrate++
    })

    return NextResponse.json({
      success: true,
      analysis,
      membersToMigrate: membersToMigrate.slice(0, 50), // Limit to first 50 for response size
      message: membersToMigrate.length > 0 
        ? `Found ${membersToMigrate.length} team members in localStorage that need to be migrated to database`
        : 'All team members are already in the database'
    })

  } catch (error) {
    console.error('Migration check error:', error)
    return NextResponse.json(
      { error: 'Failed to check localStorage data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

