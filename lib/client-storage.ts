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
    const clients = getClientsSync()
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

// Get all clients from localStorage (synchronous version for backward compatibility)
export function getClientsSync(): Client[] {
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
    console.error('Error fetching clients:', error)
  }
  
  // Return default mock clients if none exist
  return [] // No mock data - only real clients from onboarding
}

// Get all clients from API with localStorage fallback
export async function getClients(userEmail?: string): Promise<Client[]> {
  if (typeof window === 'undefined') return []
  
  try {
    // Try API first if userEmail is provided
    if (userEmail) {
      const response = await fetch('/api/clients', {
        headers: {
          'x-user-email': userEmail
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const apiClients = data.clients || []
        
        // Convert database format to Client interface
        return apiClients.map((dbClient: any) => ({
          id: dbClient.id,
          name: dbClient.name,
          email: dbClient.email || '',
          phone: dbClient.phone || '',
          notes: dbClient.notes || '',
          lastVisit: undefined, // Not in database schema
          totalAnalyses: 0, // Not in database schema
          lastResult: undefined, // Not in database schema
          createdAt: new Date(dbClient.createdAt).toISOString(),
          updatedAt: new Date(dbClient.updatedAt).toISOString(),
          analyses: dbClient.analyses || [],
          procedures: dbClient.procedures || [],
          documents: dbClient.documents || [],
          insurance: [],
          emergencyContact: dbClient.emergencyContact,
          emergencyPhone: undefined, // Not in database schema
          dateOfBirth: dbClient.dateOfBirth ? new Date(dbClient.dateOfBirth).toISOString() : undefined,
          medicalConditions: dbClient.medicalHistory ? JSON.parse(dbClient.medicalHistory) : [],
          medications: [], // Not in database schema
          allergies: dbClient.allergies ? (typeof dbClient.allergies === 'string' ? JSON.parse(dbClient.allergies) : dbClient.allergies) : [],
          skinConditions: dbClient.skinType ? JSON.parse(dbClient.skinType) : [],
          previousPMU: false, // Not in database schema
          previousPMUDetails: undefined, // Not in database schema
          desiredService: undefined, // Not in database schema
          desiredColor: undefined, // Not in database schema
          sunExposure: undefined, // Not in database schema
          skincareRoutine: undefined, // Not in database schema
          exerciseHabits: undefined, // Not in database schema
          smokingStatus: undefined, // Not in database schema
          photoConsent: false, // Not in database schema
          medicalRelease: false, // Not in database schema
          liabilityWaiver: false, // Not in database schema
          aftercareAgreement: false // Not in database schema
        }))
      }
    }
    
    // Fallback to localStorage
    const clients = localStorage.getItem('pmu_clients')
    if (clients) {
      const parsedClients = JSON.parse(clients)
      // Migrate any old ID formats
      migrateClientIds()
      return parsedClients
    }
  } catch (error) {
    console.error('Error fetching clients:', error)
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
export async function addClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'analyses' | 'procedures' | 'documents' | 'insurance'>, userEmail?: string): Promise<Client> {
  try {
    // Try API first if userEmail is provided
    if (userEmail) {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail
        },
        body: JSON.stringify(clientData)
      })

      if (response.ok) {
        const data = await response.json()
        const apiClient = data.client
        
        // Convert database format to Client interface
        const newClient: Client = {
          id: apiClient.id,
          name: apiClient.name,
          email: apiClient.email || '',
          phone: apiClient.phone || '',
          notes: apiClient.notes || '',
          lastVisit: undefined, // Not in database schema
          totalAnalyses: 0, // Not in database schema
          lastResult: undefined, // Not in database schema
          createdAt: new Date(apiClient.createdAt).toISOString(),
          updatedAt: new Date(apiClient.updatedAt).toISOString(),
          analyses: [],
          procedures: [],
          documents: [],
          insurance: [],
          emergencyContact: apiClient.emergencyContact,
          emergencyPhone: undefined, // Not in database schema
          dateOfBirth: apiClient.dateOfBirth ? new Date(apiClient.dateOfBirth).toISOString() : undefined,
          medicalConditions: apiClient.medicalHistory ? JSON.parse(apiClient.medicalHistory) : [],
          medications: [], // Not in database schema
          allergies: apiClient.allergies ? (typeof apiClient.allergies === 'string' ? JSON.parse(apiClient.allergies) : apiClient.allergies) : [],
          skinConditions: apiClient.skinType ? JSON.parse(apiClient.skinType) : [],
          previousPMU: false, // Not in database schema
          previousPMUDetails: undefined, // Not in database schema
          desiredService: undefined, // Not in database schema
          desiredColor: undefined, // Not in database schema
          sunExposure: undefined, // Not in database schema
          skincareRoutine: undefined, // Not in database schema
          exerciseHabits: undefined, // Not in database schema
          smokingStatus: undefined, // Not in database schema
          photoConsent: false, // Not in database schema
          medicalRelease: false, // Not in database schema
          liabilityWaiver: false, // Not in database schema
          aftercareAgreement: false // Not in database schema
        }

        // Also save to localStorage as backup
        const clients = await getClients(userEmail)
        clients.push(newClient)
        saveClients(clients)

        return newClient
      }
    }
    
    // Fallback to localStorage only
    const clients = await getClients()
    
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
  } catch (error) {
    console.error('Error adding client:', error)
    
    // Fallback to localStorage only
    const clients = await getClients()
    
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
}

// Update existing client
export function updateClient(id: string, updates: Partial<Client>): Client | null {
  const clients = getClientsSync()
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
  const clients = getClientsSync()
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
  const clients = getClientsSync()
  return clients.find(client => client.id === id) || null
}

// Search clients
export function searchClients(query: string): Client[] {
  const clients = getClientsSync()
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
  const clients = getClientsSync()
  
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
