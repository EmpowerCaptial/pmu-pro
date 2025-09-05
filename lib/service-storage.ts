// Service storage and management utilities
export interface PMUService {
  id: string
  name: string
  description: string
  price: number
  duration: number // in minutes
  category: string
  isActive: boolean
  createdAt: string
}

class ServiceStorage {
  private services: PMUService[] = []
  private storageKey = 'pmu-services'

  constructor() {
    this.loadServices()
  }

  private loadServices() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        this.services = JSON.parse(stored)
      } else {
        // Initialize with default services
        this.services = [
          {
            id: '1',
            name: 'Eyebrow Microblading',
            description: 'Semi-permanent eyebrow tattooing using microblading technique',
            price: 350,
            duration: 120,
            category: 'Eyebrows',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Lip Blush',
            description: 'Semi-permanent lip color enhancement',
            price: 400,
            duration: 90,
            category: 'Lips',
            isActive: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Eyeliner',
            description: 'Semi-permanent eyeliner application',
            price: 300,
            duration: 60,
            category: 'Eyes',
            isActive: true,
            createdAt: new Date().toISOString()
          }
        ]
        this.saveServices()
      }
    }
  }

  private saveServices() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(this.services))
    }
  }

  getAllServices(): PMUService[] {
    return this.services
  }

  getActiveServices(): PMUService[] {
    return this.services.filter(service => service.isActive)
  }

  getServiceById(id: string): PMUService | undefined {
    return this.services.find(service => service.id === id)
  }

  addService(service: Omit<PMUService, 'id' | 'createdAt'>): PMUService {
    const newService: PMUService = {
      ...service,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    this.services.push(newService)
    this.saveServices()
    return newService
  }

  updateService(id: string, updates: Partial<PMUService>): PMUService | null {
    const index = this.services.findIndex(service => service.id === id)
    if (index !== -1) {
      this.services[index] = { ...this.services[index], ...updates }
      this.saveServices()
      return this.services[index]
    }
    return null
  }

  deleteService(id: string): boolean {
    const index = this.services.findIndex(service => service.id === id)
    if (index !== -1) {
      this.services.splice(index, 1)
      this.saveServices()
      return true
    }
    return false
  }

  toggleServiceStatus(id: string): boolean {
    const service = this.getServiceById(id)
    if (service) {
      service.isActive = !service.isActive
      this.saveServices()
      return true
    }
    return false
  }

  getServicesByCategory(category: string): PMUService[] {
    return this.services.filter(service => 
      service.category === category && service.isActive
    )
  }

  searchServices(query: string): PMUService[] {
    const lowercaseQuery = query.toLowerCase()
    return this.services.filter(service =>
      service.name.toLowerCase().includes(lowercaseQuery) ||
      service.description.toLowerCase().includes(lowercaseQuery) ||
      service.category.toLowerCase().includes(lowercaseQuery)
    )
  }
}

// Export singleton instance
export const serviceStorage = new ServiceStorage()

// Utility functions
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${remainingMinutes}m`
}

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price)
}

export const getServiceCategories = (): string[] => {
  return ['Eyebrows', 'Lips', 'Eyes', 'Face', 'Other']
}
