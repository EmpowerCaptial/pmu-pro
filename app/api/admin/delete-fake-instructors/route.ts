import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { adminKey } = await request.json()
    
    // Simple admin key check
    if (adminKey !== 'delete-fakes-2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Finding fake instructor accounts...')
    
    // Find fake instructor emails
    const fakeEmails = [
      'sarah.johnson@example.com',
      'test-frontend-fix@example.com',
      'working-test@example.com',
      'mike.apprentice@example.com' // Also delete Mike Rodriguez (test account)
    ]
    
    const fakeUsers = await prisma.user.findMany({
      where: {
        email: { in: fakeEmails }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })
    
    console.log(`Found ${fakeUsers.length} fake users:`, fakeUsers.map(u => u.name))
    
    // Delete them
    const deleteResult = await prisma.user.deleteMany({
      where: {
        email: { in: fakeEmails }
      }
    })
    
    console.log(`✅ Deleted ${deleteResult.count} fake users`)
    
    // Verify deletion
    const remaining = await prisma.user.findMany({
      where: {
        studioName: 'Universal Beauty Studio Academy'
      },
      select: {
        name: true,
        email: true,
        role: true
      }
    })
    
    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.count,
      deletedUsers: fakeUsers.map(u => `${u.name} (${u.email})`),
      remainingUsers: remaining.map(u => `${u.name} (${u.email}) - ${u.role}`),
      message: `Deleted ${deleteResult.count} fake instructors from production database`
    })

  } catch (error: any) {
    console.error('Error deleting fake instructors:', error)
    return NextResponse.json({ 
      error: error.message,
      success: false
    }, { status: 500 })
  }
}

