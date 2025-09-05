// Enhanced client management service
import { EnhancedClientProfile, ClientPipeline, PipelineStage, PipelineNote } from '@/types/client-pipeline'

// In-memory storage for enhanced clients (in production, this would be a database)
let enhancedClients: EnhancedClientProfile[] = []

// Initialize with sample data
const initializeSampleData = () => {
  enhancedClients = [
    {
      id: '1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(555) 123-4567',
      dateOfBirth: new Date('1990-05-15'),
      address: '123 Main St, City, State 12345',
      emergencyContact: 'John Johnson (555) 987-6543',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date(),
      pipeline: {
        id: 'pipeline-1',
        clientId: '1',
        stage: 'lead',
        probability: 0.25,
        estimatedValue: 800,
        nextAction: 'Schedule initial consultation',
        followUpDate: new Date('2024-01-20'),
        notes: [
          {
            id: 'note-1',
            content: 'Interested in microblading. Has fair skin, good candidate.',
            author: 'Artist',
            timestamp: new Date('2024-01-15'),
            type: 'note'
          }
        ],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date()
      },
      preferences: {
        preferredContact: 'email',
        preferredTime: 'afternoon',
        communicationFrequency: 'weekly',
        specialRequirements: ['Allergic to latex'],
        allergies: ['Latex'],
        medicalConditions: []
      },
      skinHistory: [],
      procedureHistory: [],
      aftercareStatus: {
        complianceScore: 0,
        lastCheckIn: new Date(),
        healingProgress: 0,
        issues: [],
        nextFollowUp: new Date(),
        completed: false
      },
      communicationHistory: [],
      financialHistory: [],
      notes: ['Good candidate for microblading'],
      tags: ['new-client', 'microblading'],
      status: 'lead'
    },
    {
      id: '2',
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria.garcia@email.com',
      phone: '(555) 234-5678',
      dateOfBirth: new Date('1985-08-22'),
      address: '456 Oak Ave, City, State 12345',
      emergencyContact: 'Carlos Garcia (555) 876-5432',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date(),
      pipeline: {
        id: 'pipeline-2',
        clientId: '2',
        stage: 'consultation',
        probability: 0.75,
        estimatedValue: 1200,
        nextAction: 'Send consultation summary and pricing',
        followUpDate: new Date('2024-01-25'),
        notes: [
          {
            id: 'note-2',
            content: 'Scheduled for lip blush consultation. Very interested in natural look.',
            author: 'Artist',
            timestamp: new Date('2024-01-18'),
            type: 'milestone'
          }
        ],
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date()
      },
      preferences: {
        preferredContact: 'sms',
        preferredTime: 'morning',
        communicationFrequency: 'daily',
        specialRequirements: [],
        allergies: [],
        medicalConditions: []
      },
      skinHistory: [],
      procedureHistory: [],
      aftercareStatus: {
        complianceScore: 0,
        lastCheckIn: new Date(),
        healingProgress: 0,
        issues: [],
        nextFollowUp: new Date(),
        completed: false
      },
      communicationHistory: [],
      financialHistory: [],
      notes: ['Excited about lip blush procedure'],
      tags: ['lip-blush', 'consultation'],
      status: 'active'
    },
    {
      id: '3',
      firstName: 'Emma',
      lastName: 'Wilson',
      email: 'emma.wilson@email.com',
      phone: '(555) 345-6789',
      dateOfBirth: new Date('1992-12-03'),
      address: '789 Pine St, City, State 12345',
      emergencyContact: 'David Wilson (555) 765-4321',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date(),
      pipeline: {
        id: 'pipeline-3',
        clientId: '3',
        stage: 'aftercare',
        probability: 0.95,
        estimatedValue: 600,
        nextAction: 'Follow up on healing progress',
        followUpDate: new Date('2024-01-22'),
        notes: [
          {
            id: 'note-3',
            content: 'Microblading completed. Healing well, slight redness normal.',
            author: 'Artist',
            timestamp: new Date('2024-01-19'),
            type: 'milestone'
          }
        ],
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date()
      },
      preferences: {
        preferredContact: 'phone',
        preferredTime: 'evening',
        communicationFrequency: 'weekly',
        specialRequirements: [],
        allergies: [],
        medicalConditions: []
      },
      skinHistory: [],
      procedureHistory: [],
      aftercareStatus: {
        complianceScore: 0.8,
        lastCheckIn: new Date('2024-01-20'),
        healingProgress: 0.6,
        issues: ['Slight redness'],
        nextFollowUp: new Date('2024-01-22'),
        completed: false
      },
      communicationHistory: [],
      financialHistory: [],
      notes: ['Healing well, following aftercare instructions'],
      tags: ['microblading', 'healing'],
      status: 'active'
    },
    {
      id: '4',
      firstName: 'Jessica',
      lastName: 'Brown',
      email: 'jessica.brown@email.com',
      phone: '(555) 456-7890',
      dateOfBirth: new Date('1988-03-14'),
      address: '321 Elm St, City, State 12345',
      emergencyContact: 'Michael Brown (555) 654-3210',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date(),
      pipeline: {
        id: 'pipeline-4',
        clientId: '4',
        stage: 'booking',
        probability: 0.9,
        estimatedValue: 1500,
        nextAction: 'Send pre-procedure instructions',
        followUpDate: new Date('2024-01-28'),
        notes: [
          {
            id: 'note-4',
            content: 'Booked for microblading and lip blush combo. Deposit paid.',
            author: 'Artist',
            timestamp: new Date('2024-01-20'),
            type: 'milestone'
          }
        ],
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date()
      },
      preferences: {
        preferredContact: 'email',
        preferredTime: 'morning',
        communicationFrequency: 'weekly',
        specialRequirements: ['Wants natural look'],
        allergies: [],
        medicalConditions: []
      },
      skinHistory: [],
      procedureHistory: [],
      aftercareStatus: {
        complianceScore: 0,
        lastCheckIn: new Date(),
        healingProgress: 0,
        issues: [],
        nextFollowUp: new Date(),
        completed: false
      },
      communicationHistory: [],
      financialHistory: [],
      notes: ['Combo procedure - high value client'],
      tags: ['combo', 'booked'],
      status: 'active'
    },
    {
      id: '5',
      firstName: 'Amanda',
      lastName: 'Davis',
      email: 'amanda.davis@email.com',
      phone: '(555) 567-8901',
      dateOfBirth: new Date('1995-07-08'),
      address: '654 Maple Ave, City, State 12345',
      emergencyContact: 'Robert Davis (555) 543-2109',
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date(),
      pipeline: {
        id: 'pipeline-5',
        clientId: '5',
        stage: 'procedure',
        probability: 0.95,
        estimatedValue: 900,
        nextAction: 'Complete microblading procedure',
        followUpDate: new Date('2024-01-26'),
        notes: [
          {
            id: 'note-5',
            content: 'Procedure started. Client doing well, following instructions.',
            author: 'Artist',
            timestamp: new Date('2024-01-21'),
            type: 'milestone'
          }
        ],
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date()
      },
      preferences: {
        preferredContact: 'sms',
        preferredTime: 'afternoon',
        communicationFrequency: 'daily',
        specialRequirements: [],
        allergies: [],
        medicalConditions: []
      },
      skinHistory: [],
      procedureHistory: [],
      aftercareStatus: {
        complianceScore: 0.9,
        lastCheckIn: new Date('2024-01-21'),
        healingProgress: 0.3,
        issues: [],
        nextFollowUp: new Date('2024-01-26'),
        completed: false
      },
      communicationHistory: [],
      financialHistory: [],
      notes: ['Procedure in progress'],
      tags: ['microblading', 'procedure'],
      status: 'active'
    },
    {
      id: '6',
      firstName: 'Rachel',
      lastName: 'Miller',
      email: 'rachel.miller@email.com',
      phone: '(555) 678-9012',
      dateOfBirth: new Date('1991-11-25'),
      address: '987 Cedar Ln, City, State 12345',
      emergencyContact: 'James Miller (555) 432-1098',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date(),
      pipeline: {
        id: 'pipeline-6',
        clientId: '6',
        stage: 'touchup',
        probability: 0.8,
        estimatedValue: 300,
        nextAction: 'Schedule touch-up session',
        followUpDate: new Date('2024-01-30'),
        notes: [
          {
            id: 'note-6',
            content: 'Touch-up needed for better symmetry. Client satisfied with initial results.',
            author: 'Artist',
            timestamp: new Date('2024-01-18'),
            type: 'milestone'
          }
        ],
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date()
      },
      preferences: {
        preferredContact: 'phone',
        preferredTime: 'morning',
        communicationFrequency: 'weekly',
        specialRequirements: [],
        allergies: [],
        medicalConditions: []
      },
      skinHistory: [],
      procedureHistory: [],
      aftercareStatus: {
        complianceScore: 0.7,
        lastCheckIn: new Date('2024-01-15'),
        healingProgress: 0.9,
        issues: ['Minor asymmetry'],
        nextFollowUp: new Date('2024-01-30'),
        completed: false
      },
      communicationHistory: [],
      financialHistory: [],
      notes: ['Touch-up session needed'],
      tags: ['touchup', 'followup'],
      status: 'active'
    },
    {
      id: '7',
      firstName: 'Lisa',
      lastName: 'Anderson',
      email: 'lisa.anderson@email.com',
      phone: '(555) 789-0123',
      dateOfBirth: new Date('1987-09-12'),
      address: '147 Birch Dr, City, State 12345',
      emergencyContact: 'Thomas Anderson (555) 321-0987',
      createdAt: new Date('2023-12-20'),
      updatedAt: new Date(),
      pipeline: {
        id: 'pipeline-7',
        clientId: '7',
        stage: 'retention',
        probability: 0.9,
        estimatedValue: 2000,
        nextAction: 'Schedule annual touch-up',
        followUpDate: new Date('2024-02-15'),
        notes: [
          {
            id: 'note-7',
            content: 'Long-term client. Annual touch-up due soon. Very satisfied with results.',
            author: 'Artist',
            timestamp: new Date('2024-01-10'),
            type: 'milestone'
          }
        ],
        createdAt: new Date('2023-12-20'),
        updatedAt: new Date()
      },
      preferences: {
        preferredContact: 'email',
        preferredTime: 'afternoon',
        communicationFrequency: 'monthly',
        specialRequirements: [],
        allergies: [],
        medicalConditions: []
      },
      skinHistory: [],
      procedureHistory: [],
      aftercareStatus: {
        complianceScore: 0.95,
        lastCheckIn: new Date('2024-01-05'),
        healingProgress: 1.0,
        issues: [],
        nextFollowUp: new Date('2024-02-15'),
        completed: true
      },
      communicationHistory: [],
      financialHistory: [],
      notes: ['Excellent long-term client'],
      tags: ['retention', 'annual'],
      status: 'active'
    }
  ]
}

// Initialize sample data
initializeSampleData()

// Get all enhanced clients
export function getEnhancedClients(): EnhancedClientProfile[] {
  return enhancedClients
}

// Get client by ID
export function getEnhancedClientById(id: string): EnhancedClientProfile | null {
  return enhancedClients.find(client => client.id === id) || null
}

// Create new enhanced client
export function createEnhancedClient(clientData: Omit<EnhancedClientProfile, 'id' | 'createdAt' | 'updatedAt'>): EnhancedClientProfile {
  const newClient: EnhancedClientProfile = {
    ...clientData,
    id: `client_${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  enhancedClients.push(newClient)
  return newClient
}

// Update client pipeline
export function updateClientPipeline(clientId: string, updates: Partial<ClientPipeline>): EnhancedClientProfile | null {
  const clientIndex = enhancedClients.findIndex(client => client.id === clientId)
  
  if (clientIndex === -1) return null
  
  const updatedClient = {
    ...enhancedClients[clientIndex],
    pipeline: {
      ...enhancedClients[clientIndex].pipeline,
      ...updates,
      updatedAt: new Date()
    },
    updatedAt: new Date()
  }
  
  enhancedClients[clientIndex] = updatedClient
  return updatedClient
}

// Move client to different pipeline stage
export function moveClientToStage(clientId: string, newStage: PipelineStage): EnhancedClientProfile | null {
  return updateClientPipeline(clientId, { stage: newStage })
}

// Add note to client pipeline
export function addPipelineNote(clientId: string, noteContent: string, author: string): EnhancedClientProfile | null {
  const client = getEnhancedClientById(clientId)
  if (!client) return null
  
  const newNote: PipelineNote = {
    id: `note_${Date.now()}`,
    content: noteContent,
    author,
    timestamp: new Date(),
    type: 'note'
  }
  
  const updatedNotes = [...client.pipeline.notes, newNote]
  return updateClientPipeline(clientId, { notes: updatedNotes })
}

// Get clients by pipeline stage
export function getClientsByStage(stage: PipelineStage): EnhancedClientProfile[] {
  return enhancedClients.filter(client => client.pipeline.stage === stage)
}

// Get pipeline statistics
export function getPipelineStats() {
  const stats = {
    totalClients: enhancedClients.length,
    totalValue: enhancedClients.reduce((sum, client) => sum + client.pipeline.estimatedValue, 0),
    avgProbability: enhancedClients.length > 0 
      ? enhancedClients.reduce((sum, client) => sum + client.pipeline.probability, 0) / enhancedClients.length 
      : 0,
    byStage: {} as Record<PipelineStage, { count: number; value: number; avgProbability: number }>
  }
  
  const stages: PipelineStage[] = ['lead', 'consultation', 'booking', 'procedure', 'aftercare', 'touchup', 'retention']
  
  stages.forEach(stage => {
    const stageClients = getClientsByStage(stage)
    stats.byStage[stage] = {
      count: stageClients.length,
      value: stageClients.reduce((sum, client) => sum + client.pipeline.estimatedValue, 0),
      avgProbability: stageClients.length > 0 
        ? stageClients.reduce((sum, client) => sum + client.pipeline.probability, 0) / stageClients.length 
        : 0
    }
  })
  
  return stats
}

// Search clients
export function searchClients(query: string): EnhancedClientProfile[] {
  const lowercaseQuery = query.toLowerCase()
  return enhancedClients.filter(client => 
    client.firstName.toLowerCase().includes(lowercaseQuery) ||
    client.lastName.toLowerCase().includes(lowercaseQuery) ||
    client.email.toLowerCase().includes(lowercaseQuery) ||
    client.notes.some(note => note.toLowerCase().includes(lowercaseQuery))
  )
}

// Get clients needing follow-up
export function getClientsNeedingFollowUp(): EnhancedClientProfile[] {
  const today = new Date()
  return enhancedClients.filter(client => 
    client.pipeline.followUpDate && 
    new Date(client.pipeline.followUpDate) <= today &&
    client.pipeline.stage !== 'retention'
  )
}
