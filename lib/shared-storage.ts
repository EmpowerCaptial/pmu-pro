// Shared storage for all consent form APIs
// In production, this should be stored in a database
export const consentFormsStorage = new Map<string, any>()
export const formAuditLog = new Map<string, any[]>()
export const notificationsStorage = new Map<string, any[]>()

// Helper functions
export function logFormAccess(formId: string, action: string, details: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    formId,
    details,
    ipAddress: 'server-side', // In production, get from request
    userAgent: 'server-side' // In production, get from request
  }
  
  const existingLogs = formAuditLog.get(formId) || []
  existingLogs.push(logEntry)
  formAuditLog.set(formId, existingLogs)
}

export function createNotification(artistId: string, notification: any) {
  const existingNotifications = notificationsStorage.get(artistId) || []
  existingNotifications.unshift(notification) // Add to beginning
  
  // Keep only last 50 notifications
  if (existingNotifications.length > 50) {
    existingNotifications.splice(50)
  }
  
  notificationsStorage.set(artistId, existingNotifications)
}


