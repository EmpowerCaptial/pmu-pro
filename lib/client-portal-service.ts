// Client portal service for managing client access and data
import { 
  ClientPortalUser, 
  ClientPortalSession, 
  ClientPortalActivity, 
  ClientPortalDocument,
  ClientPortalAppointment,
  ClientPortalPayment,
  ClientPortalMessage,
  ClientPortalPermission
} from '@/types/client-portal'
import { EnhancedClientProfile } from '@/types/client-pipeline'

// In-memory storage for client portal data (in production, this would be a database)
let portalUsers: ClientPortalUser[] = []
let portalSessions: ClientPortalSession[] = []
let portalActivities: ClientPortalActivity[] = []
let portalDocuments: ClientPortalDocument[] = []
let portalAppointments: ClientPortalAppointment[] = []
let portalPayments: ClientPortalPayment[] = []
let portalMessages: ClientPortalMessage[] = []

// Initialize sample portal data
const initializePortalData = () => {
  // Sample portal users
  portalUsers = [
    {
      id: 'portal_user_1',
      clientId: '1',
      email: 'sarah.johnson@email.com',
      accessToken: 'token_sarah_123',
      lastLogin: new Date('2024-01-20'),
      isActive: true,
      permissions: [
        { id: 'perm_1', name: 'view_profile', granted: true, grantedAt: new Date('2024-01-15') },
        { id: 'perm_2', name: 'view_appointments', granted: true, grantedAt: new Date('2024-01-15') },
        { id: 'perm_3', name: 'view_documents', granted: true, grantedAt: new Date('2024-01-15') },
        { id: 'perm_4', name: 'view_aftercare', granted: true, grantedAt: new Date('2024-01-15') },
        { id: 'perm_5', name: 'make_payments', granted: true, grantedAt: new Date('2024-01-15') },
        { id: 'perm_6', name: 'book_appointments', granted: true, grantedAt: new Date('2024-01-15') }
      ],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date()
    },
    {
      id: 'portal_user_2',
      clientId: '2',
      email: 'maria.garcia@email.com',
      accessToken: 'token_maria_456',
      lastLogin: new Date('2024-01-19'),
      isActive: true,
      permissions: [
        { id: 'perm_7', name: 'view_profile', granted: true, grantedAt: new Date('2024-01-10') },
        { id: 'perm_8', name: 'view_appointments', granted: true, grantedAt: new Date('2024-01-10') },
        { id: 'perm_9', name: 'view_documents', granted: true, grantedAt: new Date('2024-01-10') },
        { id: 'perm_10', name: 'view_aftercare', granted: false, grantedAt: new Date('2024-01-10') },
        { id: 'perm_11', name: 'make_payments', granted: true, grantedAt: new Date('2024-01-10') },
        { id: 'perm_12', name: 'book_appointments', granted: true, grantedAt: new Date('2024-01-10') }
      ],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date()
    }
  ]

  // Sample portal documents
  portalDocuments = [
    {
      id: 'doc_1',
      clientId: '1',
      type: 'consent_form',
      title: 'Microblading Consent Form',
      description: 'Signed consent form for microblading procedure',
      fileUrl: '/documents/consent_forms/microblading_consent_sarah.pdf',
      fileSize: 245760,
      uploadedAt: new Date('2024-01-15'),
      isPublic: true,
      downloadCount: 2
    },
    {
      id: 'doc_2',
      clientId: '1',
      type: 'aftercare_instructions',
      title: 'Microblading Aftercare Instructions',
      description: 'Comprehensive aftercare guide for optimal healing',
      fileUrl: '/documents/aftercare/microblading_aftercare_sarah.pdf',
      fileSize: 512000,
      uploadedAt: new Date('2024-01-19'),
      isPublic: true,
      downloadCount: 1
    },
    {
      id: 'doc_3',
      clientId: '2',
      type: 'consent_form',
      title: 'Lip Blush Consent Form',
      description: 'Signed consent form for lip blush procedure',
      fileUrl: '/documents/consent_forms/lip_blush_consent_maria.pdf',
      fileSize: 198432,
      uploadedAt: new Date('2024-01-18'),
      isPublic: true,
      downloadCount: 1
    }
  ]

  // Sample portal appointments
  portalAppointments = [
    {
      id: 'apt_1',
      clientId: '1',
      type: 'Microblading Consultation',
      scheduledDate: new Date('2024-01-25 14:00:00'),
      duration: 60,
      status: 'scheduled',
      notes: 'Initial consultation for microblading procedure',
      reminderSent: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 'apt_2',
      clientId: '2',
      type: 'Lip Blush Procedure',
      scheduledDate: new Date('2024-01-28 10:00:00'),
      duration: 120,
      status: 'confirmed',
      notes: 'Lip blush procedure - client confirmed',
      reminderSent: true,
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-20')
    }
  ]

  // Sample portal payments
  portalPayments = [
    {
      id: 'pay_1',
      clientId: '1',
      amount: 200,
      type: 'deposit',
      status: 'completed',
      method: 'credit_card',
      transactionId: 'txn_123456',
      description: 'Deposit for microblading procedure',
      paidAt: new Date('2024-01-15'),
      createdAt: new Date('2024-01-15')
    },
    {
      id: 'pay_2',
      clientId: '2',
      amount: 600,
      type: 'full_payment',
      status: 'completed',
      method: 'credit_card',
      transactionId: 'txn_789012',
      description: 'Full payment for lip blush procedure',
      paidAt: new Date('2024-01-18'),
      createdAt: new Date('2024-01-18')
    },
    {
      id: 'pay_3',
      clientId: '1',
      amount: 600,
      type: 'full_payment',
      status: 'pending',
      method: 'bank_transfer',
      description: 'Remaining balance for microblading procedure',
      dueDate: new Date('2024-01-25'),
      createdAt: new Date('2024-01-19')
    }
  ]

  // Sample portal messages
  portalMessages = [
    {
      id: 'msg_1',
      clientId: '1',
      sender: 'artist',
      subject: 'Welcome to PMU Pro!',
      content: 'Welcome Sarah! We\'re excited to have you as a client. Your consultation is scheduled for January 25th at 2:00 PM.',
      isRead: true,
      attachments: [],
      timestamp: new Date('2024-01-15')
    },
    {
      id: 'msg_2',
      clientId: '1',
      sender: 'client',
      subject: 'Question about aftercare',
      content: 'Hi! I have a question about the aftercare instructions. Should I avoid swimming for the full 2 weeks?',
      isRead: true,
      attachments: [],
      timestamp: new Date('2024-01-20')
    },
    {
      id: 'msg_3',
      clientId: '2',
      sender: 'artist',
      subject: 'Appointment Confirmation',
      content: 'Hi Maria! Your lip blush procedure is confirmed for January 28th at 10:00 AM. Please arrive 15 minutes early.',
      isRead: false,
      attachments: [],
      timestamp: new Date('2024-01-20')
    }
  ]
}

// Initialize portal data
initializePortalData()

// Client Portal Service
export class ClientPortalService {
  private static instance: ClientPortalService

  static getInstance(): ClientPortalService {
    if (!ClientPortalService.instance) {
      ClientPortalService.instance = new ClientPortalService()
    }
    return ClientPortalService.instance
  }

  // Create portal access for a client
  createPortalAccess(client: EnhancedClientProfile): ClientPortalUser {
    const existingUser = portalUsers.find(u => u.clientId === client.id)
    if (existingUser) {
      return existingUser
    }

    const newUser: ClientPortalUser = {
      id: `portal_user_${Date.now()}`,
      clientId: client.id,
      email: client.email,
      accessToken: `token_${client.id}_${Date.now()}`,
      lastLogin: new Date(),
      isActive: true,
      permissions: [
        { id: `perm_${Date.now()}_1`, name: 'view_profile', granted: true, grantedAt: new Date() },
        { id: `perm_${Date.now()}_2`, name: 'view_appointments', granted: true, grantedAt: new Date() },
        { id: `perm_${Date.now()}_3`, name: 'view_documents', granted: true, grantedAt: new Date() },
        { id: `perm_${Date.now()}_4`, name: 'view_aftercare', granted: true, grantedAt: new Date() },
        { id: `perm_${Date.now()}_5`, name: 'make_payments', granted: true, grantedAt: new Date() },
        { id: `perm_${Date.now()}_6`, name: 'book_appointments', granted: true, grantedAt: new Date() }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    portalUsers.push(newUser)
    return newUser
  }

  // Authenticate portal user
  authenticatePortalUser(email: string, accessToken: string): ClientPortalUser | null {
    const user = portalUsers.find(u => u.email === email && u.accessToken === accessToken && u.isActive)
    if (user) {
      // Update last login
      user.lastLogin = new Date()
      user.updatedAt = new Date()
      
      // Log activity
      this.logActivity(user.clientId, 'login', 'Portal login successful')
      
      return user
    }
    return null
  }

  // Get portal user by client ID
  getPortalUserByClientId(clientId: string): ClientPortalUser | null {
    return portalUsers.find(u => u.clientId === clientId) || null
  }

  // Get client documents
  getClientDocuments(clientId: string): ClientPortalDocument[] {
    return portalDocuments.filter(doc => doc.clientId === clientId)
  }

  // Get client appointments
  getClientAppointments(clientId: string): ClientPortalAppointment[] {
    return portalAppointments.filter(apt => apt.clientId === clientId)
  }

  // Get client payments
  getClientPayments(clientId: string): ClientPortalPayment[] {
    return portalPayments.filter(pay => pay.clientId === clientId)
  }

  // Get client messages
  getClientMessages(clientId: string): ClientPortalMessage[] {
    return portalMessages.filter(msg => msg.clientId === clientId)
  }

  // Add client document
  addClientDocument(document: Omit<ClientPortalDocument, 'id' | 'uploadedAt' | 'downloadCount'>): ClientPortalDocument {
    const newDocument: ClientPortalDocument = {
      ...document,
      id: `doc_${Date.now()}`,
      uploadedAt: new Date(),
      downloadCount: 0
    }
    
    portalDocuments.push(newDocument)
    this.logActivity(document.clientId, 'download_document', `Document uploaded: ${document.title}`)
    
    return newDocument
  }

  // Add client appointment
  addClientAppointment(appointment: Omit<ClientPortalAppointment, 'id' | 'createdAt' | 'updatedAt'>): ClientPortalAppointment {
    const newAppointment: ClientPortalAppointment = {
      ...appointment,
      id: `apt_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    portalAppointments.push(newAppointment)
    this.logActivity(appointment.clientId, 'book_appointment', `Appointment booked: ${appointment.type}`)
    
    return newAppointment
  }

  // Add client payment
  addClientPayment(payment: Omit<ClientPortalPayment, 'id' | 'createdAt'>): ClientPortalPayment {
    const newPayment: ClientPortalPayment = {
      ...payment,
      id: `pay_${Date.now()}`,
      createdAt: new Date()
    }
    
    portalPayments.push(newPayment)
    this.logActivity(payment.clientId, 'make_payment', `Payment made: ${payment.description}`)
    
    return newPayment
  }

  // Add client message
  addClientMessage(message: Omit<ClientPortalMessage, 'id' | 'createdAt'>): ClientPortalMessage {
    const newMessage: ClientPortalMessage = {
      ...message,
      id: `msg_${Date.now()}`,
      timestamp: new Date()
    }
    
    portalMessages.push(newMessage)
    this.logActivity(message.clientId, 'view_profile', `Message sent: ${message.subject}`)
    
    return newMessage
  }

  // Log portal activity
  private logActivity(clientId: string, action: ClientPortalActivity['action'], details: string) {
    const activity: ClientPortalActivity = {
      id: `activity_${Date.now()}`,
      clientId,
      action,
      details,
      timestamp: new Date(),
      ipAddress: '127.0.0.1' // In production, get from request
    }
    
    portalActivities.push(activity)
  }

  // Get client activity
  getClientActivity(clientId: string): ClientPortalActivity[] {
    return portalActivities.filter(activity => activity.clientId === clientId)
  }

  // Update appointment status
  updateAppointmentStatus(appointmentId: string, status: ClientPortalAppointment['status']): ClientPortalAppointment | null {
    const appointment = portalAppointments.find(apt => apt.id === appointmentId)
    if (appointment) {
      appointment.status = status
      appointment.updatedAt = new Date()
      this.logActivity(appointment.clientId, 'view_appointment', `Appointment status updated to: ${status}`)
      return appointment
    }
    return null
  }

  // Mark message as read
  markMessageAsRead(messageId: string): ClientPortalMessage | null {
    const message = portalMessages.find(msg => msg.id === messageId)
    if (message && !message.isRead) {
      message.isRead = true
      return message
    }
    return null
  }

  // Get portal statistics
  getPortalStats() {
    return {
      totalUsers: portalUsers.length,
      activeUsers: portalUsers.filter(u => u.isActive).length,
      totalDocuments: portalDocuments.length,
      totalAppointments: portalAppointments.length,
      totalPayments: portalPayments.length,
      totalMessages: portalMessages.length,
      recentActivity: portalActivities.slice(-10) // Last 10 activities
    }
  }

  // Generate portal access link
  generatePortalAccessLink(clientId: string): string {
    const user = this.getPortalUserByClientId(clientId)
    if (user) {
      return `/client-portal/${clientId}?token=${user.accessToken}`
    }
    return ''
  }

  // Check user permission
  hasPermission(clientId: string, permission: ClientPortalPermission['name']): boolean {
    const user = this.getPortalUserByClientId(clientId)
    if (!user) return false
    
    const permissionObj = user.permissions.find(p => p.name === permission)
    return permissionObj?.granted || false
  }
}
