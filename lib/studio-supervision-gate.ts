// Enterprise Studio Supervision Feature Gating
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface SupervisionUser {
  id: string
  email: string
  role: string
  selectedPlan: string
  isLicenseVerified: boolean
  hasActiveSubscription: boolean
}

export interface SupervisionAccessResult {
  canAccess: boolean
  isEnterpriseStudio: boolean
  userRole: 'INSTRUCTOR' | 'APPRENTICE' | 'ADMIN' | 'NONE'
  message?: string
}

/**
 * Check if user has access to Enterprise Studio Supervision features
 */
export function checkStudioSupervisionAccess(user: SupervisionUser): SupervisionAccessResult {
  // 1. Must be Enterprise Studio subscription
  const isEnterpriseStudio = user.selectedPlan === 'studio' && user.hasActiveSubscription
  
  if (!isEnterpriseStudio) {
    return {
      canAccess: false,
      isEnterpriseStudio: false,
      userRole: 'NONE',
      message: 'Enterprise Studio Supervised Scheduling requires Studio ($99/month) subscription'
    }
  }

  // 2. Must be license verified
  if (!user.isLicenseVerified) {
    return {
      canAccess: false,
      isEnterpriseStudio: true,
      userRole: 'NONE',
      message: 'License verification required for supervision features'
    }
  }

  // 3. Determine user role for supervision system
  let supervisionRole: 'INSTRUCTOR' | 'APPRENTICE' | 'ADMIN' | 'NONE' = 'NONE'
  
  // Map roles to supervision roles
  switch (user.role) {
    case 'admin':
    case 'staff':
      supervisionRole = 'ADMIN'
      break
    case 'instructor':
      // Direct instructor role - full access to supervision system
      if (isEnterpriseStudio && user.isLicenseVerified) {
        supervisionRole = 'INSTRUCTOR'
      } else {
        supervisionRole = 'NONE'
      }
      break
    case 'licensed':
      // Licensed artists with studio subscription can be instructors
      if (isEnterpriseStudio && user.isLicenseVerified) {
        supervisionRole = 'INSTRUCTOR'
      } else {
        supervisionRole = 'NONE'
      }
      break
    case 'student':
      supervisionRole = 'APPRENTICE'
      break
    case 'artist':
      // Legacy role - map to licensed if license verified, otherwise student
      if (user.isLicenseVerified) {
        supervisionRole = 'INSTRUCTOR'
      } else {
        supervisionRole = 'APPRENTICE'
      }
      break
    case 'apprentice':
      // Legacy role - map to student
      supervisionRole = 'APPRENTICE'
      break
    default:
      supervisionRole = 'NONE'
  }

  if (supervisionRole === 'NONE') {
    return {
      canAccess: false,
      isEnterpriseStudio: true,
      userRole: 'NONE',
      message: 'Valid role required. Contact admin to set your supervision role'
    }
  }

  return {
    canAccess: true,
    isEnterpriseStudio: true,
    userRole: supervisionRole
  }
}

/**
 * Check if user can publish supervision availability (INSTRUCTOR or ADMIN only)
 */
export function canPublishAvailability(user: SupervisionUser): boolean {
  const result = checkStudioSupervisionAccess(user)
  return result.canAccess && (result.userRole === 'INSTRUCTOR' || result.userRole === 'ADMIN')
}

/**
 * Check if user can book supervision slots (APPRENTICE or ADMIN only)
 */
export function canBookSupervision(user: SupervisionUser): boolean {
  const result = checkStudioSupervisionAccess(user)
  return result.canAccess && (result.userRole === 'APPRENTICE' || result.userRole === 'ADMIN')
}

/**
 * Check if user should use regular booking system (licensed artists)
 */
export function shouldUseRegularBooking(user: SupervisionUser): boolean {
  // Owners and managers always use regular booking
  if (user.role === 'owner' || user.role === 'manager' || user.role === 'director') {
    return true
  }
  
  // Instructors use regular booking system (they can book their own clients)
  if (user.role === 'instructor') {
    return true
  }
  
  // Licensed artists use regular booking system
  if (user.role === 'licensed') {
    return true
  }
  
  // Legacy: artists with verified licenses use regular booking
  if (user.role === 'artist' && user.isLicenseVerified) {
    return true
  }
  
  return false
}

/**
 * Check if user should use supervision booking system (students)
 */
export function shouldUseSupervisionBooking(user: SupervisionUser): boolean {
  // Students use supervision booking system
  if (user.role === 'student') {
    return true
  }
  
  // Legacy: apprentices use supervision booking
  if (user.role === 'apprentice') {
    return true
  }
  
  // Legacy: artists without verified licenses use supervision booking
  if (user.role === 'artist' && !user.isLicenseVerified) {
    return true
  }
  
  return false
}

/**
 * Get user with supervision access validation from database
 */
export async function getSupervisionUser(userId: string): Promise<SupervisionUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        selectedPlan: true,
        isLicenseVerified: true,
        hasActiveSubscription: true
      }
    })

    return user
  } catch (error) {
    console.error('Error fetching supervision user:', error)
    return null
  }
}
