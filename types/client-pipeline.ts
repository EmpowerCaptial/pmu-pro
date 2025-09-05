// Enhanced client pipeline types and interfaces
export interface ClientPipeline {
  id: string
  clientId: string
  stage: PipelineStage
  probability: number
  estimatedValue: number
  nextAction: string
  followUpDate: Date | null
  notes: PipelineNote[]
  createdAt: Date
  updatedAt: Date
}

export type PipelineStage = 
  | 'lead' 
  | 'consultation' 
  | 'booking' 
  | 'procedure' 
  | 'aftercare' 
  | 'touchup' 
  | 'retention'

export interface PipelineNote {
  id: string
  content: string
  author: string
  timestamp: Date
  type: 'note' | 'followup' | 'reminder' | 'milestone'
}

export interface ClientPreferences {
  preferredContact: 'email' | 'sms' | 'phone'
  preferredTime: 'morning' | 'afternoon' | 'evening'
  communicationFrequency: 'daily' | 'weekly' | 'monthly'
  specialRequirements: string[]
  allergies: string[]
  medicalConditions: string[]
}

export interface ProcedureHistory {
  id: string
  procedureType: string
  date: Date
  artist: string
  notes: string
  photos: string[]
  healingProgress: number
  touchUpNeeded: boolean
  touchUpDate?: Date
}

export interface AftercareStatus {
  complianceScore: number
  lastCheckIn: Date
  healingProgress: number
  issues: string[]
  nextFollowUp: Date
  completed: boolean
}

// Basic interfaces for compatibility
export interface SkinAnalysis {
  id: string
  type: string
  results: any
  date: Date
}

export interface Message {
  id: string
  content: string
  sender: string
  timestamp: Date
  type: 'email' | 'sms' | 'note'
}

export interface Payment {
  id: string
  amount: number
  date: Date
  method: string
  status: string
}

// Enhanced client profile interface
export interface EnhancedClientProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth?: Date
  address?: string
  emergencyContact?: string
  createdAt: Date
  updatedAt: Date
  
  // Enhanced fields
  pipeline: ClientPipeline
  preferences: ClientPreferences
  skinHistory: SkinAnalysis[]
  procedureHistory: ProcedureHistory[]
  aftercareStatus: AftercareStatus
  communicationHistory: Message[]
  financialHistory: Payment[]
  notes: string[]
  tags: string[]
  status: 'active' | 'inactive' | 'lead' | 'prospect'
}
