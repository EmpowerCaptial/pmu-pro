import { NextRequest, NextResponse } from "next/server";
import { DepositPaymentService } from "@/lib/deposit-payment-service";

export async function GET(req: NextRequest, { params }: { params: { depositLink: string } }) {
  try {
    const { depositLink } = params;

    if (!depositLink) {
      return NextResponse.json({ error: "Deposit link required" }, { status: 400 });
    }

    // Get deposit payment by link
    const depositPayment = await DepositPaymentService.getDepositByLink(depositLink);

    if (!depositPayment) {
      return NextResponse.json({ error: "Deposit payment not found" }, { status: 404 });
    }

    // Check if link is expired
    if (depositPayment.depositLinkExpiresAt < new Date() && depositPayment.status === 'PENDING') {
      await DepositPaymentService.updateDepositStatus(depositPayment.id, 'EXPIRED');
      depositPayment.status = 'EXPIRED';
    }

    return NextResponse.json({ 
      success: true,
      depositPayment
    });

  } catch (error) {
    console.error("Get deposit by link error:", error);
    return NextResponse.json(
      { 
        error: "Failed to get deposit payment", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    );
  }
}
