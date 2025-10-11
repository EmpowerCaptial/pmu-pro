import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPaymentRouting, recordCommissionTransaction } from '@/lib/payment-routing';

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  let body: any = {};
  try {
    // Get user email from headers
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        name: true,
        selectedPlan: true,
        hasActiveSubscription: true,
        isLicenseVerified: true,
        businessName: true,
        studioName: true,
        role: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    body = await request.json();
    const {
      clientName,
      clientEmail,
      clientPhone,
      service,
      date,
      time,
      duration,
      price,
      deposit,
      status = 'pending_deposit'
    } = body;

    // Validate required fields
    if (!clientName || !clientEmail || !service || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Convert time to 24-hour format if needed (e.g., "9:30 AM" -> "09:30")
    let time24 = time;
    if (time.includes('AM') || time.includes('PM')) {
      const [timePart, period] = time.split(' ');
      let [hours, minutes] = timePart.split(':');
      hours = parseInt(hours);
      
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
      
      time24 = `${hours.toString().padStart(2, '0')}:${minutes}`;
    }

    // Check if client exists, if not create one
    let client = await prisma.client.findFirst({
      where: {
        email: clientEmail,
        userId: user.id
      }
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          userId: user.id,
          name: clientName,
          email: clientEmail,
          phone: clientPhone || '',
          isActive: true
        }
      });
    }

    // CRITICAL: Determine where payment should go based on employment type
    const paymentRouting = await getPaymentRouting(user.id, price || 0);
    
    console.log('💰 Payment Routing:', {
      serviceProvider: user.name,
      amount: price,
      goesTo: paymentRouting.recipientName,
      employmentType: paymentRouting.employmentType,
      commissionTracked: paymentRouting.shouldTrackCommission
    });

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        userId: user.id,
        clientId: client.id,
        title: `${service} - ${clientName}`,
        serviceType: service,
        duration: duration || 120,
        startTime: new Date(`${date}T${time24}`),
        endTime: new Date(new Date(`${date}T${time24}`).getTime() + (duration || 120) * 60000),
        status: status,
        price: price || 0,
        deposit: deposit || 0,
        paymentStatus: 'pending',
        source: 'public_booking',
        notes: `Booked via public booking page. Payment to: ${paymentRouting.recipientName}${paymentRouting.shouldTrackCommission ? ` (${paymentRouting.commissionRate}% commission)` : ''}`,
        reminderSent: false
      }
    });

    // If payment goes to owner for commissioned staff, record commission owed
    if (paymentRouting.shouldTrackCommission && paymentRouting.commissionRate) {
      await recordCommissionTransaction(
        paymentRouting.recipientId, // Owner ID
        user.id, // Staff ID
        price || 0,
        paymentRouting.commissionRate,
        paymentRouting.employmentType,
        appointment.id,
        `${service} for ${clientName}`
      );
    }

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        clientId: client.id,
        clientName: client.name,
        clientEmail: client.email,
        service: appointment.serviceType,
        date: appointment.startTime.toISOString().split('T')[0],
        time: appointment.startTime.toTimeString().split(' ')[0].substring(0, 5),
        duration: appointment.duration,
        price: appointment.price,
        deposit: appointment.deposit,
        status: appointment.status
      }
    });

  } catch (error: any) {
    console.error('Error creating appointment:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      body: body
    });
    return NextResponse.json(
      { 
        error: 'Failed to create appointment',
        details: error.message,
        debugInfo: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user email from headers
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        name: true,
        selectedPlan: true,
        hasActiveSubscription: true,
        isLicenseVerified: true,
        businessName: true,
        studioName: true,
        role: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        userId: user.id
      },
      include: {
        client: true
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      appointments: appointments.map(apt => ({
        id: apt.id,
        clientName: apt.client.name,
        clientEmail: apt.client.email,
        service: apt.serviceType,
        date: apt.startTime.toISOString().split('T')[0],
        time: apt.startTime.toTimeString().split(' ')[0].substring(0, 5),
        duration: apt.duration,
        price: apt.price,
        deposit: apt.deposit,
        status: apt.status,
        paymentStatus: apt.paymentStatus
      }))
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}