import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Simulate data deletion process for development
async function simulateDataDeletion(email: string, requestId: string) {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        clients: true,
        portfolios: true
      }
    })

    if (!user) {
      console.log(`No user found with email ${email}`)
      return
    }

    // Delete user's data in proper order (respecting foreign key constraints)
    await prisma.portfolio.deleteMany({ where: { userId: user.id } })
    
    // Delete clients and their related data
    for (const client of user.clients) {
      await prisma.document.deleteMany({ where: { clientId: client.id } })
      await prisma.analysis.deleteMany({ where: { clientId: client.id } })
      await prisma.intake.deleteMany({ where: { clientId: client.id } })
      await prisma.appointment.deleteMany({ where: { clientId: client.id } })
      await prisma.order.deleteMany({ where: { clientId: client.id } })
      await prisma.client.delete({ where: { id: client.id } })
    }

    // Finally delete the user
    await prisma.user.delete({ where: { id: user.id } })

    // Update deletion request status
    await prisma.dataDeletionRequest.update({
      where: { id: requestId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    })

    console.log(`Data deletion completed for user ${email}`)
  } catch (error) {
    console.error(`Error during data deletion for ${email}:`, error)
    
    // Update deletion request status to failed
    await prisma.dataDeletionRequest.update({
      where: { id: requestId },
      data: {
        status: 'FAILED',
        completedAt: new Date()
      }
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, reason } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Create data deletion request record
    const deletionRequest = await prisma.dataDeletionRequest.create({
      data: {
        email,
        reason: reason || null,
        status: 'PENDING',
        requestedAt: new Date()
      }
    });

    // Send confirmation email to user (placeholder for email service)
    console.log(`Data deletion request created for ${email}. Confirmation email would be sent.`)
    
    // Notify admin team (placeholder for admin notification)
    console.log(`Admin notification: New data deletion request from ${email}`)
    
    // For demo purposes, we'll simulate the deletion process
    // In production, this would be handled by a background job with proper verification
    if (process.env.NODE_ENV === 'development') {
      // Simulate immediate deletion for development
      await simulateDataDeletion(email, deletionRequest.id)
    }

    return NextResponse.json({ 
      success: true,
      message: "Data deletion request submitted successfully",
      requestId: deletionRequest.id
    });

  } catch (error) {
    console.error("Data deletion request error:", error);
    return NextResponse.json(
      { 
        error: "Failed to submit data deletion request", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
    }

    // Get deletion request status
    const deletionRequest = await prisma.dataDeletionRequest.findFirst({
      where: { email },
      orderBy: { requestedAt: 'desc' }
    });

    if (!deletionRequest) {
      return NextResponse.json({ 
        success: true,
        status: 'NO_REQUEST',
        message: "No deletion request found for this email"
      });
    }

    return NextResponse.json({ 
      success: true,
      status: deletionRequest.status,
      requestedAt: deletionRequest.requestedAt,
      completedAt: deletionRequest.completedAt,
      message: `Deletion request is ${deletionRequest.status.toLowerCase()}`
    });

  } catch (error) {
    console.error("Get deletion request status error:", error);
    return NextResponse.json(
      { 
        error: "Failed to get deletion request status", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    );
  }
}
