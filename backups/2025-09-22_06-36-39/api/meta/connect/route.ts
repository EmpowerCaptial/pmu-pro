import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { exchangeUserTokenForLongLived, getUserPages } from "@/lib/meta";

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

    // Get Facebook access token from request body
    const { fbAccessToken } = await req.json();
    if (!fbAccessToken) {
      return NextResponse.json({ error: "Facebook access token required" }, { status: 400 });
    }

    // Exchange user token for long-lived token
    const exchange = await exchangeUserTokenForLongLived(fbAccessToken);
    const longUserToken = exchange.access_token;

    // Get user's pages
    const pages = await getUserPages(longUserToken);

    return NextResponse.json({ 
      success: true,
      pages: pages.map(page => ({
        id: page.id,
        name: page.name,
        access_token: page.access_token,
        expires_in: page.expires_in,
        hasInstagram: !!page.instagram_business_account?.id,
        instagramId: page.instagram_business_account?.id
      }))
    });

  } catch (error) {
    console.error("Meta connect error:", error);
    return NextResponse.json(
      { 
        error: "Failed to connect to Facebook", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    );
  }
}
