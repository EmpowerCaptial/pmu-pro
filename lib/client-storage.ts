// Enhanced Client Storage System for PMU Pro
// Manages client data persistence and retrieval with full synchronization

export interface ClientAnalysis {
  id: string
  date: string
  type: 'skin-analysis' | 'color-correction' | 'procell-analysis' | 'intake' | 'consent'
  fitzpatrick?: number
  undertone?: string
  confidence?: number
  recommendedPigments?: string[]
  imageUrl?: string
  notes?: string
  result?: 'safe' | 'precaution' | 'not_recommended'
  conditions?: string[]
  medications?: string[]
  rationale?: string
}

export interface ClientProcedure {
  id: string
  date: string
  type: string
  description: string
  cost: number
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
}

export interface ClientDocument {
  id: string
  name: string
  type: 'consent' | 'medical' | 'insurance' | 'photo' | 'other'
  fileName: string
  fileUrl: string
  uploadedAt: string
  notes?: string
}

export interface ClientInsurance {
  id: string
  provider: string
  policyNumber: string
  groupNumber?: string
  subscriberName: string
  relationship: string
  phoneNumber?: string
  effectiveDate?: string
  expirationDate?: string
  copay?: number
  deductible?: number
  notes?: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  notes: string
  lastVisit?: string
  totalAnalyses: number
  lastResult?: 'safe' | 'precaution' | 'not_recommended'
  createdAt: string
  updatedAt: string
  analyses: ClientAnalysis[]
  procedures: ClientProcedure[]
  documents: ClientDocument[]
  insurance: ClientInsurance[]
  emergencyContact?: string
  emergencyPhone?: string
  dateOfBirth?: string
  medicalConditions: string[]
  medications: string[]
  allergies: string[]
  skinConditions: string[]
  previousPMU: boolean
  previousPMUDetails?: string
  desiredService?: string
  desiredColor?: string
  sunExposure?: string
  skincareRoutine?: string
  exerciseHabits?: string
  smokingStatus?: string
  photoConsent: boolean
  medicalRelease: boolean
  liabilityWaiver: boolean
  aftercareAgreement: boolean
}

// Update client data from portal (for client portal updates)
export function updateClientFromPortal(clientId: string, updates: Partial<Client>): Client | null {
  if (typeof window === 'undefined') return null
  
  try {
    const clients = getClients()
    const clientIndex = clients.findIndex(c => c.id === clientId)
    
    if (clientIndex === -1) return null
    
    // Update the client with new data
    const updatedClient = {
      ...clients[clientIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    clients[clientIndex] = updatedClient
    localStorage.setItem('pmu_clients', JSON.stringify(clients))
    
    return updatedClient
  } catch (error) {
    console.error('Error updating client from portal:', error)
    return null
  }
}

// Get all clients from localStorage
export function getClients(): Client[] {
  if (typeof window === 'undefined') return []
  
  try {
    const clients = localStorage.getItem('pmu_clients')
    if (clients) {
      const parsedClients = JSON.parse(clients)
      // Migrate any old ID formats
      migrateClientIds()
      return parsedClients
    }
  } catch (error) {
    // Silent error handling
  }
  
  // Return default mock clients if none exist
  return [] // No mock data - only real clients from onboarding
}

// Save clients to localStorage
export function saveClients(clients: Client[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('pmu_clients', JSON.stringify(clients))
    // Trigger custom event for real-time updates
    window.dispatchEvent(new CustomEvent('clientsUpdated', { detail: clients }))
  } catch (error) {
    // Silent error handling
  }
}

// Add new client
export function addClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'analyses' | 'procedures' | 'documents' | 'insurance'>): Client {
  const clients = getClients()
  
  const newClient: Client = {
    ...clientData,
    id: `client_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    analyses: [],
    procedures: [],
    documents: [],
    insurance: []
  }
  
  clients.push(newClient)
  saveClients(clients)
  return newClient
}

// Update existing client
export function updateClient(id: string, updates: Partial<Client>): Client | null {
  const clients = getClients()
  const clientIndex = clients.findIndex(client => client.id === id)
  
  if (clientIndex === -1) return null
  
  const updatedClient: Client = {
    ...clients[clientIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  clients[clientIndex] = updatedClient
  saveClients(clients)
  
  return updatedClient
}

// Add analysis result to client
export function addClientAnalysis(clientId: string, analysis: Omit<ClientAnalysis, 'id' | 'date'>): ClientAnalysis | null {
  const client = getClientById(clientId)
  if (!client) return null
  
  const newAnalysis: ClientAnalysis = {
    ...analysis,
    id: `analysis_${Date.now()}`,
    date: new Date().toISOString()
  }
  
  const updatedClient: Client = {
    ...client,
    analyses: [...client.analyses, newAnalysis],
    totalAnalyses: client.analyses.length + 1,
    lastResult: analysis.result || client.lastResult,
    updatedAt: new Date().toISOString()
  }
  
  updateClient(clientId, updatedClient)
  return newAnalysis
}

// Add procedure to client
export function addClientProcedure(clientId: string, procedure: Omit<ClientProcedure, 'id' | 'date'>): ClientProcedure | null {
  const client = getClientById(clientId)
  if (!client) return null
  
  const newProcedure: ClientProcedure = {
    ...procedure,
    id: `procedure_${Date.now()}`,
    date: new Date().toISOString()
  }
  
  const updatedClient: Client = {
    ...client,
    procedures: [...client.procedures, newProcedure],
    updatedAt: new Date().toISOString()
  }
  
  updateClient(clientId, updatedClient)
  return newProcedure
}

// Add document to client
export function addClientDocument(clientId: string, document: Omit<ClientDocument, 'id' | 'uploadedAt'>): ClientDocument | null {
  const client = getClientById(clientId)
  if (!client) return null

  const newDocument: ClientDocument = {
    ...document,
    id: `doc_${Date.now()}`,
    uploadedAt: new Date().toISOString()
  }

  const updatedClient: Client = {
    ...client,
    documents: [...client.documents, newDocument],
    updatedAt: new Date().toISOString()
  }

  updateClient(clientId, updatedClient)
  return newDocument
}

// Add insurance information to client
export function addClientInsurance(clientId: string, insurance: Omit<ClientInsurance, 'id'>): ClientInsurance | null {
  const client = getClientById(clientId)
  if (!client) return null

  const newInsurance: ClientInsurance = {
    ...insurance,
    id: `insurance_${Date.now()}`
  }

  const updatedClient: Client = {
    ...client,
    insurance: [...client.insurance, newInsurance],
    updatedAt: new Date().toISOString()
  }

  updateClient(clientId, updatedClient)
  return newInsurance
}

// Update insurance information
export function updateClientInsurance(clientId: string, insuranceId: string, updates: Partial<ClientInsurance>): boolean {
  const client = getClientById(clientId)
  if (!client) return false

  const updatedInsurance = client.insurance.map(ins => 
    ins.id === insuranceId ? { ...ins, ...updates } : ins
  )

  const updatedClient: Client = {
    ...client,
    insurance: updatedInsurance,
    updatedAt: new Date().toISOString()
  }

  return !!updateClient(clientId, updatedClient)
}

// Delete document from client
export function deleteClientDocument(clientId: string, documentId: string): boolean {
  const client = getClientById(clientId)
  if (!client) return false

  const updatedDocuments = client.documents.filter(doc => doc.id !== documentId)
  
  const updatedClient: Client = {
    ...client,
    documents: updatedDocuments,
    updatedAt: new Date().toISOString()
  }

  return !!updateClient(clientId, updatedClient)
}

// Delete insurance from client
export function deleteClientInsurance(clientId: string, insuranceId: string): boolean {
  const client = getClientById(clientId)
  if (!client) return false

  const updatedInsurance = client.insurance.filter(ins => ins.id !== insuranceId)
  
  const updatedClient: Client = {
    ...client,
    insurance: updatedInsurance,
    updatedAt: new Date().toISOString()
  }

  return !!updateClient(clientId, updatedClient)
}

// Delete client
export function deleteClient(clientId: string): boolean {
  const clients = getClients()
  const initialLength = clients.length
  const filteredClients = clients.filter(client => client.id !== clientId)
  
  if (filteredClients.length < initialLength) {
    saveClients(filteredClients)
    return true
  }
  return false
}

// Get client by ID
export function getClientById(id: string): Client | null {
  const clients = getClients()
  return clients.find(client => client.id === id) || null
}

// Search clients
export function searchClients(query: string): Client[] {
  const clients = getClients()
  const lowerQuery = query.toLowerCase()
  
  return clients.filter(client => 
    client.name.toLowerCase().includes(lowerQuery) ||
    client.email.toLowerCase().includes(lowerQuery) ||
    client.phone.includes(lowerQuery) ||
    client.notes.toLowerCase().includes(lowerQuery)
  )
}

// Get client statistics
export function getClientStats() {
  const clients = getClients()
  
  return {
    total: clients.length,
    newThisMonth: clients.filter(client => {
      const createdAt = new Date(client.createdAt)
      const now = new Date()
      return createdAt.getMonth() === now.getMonth() && 
             createdAt.getFullYear() === now.getFullYear()
    }).length,
    active: clients.filter(client => {
      if (!client.lastVisit) return false
      const lastVisit = new Date(client.lastVisit)
      const now = new Date()
      const daysSinceVisit = (now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)
      return daysSinceVisit <= 90 // Active if visited within 90 days
    }).length,
  }
}

// Listen for client updates (for real-time synchronization)
export function onClientsUpdate(callback: (clients: Client[]) => void): () => void {
  const handler = (event: CustomEvent) => callback(event.detail)
  window.addEventListener('clientsUpdated', handler as EventListener)
  
  return () => window.removeEventListener('clientsUpdated', handler as EventListener)
}

// Migrate existing clients to new ID format
export function migrateClientIds(): void {
  if (typeof window === 'undefined') return
  
  try {
    const clients = localStorage.getItem('pmu_clients')
    if (clients) {
      const parsedClients = JSON.parse(clients)
      let needsMigration = false
      
      const migratedClients = parsedClients.map((client: Client) => {
        // Check if client has old ID format (just numbers)
        if (/^\d+$/.test(client.id)) {
          needsMigration = true
          // Convert old ID to new format using createdAt timestamp
          const timestamp = new Date(client.createdAt).getTime()
          return { ...client, id: `client_${timestamp}` }
        }
        return client
      })
      
      if (needsMigration) {
        saveClients(migratedClients)
      }
    }
  } catch (error) {
    // Silent error handling
  }
}

// Clear all client data (for debugging/fresh start)
export function clearAllClients(): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem('pmu_clients')
    // Trigger update event
    window.dispatchEvent(new CustomEvent('clientsUpdated', { detail: [] }))
  } catch (error) {
    // Silent error handling
  }
}
