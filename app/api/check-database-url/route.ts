import { NextResponse } from 'next/server'

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Show what database URL is being used (masked)
    const dbUrl = process.env.DATABASE_URL || 'NOT SET'
    
    // Mask sensitive parts
    const masked = dbUrl.replace(/:[^:@]+@/, ':****@').substring(0, 100)
    
    return NextResponse.json({
      success: true,
      databaseUrl: masked,
      environment: process.env.NODE_ENV,
      vercel: process.env.VERCEL ? 'true' : 'false'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

