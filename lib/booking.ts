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

// Temporary in-memory config for demo/wiring. Replace with real fetch.
export async function getPublicBookingConfig(handle: string): Promise<PublicBookingConfig | null> {
  // Replace with actual DB or API call
  const demo: Record<string, PublicBookingConfig> = {
    tierra: {
      handle: "tierra",
      displayName: "Tierra Jackson",
      avatarUrl: "/images/demo/tierra.jpg",
      brandColor: "#ff4d8d",
      services: [
        { id: "powder-brow", name: "Powder Brow", price: 600, durationMinutes: 180 },
        { id: "ombre-brow", name: "Ombré Brow", price: 600, durationMinutes: 180 },
      ],
    },
  };
  return demo[handle] ?? null;
}
