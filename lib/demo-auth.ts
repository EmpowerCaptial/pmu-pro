export interface DemoUser {
  username: string
  password: string
  role: 'demo'
  permissions: {
    canView: boolean
    canAnalyze: boolean
    canUseTools: boolean
    canSave: boolean
    canPrint: boolean
    canExport: boolean
    canModifyData: boolean
  }
  restrictions: {
    dataExpires: boolean
    sessionTimeout: number // minutes
    maxClients: number
    maxAnalyses: number
  }
}

export const DEMO_USER: DemoUser = {
  username: 'demo',
  password: 'pmupro2024',
  role: 'demo',
  permissions: {
    canView: true,        // Can view all features
    canAnalyze: true,     // Can use skin analysis tools
    canUseTools: true,    // Can use all PMU tools
    canSave: false,       // Cannot save data permanently
    canPrint: false,      // Cannot print documents
    canExport: false,     // Cannot export data
    canModifyData: false  // Cannot modify existing data
  },
  restrictions: {
    dataExpires: true,    // Demo data expires after session
    sessionTimeout: 120,  // 2 hours session
    maxClients: 5,        // Maximum 5 demo clients
    maxAnalyses: 10       // Maximum 10 demo analyses
  }
}

export const DEMO_CREDENTIALS = {
  username: 'demo@pmupro.com',
  password: 'demopmu'
}

// Demo data that resets after session
export const DEMO_DATA = {
  clients: [
    {
      id: 'demo-1',
      name: 'Sarah Johnson',
      email: 'sarah.j@demo.com',
      phone: '(555) 123-4567',
      skinType: 'Type III',
      undertone: 'Warm',
      lastVisit: '2024-01-15',
      status: 'Active'
    },
    {
      id: 'demo-2',
      name: 'Maria Rodriguez',
      email: 'maria.r@demo.com',
      phone: '(555) 234-5678',
      skinType: 'Type IV',
      undertone: 'Cool',
      lastVisit: '2024-01-10',
      status: 'Active'
    },
    {
      id: 'demo-3',
      name: 'Jennifer Lee',
      email: 'jennifer.l@demo.com',
      phone: '(555) 345-6789',
      skinType: 'Type II',
      undertone: 'Neutral',
      lastVisit: '2024-01-08',
      status: 'Active'
    }
  ],
  analyses: [
    {
      id: 'demo-analysis-1',
      clientId: 'demo-1',
      type: 'Skin Analysis',
      result: 'Type III - Warm Undertone',
      confidence: 87,
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      id: 'demo-analysis-2',
      clientId: 'demo-2',
      type: 'Procell Analysis',
      result: 'Recommended: 3 sessions',
      confidence: 92,
      timestamp: '2024-01-10T14:15:00Z'
    }
  ]
}

// Check if user is in demo mode
export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('demo-mode') === 'true'
}

// Set demo mode
export function setDemoMode(enabled: boolean): void {
  if (typeof window === 'undefined') return
  if (enabled) {
    localStorage.setItem('demo-mode', 'true')
    localStorage.setItem('demo-session-start', Date.now().toString())
  } else {
    // Clear all demo-related data when exiting demo mode
    clearAllDemoData()
  }
}

// Get demo session start time
export function getDemoSessionStart(): number {
  if (typeof window === 'undefined') return 0
  const start = localStorage.getItem('demo-session-start')
  return start ? parseInt(start) : 0
}

// Check if demo session has expired
export function isDemoSessionExpired(): boolean {
  if (typeof window === 'undefined') return false
  const start = getDemoSessionStart()
  const now = Date.now()
  const sessionLength = DEMO_USER.restrictions.sessionTimeout * 60 * 1000 // Convert to milliseconds
  return (now - start) > sessionLength
}

// Get remaining demo session time in minutes
export function getRemainingDemoTime(): number {
  if (typeof window === 'undefined') return 0
  const start = getDemoSessionStart()
  const now = Date.now()
  const sessionLength = DEMO_USER.restrictions.sessionTimeout * 60 * 1000
  const remaining = Math.max(0, sessionLength - (now - start))
  return Math.ceil(remaining / (60 * 1000))
}

// Demo data storage functions
export function getDemoClients() {
  if (typeof window === 'undefined') return DEMO_DATA.clients
  const stored = localStorage.getItem('demo-clients')
  return stored ? JSON.parse(stored) : DEMO_DATA.clients
}

export function getDemoAnalyses() {
  if (typeof window === 'undefined') return DEMO_DATA.analyses
  const stored = localStorage.getItem('demo-analyses')
  return stored ? JSON.parse(stored) : DEMO_DATA.analyses
}

export function addDemoClient(client: any) {
  if (typeof window === 'undefined') return
  const clients = getDemoClients()
  if (clients.length >= DEMO_USER.restrictions.maxClients) {
    throw new Error('Demo mode: Maximum number of clients reached')
  }
  const newClient = { ...client, id: `demo-${Date.now()}` }
  clients.push(newClient)
  localStorage.setItem('demo-clients', JSON.stringify(clients))
}

export function addDemoAnalysis(analysis: any) {
  if (typeof window === 'undefined') return
  const analyses = getDemoAnalyses()
  if (analyses.length >= DEMO_USER.restrictions.maxAnalyses) {
    throw new Error('Demo mode: Maximum number of analyses reached')
  }
  const newAnalysis = { ...analysis, id: `demo-analysis-${Date.now()}` }
  analyses.push(newAnalysis)
  localStorage.setItem('demo-analyses', JSON.stringify(analyses))
}

// Reset demo data to initial state
export function resetDemoData(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('demo-clients', JSON.stringify(DEMO_DATA.clients))
  localStorage.setItem('demo-analyses', JSON.stringify(DEMO_DATA.analyses))
}

// Clear all demo data and return to initial state
export function clearAllDemoData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('demo-mode')
  localStorage.removeItem('demo-session-start')
  localStorage.removeItem('demo-clients')
  localStorage.removeItem('demo-analyses')
  localStorage.removeItem('demoUser')
}

// Initialize demo data
export function initializeDemoData(): void {
  if (typeof window === 'undefined') return
  if (!localStorage.getItem('demo-clients')) {
    resetDemoData()
  }
}
