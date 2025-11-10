import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCrmUser } from '@/lib/server/crm-auth'

export async function GET(request: NextRequest) {
  try {
    const { staffRecord } = await requireCrmUser(request)
    const statusFilter = request.nextUrl.searchParams.get('status')
    const scope = request.nextUrl.searchParams.get('scope') ?? 'mine'

    const whereClause: any = {
      ...(statusFilter ? { status: statusFilter } : {})
    }

    if (scope === 'mine') {
      whereClause.ownerId = staffRecord.id
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: { dueAt: 'asc' },
      include: {
        contact: {
          select: { id: true, firstName: true, lastName: true, stage: true }
        }
      }
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('CRM tasks GET error:', error)
    return NextResponse.json({ error: 'Failed to load tasks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { staffRecord } = await requireCrmUser(request)
    const body = await request.json()
    const { title, dueAt, contactId } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const task = await prisma.task.create({
      data: {
        title,
        dueAt: dueAt ? new Date(dueAt) : undefined,
        status: 'OPEN',
        contactId: contactId || undefined,
        ownerId: staffRecord.id
      }
    })

    return NextResponse.json({ success: true, task })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('CRM tasks POST error:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
