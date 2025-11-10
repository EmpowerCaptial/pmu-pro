import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { requireCrmUser } from '@/lib/server/crm-auth'

const STAGE_VALUES = [
  'LEAD',
  'TOUR_SCHEDULED',
  'TOURED',
  'APP_STARTED',
  'APP_SUBMITTED',
  'ENROLLED',
  'NO_SHOW',
  'NURTURE'
] as const

type StageValue = (typeof STAGE_VALUES)[number]

function isStageValue(value: string | null): value is StageValue {
  return value !== null && STAGE_VALUES.includes(value as StageValue)
}
 
 export async function GET(request: NextRequest) {
   try {
     await requireCrmUser(request)
     const search = request.nextUrl.searchParams.get('q')?.toLowerCase() ?? ''
     const stageParam = request.nextUrl.searchParams.get('stage')
     const stageFilter = isStageValue(stageParam) ? stageParam : undefined
 
     const whereClause: Prisma.ContactWhereInput = {
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
     }

     if (stageFilter) {
       // Prisma expects its generated Stage enum type. Value is validated above; suppress type mismatch.
       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
       // @ts-ignore - Stage enum type not exported in all environments
       whereClause.stage = stageFilter
     }
 
     const contacts = await prisma.contact.findMany({
       where: whereClause,
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
