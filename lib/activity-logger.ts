export interface ActivityLog {
  id: string
  timestamp: string
  userId: string
  userName: string
  userEmail: string
  action: string
  details: string
  ipAddress: string
  userAgent: string
  status: 'success' | 'warning' | 'error'
  category: 'auth' | 'user' | 'client' | 'procedure' | 'document' | 'payment' | 'system'
  metadata?: Record<string, any>
}

export interface ActivityLoggerConfig {
  enabled: boolean
  logToConsole: boolean
  logToDatabase: boolean
  logToFile: boolean
  retentionDays: number
}

class ActivityLogger {
  private config: ActivityLoggerConfig
  private logs: ActivityLog[] = []

  constructor(config: Partial<ActivityLoggerConfig> = {}) {
    this.config = {
      enabled: true,
      logToConsole: true,
      logToDatabase: true,
      logToFile: false,
      retentionDays: 90,
      ...config
    }
  }

  /**
   * Log a user activity
   */
  async logActivity(params: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> {
    if (!this.config.enabled) return

    const log: ActivityLog = {
      ...params,
      id: this.generateId(),
      timestamp: new Date().toISOString()
    }

    // Add to memory
    this.logs.push(log)

    // Log to console if enabled
    if (this.config.logToConsole) {
      this.logToConsole(log)
    }

    // Log to database if enabled
    if (this.config.logToDatabase) {
      await this.logToDatabase(log)
    }

    // Log to file if enabled
    if (this.config.logToFile) {
      await this.logToFile(log)
    }

    // Clean up old logs
    this.cleanupOldLogs()
  }

  /**
   * Log authentication events
   */
  async logAuthEvent(
    userId: string,
    userName: string,
    userEmail: string,
    action: 'login' | 'logout' | 'login_failed' | 'password_reset' | 'account_locked',
    ipAddress: string,
    userAgent: string,
    details?: string
  ): Promise<void> {
    await this.logActivity({
      userId,
      userName,
      userEmail,
      action: `AUTH_${action.toUpperCase()}`,
      details: details || `${action} for user ${userName}`,
      ipAddress,
      userAgent,
      status: action === 'login_failed' || action === 'account_locked' ? 'error' : 'success',
      category: 'auth'
    })
  }

  /**
   * Log user management events
   */
  async logUserEvent(
    userId: string,
    userName: string,
    userEmail: string,
    action: 'created' | 'updated' | 'deleted' | 'suspended' | 'activated' | 'role_changed',
    targetUserId: string,
    targetUserName: string,
    ipAddress: string,
    userAgent: string,
    details?: string
  ): Promise<void> {
    await this.logActivity({
      userId,
      userName,
      userEmail,
      action: `USER_${action.toUpperCase()}`,
      details: details || `${action} user ${targetUserName}`,
      ipAddress,
      userAgent,
      status: 'success',
      category: 'user',
      metadata: { targetUserId, targetUserName }
    })
  }

  /**
   * Log client-related events
   */
  async logClientEvent(
    userId: string,
    userName: string,
    userEmail: string,
    action: 'created' | 'updated' | 'deleted' | 'document_uploaded' | 'procedure_added',
    clientId: string,
    clientName: string,
    ipAddress: string,
    userAgent: string,
    details?: string
  ): Promise<void> {
    await this.logActivity({
      userId,
      userName,
      userEmail,
      action: `CLIENT_${action.toUpperCase()}`,
      details: details || `${action} for client ${clientName}`,
      ipAddress,
      userAgent,
      status: 'success',
      category: 'client',
      metadata: { clientId, clientName }
    })
  }

  /**
   * Log payment events
   */
  async logPaymentEvent(
    userId: string,
    userName: string,
    userEmail: string,
    action: 'payment_success' | 'payment_failed' | 'subscription_created' | 'subscription_cancelled',
    amount?: number,
    currency?: string,
    ipAddress?: string,
    userAgent?: string,
    details?: string
  ): Promise<void> {
    await this.logActivity({
      userId,
      userName,
      userEmail,
      action: `PAYMENT_${action.toUpperCase()}`,
      details: details || `${action} for user ${userName}`,
      ipAddress: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown',
      status: action === 'payment_failed' ? 'error' : 'success',
      category: 'payment',
      metadata: { amount, currency }
    })
  }

  /**
   * Log system events
   */
  async logSystemEvent(
    action: 'backup_completed' | 'maintenance_started' | 'maintenance_completed' | 'error_occurred' | 'performance_warning',
    details: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logActivity({
      userId: 'system',
      userName: 'System',
      userEmail: 'system@pmu-pro.com',
      action: `SYSTEM_${action.toUpperCase()}`,
      details,
      ipAddress: '127.0.0.1',
      userAgent: 'System Service',
      status: action === 'error_occurred' ? 'error' : action === 'performance_warning' ? 'warning' : 'success',
      category: 'system',
      metadata
    })
  }

  /**
   * Get logs with filters
   */
  getLogs(filters?: {
    userId?: string
    category?: string
    status?: string
    startDate?: string
    endDate?: string
    limit?: number
  }): ActivityLog[] {
    let filteredLogs = [...this.logs]

    if (filters?.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId)
    }

    if (filters?.category) {
      filteredLogs = filteredLogs.filter(log => log.category === filters.category)
    }

    if (filters?.status) {
      filteredLogs = filteredLogs.filter(log => log.status === filters.status)
    }

    if (filters?.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!)
    }

    if (filters?.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!)
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    if (filters?.limit) {
      filteredLogs = filteredLogs.slice(0, filters.limit)
    }

    return filteredLogs
  }

  /**
   * Get logs for a specific user
   */
  getUserLogs(userId: string, limit: number = 50): ActivityLog[] {
    return this.getLogs({ userId, limit })
  }

  /**
   * Get recent logs
   */
  getRecentLogs(limit: number = 100): ActivityLog[] {
    return this.getLogs({ limit })
  }

  /**
   * Export logs to JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = []
  }

  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private logToConsole(log: ActivityLog): void {
    const timestamp = new Date(log.timestamp).toLocaleString()
    const level = log.status.toUpperCase()
    const message = `[${timestamp}] [${level}] ${log.action}: ${log.details}`
    
    switch (log.status) {
      case 'error':
        console.error(message)
        break
      case 'warning':
        console.warn(message)
        break
      default:
        console.log(message)
    }
  }

  private async logToDatabase(log: ActivityLog): Promise<void> {
    try {
      // In a real app, this would save to your database
      // For now, we'll just simulate it
      console.log('Saving to database:', log.id)
      
      // Example database save:
      // await prisma.activityLog.create({
      //   data: {
      //     id: log.id,
      //     timestamp: new Date(log.timestamp),
      //     userId: log.userId,
      //     userName: log.userName,
      //     userEmail: log.userEmail,
      //     action: log.action,
      //     details: log.details,
      //     ipAddress: log.ipAddress,
      //     userAgent: log.userAgent,
      //     status: log.status,
      //     category: log.category,
      //     metadata: log.metadata
      //   }
      // })
    } catch (error) {
      console.error('Failed to save log to database:', error)
    }
  }

  private async logToFile(log: ActivityLog): Promise<void> {
    try {
      // In a real app, this would append to a log file
      // For now, we'll just simulate it
      console.log('Appending to log file:', log.id)
    } catch (error) {
      console.error('Failed to write to log file:', error)
    }
  }

  private cleanupOldLogs(): void {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays)
    
    this.logs = this.logs.filter(log => new Date(log.timestamp) > cutoffDate)
  }
}

// Create and export a singleton instance
export const activityLogger = new ActivityLogger()

// Export the class for testing or custom instances
export { ActivityLogger }
