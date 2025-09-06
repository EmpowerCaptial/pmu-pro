// Meta API helpers for Facebook/Instagram integration
// Handles token exchange, page management, and Instagram account linking

const FB_API = "https://graph.facebook.com/v20.0";

export interface LongLivedTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  expires_in?: number;
  instagram_business_account?: {
    id: string;
  };
}

export interface InstagramAccount {
  id: string;
  username: string;
  profile_picture_url?: string;
}

/**
 * Exchange short-lived user token for long-lived token
 */
export async function exchangeUserTokenForLongLived(userToken: string): Promise<LongLivedTokenResponse> {
  const url = new URL(`${FB_API}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", process.env.FACEBOOK_CLIENT_ID!);
  url.searchParams.set("client_secret", process.env.FACEBOOK_CLIENT_SECRET!);
  url.searchParams.set("fb_exchange_token", userToken);
  
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to exchange user token: ${error}`);
  }
  
  return res.json();
}

/**
 * Get user's Facebook pages with Instagram business account info
 */
export async function getUserPages(userAccessToken: string): Promise<FacebookPage[]> {
  const res = await fetch(
    `${FB_API}/me/accounts?fields=id,name,access_token,instagram_business_account&limit=100`,
    { 
      headers: { 
        Authorization: `Bearer ${userAccessToken}`,
        'Content-Type': 'application/json'
      } 
    }
  );
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch pages: ${error}`);
  }
  
  const data = await res.json();
  return data.data || [];
}

/**
 * Get Instagram business account ID from Facebook page
 */
export async function getIGFromPage(pageId: string, pageAccessToken: string): Promise<string | undefined> {
  const res = await fetch(`${FB_API}/${pageId}?fields=instagram_business_account`, {
    headers: { 
      Authorization: `Bearer ${pageAccessToken}`,
      'Content-Type': 'application/json'
    },
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to resolve IG account: ${error}`);
  }
  
  const data = await res.json();
  return data.instagram_business_account?.id;
}

/**
 * Get Instagram account basic info
 */
export async function getIGBasic(igUserId: string, pageAccessToken: string): Promise<InstagramAccount> {
  const res = await fetch(`${FB_API}/${igUserId}?fields=id,username,profile_picture_url`, {
    headers: { 
      Authorization: `Bearer ${pageAccessToken}`,
      'Content-Type': 'application/json'
    },
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch IG account: ${error}`);
  }
  
  return res.json();
}

/**
 * Validate Facebook access token
 */
export async function validateAccessToken(accessToken: string): Promise<boolean> {
  try {
    const res = await fetch(`${FB_API}/me?access_token=${accessToken}`);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Get Facebook user info
 */
export async function getFacebookUserInfo(accessToken: string): Promise<{
  id: string;
  name: string;
  email?: string;
}> {
  const res = await fetch(`${FB_API}/me?fields=id,name,email`, {
    headers: { 
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch user info: ${error}`);
  }
  
  return res.json();
}
