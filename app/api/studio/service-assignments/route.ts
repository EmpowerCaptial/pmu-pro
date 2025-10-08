import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    // Find the requesting user to get their studio
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

    // Check if user has access to service assignment management
    if (user.selectedPlan !== 'studio' || !['owner', 'manager', 'director'].includes(user.role)) {
      return NextResponse.json({ 
        error: 'Enterprise Studio subscription and management role required' 
      }, { status: 403 })
    }

    // Get all services for this studio
    const services = await prisma.service.findMany({
      where: {
        userId: user.id // Services belong to the studio owner
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

    // Get service assignments (stored in localStorage for now, but could be in database)
    // For now, we'll return the services and team members, and assignments will be managed in the frontend

    return NextResponse.json({
      success: true,
      services,
      teamMembers,
      studioName: user.studioName
    })

  } catch (error) {
    console.error('Error fetching service assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service assignments' },
      { status: 500 }
    )
  }}

export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email')
    const { assignments } = await request.json()
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    // Find the requesting user to verify permissions
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

    // Check if user has access to service assignment management
    if (user.selectedPlan !== 'studio' || !['owner', 'manager', 'director'].includes(user.role)) {
      return NextResponse.json({ 
        error: 'Enterprise Studio subscription and management role required' 
      }, { status: 403 })
    }

    // For now, we'll store assignments in localStorage via the frontend
    // In a production system, you'd store this in a database table like:
    // CREATE TABLE service_assignments (
    //   id SERIAL PRIMARY KEY,
    //   service_id VARCHAR NOT NULL,
    //   user_id VARCHAR NOT NULL,
    //   assigned_by VARCHAR NOT NULL,
    //   created_at TIMESTAMP DEFAULT NOW(),
    //   UNIQUE(service_id, user_id)
    // );

    return NextResponse.json({
      success: true,
      message: 'Service assignments updated successfully',
      assignments
    })

  } catch (error) {
    console.error('Error updating service assignments:', error)
    return NextResponse.json(
      { error: 'Failed to update service assignments' },
      { status: 500 }
    )
  }}
