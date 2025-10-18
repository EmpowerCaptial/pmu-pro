import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { exchangeUserTokenForLongLived, getUserPages } from "@/lib/meta";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log('Facebook OAuth callback received:', { code: !!code, state, error });

    // Handle Facebook OAuth errors
    if (error) {
      const errorDescription = searchParams.get('error_description') || 'Unknown error';
      console.error('Facebook OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/integrations/meta?error=${encodeURIComponent(errorDescription)}`
      );
    }

    if (!code) {
      console.error('No authorization code received');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/integrations/meta?error=No authorization code received`
      );
    }

    // Check environment variables
    const clientId = process.env.FACEBOOK_CLIENT_ID;
    const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/integrations/meta/callback`;

    if (!clientId || !clientSecret) {
      console.error('Missing Facebook environment variables:', { 
        hasClientId: !!clientId, 
        hasClientSecret: !!clientSecret 
      });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/integrations/meta?error=Facebook integration not configured`
      );
    }

    console.log('Exchanging authorization code for access token...');

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://graph.facebook.com/v20.0/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', tokenResponse.status, errorText);
      throw new Error(`Failed to exchange authorization code for access token: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful');

    if (tokenData.error) {
      console.error('Facebook API error:', tokenData.error);
      throw new Error(`Facebook API error: ${tokenData.error.message || 'Unknown error'}`);
    }

    const userAccessToken = tokenData.access_token;

    console.log('Exchanging for long-lived token...');
    // Exchange for long-lived token
    const longLivedToken = await exchangeUserTokenForLongLived(userAccessToken);

    console.log('Fetching user pages...');
    // Get user's pages
    const pages = await getUserPages(longLivedToken.access_token);

    console.log('Pages fetched successfully:', pages.length);

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
    const errorMessage = error instanceof Error ? error.message : 'Failed to connect to Facebook';
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/integrations/meta?error=${encodeURIComponent(errorMessage)}`
    );
  }
}
