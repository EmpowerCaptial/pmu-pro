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

// TODO: point to your existing booking flow (internal route or external system)
export const BOOK_URL_BASE = process.env.NEXT_PUBLIC_BOOK_URL_BASE || 
  "https://thepmuguide.com/checkout"; // example placeholder; update

export function buildBookingHref(handle: string, serviceId?: string) {
  const url = new URL(BOOK_URL_BASE);
  url.searchParams.set("owner", handle);
  if (serviceId) url.searchParams.set("service", serviceId);
  return url.toString();
}

// Generate user handle from email
export function generateUserHandle(email: string): string {
  return email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
}

// Get booking config for a user handle
export async function getPublicBookingConfig(handle: string): Promise<PublicBookingConfig | null> {
  try {
    // For demo purposes, we'll use the demo email
    // In production, you'd want to store handle-to-email mapping in the database
    const demoEmail = 'universalbeautystudioacademy@gmail.com';
    
    // Fetch services from the API
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : (process.env.NEXT_PUBLIC_BASE_URL || 'https://thepmuguide.com');
    
    const response = await fetch(`${baseUrl}/api/services`, {
      method: 'GET',
      headers: {
        'x-user-email': demoEmail,
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
