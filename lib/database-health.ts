/**
 * Database Health Monitoring
 * Provides real-time database connection monitoring and recovery
 */

import { PrismaClient } from '@prisma/client'

class DatabaseHealthMonitor {
  private prisma: PrismaClient
  private isHealthy: boolean = true
  private lastCheck: Date = new Date()
  private checkInterval: number = 30000 // 30 seconds
  private maxRetries: number = 3
  private retryDelay: number = 5000 // 5 seconds

  constructor() {
    this.prisma = new PrismaClient({
      log: ['error', 'warn'],
      errorFormat: 'pretty',
    })
    
    this.startHealthMonitoring()
  }

  /**
   * Start continuous health monitoring
   */
  private startHealthMonitoring() {
    setInterval(async () => {
      await this.performHealthCheck()
    }, this.checkInterval)
  }

  /**
   * Perform a health check on the database
   */
  async performHealthCheck(): Promise<boolean> {
    try {
      // Test basic connection
      await this.prisma.$connect()
      
      // Test a simple query
      await this.prisma.user.count()
      
      this.isHealthy = true
      this.lastCheck = new Date()
      
      console.log('✅ Database health check passed')
      return true
      
    } catch (error) {
      console.error('❌ Database health check failed:', error)
      this.isHealthy = false
      
      // Attempt recovery
      await this.attemptRecovery()
      return false
    }
  }

  /**
   * Attempt to recover from database connection issues
   */
  private async attemptRecovery() {
    console.log('🔄 Attempting database recovery...')
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 Recovery attempt ${attempt}/${this.maxRetries}`)
        
        // Disconnect and reconnect
        await this.prisma.$disconnect()
        await new Promise(resolve => setTimeout(resolve, this.retryDelay))
        
        // Test connection
        await this.prisma.$connect()
        await this.prisma.user.count()
        
        this.isHealthy = true
        this.lastCheck = new Date()
        
        console.log('✅ Database recovery successful')
        return
        
      } catch (error) {
        console.error(`❌ Recovery attempt ${attempt} failed:`, error)
        
        if (attempt === this.maxRetries) {
          console.error('❌ All recovery attempts failed')
          this.notifyAdmins()
        }
      }
    }
  }

  /**
   * Notify administrators of critical database issues
   */
  private notifyAdmins() {
    // In production, this would send alerts to administrators
    console.error('🚨 CRITICAL: Database connection lost - Admin notification required')
    
    // You could integrate with:
    // - Email notifications
    // - Slack alerts
    // - PagerDuty
    // - Custom monitoring systems
  }

  /**
   * Get current health status
   */
  getHealthStatus() {
    return {
      isHealthy: this.isHealthy,
      lastCheck: this.lastCheck,
      uptime: Date.now() - this.lastCheck.getTime()
    }
  }

  /**
   * Force a health check
   */
  async forceHealthCheck(): Promise<boolean> {
    return await this.performHealthCheck()
  }

  /**
   * Get database connection info
   */
  async getConnectionInfo() {
    try {
      const result = await this.prisma.$queryRaw`SELECT version() as version, now() as current_time`
      return result
    } catch (error) {
      console.error('Failed to get connection info:', error)
      return null
    }
  }
}

// Singleton instance
let healthMonitor: DatabaseHealthMonitor | null = null

export function getDatabaseHealthMonitor(): DatabaseHealthMonitor {
  if (!healthMonitor) {
    healthMonitor = new DatabaseHealthMonitor()
  }
  return healthMonitor
}

/**
 * API endpoint for health checks
 */
export async function checkDatabaseHealth() {
  const monitor = getDatabaseHealthMonitor()
  const isHealthy = await monitor.forceHealthCheck()
  const status = monitor.getHealthStatus()
  
  return {
    healthy: isHealthy,
    status,
    timestamp: new Date().toISOString()
  }
}
