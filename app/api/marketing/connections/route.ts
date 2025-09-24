// app/api/marketing/connections/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userId = 'demo-user'; // replace with session user
    const rows = await prisma.marketingConnection.findMany({ where: { userId } });
    // Do NOT return tokens
    return NextResponse.json(rows.map((r: any) => ({
      id: r.id, 
      platform: r.platform, 
      accountId: r.accountId, 
      accountName: r.accountName, 
      updatedAt: r.updatedAt
    })));
  } catch (error) {
    console.error('Get connections error:', error);
    return NextResponse.json([]);
  }
}
