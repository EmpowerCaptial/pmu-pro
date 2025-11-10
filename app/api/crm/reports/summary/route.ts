import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { requireCrmUser } from '@/lib/server/crm-auth'

const CRM_MISSING_TABLE_MESSAGE = 'CRM database tables not found. Please run the CRM migrations.'

export async function GET(request: NextRequest) {
  try {
    await requireCrmUser(request)

    const [contactCounts, tourCounts, taskCounts, interactionStats] = await Promise.all([
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

    const enrollmentCount = await prisma.enrollment.count()
    const upcomingTours = await prisma.tour.count({ where: { status: 'SCHEDULED', start: { gte: new Date() } } })

    const stageSummary = contactCounts.reduce<Record<string, number>>((acc, item) => {
      acc[item.stage] = item._count.stage
      return acc
    }, {})

    return NextResponse.json({
      contactsByStage: stageSummary,
      toursByStatus: tourCounts.reduce<Record<string, number>>((acc, item) => {
        acc[item.status] = item._count.status
        return acc
      }, {}),
      tasksByStatus: taskCounts.reduce<Record<string, number>>((acc, item) => {
        acc[item.status] = item._count.status
        return acc
      }, {}),
      enrollments: enrollmentCount,
      upcomingTours,
      interactionSummary: {
        total: interactionStats._count.id,
        lastActivityAt: interactionStats._max.createdAt
      }
    })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') {
      console.error('CRM reports summary missing tables:', error)
      return NextResponse.json({ error: CRM_MISSING_TABLE_MESSAGE }, { status: 500 })
    }
    console.error('CRM reports summary GET error:', error)
    return NextResponse.json({ error: 'Failed to load report summary' }, { status: 500 })
  }
}
