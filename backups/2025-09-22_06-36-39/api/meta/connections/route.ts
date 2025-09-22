import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    // Get user's Meta connections
    const connections = await prisma.metaConnection.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ 
      success: true,
      connections: connections.map(conn => ({
        id: conn.id,
        pageId: conn.pageId,
        pageName: conn.pageName,
        hasInstagram: !!conn.igUserId,
        igUsername: conn.igUsername,
        expiresAt: conn.pageTokenExpiresAt,
        createdAt: conn.createdAt
      }))
    });

  } catch (error) {
    console.error("Get connections error:", error);
    return NextResponse.json(
      { 
        error: "Failed to load connections", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
