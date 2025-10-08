import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { DepositPaymentService } from "@/lib/deposit-payment-service";
import { DepositEmailService } from "@/lib/deposit-email-service";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    console.log('🧪 DEBUG: Test deposit payment API called');
    
    // Test email sending directly without database constraints
    console.log('🧪 Testing email service directly...');
    
    const testEmail = 'test@example.com';
    const testDepositLink = 'https://thepmuguide.com/deposit/test-link-123';
    
    // Create a mock deposit payment object for testing
    const mockDepositPayment = {
      id: 'test-deposit-123',
      amount: 50,
      totalAmount: 200,
      currency: 'USD',
      depositLink: 'test-link-123',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('🧪 Sending test email to:', testEmail);
    
    await DepositEmailService.sendDepositEmail(
      testEmail,
      mockDepositPayment as any,
      'Test Client',
      'Test Artist',
      'Test Business',
      testDepositLink
    );
    
    console.log('🧪 Test email sent successfully');
    
    return NextResponse.json({ 
      success: true,
      message: 'Test email sent successfully (bypassed database constraints)',
      emailSent: true,
      testEmail,
      depositLink: testDepositLink
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
