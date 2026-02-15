import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { requireCrmUser } from '@/lib/server/crm-auth'

const CRM_MISSING_TABLE_MESSAGE = 'CRM database tables not found. Please run the CRM migrations.'

function safeStageSummary(contactCounts: { stage: string; _count: { stage: number } }[]): Record<string, number> {
  return contactCounts.reduce<Record<string, number>>((acc, item) => {
    acc[String(item.stage)] = item._count.stage
    return acc
  }, {})
}

function safeStatusSummary<T extends { status: string; _count: { status: number } }>(items: T[]): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[String(item.status)] = item._count.status
    return acc
  }, {})
}

export async function GET(request: NextRequest) {
  try {
    await requireCrmUser(request)

    const [contactResult, tourResult, taskResult, interactionResult] = await Promise.allSettled([
      prisma.contact.groupBy({
        by: ['stage'],
        _count: { stage: true }
      }),
      prisma.tour.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.task.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.interaction.aggregate({
        _count: { id: true },
        _max: { createdAt: true }
      })
    ])

    const contactCounts = contactResult.status === 'fulfilled' ? contactResult.value : []
    const tourCounts = tourResult.status === 'fulfilled' ? tourResult.value : []
    const taskCounts = taskResult.status === 'fulfilled' ? taskResult.value : []
    const interactionStats = interactionResult.status === 'fulfilled'
      ? interactionResult.value
      : { _count: { id: 0 }, _max: { createdAt: null as Date | null } }

    if (contactResult.status === 'rejected') {
      console.warn('CRM summary: contact groupBy failed', contactResult.reason)
    }
    if (tourResult.status === 'rejected') {
      console.warn('CRM summary: tour groupBy failed', tourResult.reason)
    }
    if (taskResult.status === 'rejected') {
      console.warn('CRM summary: task groupBy failed', taskResult.reason)
    }
    if (interactionResult.status === 'rejected') {
      console.warn('CRM summary: interaction aggregate failed', interactionResult.reason)
    }

    let enrollmentCount = 0
    let upcomingTours = 0
    try {
      enrollmentCount = await prisma.enrollment.count()
    } catch (e) {
      console.warn('CRM summary: enrollment count failed', e)
    }
    try {
      upcomingTours = await prisma.tour.count({ where: { status: 'SCHEDULED', start: { gte: new Date() } } })
    } catch (e) {
      console.warn('CRM summary: upcoming tours count failed', e)
    }

    const stageSummary = safeStageSummary(contactCounts)
    const lastActivityAt = interactionStats._max.createdAt
    const serializedLastActivity = lastActivityAt instanceof Date ? lastActivityAt.toISOString() : lastActivityAt

    return NextResponse.json({
      contactsByStage: stageSummary,
      toursByStatus: safeStatusSummary(tourCounts),
      tasksByStatus: safeStatusSummary(taskCounts),
      enrollments: enrollmentCount,
      upcomingTours,
      interactionSummary: {
        total: interactionStats._count.id,
        lastActivityAt: serializedLastActivity ?? null
      }
    })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2021') {
        console.error('CRM reports summary missing tables:', error)
        return NextResponse.json({ error: CRM_MISSING_TABLE_MESSAGE }, { status: 500 })
      }
      console.error('CRM reports summary Prisma error:', error.code, error.message)
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
    }
    const message = error instanceof Error ? error.message : 'Failed to load report summary'
    console.error('CRM reports summary GET error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
