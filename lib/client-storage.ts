// Client Storage System for PMU Pro
// Manages client data persistence and retrieval

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  notes: string
  lastVisit?: string
  totalAnalyses: number
  lastResult?: 'safe' | 'precaution' | 'unsafe'
  createdAt: string
  updatedAt: string
}

// Get all clients from localStorage
export function getClients(): Client[] {
  if (typeof window === 'undefined') return []
  
  try {
    const clients = localStorage.getItem('pmu_clients')
    if (clients) {
      return JSON.parse(clients)
    }
  } catch (error) {
    console.error('Error loading clients:', error)
  }
  
  // Return default mock clients if none exist
  return [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+1-555-0123",
      lastVisit: "2024-01-15",
      totalAnalyses: 3,
      lastResult: "safe",
      notes: "First-time PMU client, interested in microblading",
      createdAt: "2024-01-10",
      updatedAt: "2024-01-10",
    },
    {
      id: "2",
      name: "Maria Garcia",
      email: "maria@example.com",
      phone: "+1-555-0124",
      lastVisit: "2024-01-12",
      totalAnalyses: 5,
      lastResult: "precaution",
      notes: "Returning client for lip blush touch-up",
      createdAt: "2023-12-15",
      updatedAt: "2023-12-15",
    },
    {
      id: "3",
      name: "Emma Wilson",
      email: "emma@example.com",
      phone: "+1-555-0125",
      lastVisit: "2024-01-08",
      totalAnalyses: 2,
      lastResult: "safe",
      notes: "Interested in eyebrow enhancement",
      createdAt: "2024-01-05",
      updatedAt: "2024-01-05",
    },
  ]
}

// Save clients to localStorage
export function saveClients(clients: Client[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('pmu_clients', JSON.stringify(clients))
  } catch (error) {
    console.error('Error saving clients:', error)
  }
}

// Add new client
export function addClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Client {
  const clients = getClients()
  
  const newClient: Client = {
    ...clientData,
    id: `client_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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

// Delete client
export function deleteClient(id: string): boolean {
  const clients = getClients()
  const filteredClients = clients.filter(client => client.id !== id)
  
  if (filteredClients.length === clients.length) return false
  
  saveClients(filteredClients)
  return true
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
