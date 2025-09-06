import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { getIGFromPage, getIGBasic } from "@/lib/meta";
import { PrismaClient } from "@prisma/client";

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

    // Get page data from request body
    const { pageId, pageName, pageAccessToken, pageTokenExpiresIn } = await req.json();
    
    if (!pageId || !pageName || !pageAccessToken) {
      return NextResponse.json({ error: "Missing required page data" }, { status: 400 });
    }

    // Get Instagram account info if linked
    let igUserId: string | undefined;
    let igUsername: string | undefined;
    
    try {
      igUserId = await getIGFromPage(pageId, pageAccessToken);
      if (igUserId) {
        const igAccount = await getIGBasic(igUserId, pageAccessToken);
        igUsername = igAccount.username;
      }
    } catch (error) {
      console.warn("Failed to get Instagram info:", error);
      // Continue without Instagram info - user can link later
    }

    // Calculate expiration date
    const expiresAt = pageTokenExpiresIn 
      ? new Date(Date.now() + pageTokenExpiresIn * 1000) 
      : null;

    // Save or update the connection
    const connection = await prisma.metaConnection.upsert({
      where: { 
        userId_pageId: { 
          userId: user.id, 
          pageId: pageId 
        } 
      },
      update: {
        pageName,
        pageAccessToken,
        pageTokenExpiresAt: expiresAt,
        igUserId: igUserId || null,
        igUsername: igUsername || null,
      },
      create: {
        userId: user.id,
        pageId,
        pageName,
        pageAccessToken,
        pageTokenExpiresAt: expiresAt,
        igUserId: igUserId || null,
        igUsername: igUsername || null,
      },
    });

    return NextResponse.json({ 
      success: true, 
      connection: {
        id: connection.id,
        pageId: connection.pageId,
        pageName: connection.pageName,
        hasInstagram: !!connection.igUserId,
        igUsername: connection.igUsername,
        expiresAt: connection.pageTokenExpiresAt
      }
    });

  } catch (error) {
    console.error("Meta select-page error:", error);
    return NextResponse.json(
      { 
        error: "Failed to save page connection", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
