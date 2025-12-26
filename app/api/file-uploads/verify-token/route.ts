import { NextRequest, NextResponse } from 'next/server'
import { list } from '@vercel/blob'

export const dynamic = "force-dynamic"

// GET /api/file-uploads/verify-token - Verify BLOB_READ_WRITE_TOKEN is working
export async function GET(request: NextRequest) {
  try {
    let blobToken = process.env.BLOB_READ_WRITE_TOKEN
    
    if (!blobToken) {
      return NextResponse.json({ 
        success: false,
        error: 'BLOB_READ_WRITE_TOKEN is not set',
        tokenExists: false,
        tokenPrefix: 'none',
        tokenLength: 0
      }, { status: 500 })
    }

    // Strip quotes if present (common issue when copying from Vercel dashboard)
    blobToken = blobToken.trim().replace(/^["']|["']$/g, '')

    // Verify token format
    const tokenPrefix = blobToken.substring(0, 15)
    const expectedPrefix = 'vercel_blob_rw_'
    const hasCorrectPrefix = tokenPrefix === expectedPrefix
    
    // Try to use the token to list blobs (this will verify it works)
    let tokenWorks = false
    let errorMessage = null
    
    try {
      await list({ 
        limit: 1,
        token: blobToken 
      })
      tokenWorks = true
    } catch (error: any) {
      tokenWorks = false
      errorMessage = error?.message || 'Unknown error'
    }

    return NextResponse.json({
      success: tokenWorks,
      tokenExists: true,
      tokenPrefix,
      tokenLength: blobToken.length,
      hasCorrectPrefix,
      expectedPrefix,
      tokenWorks,
      error: errorMessage,
      // Show first 20 chars and last 10 chars for verification (don't expose full token)
      tokenPreview: `${blobToken.substring(0, 20)}...${blobToken.substring(blobToken.length - 10)}`
    })
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

