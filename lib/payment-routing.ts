import { prisma } from './prisma'

export interface PaymentRoutingResult {
  stripeAccountId: string | null
  recipientEmail: string
  recipientName: string
  recipientId: string
  isOwnerAccount: boolean
  employmentType: 'commissioned' | 'booth_renter' | 'student' | 'owner'
  commissionRate?: number
  shouldTrackCommission: boolean
  commissionAmount?: number
  ownerAmount?: number
  gratuityAmount?: number
  staffTotalAmount?: number // Total amount staff receives (commission + full gratuity)
}

/**
 * Determines where payment should be routed based on staff member's employment type
 * 
 * Rules:
 * - Students: Always to owner (100% of service + gratuity)
 * - Commissioned staff: Service split by commission rate, but 100% of gratuity to staff
 * - Booth renters: To their own Stripe account (100% of service + gratuity)
 * - Owners: To their own account (100% of service + gratuity)
 * 
 * IMPORTANT: For commissioned staff, gratuity always goes 100% to the staff member
 */
export async function getPaymentRouting(
  serviceProviderId: string,
  serviceAmount: number,
  gratuityAmount: number = 0
): Promise<PaymentRoutingResult> {
  
  // Get service provider (staff member who performed service)
  const serviceProvider = await prisma.user.findUnique({
    where: { id: serviceProviderId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      studioName: true,
      employmentType: true,
      commissionRate: true,
      stripeConnectAccountId: true
    }
  })

  if (!serviceProvider) {
    throw new Error('Service provider not found')
  }

  // If service provider is the owner, payment goes to them
  if (serviceProvider.role === 'owner') {
    return {
      stripeAccountId: serviceProvider.stripeConnectAccountId || null,
      recipientEmail: serviceProvider.email,
      recipientName: serviceProvider.name,
      recipientId: serviceProvider.id,
      isOwnerAccount: true,
      employmentType: 'owner',
      shouldTrackCommission: false
    }
  }

  // If service provider is a student or commissioned staff, find owner
  if (
    serviceProvider.role === 'student' || 
    serviceProvider.employmentType === 'commissioned'
  ) {
    // Find studio owner
    const owner = await prisma.user.findFirst({
      where: {
        studioName: serviceProvider.studioName,
        role: 'owner'
      },
      select: {
        id: true,
        name: true,
        email: true,
        stripeConnectAccountId: true
      }
    })

    if (!owner) {
      throw new Error('Studio owner not found')
    }

    const commissionRate = serviceProvider.commissionRate || 0
    
    // Calculate commission ONLY on service amount, NOT on gratuity
    const commissionAmount = (serviceAmount * commissionRate) / 100
    const ownerAmount = serviceAmount - commissionAmount
    
    // For commissioned staff: Staff gets commission + 100% of gratuity
    // For students: Owner gets everything (gratuity goes to owner's account, student earns nothing)
    const isCommissioned = serviceProvider.employmentType === 'commissioned'
    const staffTotal = isCommissioned ? commissionAmount + gratuityAmount : 0

    return {
      stripeAccountId: owner.stripeConnectAccountId || null,
      recipientEmail: owner.email,
      recipientName: owner.name,
      recipientId: owner.id,
      isOwnerAccount: true,
      employmentType: serviceProvider.role === 'student' ? 'student' : 'commissioned',
      commissionRate: commissionRate,
      shouldTrackCommission: serviceProvider.role !== 'student' && commissionRate > 0,
      commissionAmount: commissionAmount,
      ownerAmount: ownerAmount,
      gratuityAmount: gratuityAmount,
      staffTotalAmount: staffTotal
    }
  }

  // If booth renter, payment goes to their account
  if (serviceProvider.employmentType === 'booth_renter') {
    return {
      stripeAccountId: serviceProvider.stripeConnectAccountId || null,
      recipientEmail: serviceProvider.email,
      recipientName: serviceProvider.name,
      recipientId: serviceProvider.id,
      isOwnerAccount: false,
      employmentType: 'booth_renter',
      shouldTrackCommission: false
    }
  }

  // Default: Payment to service provider (fallback for unset employment type)
  console.warn(`⚠️ Employment type not set for ${serviceProvider.name} - defaulting to their account`)
  
  return {
    stripeAccountId: serviceProvider.stripeConnectAccountId || null,
    recipientEmail: serviceProvider.email,
    recipientName: serviceProvider.name,
    recipientId: serviceProvider.id,
    isOwnerAccount: false,
    employmentType: 'commissioned', // Default assumption
    shouldTrackCommission: false
  }
}

/**
 * Records a commission transaction when payment goes to owner for commissioned staff
 * 
 * IMPORTANT: For commissioned staff, gratuity is NOT split - it goes 100% to the staff member
 * Commission is only calculated on the service amount
 */
export async function recordCommissionTransaction(
  ownerId: string,
  staffId: string,
  serviceAmount: number,
  commissionRate: number,
  employmentType: string,
  gratuityAmount: number = 0,
  appointmentId?: string,
  notes?: string
): Promise<void> {
  
  // Calculate commission ONLY on service amount, NOT on gratuity
  const commissionAmount = (serviceAmount * commissionRate) / 100
  const ownerAmount = serviceAmount - commissionAmount
  
  // Staff gets commission from service + 100% of gratuity
  const staffTotalAmount = commissionAmount + gratuityAmount

  await prisma.commissionTransaction.create({
    data: {
      ownerId,
      staffId,
      appointmentId: appointmentId || null,
      amount: serviceAmount, // Service amount only (excluding gratuity)
      gratuityAmount: gratuityAmount, // Gratuity tracked separately
      commissionRate,
      commissionAmount, // Commission from service only
      ownerAmount, // Owner's portion of service only
      staffTotalAmount, // Total staff receives (commission + full gratuity)
      employmentType,
      status: 'pending',
      notes: notes || null
    }
  })

  const gratuityNote = gratuityAmount > 0 ? ` + $${gratuityAmount.toFixed(2)} gratuity (100% to staff)` : ''
  console.log(`✅ Recorded commission: Service $${serviceAmount.toFixed(2)} → Staff $${commissionAmount.toFixed(2)} (${commissionRate}%), Owner $${ownerAmount.toFixed(2)}${gratuityNote}. Staff total: $${staffTotalAmount.toFixed(2)}`)
}

