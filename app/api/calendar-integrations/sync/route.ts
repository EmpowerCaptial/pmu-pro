import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncEventsFromExternal } from "@/lib/calendar-integration";

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

    // Get integration ID from request body
    const { integrationId } = await req.json();
    
    if (!integrationId) {
      return NextResponse.json({ error: "Integration ID required" }, { status: 400 });
    }

    // Get the integration
    const integration = await prisma.calendarIntegration.findFirst({
      where: { 
        id: integrationId,
        userId: user.id 
      }
    });

    if (!integration) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    if (!integration.apiKey) {
      return NextResponse.json({ error: "Integration API key not configured" }, { status: 400 });
    }

    // Sync events from external calendar
    const events = await syncEventsFromExternal(
      integration.id,
      integration.provider,
      integration.apiKey,
      integration.calendarId || undefined
    );

    // Update last sync time
    await prisma.calendarIntegration.update({
      where: { id: integration.id },
      data: { lastSyncAt: new Date() }
    });

    return NextResponse.json({ 
      success: true,
      events: events.map(event => ({
        id: event.id,
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        clientName: event.clientName,
        clientEmail: event.clientEmail,
        serviceType: event.serviceType,
        status: event.status,
        externalId: event.externalId
      })),
      syncedAt: new Date(),
      eventCount: events.length
    });

  } catch (error) {
    console.error("Sync calendar events error:", error);
    return NextResponse.json(
      { 
        error: "Failed to sync calendar events", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
