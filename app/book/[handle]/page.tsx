"use client";

import { UnifiedBookingPage } from '@/components/booking/unified-booking-page';

export default function PublicBookingPage({ params }: { params: { handle: string } }) {
  return <UnifiedBookingPage artistHandle={params.handle} />
}