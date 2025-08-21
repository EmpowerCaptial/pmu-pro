// Ticket Management System for PMU Pro
// Handles support tickets, status updates, and resolution workflow

export interface SupportTicket {
  id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'general'
  assignedTo?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  closedAt?: string
  resolution?: string
  resolutionNotes?: string
  resolvedBy?: string
  emailNotifications: EmailNotification[]
}

export interface EmailNotification {
  id: string
  type: 'ticket_created' | 'ticket_assigned' | 'ticket_resolved' | 'ticket_closed'
  sentTo: string
  sentAt: string
  subject: string
  message: string
  status: 'sent' | 'failed' | 'pending'
}

export interface TicketStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
  highPriority: number
  urgent: number
  thisWeek: number
  thisMonth: number
}

// Mock data for demonstration
const mockTickets: SupportTicket[] = [
  {
    id: 'ticket_001',
    title: 'Payment Processing Issue',
    description: 'User unable to complete subscription payment. Getting error message "Payment failed" when trying to use credit card.',
    status: 'open',
    priority: 'high',
    category: 'billing',
    assignedTo: 'manager1',
    createdBy: 'john.doe@example.com',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
    emailNotifications: []
  },
  {
    id: 'ticket_002',
    title: 'Feature Request - Bulk Export',
    description: 'Request for ability to export multiple client records at once. Currently only able to export one at a time.',
    status: 'in_progress',
    priority: 'medium',
    category: 'feature_request',
    assignedTo: 'rep1',
    createdBy: 'jane.smith@example.com',
    createdAt: '2024-01-14T14:30:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
    emailNotifications: []
  },
  {
    id: 'ticket_003',
    title: 'Skin Analysis Accuracy',
    description: 'User reports inconsistent Fitzpatrick type results. Same photo gives different results on different attempts.',
    status: 'resolved',
    priority: 'medium',
    category: 'bug_report',
    assignedTo: 'manager1',
    createdBy: 'bob.wilson@example.com',
    createdAt: '2024-01-15T08:30:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    resolvedAt: '2024-01-15T10:00:00Z',
    resolution: 'Fixed algorithm inconsistency in skin analysis. Results now consistent across multiple attempts.',
    resolutionNotes: 'Updated Fitzpatrick classification algorithm to use consistent seed values.',
    resolvedBy: 'manager1',
    emailNotifications: []
  }
]

// Local storage key
const TICKETS_STORAGE_KEY = 'pmu_pro_tickets'

// Save tickets to local storage
function saveTickets(tickets: SupportTicket[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets))
  }
}

// Load tickets from local storage
function loadTickets(): SupportTicket[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(TICKETS_STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.error('Error parsing stored tickets:', error)
      }
    }
  }
  return [...mockTickets]
}

// Get all tickets
export function getAllTickets(): SupportTicket[] {
  return loadTickets()
}

// Get ticket by ID
export function getTicketById(id: string): SupportTicket | null {
  const tickets = getAllTickets()
  return tickets.find(ticket => ticket.id === id) || null
}

// Create new ticket
export function createTicket(ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'emailNotifications'>): SupportTicket {
  const tickets = getAllTickets()
  const newTicket: SupportTicket = {
    ...ticketData,
    id: `ticket_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    emailNotifications: []
  }
  
  tickets.push(newTicket)
  saveTickets(tickets)
  
  // Send email notification to user
  sendTicketNotification(newTicket, 'ticket_created')
  
  return newTicket
}

// Update ticket status
export function updateTicketStatus(
  ticketId: string, 
  status: SupportTicket['status'], 
  updatedBy: string,
  resolution?: string,
  resolutionNotes?: string
): SupportTicket | null {
  const tickets = getAllTickets()
  const ticketIndex = tickets.findIndex(ticket => ticket.id === ticketId)
  
  if (ticketIndex === -1) return null
  
  const updatedTicket: SupportTicket = {
    ...tickets[ticketIndex],
    status,
    updatedAt: new Date().toISOString(),
    resolution,
    resolutionNotes,
    resolvedBy: updatedBy
  }
  
  // Set resolution timestamp if resolving
  if (status === 'resolved') {
    updatedTicket.resolvedAt = new Date().toISOString()
  }
  
  // Set closed timestamp if closing
  if (status === 'closed') {
    updatedTicket.closedAt = new Date().toISOString()
  }
  
  tickets[ticketIndex] = updatedTicket
  saveTickets(tickets)
  
  // Send appropriate email notification
  if (status === 'resolved') {
    sendTicketNotification(updatedTicket, 'ticket_resolved')
  } else if (status === 'closed') {
    sendTicketNotification(updatedTicket, 'ticket_closed')
  }
  
  return updatedTicket
}

// Assign ticket to staff member
export function assignTicket(ticketId: string, assignedTo: string): SupportTicket | null {
  const tickets = getAllTickets()
  const ticketIndex = tickets.findIndex(ticket => ticket.id === ticketId)
  
  if (ticketIndex === -1) return null
  
  const updatedTicket: SupportTicket = {
    ...tickets[ticketIndex],
    assignedTo,
    updatedAt: new Date().toISOString()
  }
  
  tickets[ticketIndex] = updatedTicket
  saveTickets(tickets)
  
  // Send assignment notification
  sendTicketNotification(updatedTicket, 'ticket_assigned')
  
  return updatedTicket
}

// Resolve ticket
export function resolveTicket(
  ticketId: string, 
  resolvedBy: string, 
  resolution: string, 
  resolutionNotes?: string
): SupportTicket | null {
  return updateTicketStatus(ticketId, 'resolved', resolvedBy, resolution, resolutionNotes)
}

// Close ticket
export function closeTicket(ticketId: string, closedBy: string): SupportTicket | null {
  return updateTicketStatus(ticketId, 'closed', closedBy)
}

// Get tickets by status
export function getTicketsByStatus(status: SupportTicket['status'] | 'all'): SupportTicket[] {
  const tickets = getAllTickets()
  if (status === 'all') return tickets
  return tickets.filter(ticket => ticket.status === status)
}

// Get tickets by priority
export function getTicketsByPriority(priority: SupportTicket['priority']): SupportTicket[] {
  const tickets = getAllTickets()
  return tickets.filter(ticket => ticket.priority === priority)
}

// Get tickets by category
export function getTicketsByCategory(category: SupportTicket['category']): SupportTicket[] {
  const tickets = getAllTickets()
  return tickets.filter(ticket => ticket.category === category)
}

// Get tickets assigned to specific staff member
export function getTicketsAssignedTo(staffMember: string): SupportTicket[] {
  const tickets = getAllTickets()
  return tickets.filter(ticket => ticket.assignedTo === staffMember)
}

// Get tickets created by specific user
export function getTicketsByUser(email: string): SupportTicket[] {
  const tickets = getAllTickets()
  return tickets.filter(ticket => ticket.createdBy === email)
}

// Search tickets
export function searchTickets(query: string): SupportTicket[] {
  const tickets = getAllTickets()
  const lowerQuery = query.toLowerCase()
  
  return tickets.filter(ticket => 
    ticket.title.toLowerCase().includes(lowerQuery) ||
    ticket.description.toLowerCase().includes(lowerQuery) ||
    ticket.category.toLowerCase().includes(lowerQuery) ||
    ticket.status.toLowerCase().includes(lowerQuery)
  )
}

// Get ticket statistics
export function getTicketStats(): TicketStats {
  const tickets = getAllTickets()
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  return {
    total: tickets.length,
    open: tickets.filter(ticket => ticket.status === 'open').length,
    inProgress: tickets.filter(ticket => ticket.status === 'in_progress').length,
    resolved: tickets.filter(ticket => ticket.status === 'resolved').length,
    closed: tickets.filter(ticket => ticket.status === 'closed').length,
    highPriority: tickets.filter(ticket => ticket.priority === 'high').length,
    urgent: tickets.filter(ticket => ticket.priority === 'urgent').length,
    thisWeek: tickets.filter(ticket => new Date(ticket.createdAt) >= weekAgo).length,
    thisMonth: tickets.filter(ticket => new Date(ticket.createdAt) >= monthAgo).length
  }
}

// Send email notification (mock implementation)
function sendTicketNotification(ticket: SupportTicket, type: EmailNotification['type']): void {
  const notification: EmailNotification = {
    id: `notif_${Date.now()}`,
    type,
    sentTo: ticket.createdBy,
    sentAt: new Date().toISOString(),
    subject: getNotificationSubject(type, ticket),
    message: getNotificationMessage(type, ticket),
    status: 'sent'
  }
  
  // Add notification to ticket
  ticket.emailNotifications.push(notification)
  
  // In production, this would send an actual email
  console.log(`📧 Email notification sent to ${ticket.createdBy}:`, notification.subject)
  
  // Simulate email sending
  setTimeout(() => {
    console.log(`✅ Email sent successfully to ${ticket.createdBy}`)
  }, 1000)
}

// Get notification subject based on type
function getNotificationSubject(type: EmailNotification['type'], ticket: SupportTicket): string {
  switch (type) {
    case 'ticket_created':
      return `Support Ticket Created: ${ticket.title}`
    case 'ticket_assigned':
      return `Your Ticket Has Been Assigned: ${ticket.title}`
    case 'ticket_resolved':
      return `Ticket Resolved: ${ticket.title}`
    case 'ticket_closed':
      return `Ticket Closed: ${ticket.title}`
    default:
      return `Ticket Update: ${ticket.title}`
  }
}

// Get notification message based on type
function getNotificationMessage(type: EmailNotification['type'], ticket: SupportTicket): string {
  switch (type) {
    case 'ticket_created':
      return `Your support ticket "${ticket.title}" has been created and is being reviewed by our team. We'll get back to you soon.`
    case 'ticket_assigned':
      return `Your ticket "${ticket.title}" has been assigned to a support specialist and is being worked on.`
    case 'ticket_resolved':
      return `Great news! Your ticket "${ticket.title}" has been resolved. Resolution: ${ticket.resolution || 'Issue has been fixed'}.`
    case 'ticket_closed':
      return `Your ticket "${ticket.title}" has been closed. If you have any further questions, please don't hesitate to contact us.`
    default:
      return `Your ticket "${ticket.title}" has been updated. Please check the ticket for more details.`
  }
}

// Get priority color for UI
export function getPriorityColor(priority: SupportTicket['priority']): string {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800'
    case 'high':
      return 'bg-orange-100 text-orange-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Get status color for UI
export function getStatusColor(status: SupportTicket['status']): string {
  switch (status) {
    case 'open':
      return 'bg-red-100 text-red-800'
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800'
    case 'resolved':
      return 'bg-blue-100 text-blue-800'
    case 'closed':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Get status icon for UI
export function getStatusIcon(status: SupportTicket['status']) {
  switch (status) {
    case 'open':
      return '🔴'
    case 'in_progress':
      return '🟡'
    case 'resolved':
      return '🔵'
    case 'closed':
      return '🟢'
    default:
      return '⚪'
  }
}

// Get category icon for UI
export function getCategoryIcon(category: SupportTicket['category']): string {
  switch (category) {
    case 'technical':
      return '🔧'
    case 'billing':
      return '💳'
    case 'feature_request':
      return '💡'
    case 'bug_report':
      return '🐛'
    case 'general':
      return '📝'
    default:
      return '📋'
  }
}
