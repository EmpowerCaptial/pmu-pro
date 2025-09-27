// PMU Pro Services Configuration - Database-backed
// This replaces the in-memory PMU_SERVICES array with API calls

export interface Service {
  id: string
  name: string
  description?: string
  defaultDuration: number // in minutes
  defaultPrice: number
  category: 'eyebrows' | 'lips' | 'eyeliner' | 'consultation' | 'touch-up' | 'other'
  isActive: boolean
  imageUrl?: string // URL for service icon/image
  isCustomImage?: boolean // Whether image was uploaded by user
}

// Default PMU services for new users
export const DEFAULT_PMU_SERVICES: Omit<Service, 'id'>[] = [
  {
    name: 'Microblading',
    description: 'Semi-permanent eyebrow tattooing technique',
    defaultDuration: 120,
    defaultPrice: 350,
    category: 'eyebrows',
    isActive: true,
    imageUrl: '/images/services/microblading-icon.svg',
    isCustomImage: false
  },
  {
    name: 'Lip Blush',
    description: 'Semi-permanent lip color enhancement',
    defaultDuration: 90,
    defaultPrice: 400,
    category: 'lips',
    isActive: true,
    imageUrl: '/images/services/lip-blush-icon.svg',
    isCustomImage: false
  },
  {
    name: 'Eyeliner',
    description: 'Semi-permanent eyeliner application',
    defaultDuration: 60,
    defaultPrice: 300,
    category: 'eyeliner',
    isActive: true,
    imageUrl: '/images/services/eyeliner-icon.svg',
    isCustomImage: false
  },
  {
    name: 'Eyebrow Mapping',
    description: 'Eyebrow design and mapping consultation',
    defaultDuration: 30,
    defaultPrice: 75,
    category: 'consultation',
    isActive: true,
    imageUrl: '/images/services/eyebrow-mapping-icon.svg',
    isCustomImage: false
  },
  {
    name: 'Consultation',
    description: 'Initial consultation and skin analysis',
    defaultDuration: 45,
    defaultPrice: 50,
    category: 'consultation',
    isActive: true,
    imageUrl: '/images/services/consultation-icon.svg',
    isCustomImage: false
  },
  {
    name: 'Touch-up',
    description: 'Follow-up appointment for color refresh',
    defaultDuration: 60,
    defaultPrice: 150,
    category: 'touch-up',
    isActive: true,
    imageUrl: '/images/services/touch-up-icon.svg',
    isCustomImage: false
  }
]

// API functions for service management
export async function getServices(userEmail: string): Promise<Service[]> {
  try {
    const response = await fetch('/api/services', {
      headers: {
        'x-user-email': userEmail,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch services: ${response.statusText}`)
    }

    const data = await response.json()
    return data.services || []
  } catch (error) {
    console.error('Error fetching services:', error)
    return []
  }
}

export async function createService(userEmail: string, service: Omit<Service, 'id'>): Promise<Service | null> {
  try {
    console.log('Creating service with data:', { userEmail, service })
    
    const response = await fetch('/api/services', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail,
        'Accept': 'application/json'
      },
      body: JSON.stringify(service)
    })

    console.log('Service creation response status:', response.status)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('Service creation failed:', errorData)
      throw new Error(`Failed to create service: ${errorData.error || response.statusText}`)
    }

    const data = await response.json()
    console.log('Service created successfully:', data)
    return data.service
  } catch (error) {
    console.error('Error creating service:', error)
    throw error // Re-throw to let the UI handle it
  }
}

export async function updateService(userEmail: string, serviceId: string, updates: Partial<Service>): Promise<Service | null> {
  try {
    const response = await fetch(`/api/services/${serviceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail,
        'Accept': 'application/json'
      },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      throw new Error(`Failed to update service: ${response.statusText}`)
    }

    const data = await response.json()
    return data.service
  } catch (error) {
    console.error('Error updating service:', error)
    return null
  }
}

export async function deleteService(userEmail: string, serviceId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/services/${serviceId}`, {
      method: 'DELETE',
      headers: {
        'x-user-email': userEmail,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to delete service: ${response.statusText}`)
    }

    return true
  } catch (error) {
    console.error('Error deleting service:', error)
    return false
  }
}

// Helper functions
export function getActiveServices(services: Service[]): Service[] {
  return services.filter(service => service.isActive)
}

export function getServicesByCategory(services: Service[], category: Service['category']): Service[] {
  return services.filter(service => service.category === category && service.isActive)
}

export function getServiceById(services: Service[], id: string): Service | undefined {
  return services.find(service => service.id === id)
}

export function getServiceCategories(): Service['category'][] {
  return ['eyebrows', 'lips', 'eyeliner', 'consultation', 'touch-up', 'other']
}
