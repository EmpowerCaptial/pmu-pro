import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { exchangeUserTokenForLongLived, getUserPages } from "@/lib/meta";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle Facebook OAuth errors
    if (error) {
      const errorDescription = searchParams.get('error_description') || 'Unknown error';
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/integrations/meta?error=${encodeURIComponent(errorDescription)}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/integrations/meta?error=No authorization code received`
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://graph.facebook.com/v20.0/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.FACEBOOK_CLIENT_ID!,
        client_secret: process.env.FACEBOOK_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/integrations/meta/callback`,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange authorization code for access token');
    }

    const tokenData = await tokenResponse.json();
    const userAccessToken = tokenData.access_token;

    // Exchange for long-lived token
    const longLivedToken = await exchangeUserTokenForLongLived(userAccessToken);

    // Get user's pages
    const pages = await getUserPages(longLivedToken.access_token);

    // Redirect back to integration page with pages data
    const pagesParam = encodeURIComponent(JSON.stringify(pages.map(page => ({
      id: page.id,
      name: page.name,
      access_token: page.access_token,
      expires_in: page.expires_in,
      hasInstagram: !!page.instagram_business_account?.id,
      instagramId: page.instagram_business_account?.id
    }))));

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/integrations/meta?pages=${pagesParam}&success=Facebook connected successfully!`
    );

  } catch (error) {
    console.error('Facebook OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/integrations/meta?error=${encodeURIComponent('Failed to connect to Facebook')}`
    );
  }
}
