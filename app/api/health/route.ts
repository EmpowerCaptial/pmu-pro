import { NextRequest, NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/database-health'

/**
 * Health Check API Endpoint
 * Provides system health status for monitoring and load balancers
 */

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Check database health
    const dbHealth = await checkDatabaseHealth()
    
    const responseTime = Date.now() - startTime
    
    const healthStatus = {
      status: dbHealth.healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      database: {
        healthy: dbHealth.healthy,
        lastCheck: dbHealth.status.lastCheck,
        uptime: dbHealth.status.uptime
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    }
    
    // Return appropriate HTTP status
    const statusCode = dbHealth.healthy ? 200 : 503
    
    return NextResponse.json(healthStatus, { status: statusCode })
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}