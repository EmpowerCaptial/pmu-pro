import { NextResponse } from "next/server";
import { getPublicBookingConfig } from "@/lib/booking";

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { handle: string } }) {
  const cfg = await getPublicBookingConfig(params.handle);
  if (!cfg) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(cfg);
}
