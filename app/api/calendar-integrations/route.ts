import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { testCalendarConnection, CALENDAR_PROVIDERS } from "@/lib/calendar-integration";

export const dynamic = "force-dynamic"

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

    // Get user's calendar integrations
    const integrations = await prisma.calendarIntegration.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ 
      success: true,
      integrations: integrations.map(integration => ({
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
      })),
      availableProviders: CALENDAR_PROVIDERS
    });

  } catch (error) {
    console.error("Get calendar integrations error:", error);
    return NextResponse.json(
      { 
        error: "Failed to load calendar integrations", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
