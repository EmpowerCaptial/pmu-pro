import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCrmUser } from '@/lib/server/crm-auth'

export async function GET(request: NextRequest) {
  try {
    await requireCrmUser(request)
    const search = request.nextUrl.searchParams.get('q')?.toLowerCase() ?? ''
    const stageFilter = request.nextUrl.searchParams.get('stage')

    const contacts = await prisma.contact.findMany({
      where: {
        ...(stageFilter ? { stage: stageFilter } : {}),
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                { source: { contains: search, mode: 'insensitive' } }
              ]
            }
          : {})
      },
      include: {
        owner: true,
        tasks: {
          select: { id: true, status: true },
          where: { status: { not: 'DONE' } }
        },
        interactions: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { id: true, type: true, direction: true, subject: true, createdAt: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ contacts })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('CRM contacts GET error:', error)
    return NextResponse.json({ error: 'Failed to load contacts' }, { status: 500 })
  }
}
