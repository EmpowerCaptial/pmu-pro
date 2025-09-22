import { getActiveServices } from './services-config';

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
  // Get active services from the services system
  const activeServices = getActiveServices();
  
  // Convert services to booking format
  const bookingServices = activeServices.map(service => ({
    id: service.id,
    name: service.name,
    price: service.defaultPrice,
    durationMinutes: service.defaultDuration,
    imageUrl: service.imageUrl
  }));

  // For demo purposes, create config for any handle
  // In production, this would fetch from database
  return {
    handle,
    displayName: handle.charAt(0).toUpperCase() + handle.slice(1).replace(/-/g, ' '),
    avatarUrl: undefined,
    brandColor: "#8b5cf6", // lavender
    services: bookingServices
  };
}
