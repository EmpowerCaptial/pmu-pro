import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

// GET - Fetch service assignments for a studio
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    // Find the requesting user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        role: true,
        studioName: true,
        selectedPlan: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all team members in this studio
    const teamMembers = await prisma.user.findMany({
      where: {
        studioName: user.studioName,
        role: { in: ['student', 'licensed', 'instructor'] }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        specialties: true,
        certifications: true
      }
    })

    // Get all services for the studio owner
    const owner = await prisma.user.findFirst({
      where: {
        studioName: user.studioName,
        role: 'owner'
      },
      select: { id: true }
    })

    if (!owner) {
      return NextResponse.json({ error: 'Studio owner not found' }, { status: 404 })
    }

    const services = await prisma.service.findMany({
      where: {
        userId: owner.id,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        defaultPrice: true,
        description: true,
        category: true,
        defaultDuration: true
      }
    })

    // Get all service assignments for this studio
    const assignments = await prisma.serviceAssignment.findMany({
      where: {
        userId: { in: teamMembers.map(m => m.id) }
      },
      select: {
        id: true,
        serviceId: true,
        userId: true,
        assigned: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      services,
      teamMembers,
      assignments,
      studioName: user.studioName
    })

  } catch (error) {
    console.error('Error fetching service assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service assignments' },
      { status: 500 }
    )
  }
}

// POST - Create or update service assignments
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    const { assignments } = await request.json()
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    // Find the requesting user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        studioName: true,
        role: true,
        selectedPlan: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check permissions
    if (user.selectedPlan !== 'studio' || !['owner', 'manager', 'director'].includes(user.role)) {
      return NextResponse.json({ 
        error: 'Enterprise Studio subscription and management role required' 
      }, { status: 403 })
    }

    // Validate assignments array
    if (!Array.isArray(assignments)) {
      return NextResponse.json({ error: 'Invalid assignments format' }, { status: 400 })
    }

    // Process each assignment
    const results = []
    for (const assignment of assignments) {
      const { serviceId, userId, assigned } = assignment

      // Verify the team member belongs to this studio
      const teamMember = await prisma.user.findFirst({
        where: {
          id: userId,
          studioName: user.studioName
        }
      })

      if (!teamMember) {
        console.warn(`Team member ${userId} not found or not in same studio`)
        continue
      }

      // Upsert the assignment
      const result = await prisma.serviceAssignment.upsert({
        where: {
          serviceId_userId: {
            serviceId,
            userId
          }
        },
        update: {
          assigned,
          assignedBy: user.id,
          updatedAt: new Date()
        },
        create: {
          serviceId,
          userId,
          assigned,
          assignedBy: user.id
        }
      })

      results.push(result)
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${results.length} service assignments`,
      assignments: results
    })

  } catch (error) {
    console.error('Error updating service assignments:', error)
    return NextResponse.json(
      { error: 'Failed to update service assignments', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a service assignment
export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    const { serviceId, userId } = await request.json()
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, role: true, selectedPlan: true }
    })

    if (!user || user.selectedPlan !== 'studio' || !['owner', 'manager', 'director'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.serviceAssignment.delete({
      where: {
        serviceId_userId: {
          serviceId,
          userId
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Service assignment deleted'
    })

  } catch (error) {
    console.error('Error deleting service assignment:', error)
    return NextResponse.json(
      { error: 'Failed to delete service assignment' },
      { status: 500 }
    )
  }
}

