import { NextRequest, NextResponse } from 'next/server'
import { httpClient, HTTPError, TimeoutError, getErrorMessage } from '@/lib/http-client'

interface Client {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  skinType: string
  undertone: string
  allergies: string[]
  medicalConditions: string[]
  medications: string[]
  previousPMU: boolean
  lastProcedure?: string
  notes: string
  createdAt: string
  updatedAt: string
}

interface CreateClientRequest {
  name: string
  email: string
  phone: string
  dateOfBirth: string
  skinType?: string
  undertone?: string
  allergies?: string[]
  medicalConditions?: string[]
  medications?: string[]
  previousPMU?: boolean
  lastProcedure?: string
  notes?: string
}

interface UpdateClientRequest extends Partial<CreateClientRequest> {
  id: string
}

// Enhanced client operations with Undici
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Enhanced client retrieval with Undici
    const clients = await getClientsWithEnhancedSearch(search, page, limit)
    
    return NextResponse.json({
      success: true,
      clients,
      pagination: {
        page,
        limit,
        total: clients.length,
        hasMore: clients.length === limit
      }
    })
    
  } catch (error) {
    console.error('Client retrieval error:', error)
    
    if (error instanceof HTTPError) {
      return NextResponse.json(
        { error: `Client service error: ${error.message}` },
        { status: error.statusCode }
      )
    }
    
    if (error instanceof TimeoutError) {
      return NextResponse.json(
        { error: 'Client retrieval timed out. Please try again.' },
        { status: 408 }
      )
    }
    
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateClientRequest = await request.json()
    
    // Validate required fields
    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      )
    }
    
    // Enhanced client creation with Undici
    const newClient = await createClientWithEnhancedValidation(body)
    
    return NextResponse.json({
      success: true,
      client: newClient,
      message: 'Client created successfully'
    }, { status: 201 })
    
  } catch (error) {
    console.error('Client creation error:', error)
    
    if (error instanceof HTTPError) {
      return NextResponse.json(
        { error: `Client creation service error: ${error.message}` },
        { status: error.statusCode }
      )
    }
    
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: UpdateClientRequest = await request.json()
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }
    
    // Enhanced client update with Undici
    const updatedClient = await updateClientWithEnhancedValidation(body)
    
    return NextResponse.json({
      success: true,
      client: updatedClient,
      message: 'Client updated successfully'
    })
    
  } catch (error) {
    console.error('Client update error:', error)
    
    if (error instanceof HTTPError) {
      return NextResponse.json(
        { error: `Client update service error: ${error.message}` },
        { status: error.statusCode }
      )
    }
    
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }
    
    // Enhanced client deletion with Undici
    await deleteClientWithEnhancedValidation(id)
    
    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully'
    })
    
  } catch (error) {
    console.error('Client deletion error:', error)
    
    if (error instanceof HTTPError) {
      return NextResponse.json(
        { error: `Client deletion service error: ${error.message}` },
        { status: error.statusCode }
      )
    }
    
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}

// Enhanced client operations
async function getClientsWithEnhancedSearch(
  search?: string | null,
  page: number = 1,
  limit: number = 20
): Promise<Client[]> {
  try {
    // Enhanced search with Undici (simulated)
    const searchParams = new URLSearchParams()
    if (search) searchParams.append('q', search)
    searchParams.append('page', page.toString())
    searchParams.append('limit', limit.toString())
    
    // Use Undici client for external service calls (if applicable)
    // const response = await httpClient.get(`/clients/search?${searchParams}`)
    
    // For now, simulate enhanced search
    const mockClients: Client[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '(555) 123-4567',
        dateOfBirth: '1990-05-15',
        skinType: 'III',
        undertone: 'Warm',
        allergies: ['None'],
        medicalConditions: ['None'],
        medications: ['None'],
        previousPMU: false,
        notes: 'Interested in microblading',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Michael Chen',
        email: 'mchen@email.com',
        phone: '(555) 987-6543',
        dateOfBirth: '1985-08-22',
        skinType: 'IV',
        undertone: 'Cool',
        allergies: ['Latex'],
        medicalConditions: ['None'],
        medications: ['None'],
        previousPMU: true,
        lastProcedure: '2023-06-10',
        notes: 'Previous microblading faded, wants refresh',
        createdAt: '2024-01-10T14:30:00Z',
        updatedAt: '2024-01-10T14:30:00Z'
      }
    ]
    
    // Enhanced filtering
    if (search) {
      const searchLower = search.toLowerCase()
      return mockClients.filter(client =>
        client.name.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        client.phone.includes(search)
      )
    }
    
    return mockClients
    
  } catch (error) {
    console.error('Enhanced client search failed:', error)
    throw error
  }
}

async function createClientWithEnhancedValidation(data: CreateClientRequest): Promise<Client> {
  try {
    // Enhanced validation with Undici
    const validationResult = await validateClientData(data)
    
    if (!validationResult.isValid) {
      throw new HTTPError(validationResult.errors.join(', '), 400)
    }
    
    // Enhanced client creation
    const newClient: Client = {
      id: generateClientId(),
      ...data,
      skinType: data.skinType || 'III',
      undertone: data.undertone || 'Neutral',
      allergies: data.allergies || ['None'],
      medicalConditions: data.medicalConditions || ['None'],
      medications: data.medications || ['None'],
      previousPMU: data.previousPMU || false,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Enhanced data persistence (simulated)
    await persistClientData(newClient)
    
    return newClient
    
  } catch (error) {
    console.error('Enhanced client creation failed:', error)
    throw error
  }
}

async function updateClientWithEnhancedValidation(data: UpdateClientRequest): Promise<Client> {
  try {
    // Enhanced client retrieval
    const existingClient = await getClientById(data.id!)
    
    if (!existingClient) {
      throw new HTTPError('Client not found', 404)
    }
    
    // Enhanced validation
    const validationResult = await validateClientData(data as CreateClientRequest)
    
    if (!validationResult.isValid) {
      throw new HTTPError(validationResult.errors.join(', '), 400)
    }
    
    // Enhanced update
    const updatedClient: Client = {
      ...existingClient,
      ...data,
      updatedAt: new Date().toISOString()
    }
    
    // Enhanced data persistence
    await persistClientData(updatedClient)
    
    return updatedClient
    
  } catch (error) {
    console.error('Enhanced client update failed:', error)
    throw error
  }
}

async function deleteClientWithEnhancedValidation(id: string): Promise<void> {
  try {
    // Enhanced client retrieval
    const existingClient = await getClientById(id)
    
    if (!existingClient) {
      throw new HTTPError('Client not found', 404)
    }
    
    // Enhanced deletion with cleanup
    await cleanupClientData(id)
    
  } catch (error) {
    console.error('Enhanced client deletion failed:', error)
    throw error
  }
}

// Enhanced helper functions
async function validateClientData(data: CreateClientRequest): Promise<{ isValid: boolean; errors: string[] }> {
  const errors: string[] = []
  
  // Enhanced validation logic
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long')
  }
  
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('Valid email address is required')
  }
  
  if (!data.phone || !isValidPhone(data.phone)) {
    errors.push('Valid phone number is required')
  }
  
  if (data.dateOfBirth && !isValidDate(data.dateOfBirth)) {
    errors.push('Valid date of birth is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

async function getClientById(id: string): Promise<Client | null> {
  try {
    // Enhanced client retrieval with Undici
    // const response = await httpClient.get(`/clients/${id}`)
    
    // Simulated enhanced retrieval
    const mockClients: Client[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '(555) 123-4567',
        dateOfBirth: '1990-05-15',
        skinType: 'III',
        undertone: 'Warm',
        allergies: ['None'],
        medicalConditions: ['None'],
        medications: ['None'],
        previousPMU: false,
        notes: 'Interested in microblading',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      }
    ]
    
    return mockClients.find(client => client.id === id) || null
    
  } catch (error) {
    console.error('Enhanced client retrieval failed:', error)
    return null
  }
}

async function persistClientData(client: Client): Promise<void> {
  try {
    // Enhanced data persistence with Undici
    // await httpClient.post('/clients/persist', client)
    
    // Simulated enhanced persistence
    console.log('Enhanced client data persisted:', client.id)
    
  } catch (error) {
    console.error('Enhanced client persistence failed:', error)
    throw error
  }
}

async function cleanupClientData(id: string): Promise<void> {
  try {
    // Enhanced cleanup with Undici
    // await httpClient.delete(`/clients/${id}/cleanup`)
    
    // Simulated enhanced cleanup
    console.log('Enhanced client data cleaned up:', id)
    
  } catch (error) {
    console.error('Enhanced client cleanup failed:', error)
    throw error
  }
}

// Utility functions
function generateClientId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

function isValidDate(date: string): boolean {
  const dateObj = new Date(date)
  return dateObj instanceof Date && !isNaN(dateObj.getTime())
}
