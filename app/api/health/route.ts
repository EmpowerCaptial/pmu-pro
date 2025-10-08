import { NextResponse } from 'next/server'

/**
 * Health check endpoint
 * Used to detect network degradation or API availability
 */
export async function GET() {
  return NextResponse.json({ 
    ok: true,
    timestamp: new Date().toISOString(),
    service: 'pmu-pro-api'
  })
}

export const dynamic = 'force-dynamic'
