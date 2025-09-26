import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { APP_SCHEMA_VERSION } from '@/lib/schemaVersion';
import { getAllFlags } from '@/lib/flags';
import { getBlobBaseUrl } from '@/lib/blob';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check database connectivity
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;
    
    // Get schema version
    const metaRow = await (prisma as any).meta.findUnique({ 
      where: { key: 'schemaVersion' } 
    });
    const schemaVersion = metaRow ? Number(metaRow.value) : 0;
    
    // Check blob storage (basic connectivity)
    const blobBaseUrl = getBlobBaseUrl();
    const blobReachable = blobBaseUrl.startsWith('https://');
    
    // Get feature flags
    const featureFlags = getAllFlags();
    
    // Get git information (if available)
    const gitSha = process.env.VERCEL_GIT_COMMIT_SHA || 'unknown';
    const gitBranch = process.env.VERCEL_GIT_COMMIT_REF || 'unknown';
    
    const responseTime = Date.now() - startTime;
    
    const health = {
      ok: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: {
        schema: schemaVersion,
        required: APP_SCHEMA_VERSION,
        compatible: schemaVersion >= APP_SCHEMA_VERSION
      },
      api: {
        versions: ['v1'], // Add v2 when implemented
        current: 'v1'
      },
      database: {
        connected: true,
        latency: `${dbLatency}ms`,
        type: process.env.DATABASE_URL?.startsWith('postgres') ? 'postgresql' : 'unknown'
      },
      storage: {
        blob: {
          reachable: blobReachable,
          baseUrl: blobBaseUrl
        }
      },
      features: {
        flags: featureFlags,
        count: Object.keys(featureFlags).length
      },
      deployment: {
        gitSha: gitSha.substring(0, 8),
        gitBranch,
        vercelEnv: process.env.VERCEL_ENV || 'development'
      },
      performance: {
        responseTime: `${responseTime}ms`
      }
    };
    
    return NextResponse.json(health, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    const health = {
      ok: false,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      performance: {
        responseTime: `${responseTime}ms`
      }
    };
    
    return NextResponse.json(health, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } finally {
    await prisma.$disconnect();
  }
}
