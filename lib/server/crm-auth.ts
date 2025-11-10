import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULT_ALLOWED_ROLES = ['owner', 'staff', 'manager', 'director'] as const

type AllowedRole = typeof DEFAULT_ALLOWED_ROLES[number]

export async function requireCrmUser(
  req: NextRequest,
  allowedRoles: AllowedRole[] = DEFAULT_ALLOWED_ROLES
) {
  const email = req.headers.get('x-user-email')

  if (!email) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const portalUser = await prisma.user.findUnique({
    where: { email }
  })

  if (!portalUser) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const normalizedRole = portalUser.role?.toLowerCase?.() ?? 'staff'
  if (!allowedRoles.includes(normalizedRole as AllowedRole)) {
    throw new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }

  const staffRecord = await prisma.staff.upsert({
    where: { email: portalUser.email },
    update: {
      name: portalUser.name ?? portalUser.email,
      role: normalizedRole,
      phone: portalUser.phone ?? undefined
    },
    create: {
      email: portalUser.email,
      name: portalUser.name ?? portalUser.email,
      role: normalizedRole,
      phone: portalUser.phone ?? undefined
    }
  })

  return { portalUser, staffRecord }
}
