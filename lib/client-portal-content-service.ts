// Service to manage client portal content
// This will store the services, facilities, and special offers managed through the admin portal

export interface PortalService {
  id: string
  name: string
  description: string
  price: number
  image: string
  isSpecial: boolean
  specialPrice?: number
  specialEndDate?: string
  category: string
}

export interface PortalFacility {
  id: string
  name: string
  specialty: string
  image: string
  rating: number
  location: string
  phone: string
  description: string
  services: string[]
  consultationFee: string
  availableSlots: number
  isActive: boolean
}

export interface PortalSpecialOffer {
  id: string
  title: string
  description: string
  discount: number
  startDate: string
  endDate: string
  image: string
  isActive: boolean
  applicableServices: string[]
}

class ClientPortalContentService {
  private static instance: ClientPortalContentService
  private services: PortalService[] = []
  private facilities: PortalFacility[] = []
  private specialOffers: PortalSpecialOffer[] = []

  private constructor() {
    this.loadFromStorage()
  }

  static getInstance(): ClientPortalContentService {
    if (!ClientPortalContentService.instance) {
      ClientPortalContentService.instance = new ClientPortalContentService()
    }
    return ClientPortalContentService.instance
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return

    try {
      // Load services
      const storedServices = localStorage.getItem('pmu_portal_services')
      if (storedServices) {
        this.services = JSON.parse(storedServices)
        console.log('ContentService: Loaded services from localStorage:', this.services)
      } else {
        console.log('ContentService: No services found in localStorage')
      }

      // Load facilities
      const storedFacilities = localStorage.getItem('pmu_portal_facilities')
      if (storedFacilities) {
        this.facilities = JSON.parse(storedFacilities)
        console.log('ContentService: Loaded facilities from localStorage:', this.facilities)
      } else {
        console.log('ContentService: No facilities found in localStorage')
      }

      // Load special offers
      const storedSpecials = localStorage.getItem('pmu_portal_specials')
      if (storedSpecials) {
        this.specialOffers = JSON.parse(storedSpecials)
        console.log('ContentService: Loaded specials from localStorage:', this.specialOffers)
      } else {
        console.log('ContentService: No specials found in localStorage')
      }
    } catch (error) {
      console.error('Error loading portal content:', error)
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return

    try {
      console.log('ContentService: Saving to localStorage')
      console.log('ContentService: Services to save:', this.services)
      
      // Check if any service has a large image
      this.services.forEach((service, index) => {
        if (service.image && service.image.length > 100000) { // 100KB threshold
          console.warn(`ContentService: Service ${index} (${service.name}) has large image: ${service.image.length} characters`)
        }
      })
      
      const servicesJson = JSON.stringify(this.services)
      console.log('ContentService: Services JSON size:', servicesJson.length, 'characters')
      
      // Check localStorage quota
      const quota = navigator.storage?.estimate?.()
      if (quota) {
        console.log('ContentService: Storage quota:', quota)
      }
      
      localStorage.setItem('pmu_portal_services', servicesJson)
      localStorage.setItem('pmu_portal_facilities', JSON.stringify(this.facilities))
      localStorage.setItem('pmu_portal_specials', JSON.stringify(this.specialOffers))
      console.log('ContentService: Successfully saved to localStorage')
      
      // Dispatch custom event to notify components of updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('servicesUpdated'))
        console.log('ContentService: Dispatched servicesUpdated event')
      }
    } catch (error: any) {
      console.error('Error saving portal content:', error)
      console.error('Error details:', error?.message)
      
      // If it's a quota exceeded error, try to compress images
      if (error?.name === 'QuotaExceededError') {
        console.warn('ContentService: localStorage quota exceeded, attempting to compress images')
        this.compressServiceImages()
        // Try saving again
        try {
          localStorage.setItem('pmu_portal_services', JSON.stringify(this.services))
          console.log('ContentService: Successfully saved compressed images')
        } catch (retryError) {
          console.error('ContentService: Still failed to save after compression:', retryError)
        }
      }
    }
  }

  // Services
  getServices(): PortalService[] {
    const filteredServices = this.services.filter(service => {
      // If service is marked as special, check if it's still valid
      if (service.isSpecial && service.specialEndDate) {
        return new Date(service.specialEndDate) > new Date()
      }
      // Return all non-special services and special services without end date
      return true
    })
    console.log('ContentService: getServices() - All services:', this.services)
    console.log('ContentService: getServices() - Filtered services:', filteredServices)
    return filteredServices
  }

  addService(service: Omit<PortalService, 'id'>): PortalService {
    console.log('ContentService: Adding service:', service)
    const newService: PortalService = {
      ...service,
      id: `service_${Date.now()}`
    }
    console.log('ContentService: Created service with ID:', newService.id)
    console.log('ContentService: Service image:', newService.image)
    this.services.push(newService)
    this.saveToStorage()
    console.log('ContentService: Service added, total services:', this.services.length)
    return newService
  }

  updateService(serviceId: string, updates: Partial<PortalService>): boolean {
    const index = this.services.findIndex(s => s.id === serviceId)
    if (index === -1) return false

    this.services[index] = { ...this.services[index], ...updates }
    this.saveToStorage()
    return true
  }

  deleteService(serviceId: string): boolean {
    const initialLength = this.services.length
    this.services = this.services.filter(s => s.id !== serviceId)
    this.saveToStorage()
    return this.services.length < initialLength
  }

  // Facilities
  getFacilities(): PortalFacility[] {
    console.log('ContentService: getFacilities() - All facilities:', this.facilities)
    const activeFacilities = this.facilities.filter(facility => facility.isActive)
    console.log('ContentService: getFacilities() - Active facilities:', activeFacilities)
    return activeFacilities
  }

  getFacilitiesBySpecialty(specialty: string): PortalFacility[] {
    return this.facilities.filter(facility => 
      facility.isActive && 
      facility.specialty.toLowerCase().includes(specialty.toLowerCase())
    )
  }

  addFacility(facility: Omit<PortalFacility, 'id'>): PortalFacility {
    console.log('ContentService: Adding facility:', facility)
    const newFacility: PortalFacility = {
      ...facility,
      id: `facility_${Date.now()}`
    }
    console.log('ContentService: Created facility with ID:', newFacility.id)
    console.log('ContentService: Facility isActive:', newFacility.isActive)
    this.facilities.push(newFacility)
    this.saveToStorage()
    console.log('ContentService: Facility added, total facilities:', this.facilities.length)
    return newFacility
  }

  updateFacility(facilityId: string, updates: Partial<PortalFacility>): boolean {
    const index = this.facilities.findIndex(f => f.id === facilityId)
    if (index === -1) return false

    this.facilities[index] = { ...this.facilities[index], ...updates }
    this.saveToStorage()
    return true
  }

  deleteFacility(facilityId: string): boolean {
    const initialLength = this.facilities.length
    this.facilities = this.facilities.filter(f => f.id !== facilityId)
    this.saveToStorage()
    return this.facilities.length < initialLength
  }

  // Debug method to check localStorage
  debugStorage() {
    console.log('=== ContentService Debug ===')
    console.log('localStorage pmu_portal_facilities:', localStorage.getItem('pmu_portal_facilities'))
    console.log('this.facilities:', this.facilities)
    console.log('Active facilities:', this.getFacilities())
    console.log('==========================')
  }

  // Special Offers
  getSpecialOffers(): PortalSpecialOffer[] {
    const now = new Date()
    return this.specialOffers.filter(offer => 
      offer.isActive && 
      new Date(offer.startDate) <= now && 
      new Date(offer.endDate) >= now
    )
  }

  addSpecialOffer(special: Omit<PortalSpecialOffer, 'id'>): PortalSpecialOffer {
    const newSpecial: PortalSpecialOffer = {
      ...special,
      id: `special_${Date.now()}`
    }
    this.specialOffers.push(newSpecial)
    this.saveToStorage()
    return newSpecial
  }

  updateSpecialOffer(specialId: string, updates: Partial<PortalSpecialOffer>): boolean {
    const index = this.specialOffers.findIndex(s => s.id === specialId)
    if (index === -1) return false

    this.specialOffers[index] = { ...this.specialOffers[index], ...updates }
    this.saveToStorage()
    return true
  }

  deleteSpecialOffer(specialId: string): boolean {
    const initialLength = this.specialOffers.length
    this.specialOffers = this.specialOffers.filter(s => s.id !== specialId)
    this.saveToStorage()
    return this.specialOffers.length < initialLength
  }

 

  // Image compression method
  private compressServiceImages() {
    this.services.forEach((service, index) => {
      if (service.image && service.image.startsWith('data:image')) {
        try {
          // Create a canvas to compress the image
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          const img = new Image()
          
          img.onload = () => {
            // Set canvas size to max 300x300 for compression
            const maxSize = 300
            let { width, height } = img
            
            if (width > height) {
              if (width > maxSize) {
                height = (height * maxSize) / width
                width = maxSize
              }
            } else {
              if (height > maxSize) {
                width = (width * maxSize) / height
                height = maxSize
              }
            }
            
            canvas.width = width
            canvas.height = height
            
            // Draw and compress
            ctx?.drawImage(img, 0, 0, width, height)
            const compressedImage = canvas.toDataURL('image/jpeg', 0.7) // 70% quality
            
            console.log(`ContentService: Compressed service ${index} image from ${service.image.length} to ${compressedImage.length} characters`)
            service.image = compressedImage
          }
          
          img.src = service.image
        } catch (error) {
          console.error(`ContentService: Failed to compress image for service ${index}:`, error)
          // Fallback to hardcoded image
          service.image = this.getDefaultServiceImage(service.name)
        }
      }
    })
  }

  // Get default hardcoded image for service
  private getDefaultServiceImage(serviceName: string): string {
    const defaultImages: Record<string, string> = {
      'microblading': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'eyebrow': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'eyeliner': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'lip': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'touchup': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'consultation': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'lash': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'brow': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
    
    // Try to match service name to default image
    const lowerName = serviceName.toLowerCase()
    for (const [key, gradient] of Object.entries(defaultImages)) {
      if (lowerName.includes(key)) {
        return gradient
      }
    }
    
    // Default gradient if no match
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }
}

export const clientPortalContentService = ClientPortalContentService.getInstance()
