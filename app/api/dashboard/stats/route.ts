import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')

    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get total active clients
    const totalClients = await prisma.client.count({
      where: {
        userId: user.id,
        isActive: true
      }
    })

    // Get analyses this month (Analysis model uses clientId, not userId)
    // We need to count analyses for this user's clients
    const userClients = await prisma.client.findMany({
      where: { userId: user.id },
      select: { id: true }
    })
    
    const clientIds = userClients.map(c => c.id)
    
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const analysesThisMonth = await prisma.analysis.count({
      where: {
        clientId: { in: clientIds },
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    // Calculate success rate (completed appointments / total appointments)
    const totalAppointments = await prisma.appointment.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    })

    const completedAppointments = await prisma.appointment.count({
      where: {
        userId: user.id,
        status: 'completed',
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    })

    const successRate = totalAppointments > 0 
      ? Math.round((completedAppointments / totalAppointments) * 100)
      : 0

    // Get recent activity (last 10 actions)
    const recentActivity = []

    // Get recent appointments
    const recentAppointments = await prisma.appointment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        client: {
          select: { name: true }
        }
      }
    })

    for (const apt of recentAppointments) {
      const timeAgo = getTimeAgo(apt.createdAt)
      recentActivity.push({
        description: `${apt.client.name} - ${apt.serviceType}`,
        timeAgo,
        badge: {
          text: apt.status === 'completed' ? 'Completed' : apt.status,
          variant: 'secondary',
          className: apt.status === 'completed' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-blue-100 text-blue-800'
        }
      })
    }

    // Get recent analyses (for this user's clients)
    const recentAnalyses = clientIds.length > 0 ? await prisma.analysis.findMany({
      where: { clientId: { in: clientIds } },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        client: {
          select: { name: true }
        }
      }
    }) : []

    for (const analysis of recentAnalyses) {
      const timeAgo = getTimeAgo(analysis.createdAt)
      const fitzpatrickText = analysis.fitzpatrick ? `Fitzpatrick ${analysis.fitzpatrick}` : 'Analyzed'
      recentActivity.push({
        description: `${analysis.client.name} - Skin Analysis`,
        timeAgo,
        badge: {
          text: fitzpatrickText,
          variant: 'outline'
        }
      })
    }

    // Sort by most recent
    recentActivity.sort((a, b) => {
      const aTime = parseTimeAgo(a.timeAgo)
      const bTime = parseTimeAgo(b.timeAgo)
      return aTime - bTime
    })

    return NextResponse.json({
      totalClients,
      analysesThisMonth,
      successRate,
      recentActivity: recentActivity.slice(0, 5)
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// Helper function to get time ago
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - new Date(date).getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInDays < 7) return `${diffInDays}d ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`
  return `${Math.floor(diffInDays / 30)}mo ago`
}

// Helper to parse time ago for sorting
function parseTimeAgo(timeAgo: string): number {
  if (timeAgo === 'Just now') return 0
  
  const match = timeAgo.match(/(\d+)([hdwm])/)
  if (!match) return 999999
  
  const value = parseInt(match[1])
  const unit = match[2]
  
  switch (unit) {
    case 'h': return value
    case 'd': return value * 24
    case 'w': return value * 24 * 7
    case 'm': return value * 24 * 30
    default: return 999999
  }
}

