import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCrmUser } from '@/lib/server/crm-auth'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { staffRecord } = await requireCrmUser(request)
    const taskId = params.id
    const body = await request.json()
    const { status, dueAt } = body

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: status || undefined,
        dueAt: dueAt ? new Date(dueAt) : undefined,
        ownerId: staffRecord.id
      }
    })

    return NextResponse.json({ success: true, task })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    console.error('CRM task PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}
