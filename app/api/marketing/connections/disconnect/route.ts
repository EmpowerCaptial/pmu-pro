// app/api/marketing/connections/disconnect/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const userId = 'demo-user'; // replace with session user
  const { platform } = await req.json();
  await prisma.marketingConnection.deleteMany({ where: { userId, platform } });
  return NextResponse.json({ ok: true });
}

