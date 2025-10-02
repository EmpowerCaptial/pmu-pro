import { getServices } from './services-api';

export type PublicBookingConfig = {
  handle: string;        // unique username/slug
  displayName: string;   // shown on booking microsite
  avatarUrl?: string;    // optional logo/headshot
  brandColor?: string;   // css color for accents
  services?: Array<{
    id: string;
    name: string;
    price?: number;
    durationMinutes?: number;
    imageUrl?: string;
  }>;
};

// Public booking page URL
export const BOOK_URL_BASE = process.env.NEXT_PUBLIC_BOOK_URL_BASE || 
  "https://thepmuguide.com/book"; // Updated to use the new booking flow

export function buildBookingHref(handle: string, serviceId?: string) {
  const url = new URL(BOOK_URL_BASE);
  url.searchParams.set("owner", handle);
  if (serviceId) url.searchParams.set("service", serviceId);
  return url.toString();
}

// Generate user handle from studio name or email
export function generateUserHandle(studioName?: string, email?: string): string {
  // Prefer studio name if available
  if (studioName && studioName.trim()) {
    return studioName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }
  
  // Fallback to email if no studio name
  if (email) {
    return email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
  }
  
  // Final fallback
  return 'pmu-artist';
}

// Map handle back to email (for public booking pages)
export function getEmailFromHandle(handle: string): string | null {
  // For production, we would query the database to find the user by handle
  // For now, we'll return null to indicate we don't have a mapping
  // This will be handled by the API route which has database access
  return null;
}

// Get booking config for a user handle
export async function getPublicBookingConfig(handle: string, userEmail?: string): Promise<PublicBookingConfig | null> {
  try {
    // Use the provided user email, or try to map from handle
    const emailToUse = userEmail || getEmailFromHandle(handle);
    
    // Fetch services from the API
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : (process.env.NEXT_PUBLIC_BASE_URL || 'https://thepmuguide.com');
    
    const response = await fetch(`${baseUrl}/api/services`, {
      method: 'GET',
      headers: {
        'x-user-email': emailToUse,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch services:', response.status);
      return {
        handle,
        displayName: handle.charAt(0).toUpperCase() + handle.slice(1).replace(/-/g, ' '),
        avatarUrl: undefined,
        brandColor: "#8b5cf6", // lavender
        services: []
      };
    }

    const data = await response.json();
    const allServices = data.services || [];
    const activeServices = allServices.filter((service: any) => service.isActive);
    
    // Convert services to booking format
    const bookingServices = activeServices.map((service: any) => ({
      id: service.id,
      name: service.name,
      price: service.defaultPrice,
      durationMinutes: service.defaultDuration,
      imageUrl: service.imageUrl
    }));

    return {
      handle,
      displayName: handle.charAt(0).toUpperCase() + handle.slice(1).replace(/-/g, ' '),
      avatarUrl: undefined,
      brandColor: "#8b5cf6", // lavender
      services: bookingServices
    };
  } catch (error) {
    console.error('Error loading booking config:', error);
    // Fallback to demo config
    return {
      handle,
      displayName: handle.charAt(0).toUpperCase() + handle.slice(1).replace(/-/g, ' '),
      avatarUrl: undefined,
      brandColor: "#8b5cf6", // lavender
      services: []
    };
  }
}
