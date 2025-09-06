// PMU Pro Services Configuration
// Centralized service management for booking calendar and other components

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

export const PMU_SERVICES: Service[] = [
  {
    id: 'microblading',
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
    id: 'lip-blush',
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
    id: 'eyeliner',
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
    id: 'eyebrow-mapping',
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
    id: 'consultation',
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
    id: 'touch-up',
    name: 'Touch-up',
    description: 'Follow-up appointment for color refresh',
    defaultDuration: 60,
    defaultPrice: 150,
    category: 'touch-up',
    isActive: true,
    imageUrl: '/images/services/touch-up-icon.svg',
    isCustomImage: false
  },
  {
    id: 'eyebrow-shading',
    name: 'Eyebrow Shading',
    description: 'Powder brow technique for fuller look',
    defaultDuration: 90,
    defaultPrice: 300,
    category: 'eyebrows',
    isActive: true,
    imageUrl: '/images/services/eyebrow-shading-icon.svg',
    isCustomImage: false
  },
  {
    id: 'lip-liner',
    name: 'Lip Liner',
    description: 'Semi-permanent lip liner application',
    defaultDuration: 45,
    defaultPrice: 200,
    category: 'lips',
    isActive: true,
    imageUrl: '/images/services/lip-liner-icon.svg',
    isCustomImage: false
  },
  {
    id: 'lash-enhancement',
    name: 'Lash Enhancement',
    description: 'Semi-permanent lash line enhancement',
    defaultDuration: 60,
    defaultPrice: 250,
    category: 'eyeliner',
    isActive: true,
    imageUrl: '/images/services/lash-enhancement-icon.svg',
    isCustomImage: false
  }
]

// Get all active services
export function getActiveServices(): Service[] {
  return PMU_SERVICES.filter(service => service.isActive)
}

// Get services by category
export function getServicesByCategory(category: Service['category']): Service[] {
  return PMU_SERVICES.filter(service => service.category === category && service.isActive)
}

// Get service by ID
export function getServiceById(id: string): Service | undefined {
  return PMU_SERVICES.find(service => service.id === id)
}

// Get service categories
export function getServiceCategories(): Service['category'][] {
  return Array.from(new Set(PMU_SERVICES.filter(s => s.isActive).map(s => s.category)))
}

// Add new service (for future admin functionality)
export function addService(service: Omit<Service, 'id'>): Service {
  const newService: Service = {
    ...service,
    id: service.name.toLowerCase().replace(/\s+/g, '-')
  }
  PMU_SERVICES.push(newService)
  return newService
}

// Update service (for future admin functionality)
export function updateService(id: string, updates: Partial<Service>): Service | null {
  const serviceIndex = PMU_SERVICES.findIndex(service => service.id === id)
  if (serviceIndex === -1) return null
  
  PMU_SERVICES[serviceIndex] = { ...PMU_SERVICES[serviceIndex], ...updates }
  return PMU_SERVICES[serviceIndex]
}

// Toggle service active status (for future admin functionality)
export function toggleServiceStatus(id: string): Service | null {
  const service = getServiceById(id)
  if (!service) return null
  
  return updateService(id, { isActive: !service.isActive })
}
