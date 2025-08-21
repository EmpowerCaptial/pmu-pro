// PMU Pro Checkout System
// Handles service checkout, tax calculation, gratuity, and Stripe integration

export interface CheckoutSession {
  id: string
  clientId: string
  clientName: string
  clientEmail: string
  serviceId: string
  serviceName: string
  basePrice: number
  customPrice?: number // Artist can modify price
  taxRate: number
  taxAmount: number
  gratuityPercentage: number
  gratuityAmount: number
  totalAmount: number
  status: 'pending' | 'completed' | 'cancelled' | 'failed'
  stripeSessionId?: string
  paymentIntentId?: string
  createdAt: string
  completedAt?: string
  notes?: string
  artistId: string
  artistName: string
}

export interface CheckoutFormData {
  clientId: string
  serviceId: string
  customPrice?: number
  gratuityPercentage: number
  notes?: string
}

export interface PaymentResult {
  success: boolean
  sessionId?: string
  paymentIntentId?: string
  error?: string
  redirectUrl?: string
}

// Tax rates by state (example - should be updated with actual rates)
export const STATE_TAX_RATES: Record<string, number> = {
  'alabama': 0.04,
  'alaska': 0.00,
  'arizona': 0.056,
  'arkansas': 0.065,
  'california': 0.0725,
  'colorado': 0.029,
  'connecticut': 0.0635,
  'delaware': 0.00,
  'florida': 0.06,
  'georgia': 0.04,
  'hawaii': 0.04,
  'idaho': 0.06,
  'illinois': 0.0625,
  'indiana': 0.07,
  'iowa': 0.06,
  'kansas': 0.065,
  'kentucky': 0.06,
  'louisiana': 0.0445,
  'maine': 0.055,
  'maryland': 0.06,
  'massachusetts': 0.0625,
  'michigan': 0.06,
  'minnesota': 0.06875,
  'mississippi': 0.07,
  'missouri': 0.04225,
  'montana': 0.00,
  'nebraska': 0.055,
  'nevada': 0.0685,
  'new-hampshire': 0.00,
  'new-jersey': 0.06625,
  'new-mexico': 0.05125,
  'new-york': 0.04,
  'north-carolina': 0.0475,
  'north-dakota': 0.05,
  'ohio': 0.0575,
  'oklahoma': 0.045,
  'oregon': 0.00,
  'pennsylvania': 0.06,
  'rhode-island': 0.07,
  'south-carolina': 0.06,
  'south-dakota': 0.045,
  'tennessee': 0.07,
  'texas': 0.0625,
  'utah': 0.061,
  'vermont': 0.06,
  'virginia': 0.053,
  'washington': 0.065,
  'west-virginia': 0.06,
  'wisconsin': 0.05,
  'wyoming': 0.04,
  'district-of-columbia': 0.06,
  'national': 0.08 // Default rate
}

// Gratuity options
export const GRATUITY_OPTIONS = [
  { percentage: 0, label: 'No Gratuity' },
  { percentage: 0.15, label: '15% - Good Service' },
  { percentage: 0.18, label: '18% - Great Service' },
  { percentage: 0.20, label: '20% - Excellent Service' },
  { percentage: 0.25, label: '25% - Outstanding Service' }
]

// Local storage key
const CHECKOUT_SESSIONS_KEY = 'pmu_pro_checkout_sessions'

// Save checkout sessions to local storage
function saveCheckoutSessions(sessions: CheckoutSession[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CHECKOUT_SESSIONS_KEY, JSON.stringify(sessions))
  }
}

// Load checkout sessions from local storage
function loadCheckoutSessions(): CheckoutSession[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(CHECKOUT_SESSIONS_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.error('Error parsing stored checkout sessions:', error)
      }
    }
  }
  return []
}

// Create new checkout session
export function createCheckoutSession(
  formData: CheckoutFormData,
  artistId: string,
  artistName: string,
  clientName: string,
  clientEmail: string,
  serviceName: string,
  basePrice: number,
  taxRate: number = 0.08
): CheckoutSession {
  const sessions = loadCheckoutSessions()
  
  // Calculate amounts
  const price = formData.customPrice || basePrice
  const taxAmount = price * taxRate
  const gratuityAmount = price * formData.gratuityPercentage
  const totalAmount = price + taxAmount + gratuityAmount
  
  const newSession: CheckoutSession = {
    id: `checkout_${Date.now()}`,
    clientId: formData.clientId,
    clientName,
    clientEmail,
    serviceId: formData.serviceId,
    serviceName,
    basePrice,
    customPrice: formData.customPrice,
    taxRate,
    taxAmount: Math.round(taxAmount * 100) / 100,
    gratuityPercentage: formData.gratuityPercentage,
    gratuityAmount: Math.round(gratuityAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    status: 'pending',
    createdAt: new Date().toISOString(),
    notes: formData.notes,
    artistId,
    artistName
  }
  
  sessions.push(newSession)
  saveCheckoutSessions(sessions)
  
  return newSession
}

// Get checkout session by ID
export function getCheckoutSessionById(id: string): CheckoutSession | null {
  const sessions = loadCheckoutSessions()
  return sessions.find(session => session.id === id) || null
}

// Get checkout sessions by client ID
export function getCheckoutSessionsByClient(clientId: string): CheckoutSession[] {
  const sessions = loadCheckoutSessions()
  return sessions.filter(session => session.clientId === clientId)
}

// Get checkout sessions by artist ID
export function getCheckoutSessionsByArtist(artistId: string): CheckoutSession[] {
  const sessions = loadCheckoutSessions()
  return sessions.filter(session => session.artistId === artistId)
}

// Update checkout session status
export function updateCheckoutSessionStatus(
  sessionId: string, 
  status: CheckoutSession['status'],
  stripeSessionId?: string,
  paymentIntentId?: string
): CheckoutSession | null {
  const sessions = loadCheckoutSessions()
  const sessionIndex = sessions.findIndex(session => session.id === sessionId)
  
  if (sessionIndex === -1) return null
  
  const updatedSession: CheckoutSession = {
    ...sessions[sessionIndex],
    status,
    stripeSessionId,
    paymentIntentId
  }
  
  if (status === 'completed') {
    updatedSession.completedAt = new Date().toISOString()
  }
  
  sessions[sessionIndex] = updatedSession
  saveCheckoutSessions(sessions)
  
  return updatedSession
}

// Get tax rate for state
export function getTaxRateForState(state: string): number {
  const normalizedState = state.toLowerCase().replace(/\s+/g, '-')
  return STATE_TAX_RATES[normalizedState] || STATE_TAX_RATES['national']
}

// Calculate checkout totals
export function calculateCheckoutTotals(
  basePrice: number,
  customPrice: number | undefined,
  taxRate: number,
  gratuityPercentage: number
): {
  finalPrice: number
  taxAmount: number
  gratuityAmount: number
  totalAmount: number
} {
  const price = customPrice || basePrice
  const taxAmount = price * taxRate
  const gratuityAmount = price * gratuityPercentage
  const totalAmount = price + taxAmount + gratuityAmount
  
  return {
    finalPrice: price,
    taxAmount: Math.round(taxAmount * 100) / 100,
    gratuityAmount: Math.round(gratuityAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100
  }
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Get checkout statistics
export function getCheckoutStats(artistId?: string): {
  totalSessions: number
  completedSessions: number
  pendingSessions: number
  totalRevenue: number
  averageTicket: number
} {
  const sessions = loadCheckoutSessions()
  const filteredSessions = artistId 
    ? sessions.filter(s => s.artistId === artistId)
    : sessions
  
  const completedSessions = filteredSessions.filter(s => s.status === 'completed')
  const pendingSessions = filteredSessions.filter(s => s.status === 'pending')
  
  const totalRevenue = completedSessions.reduce((sum, s) => sum + s.totalAmount, 0)
  const averageTicket = completedSessions.length > 0 
    ? totalRevenue / completedSessions.length 
    : 0
  
  return {
    totalSessions: filteredSessions.length,
    completedSessions: completedSessions.length,
    pendingSessions: pendingSessions.length,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    averageTicket: Math.round(averageTicket * 100) / 100
  }
}

// Search checkout sessions
export function searchCheckoutSessions(query: string, artistId?: string): CheckoutSession[] {
  const sessions = loadCheckoutSessions()
  const filteredSessions = artistId 
    ? sessions.filter(s => s.artistId === artistId)
    : sessions
  
  const lowerQuery = query.toLowerCase()
  
  return filteredSessions.filter(session => 
    session.clientName.toLowerCase().includes(lowerQuery) ||
    session.clientEmail.toLowerCase().includes(lowerQuery) ||
    session.serviceName.toLowerCase().includes(lowerQuery) ||
    session.status.toLowerCase().includes(lowerQuery)
  )
}

// Get recent checkout sessions
export function getRecentCheckoutSessions(limit: number = 10, artistId?: string): CheckoutSession[] {
  const sessions = loadCheckoutSessions()
  const filteredSessions = artistId 
    ? sessions.filter(s => s.artistId === artistId)
    : sessions
  
  return filteredSessions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

// Delete checkout session
export function deleteCheckoutSession(sessionId: string): boolean {
  const sessions = loadCheckoutSessions()
  const sessionIndex = sessions.findIndex(session => session.id === sessionId)
  
  if (sessionIndex === -1) return false
  
  sessions.splice(sessionIndex, 1)
  saveCheckoutSessions(sessions)
  
  return true
}

// Export checkout data for reporting
export function exportCheckoutData(artistId?: string, dateRange?: { start: string; end: string }): CheckoutSession[] {
  let sessions = loadCheckoutSessions()
  
  // Filter by artist if specified
  if (artistId) {
    sessions = sessions.filter(s => s.artistId === artistId)
  }
  
  // Filter by date range if specified
  if (dateRange) {
    const startDate = new Date(dateRange.start)
    const endDate = new Date(dateRange.end)
    
    sessions = sessions.filter(s => {
      const sessionDate = new Date(s.createdAt)
      return sessionDate >= startDate && sessionDate <= endDate
    })
  }
  
  return sessions
}
