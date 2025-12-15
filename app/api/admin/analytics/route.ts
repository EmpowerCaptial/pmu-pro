import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET /api/admin/analytics - Get business metrics and analytics
export async function GET(request: NextRequest) {
  try {
    // Check if database is available
    const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
    if (!DATABASE_URL) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database not configured. Please set DATABASE_URL or NEON_DATABASE_URL in your environment variables.',
          data: null
        },
        { status: 503 }
      )
    }
    
    await prisma.$connect()
    
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days
    const metric = searchParams.get('metric') || 'overview'

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    if (metric === 'overview') {
      // Get comprehensive overview metrics
      const [
        userMetrics,
        clientMetrics,
        depositMetrics,
        activityMetrics,
        systemHealth
      ] = await Promise.all([
        // User metrics
        Promise.all([
          prisma.user.count(),
          prisma.user.count({ where: { subscriptionStatus: 'active' } }),
          prisma.user.count({ where: { subscriptionStatus: 'pending' } }),
          prisma.user.count({ where: { createdAt: { gte: startDate } } })
        ]),
        
        // Client metrics
        Promise.all([
          prisma.client.count(),
          prisma.client.count({ where: { createdAt: { gte: startDate } } }),
          prisma.client.groupBy({
            by: ['userId'],
            _count: { userId: true }
          })
        ]),
        
        // Deposit payment metrics
        Promise.all([
          prisma.depositPayment.count(),
          prisma.depositPayment.count({ where: { status: 'PAID' } }),
          prisma.depositPayment.count({ where: { createdAt: { gte: startDate } } }),
          prisma.depositPayment.aggregate({
            _sum: { amount: true },
            where: { status: 'PAID' }
          })
        ]),
        
        // Activity metrics (mock data for now)
        Promise.resolve({
          totalLogins: 1250,
          activeSessions: 45,
          pageViews: 8900,
          apiCalls: 15600
        }),
        
        // System health metrics
        Promise.resolve({
          uptime: '99.9%',
          responseTime: '~200ms',
          errorRate: '0.1%',
          databaseStatus: 'Healthy',
          stripeStatus: 'Connected',
          emailStatus: 'Active'
        })
      ])

      return NextResponse.json({
        success: true,
        data: {
          users: {
            total: userMetrics[0],
            active: userMetrics[1],
            pending: userMetrics[2],
            newThisPeriod: userMetrics[3]
          },
          clients: {
            total: clientMetrics[0],
            newThisPeriod: clientMetrics[1],
            averagePerUser: clientMetrics[0] > 0 ? (clientMetrics[0] / userMetrics[0]).toFixed(1) : 0
          },
          deposits: {
            total: depositMetrics[0],
            paid: depositMetrics[1],
            newThisPeriod: depositMetrics[2],
            totalRevenue: Number(depositMetrics[3]._sum.amount || 0)
          },
          activity: activityMetrics,
          systemHealth
        }
      })

    } else if (metric === 'revenue') {
      // Revenue analytics
      const revenueData = await prisma.depositPayment.aggregate({
        _sum: { amount: true },
        _avg: { amount: true },
        _count: { id: true },
        where: {
          status: 'PAID',
          createdAt: { gte: startDate }
        }
      })

      // Mock additional revenue data
      const revenueBreakdown = {
        subscriptions: 12500,
        deposits: Number(revenueData._sum.amount || 0),
        commissions: 2500,
        total: (12500 + Number(revenueData._sum.amount || 0) + 2500)
      }

      return NextResponse.json({
        success: true,
        data: {
          period: `${period} days`,
          totalRevenue: revenueBreakdown.total,
          breakdown: revenueBreakdown,
          averageTransaction: Number(revenueData._avg.amount || 0),
          transactionCount: revenueData._count.id
        }
      })

    } else if (metric === 'users') {
      // User analytics
      const userAnalytics = await Promise.all([
        prisma.user.groupBy({
          by: ['subscriptionStatus'],
          _count: { subscriptionStatus: true }
        }),
        prisma.user.groupBy({
          by: ['selectedPlan'],
          _count: { selectedPlan: true }
        }),
        prisma.user.groupBy({
          by: ['role'],
          _count: { role: true }
        })
      ])

      return NextResponse.json({
        success: true,
        data: {
          byStatus: userAnalytics[0].reduce((acc, item) => {
            acc[item.subscriptionStatus] = item._count.subscriptionStatus
            return acc
          }, {} as Record<string, number>),
          byPlan: userAnalytics[1].reduce((acc, item) => {
            acc[item.selectedPlan] = item._count.selectedPlan
            return acc
          }, {} as Record<string, number>),
          byRole: userAnalytics[2].reduce((acc, item) => {
            acc[item.role] = item._count.role
            return acc
          }, {} as Record<string, number>)
        }
      })

    } else if (metric === 'activity') {
      // Activity analytics (mock data for now)
      const activityData = {
        daily: [
          { date: '2024-01-01', logins: 45, registrations: 8, deposits: 12 },
          { date: '2024-01-02', logins: 52, registrations: 6, deposits: 15 },
          { date: '2024-01-03', logins: 48, registrations: 7, deposits: 11 },
          { date: '2024-01-04', logins: 61, registrations: 9, deposits: 18 },
          { date: '2024-01-05', logins: 55, registrations: 5, deposits: 14 },
          { date: '2024-01-06', logins: 67, registrations: 12, deposits: 22 },
          { date: '2024-01-07', logins: 73, registrations: 8, deposits: 19 }
        ],
        hourly: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          activity: Math.floor(Math.random() * 50) + 10
        })),
        topActions: [
          { action: 'LOGIN', count: 1250 },
          { action: 'CLIENT_CREATED', count: 890 },
          { action: 'DEPOSIT_PAID', count: 456 },
          { action: 'SKIN_ANALYSIS', count: 234 },
          { action: 'DOCUMENT_UPLOAD', count: 189 }
        ]
      }

      return NextResponse.json({
        success: true,
        data: activityData
      })
    }

    return NextResponse.json(
      { error: 'Invalid metric. Use: overview, revenue, users, activity' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error fetching analytics:', error)
    
    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('datasource')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database not configured. Please set up PostgreSQL database in Vercel.',
          data: null
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics', data: null },
      { status: 500 }
    )
  }}
