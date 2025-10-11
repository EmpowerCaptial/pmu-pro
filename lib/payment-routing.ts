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
}

/**
 * Determines where payment should be routed based on staff member's employment type
 * 
 * Rules:
 * - Students: Always to owner (100%)
 * - Commissioned staff: To owner (owner pays commission separately)
 * - Booth renters: To their own Stripe account
 * - Owners: To their own account
 */
export async function getPaymentRouting(
  serviceProviderId: string,
  serviceAmount: number
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
    const commissionAmount = (serviceAmount * commissionRate) / 100
    const ownerAmount = serviceAmount - commissionAmount

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
      ownerAmount: ownerAmount
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
 */
export async function recordCommissionTransaction(
  ownerId: string,
  staffId: string,
  amount: number,
  commissionRate: number,
  employmentType: string,
  appointmentId?: string,
  notes?: string
): Promise<void> {
  
  const commissionAmount = (amount * commissionRate) / 100
  const ownerAmount = amount - commissionAmount

  await prisma.commissionTransaction.create({
    data: {
      ownerId,
      staffId,
      appointmentId: appointmentId || null,
      amount,
      commissionRate,
      commissionAmount,
      ownerAmount,
      employmentType,
      status: 'pending',
      notes: notes || null
    }
  })

  console.log(`✅ Recorded commission: $${commissionAmount.toFixed(2)} owed to staff, owner keeps $${ownerAmount.toFixed(2)}`)
}

