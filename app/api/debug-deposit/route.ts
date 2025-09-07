import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { DepositPaymentService } from "@/lib/deposit-payment-service";
import { DepositEmailService } from "@/lib/deposit-email-service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    console.log('🧪 DEBUG: Test deposit payment API called');
    
    // First create a test client
    console.log('🧪 Creating test client...');
    const testClient = await prisma.client.create({
      data: {
        userId: 'test-user-123',
        name: 'Test Client',
        email: 'test@example.com',
        phone: '555-1234',
        notes: 'Test client for deposit payment'
      }
    });
    
    console.log('🧪 Test client created:', testClient.id);
    
    // Test data
    const testData = {
      clientId: testClient.id,
      amount: 50,
      totalAmount: 200,
      currency: 'USD',
      notes: 'Test deposit payment'
    };
    
    console.log('🧪 Test data:', testData);
    
    // Create a test deposit payment
    const depositPayment = await DepositPaymentService.createDepositPayment({
      clientId: testData.clientId,
      userId: 'test-user-123',
      amount: testData.amount,
      totalAmount: testData.totalAmount,
      currency: testData.currency,
      notes: testData.notes
    });
    
    console.log('🧪 Deposit payment created:', depositPayment.id);
    
    // Test email sending
    const testEmail = 'test@example.com';
    const depositLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://thepmuguide.com'}/deposit/${depositPayment.depositLink}`;
    
    console.log('🧪 Sending test email to:', testEmail);
    
    await DepositEmailService.sendDepositEmail(
      testEmail,
      depositPayment,
      'Test Client',
      'Test Artist',
      'Test Business',
      depositLink
    );
    
    console.log('🧪 Test email sent successfully');
    
    return NextResponse.json({ 
      success: true,
      message: 'Test deposit payment and email sent successfully',
      client: {
        id: testClient.id,
        name: testClient.name,
        email: testClient.email
      },
      depositPayment: {
        id: depositPayment.id,
        amount: depositPayment.amount,
        totalAmount: depositPayment.totalAmount
      },
      depositLink,
      emailSent: true
    });

  } catch (error) {
    console.error("🧪 Test deposit payment error:", error);
    return NextResponse.json(
      { 
        error: "Test failed", 
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      }, 
      { status: 500 }
    );
  }
}
