import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { testCalendarConnection } from "@/lib/calendar-integration";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
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

    // Get integration data from request body
    const { 
      provider, 
      providerName, 
      apiKey, 
      calendarId, 
      calendarName, 
      syncDirection = 'BIDIRECTIONAL',
      syncFrequency = 15 
    } = await req.json();
    
    if (!provider || !providerName || !apiKey) {
      return NextResponse.json({ error: "Missing required integration data" }, { status: 400 });
    }

    // Test the connection first
    const connectionTest = await testCalendarConnection(provider, apiKey, { calendarId });
    
    if (!connectionTest.success) {
      return NextResponse.json({ 
        error: "Connection test failed", 
        details: connectionTest.error 
      }, { status: 400 });
    }

    // Save the integration
    const integration = await prisma.calendarIntegration.create({
      data: {
        userId: user.id,
        provider: provider as any,
        providerName,
        apiKey,
        calendarId: calendarId || null,
        calendarName: calendarName || null,
        syncDirection: syncDirection as any,
        syncFrequency,
        lastSyncAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      integration: {
        id: integration.id,
        provider: integration.provider,
        providerName: integration.providerName,
        calendarId: integration.calendarId,
        calendarName: integration.calendarName,
        isActive: integration.isActive,
        syncDirection: integration.syncDirection,
        lastSyncAt: integration.lastSyncAt,
        syncFrequency: integration.syncFrequency,
        createdAt: integration.createdAt
      },
      availableCalendars: connectionTest.calendars || []
    });

  } catch (error) {
    console.error("Create calendar integration error:", error);
    return NextResponse.json(
      { 
        error: "Failed to create calendar integration", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
