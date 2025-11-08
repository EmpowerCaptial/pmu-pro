import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const STAFF_ROLES = ['director', 'manager', 'representative', 'owner', 'hr', 'staff', 'admin']

function normalizeIdentifier(identifier: string) {
  return identifier.trim().toLowerCase()
}

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json()

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Username or email and password are required' }, { status: 400 })
    }

    const normalized = normalizeIdentifier(identifier)

    const user = await prisma.user.findFirst({
      where: {
        role: { in: STAFF_ROLES },
        OR: [
          { email: normalized },
          { email: identifier },
          { name: identifier },
          { name: normalized }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        businessName: true,
        studioName: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
        hasActiveSubscription: true,
        subscriptionStatus: true,
        isLicenseVerified: true
      }
    })

    let staffData: any = null

    if (user) {
      const isTempPassword = await bcrypt.compare('temp-password', user.password)
      if (isTempPassword) {
        return NextResponse.json({
          error: 'Password setup required',
          needsPasswordChange: true,
          staff: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            businessName: user.businessName,
            studioName: user.studioName
          }
        }, { status: 400 })
      }

      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      const { password: _password, ...rest } = user
      staffData = {
        ...rest,
        permissions: Array.isArray(user.permissions) ? user.permissions : user.permissions || []
      }
    } else {
      const superUsername = process.env.STAFF_SUPER_ADMIN_USERNAME
      const superPasswordHash = process.env.STAFF_SUPER_ADMIN_PASSWORD_HASH
      const superPassword = process.env.STAFF_SUPER_ADMIN_PASSWORD

      if (!superUsername || normalizeIdentifier(superUsername) !== normalized) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      let superValid = false
      if (superPasswordHash) {
        superValid = await bcrypt.compare(password, superPasswordHash)
      } else if (superPassword) {
        superValid = superPassword === password
      }

      if (!superValid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      staffData = {
        id: 'super-admin',
        name: 'Super Admin',
        email: `${superUsername}@pmupro.local`,
        role: 'director',
        businessName: 'PMU Pro Administration',
        studioName: 'PMU Pro HQ',
        hasActiveSubscription: true,
        subscriptionStatus: 'active',
        isLicenseVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: ['*']
      }
    }

    return NextResponse.json({
      success: true,
      staff: staffData
    })
  } catch (error) {
    console.error('Staff login error:', error)
    return NextResponse.json({ error: 'Unable to authenticate staff member' }, { status: 500 })
  }
}
