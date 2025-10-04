import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get instructor email from query params
    const { searchParams } = new URL(request.url);
    const instructorEmail = searchParams.get('instructorEmail');
    const date = searchParams.get('date'); // Optional: specific date filter

    if (!instructorEmail) {
      return NextResponse.json({ error: 'Instructor email required' }, { status: 400 });
    }

    // Find instructor user
    const instructor = await prisma.user.findUnique({
      where: { email: instructorEmail },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    if (!instructor) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }

    // Build where clause for appointments
    const whereClause: any = {
      userId: instructor.id
    };

    // Add date filter if provided
    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      whereClause.startTime = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    // Get instructor's appointments
    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        client: true
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    // Convert appointments to availability format
    const blockedTimes = appointments.map(apt => {
      const startTime = new Date(apt.startTime);
      const endTime = new Date(startTime.getTime() + apt.duration * 60 * 1000); // Add duration in minutes

      return {
        id: apt.id,
        date: startTime.toISOString().split('T')[0],
        startTime: startTime.toTimeString().split(' ')[0].substring(0, 5),
        endTime: endTime.toTimeString().split(' ')[0].substring(0, 5),
        duration: apt.duration,
        clientName: apt.client.name,
        service: apt.serviceType,
        status: apt.status,
        reason: `Client appointment: ${apt.client.name} - ${apt.serviceType}`
      };
    });

    return NextResponse.json({
      success: true,
      instructor: {
        id: instructor.id,
        name: instructor.name,
        email: instructor.email
      },
      blockedTimes,
      summary: {
        totalAppointments: appointments.length,
        dateRange: date ? date : 'all dates',
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching instructor availability:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch instructor availability',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
