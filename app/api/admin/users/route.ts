import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/users - Get all users with subscription status
export async function GET(request: NextRequest) {
  try {
    // Check if database is available
    await prisma.$connect()
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')

    const where: any = {}
    
    if (status) {
      where.subscriptionStatus = status
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          businessName: true,
          phone: true,
          licenseNumber: true,
          licenseState: true,
          yearsExperience: true,
          selectedPlan: true,
          hasActiveSubscription: true,
          isLicenseVerified: true,
          role: true,
          stripeId: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
          subscriptionStatus: true,
          createdAt: true,
          updatedAt: true,
          clients: {
            select: {
              id: true,
              name: true,
              createdAt: true
            }
          },
          depositPayments: {
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    // Calculate additional metrics
    const metrics = await prisma.user.groupBy({
      by: ['subscriptionStatus'],
      _count: { subscriptionStatus: true }
    })

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      metrics: metrics.reduce((acc, metric) => {
        acc[metric.subscriptionStatus] = metric._count.subscriptionStatus
        return acc
      }, {} as Record<string, number>)
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('datasource')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database not configured. Please set up PostgreSQL database in Vercel.',
          data: []
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users', data: [] },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT /api/admin/users - Update user status
export async function PUT(request: NextRequest) {
  try {
    const { userId, updates } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const allowedUpdates = [
      'subscriptionStatus',
      'hasActiveSubscription',
      'isLicenseVerified',
      'role',
      'selectedPlan'
    ]

    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key]
        return obj
      }, {} as any)

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: filteredUpdates,
      select: {
        id: true,
        name: true,
        email: true,
        businessName: true,
        subscriptionStatus: true,
        hasActiveSubscription: true,
        isLicenseVerified: true,
        role: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedUser
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users - Suspend/delete user
export async function DELETE(request: NextRequest) {
  try {
    const { userId, action } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (action === 'suspend') {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: 'suspended',
          hasActiveSubscription: false
        }
      })

      return NextResponse.json({
        success: true,
        data: updatedUser,
        message: 'User suspended successfully'
      })
    } else if (action === 'delete') {
      // Soft delete - mark as deleted but keep data for compliance
      const user = await prisma.user.findUnique({ where: { id: userId } })
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionStatus: 'deleted',
          hasActiveSubscription: false,
          email: `deleted_${Date.now()}_${user?.email || 'unknown'}`
        }
      })

      return NextResponse.json({
        success: true,
        data: updatedUser,
        message: 'User deleted successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "suspend" or "delete"' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error processing user action:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process user action' },
      { status: 500 }
    )
  }
}
