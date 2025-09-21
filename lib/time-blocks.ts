// Time blocking system for calendar management
export interface TimeBlock {
  id: string
  userId: string
  date: string // YYYY-MM-DD format
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  type: 'unavailable' | 'break' | 'personal' | 'maintenance' | 'training'
  title: string
  notes?: string
  isRecurring: boolean
  recurringPattern?: 'daily' | 'weekly' | 'monthly'
  recurringEndDate?: string
  createdAt: string
  updatedAt: string
}

export interface TimeBlockRequest {
  userId?: string
  date: string
  startTime: string
  endTime: string
  type: TimeBlock['type']
  title: string
  notes?: string
  isRecurring?: boolean
  recurringPattern?: TimeBlock['recurringPattern']
  recurringEndDate?: string
}

// Default time block types with colors
export const TIME_BLOCK_TYPES = {
  unavailable: { label: 'Unavailable', color: 'bg-red-100 text-red-800 border-red-200' },
  break: { label: 'Break', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  personal: { label: 'Personal Time', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  maintenance: { label: 'Maintenance', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  training: { label: 'Training', color: 'bg-blue-100 text-blue-800 border-blue-200' }
} as const

// Helper functions
export function generateTimeSlots(intervalMinutes = 30): string[] {
  const slots: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push(timeString)
    }
  }
  return slots
}

export function isTimeInBlock(time: string, block: TimeBlock): boolean {
  const timeMinutes = timeToMinutes(time)
  const startMinutes = timeToMinutes(block.startTime)
  const endMinutes = timeToMinutes(block.endTime)
  
  return timeMinutes >= startMinutes && timeMinutes < endMinutes
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

export function formatTimeBlockDuration(block: TimeBlock): string {
  const startMinutes = timeToMinutes(block.startTime)
  const endMinutes = timeToMinutes(block.endTime)
  const duration = endMinutes - startMinutes
  
  if (duration < 60) {
    return `${duration}m`
  }
  
  const hours = Math.floor(duration / 60)
  const minutes = duration % 60
  
  if (minutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${minutes}m`
}

// Validation functions
export function validateTimeBlock(block: TimeBlockRequest): string[] {
  const errors: string[] = []
  
  if (!block.date) {
    errors.push('Date is required')
  }
  
  if (!block.startTime) {
    errors.push('Start time is required')
  }
  
  if (!block.endTime) {
    errors.push('End time is required')
  }
  
  if (block.startTime && block.endTime) {
    const startMinutes = timeToMinutes(block.startTime)
    const endMinutes = timeToMinutes(block.endTime)
    
    if (startMinutes >= endMinutes) {
      errors.push('End time must be after start time')
    }
  }
  
  if (!block.title.trim()) {
    errors.push('Title is required')
  }
  
  if (block.isRecurring && !block.recurringPattern) {
    errors.push('Recurring pattern is required for recurring blocks')
  }
  
  if (block.isRecurring && block.recurringEndDate && block.date >= block.recurringEndDate) {
    errors.push('Recurring end date must be after start date')
  }
  
  return errors
}

// Mock data for development
export const mockTimeBlocks: TimeBlock[] = [
  {
    id: '1',
    userId: 'demo_artist_001',
    date: '2024-01-15',
    startTime: '12:00',
    endTime: '13:00',
    type: 'break',
    title: 'Lunch Break',
    notes: 'Personal lunch time',
    isRecurring: true,
    recurringPattern: 'daily',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    userId: 'demo_artist_001',
    date: '2024-01-15',
    startTime: '17:00',
    endTime: '18:00',
    type: 'unavailable',
    title: 'Personal Appointment',
    notes: 'Doctor appointment',
    isRecurring: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    userId: 'demo_artist_001',
    date: '2024-01-16',
    startTime: '09:00',
    endTime: '10:00',
    type: 'training',
    title: 'Equipment Maintenance',
    notes: 'Weekly equipment cleaning and calibration',
    isRecurring: true,
    recurringPattern: 'weekly',
    recurringEndDate: '2024-12-31',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]
