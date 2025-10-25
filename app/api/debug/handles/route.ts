import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateUserHandle } from '@/lib/booking'

export const dynamic = "force-dynamic"

// GET /api/debug/handles - Debug endpoint to show all users and their handles
export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        businessName: true
      }
    })

    const usersWithHandles = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      businessName: (user as any).businessName,
      generatedHandle: generateUserHandle((user as any).businessName, user.email)
    }))

    return NextResponse.json({ users: usersWithHandles })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
