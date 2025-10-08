import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { DepositPaymentService } from "@/lib/deposit-payment-service";
import { DepositEmailService } from "@/lib/deposit-email-service";
import { prisma } from "@/lib/prisma";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Deposit payment API called');
    
    // Get authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log('❌ Missing or invalid authorization header');
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    console.log('🔑 Token received:', token.substring(0, 20) + '...');
    
    // Verify the JWT token and get user
    const user = await AuthService.verifyToken(token);
    if (!user) {
      console.log('❌ Invalid or expired token');
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    
    console.log('✅ User authenticated:', user.email);

    // Get deposit payment data from request body
    const { 
      clientId, 
      appointmentId, 
      amount, 
      totalAmount, 
      currency = 'USD',
      notes,
      linkExpirationDays = 7
    } = await req.json();
    
    console.log('📊 Deposit data:', { clientId, amount, totalAmount, currency });
    
    if (!clientId || !amount || !totalAmount) {
      console.log('❌ Missing required fields');
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (amount >= totalAmount) {
      console.log('❌ Deposit amount must be less than total amount');
      return NextResponse.json({ error: "Deposit amount must be less than total amount" }, { status: 400 });
    }

    // Create deposit payment
    console.log('💳 Creating deposit payment...');
    const depositPayment = await DepositPaymentService.createDepositPayment({
      clientId,
      userId: user.id,
      appointmentId,
      amount,
      totalAmount,
      currency,
      notes,
      linkExpirationDays
    });

    // Create Stripe checkout session
    console.log('🔗 Creating Stripe checkout session...');
    const checkoutResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://thepmuguide.com'}/api/stripe/create-deposit-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        depositId: depositPayment.id,
        amount: amount,
        currency: currency,
        clientName: 'Client', // You might want to get this from client data
        successUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://thepmuguide.com'}/booking/confirmation?deposit=${depositPayment.id}`,
        cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://thepmuguide.com'}/booking/cancelled`
      })
    });

    if (!checkoutResponse.ok) {
      console.error('❌ Failed to create checkout session');
      return NextResponse.json({ error: "Failed to create payment session" }, { status: 500 });
    }

    const checkoutData = await checkoutResponse.json();
    
    console.log('✅ Deposit payment created:', depositPayment.id);

    // Get client and user information for email
    console.log('👤 Fetching client and user info...');
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    const userInfo = await prisma.user.findUnique({
      where: { id: user.id }
    });
    
    console.log('👤 Client found:', client ? 'Yes' : 'No', client?.email || 'No email');
    console.log('👤 User info found:', userInfo ? 'Yes' : 'No');

    // Send deposit email if client has email
    if (client?.email && userInfo) {
      try {
        console.log('📧 Sending deposit email to:', client.email);
        const depositLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/deposit/${depositPayment.depositLink}`;
        
        await DepositEmailService.sendDepositEmail(
          client.email,
          depositPayment,
          client.name,
          userInfo.name || 'Artist',
          userInfo.businessName || 'PMU Pro',
          depositLink
        );
        
        console.log(`✅ Deposit email sent to ${client.email}`);
      } catch (emailError) {
        console.error('❌ Failed to send deposit email:', emailError);
        // Don't fail the entire request if email fails
      }
    } else {
      console.log('⚠️ No email sent - client email:', client?.email || 'missing', 'user info:', userInfo ? 'found' : 'missing');
    }

    return NextResponse.json({ 
      success: true,
      depositPayment,
      depositLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/deposit/${depositPayment.depositLink}`,
      checkoutUrl: checkoutData.url,
      emailSent: client?.email ? true : false
    });

  } catch (error) {
    console.error("❌ Create deposit payment error:", error);
    return NextResponse.json(
      { 
        error: "Failed to create deposit payment", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Verify the JWT token and get user
    const user = await AuthService.verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    let depositPayments;
    if (clientId) {
      depositPayments = await DepositPaymentService.getClientDepositPayments(clientId);
    } else {
      depositPayments = await DepositPaymentService.getUserDepositPayments(user.id);
    }

    // Get statistics
    const stats = await DepositPaymentService.getDepositStats(user.id);

    return NextResponse.json({ 
      success: true,
      depositPayments,
      stats
    });

  } catch (error) {
    console.error("Get deposit payments error:", error);
    return NextResponse.json(
      { 
        error: "Failed to get deposit payments", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    );
  }
}
