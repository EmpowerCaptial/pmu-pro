// PMU Services Management System
// Defines available services, pricing, and service categories

export interface PMUService {
  id: string
  name: string
  description: string
  category: 'brows' | 'lips' | 'eyeliner' | 'areola' | 'scalp' | 'beauty-mark' | 'other'
  basePrice: number
  duration: string // e.g., "2-3 hours"
  recoveryTime: string // e.g., "7-14 days"
  includes: string[] // What's included in the service
  requirements: string[] // Pre-service requirements
  aftercare: string[] // Aftercare instructions
  isActive: boolean
  stripeProductId?: string // Stripe product ID for pricing
}

export interface ServiceCategory {
  id: string
  name: string
  description: string
  icon: string
  services: PMUService[]
}

// Available PMU Services
export const PMU_SERVICES: PMUService[] = [
  {
    id: 'microblading',
    name: 'Microblading',
    description: 'Natural-looking eyebrow enhancement using fine strokes to create realistic hair-like appearance',
    category: 'brows',
    basePrice: 450,
    duration: '2-3 hours',
    recoveryTime: '7-14 days',
    includes: [
      'Consultation and design',
      'Microblading procedure',
      'Touch-up session (6-8 weeks)',
      'Aftercare kit',
      'Follow-up support'
    ],
    requirements: [
      'No blood thinners 48 hours prior',
      'No alcohol 24 hours prior',
      'No sun exposure 2 weeks prior',
      'No waxing/threading 1 week prior'
    ],
    aftercare: [
      'Keep area dry for 7 days',
      'Apply healing ointment as directed',
      'Avoid sun exposure',
      'No swimming for 2 weeks'
    ],
    isActive: true
  },
  {
    id: 'powder-brows',
    name: 'Powder Brows',
    description: 'Soft, powdered eyebrow technique for a more defined, makeup-like appearance',
    category: 'brows',
    basePrice: 400,
    duration: '2-3 hours',
    recoveryTime: '7-14 days',
    includes: [
      'Consultation and design',
      'Powder brows procedure',
      'Touch-up session (6-8 weeks)',
      'Aftercare kit',
      'Follow-up support'
    ],
    requirements: [
      'No blood thinners 48 hours prior',
      'No alcohol 24 hours prior',
      'No sun exposure 2 weeks prior',
      'No waxing/threading 1 week prior'
    ],
    aftercare: [
      'Keep area dry for 7 days',
      'Apply healing ointment as directed',
      'Avoid sun exposure',
      'No swimming for 2 weeks'
    ],
    isActive: true
  },
  {
    id: 'combo-brows',
    name: 'Combo Brows',
    description: 'Combination of microblading and powder technique for the most natural and defined look',
    category: 'brows',
    basePrice: 500,
    duration: '2.5-3.5 hours',
    recoveryTime: '7-14 days',
    includes: [
      'Consultation and design',
      'Combo brows procedure',
      'Touch-up session (6-8 weeks)',
      'Aftercare kit',
      'Follow-up support'
    ],
    requirements: [
      'No blood thinners 48 hours prior',
      'No alcohol 24 hours prior',
      'No sun exposure 2 weeks prior',
      'No waxing/threading 1 week prior'
    ],
    aftercare: [
      'Keep area dry for 7 days',
      'Apply healing ointment as directed',
      'Avoid sun exposure',
      'No swimming for 2 weeks'
    ],
    isActive: true
  },
  {
    id: 'lip-blush',
    name: 'Lip Blush',
    description: 'Natural lip color enhancement and shape correction for fuller, more defined lips',
    category: 'lips',
    basePrice: 350,
    duration: '2-3 hours',
    recoveryTime: '7-10 days',
    includes: [
      'Consultation and design',
      'Lip blush procedure',
      'Touch-up session (6-8 weeks)',
      'Aftercare kit',
      'Follow-up support'
    ],
    requirements: [
      'No blood thinners 48 hours prior',
      'No alcohol 24 hours prior',
      'No cold sores (wait 2 weeks)',
      'No lip fillers 2 weeks prior'
    ],
    aftercare: [
      'Keep lips moisturized',
      'Avoid spicy foods for 3 days',
      'No kissing for 7 days',
      'Apply healing ointment as directed'
    ],
    isActive: true
  },
  {
    id: 'eyeliner',
    name: 'Eyeliner',
    description: 'Permanent eyeliner application for enhanced eye definition and beauty',
    category: 'eyeliner',
    basePrice: 300,
    duration: '1.5-2 hours',
    recoveryTime: '5-7 days',
    includes: [
      'Consultation and design',
      'Eyeliner procedure',
      'Touch-up session (6-8 weeks)',
      'Aftercare kit',
      'Follow-up support'
    ],
    requirements: [
      'No contact lenses 24 hours prior',
      'No eye makeup 24 hours prior',
      'No blood thinners 48 hours prior',
      'No alcohol 24 hours prior'
    ],
    aftercare: [
      'Keep area clean and dry',
      'Apply healing ointment as directed',
      'Avoid eye makeup for 7 days',
      'No swimming for 2 weeks'
    ],
    isActive: true
  },
  {
    id: 'areola-restoration',
    name: 'Areola Restoration',
    description: 'Restoration of areola color and shape for post-surgical patients',
    category: 'areola',
    basePrice: 600,
    duration: '2-3 hours',
    recoveryTime: '10-14 days',
    includes: [
      'Consultation and design',
      'Areola restoration procedure',
      'Touch-up session (6-8 weeks)',
      'Aftercare kit',
      'Follow-up support'
    ],
    requirements: [
      'Surgical clearance from doctor',
      'No blood thinners 48 hours prior',
      'No alcohol 24 hours prior',
      'Healed surgical scars'
    ],
    aftercare: [
      'Keep area clean and dry',
      'Apply healing ointment as directed',
      'Avoid tight clothing',
      'No swimming for 3 weeks'
    ],
    isActive: true
  },
  {
    id: 'scalp-micropigmentation',
    name: 'Scalp Micropigmentation',
    description: 'Hair follicle simulation for thinning hair or baldness',
    category: 'scalp',
    basePrice: 800,
    duration: '4-6 hours',
    recoveryTime: '7-10 days',
    includes: [
      'Consultation and design',
      'Scalp micropigmentation procedure',
      'Touch-up session (6-8 weeks)',
      'Aftercare kit',
      'Follow-up support'
    ],
    requirements: [
      'No blood thinners 48 hours prior',
      'No alcohol 24 hours prior',
      'No sun exposure 2 weeks prior',
      'Shaved head (if applicable)'
    ],
    aftercare: [
      'Keep area clean and dry',
      'Apply healing ointment as directed',
      'Avoid sun exposure',
      'No swimming for 2 weeks'
    ],
    isActive: true
  },
  {
    id: 'beauty-mark',
    name: 'Beauty Mark',
    description: 'Permanent beauty mark or freckle enhancement',
    category: 'beauty-mark',
    basePrice: 150,
    duration: '30-45 minutes',
    recoveryTime: '5-7 days',
    includes: [
      'Consultation and design',
      'Beauty mark procedure',
      'Touch-up session (6-8 weeks)',
      'Aftercare kit',
      'Follow-up support'
    ],
    requirements: [
      'No blood thinners 48 hours prior',
      'No alcohol 24 hours prior',
      'No sun exposure 2 weeks prior'
    ],
    aftercare: [
      'Keep area clean and dry',
      'Apply healing ointment as directed',
      'Avoid sun exposure',
      'No picking or scratching'
    ],
    isActive: true
  },
  {
    id: 'touch-up',
    name: 'Touch-Up Session',
    description: 'Follow-up session for existing PMU work (6-8 weeks after initial procedure)',
    category: 'other',
    basePrice: 150,
    duration: '1-2 hours',
    recoveryTime: '5-7 days',
    includes: [
      'Color and shape refinement',
      'Touch-up procedure',
      'Aftercare instructions',
      'Follow-up support'
    ],
    requirements: [
      'Minimum 6 weeks since initial procedure',
      'No blood thinners 48 hours prior',
      'No alcohol 24 hours prior'
    ],
    aftercare: [
      'Keep area clean and dry',
      'Apply healing ointment as directed',
      'Avoid sun exposure',
      'Follow specific aftercare instructions'
    ],
    isActive: true
  }
]

// Service Categories
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'brows',
    name: 'Eyebrow Services',
    description: 'Microblading, powder brows, and combination techniques',
    icon: '👁️',
    services: PMU_SERVICES.filter(s => s.category === 'brows')
  },
  {
    id: 'lips',
    name: 'Lip Services',
    description: 'Lip blush and lip enhancement techniques',
    icon: '💋',
    services: PMU_SERVICES.filter(s => s.category === 'lips')
  },
  {
    id: 'eyeliner',
    name: 'Eyeliner Services',
    description: 'Permanent eyeliner and eye enhancement',
    icon: '👁️',
    services: PMU_SERVICES.filter(s => s.category === 'eyeliner')
  },
  {
    id: 'areola',
    name: 'Areola Restoration',
    description: 'Post-surgical areola restoration and enhancement',
    icon: '🌸',
    services: PMU_SERVICES.filter(s => s.category === 'areola')
  },
  {
    id: 'scalp',
    name: 'Scalp Services',
    description: 'Scalp micropigmentation for hair restoration',
    icon: '💇‍♀️',
    services: PMU_SERVICES.filter(s => s.category === 'scalp')
  },
  {
    id: 'beauty-mark',
    name: 'Beauty Marks',
    description: 'Permanent beauty marks and freckles',
    icon: '✨',
    services: PMU_SERVICES.filter(s => s.category === 'beauty-mark')
  },
  {
    id: 'other',
    name: 'Other Services',
    description: 'Touch-ups and additional services',
    icon: '🔧',
    services: PMU_SERVICES.filter(s => s.category === 'other')
  }
]

// Get service by ID
export function getServiceById(id: string): PMUService | null {
  return PMU_SERVICES.find(service => service.id === id) || null
}

// Get services by category
export function getServicesByCategory(category: string): PMUService[] {
  return PMU_SERVICES.filter(service => service.category === category)
}

// Get active services
export function getActiveServices(): PMUService[] {
  return PMU_SERVICES.filter(service => service.isActive)
}

// Get all categories
export function getAllCategories(): ServiceCategory[] {
  return SERVICE_CATEGORIES
}

// Get category by ID
export function getCategoryById(id: string): ServiceCategory | null {
  return SERVICE_CATEGORIES.find(category => category.id === id) || null
}

// Search services
export function searchServices(query: string): PMUService[] {
  const lowerQuery = query.toLowerCase()
  return PMU_SERVICES.filter(service => 
    service.name.toLowerCase().includes(lowerQuery) ||
    service.description.toLowerCase().includes(lowerQuery) ||
    service.category.toLowerCase().includes(lowerQuery)
  )
}

// Calculate service price with tax
export function calculateServicePrice(service: PMUService, taxRate: number = 0.08): {
  basePrice: number
  taxAmount: number
  totalPrice: number
} {
  const taxAmount = service.basePrice * taxRate
  const totalPrice = service.basePrice + taxAmount
  
  return {
    basePrice: service.basePrice,
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100
  }
}

// Calculate total with gratuity
export function calculateTotalWithGratuity(
  service: PMUService, 
  taxRate: number = 0.08, 
  gratuityPercentage: number = 0
): {
  basePrice: number
  taxAmount: number
  gratuityAmount: number
  totalPrice: number
} {
  const { basePrice, taxAmount, totalPrice } = calculateServicePrice(service, taxRate)
  const gratuityAmount = totalPrice * gratuityPercentage
  const finalTotal = totalPrice + gratuityAmount
  
  return {
    basePrice,
    taxAmount,
    gratuityAmount: Math.round(gratuityAmount * 100) / 100,
    totalPrice: Math.round(finalTotal * 100) / 100
  }
}
