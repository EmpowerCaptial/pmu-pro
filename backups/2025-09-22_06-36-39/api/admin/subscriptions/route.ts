import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/subscriptions - Get subscription analytics and management
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    // Get subscription metrics
    const [
      totalSubscriptions,
      activeSubscriptions,
      expiredSubscriptions,
      pendingSubscriptions,
      revenueMetrics,
      planDistribution,
      recentSubscriptions,
      subscriptionTrends
    ] = await Promise.all([
      // Total subscriptions
      prisma.user.count(),
      
      // Active subscriptions
      prisma.user.count({
        where: {
          subscriptionStatus: 'active',
          hasActiveSubscription: true
        }
      }),
      
      // Expired subscriptions
      prisma.user.count({
        where: {
          subscriptionStatus: 'expired'
        }
      }),
      
      // Pending subscriptions
      prisma.user.count({
        where: {
          subscriptionStatus: 'pending'
        }
      }),
      
      // Revenue metrics (mock data for now - would integrate with Stripe)
      Promise.resolve({
        monthlyRevenue: 12500,
        annualRevenue: 150000,
        averageRevenuePerUser: 125,
        churnRate: 5.2
      }),
      
      // Plan distribution
      prisma.user.groupBy({
        by: ['selectedPlan'],
        _count: { selectedPlan: true }
      }),
      
      // Recent subscriptions
      prisma.user.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        select: {
          id: true,
          name: true,
          email: true,
          businessName: true,
          selectedPlan: true,
          subscriptionStatus: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      
      // Subscription trends (mock data)
      Promise.resolve([
        { date: '2024-01-01', active: 45, new: 8, churned: 2 },
        { date: '2024-01-02', active: 51, new: 6, churned: 0 },
        { date: '2024-01-03', active: 57, new: 7, churned: 1 },
        { date: '2024-01-04', active: 63, new: 8, churned: 2 },
        { date: '2024-01-05', active: 69, new: 9, churned: 3 },
        { date: '2024-01-06', active: 75, new: 10, churned: 4 },
        { date: '2024-01-07', active: 81, new: 12, churned: 6 }
      ])
    ])

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalSubscriptions,
          activeSubscriptions,
          expiredSubscriptions,
          pendingSubscriptions,
          conversionRate: totalSubscriptions > 0 ? (activeSubscriptions / totalSubscriptions * 100).toFixed(1) : 0
        },
        revenue: revenueMetrics,
        planDistribution: planDistribution.reduce((acc, plan) => {
          acc[plan.selectedPlan] = plan._count.selectedPlan
          return acc
        }, {} as Record<string, number>),
        recentSubscriptions,
        trends: subscriptionTrends
      }
    })

  } catch (error) {
    console.error('Error fetching subscription data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription data' },
      { status: 500 }
    )
  }
}

// POST /api/admin/subscriptions - Update subscription status
export async function POST(request: NextRequest) {
  try {
    const { userId, action, plan, notes } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      )
    }

    let updateData: any = {}

    switch (action) {
      case 'approve':
        updateData = {
          subscriptionStatus: 'active',
          hasActiveSubscription: true,
          isLicenseVerified: true
        }
        break
      
      case 'reject':
        updateData = {
          subscriptionStatus: 'rejected',
          hasActiveSubscription: false
        }
        break
      
      case 'suspend':
        updateData = {
          subscriptionStatus: 'suspended',
          hasActiveSubscription: false
        }
        break
      
      case 'upgrade':
        if (!plan) {
          return NextResponse.json(
            { error: 'Plan is required for upgrade action' },
            { status: 400 }
          )
        }
        updateData = {
          selectedPlan: plan,
          subscriptionStatus: 'active',
          hasActiveSubscription: true
        }
        break
      
      case 'downgrade':
        if (!plan) {
          return NextResponse.json(
            { error: 'Plan is required for downgrade action' },
            { status: 400 }
          )
        }
        updateData = {
          selectedPlan: plan
        }
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: approve, reject, suspend, upgrade, downgrade' },
          { status: 400 }
        )
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        businessName: true,
        selectedPlan: true,
        subscriptionStatus: true,
        hasActiveSubscription: true,
        isLicenseVerified: true,
        updatedAt: true
      }
    })

    // Log the action (would integrate with activity logging)
    console.log(`Admin action: ${action} for user ${userId}`, {
      userId,
      action,
      plan,
      notes,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: `User ${action} successfully`
    })

  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}
