import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCrmUser } from '@/lib/server/crm-auth'

export async function GET(request: NextRequest) {
  try {
    await requireCrmUser(request)
    const limit = Number(request.nextUrl.searchParams.get('limit') ?? '50')

    const interactions = await prisma.interaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 200),
      include: {
        contact: {
          select: { id: true, firstName: true, lastName: true, email: true, stage: true }
        },
        staff: true
      }
    })

    return NextResponse.json({ interactions })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('CRM interactions GET error:', error)
    return NextResponse.json({ error: 'Failed to load interactions' }, { status: 500 })
  }
}
