// Deposit Payment Service
// Handles client deposit payments and payment links

import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export interface CreateDepositRequest {
  clientId: string;
  userId: string;
  appointmentId?: string;
  amount: number;
  totalAmount: number;
  currency?: string;
  notes?: string;
  linkExpirationDays?: number;
}

export interface DepositPayment {
  id: string;
  clientId: string;
  appointmentId?: string;
  userId: string;
  amount: number;
  totalAmount: number;
  remainingAmount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'REFUNDED' | 'CANCELLED';
  depositLink: string;
  depositLinkExpiresAt: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class DepositPaymentService {
  /**
   * Create a deposit payment and generate a unique payment link
   */
  static async createDepositPayment(request: CreateDepositRequest): Promise<DepositPayment> {
    const {
      clientId,
      userId,
      appointmentId,
      amount,
      totalAmount,
      currency = 'USD',
      notes,
      linkExpirationDays = 7
    } = request;

    // Calculate remaining amount
    const remainingAmount = totalAmount - amount;

    // Generate unique deposit link
    const depositLink = this.generateDepositLink();

    // Calculate expiration date
    const depositLinkExpiresAt = new Date();
    depositLinkExpiresAt.setDate(depositLinkExpiresAt.getDate() + linkExpirationDays);

    // Create deposit payment record
    const depositPayment = await prisma.depositPayment.create({
      data: {
        clientId,
        userId,
        appointmentId,
        amount,
        totalAmount,
        remainingAmount,
        currency,
        depositLink,
        depositLinkExpiresAt,
        notes,
        status: 'PENDING'
      }
    });

    return {
      id: depositPayment.id,
      clientId: depositPayment.clientId,
      appointmentId: depositPayment.appointmentId || undefined,
      userId: depositPayment.userId,
      amount: Number(depositPayment.amount),
      totalAmount: Number(depositPayment.totalAmount),
      remainingAmount: Number(depositPayment.remainingAmount),
      currency: depositPayment.currency,
      status: depositPayment.status as any,
      depositLink: depositPayment.depositLink,
      depositLinkExpiresAt: depositPayment.depositLinkExpiresAt,
      paidAt: depositPayment.paidAt || undefined,
      createdAt: depositPayment.createdAt,
      updatedAt: depositPayment.updatedAt
    };
  }

  /**
   * Get deposit payment by link
   */
  static async getDepositByLink(depositLink: string): Promise<DepositPayment | null> {
    const depositPayment = await prisma.depositPayment.findUnique({
      where: { depositLink },
      include: {
        client: true,
        user: true
      }
    });

    if (!depositPayment) return null;

    return {
      id: depositPayment.id,
      clientId: depositPayment.clientId,
      appointmentId: depositPayment.appointmentId || undefined,
      userId: depositPayment.userId,
      amount: Number(depositPayment.amount),
      totalAmount: Number(depositPayment.totalAmount),
      remainingAmount: Number(depositPayment.remainingAmount),
      currency: depositPayment.currency,
      status: depositPayment.status as any,
      depositLink: depositPayment.depositLink,
      depositLinkExpiresAt: depositPayment.depositLinkExpiresAt,
      paidAt: depositPayment.paidAt || undefined,
      createdAt: depositPayment.createdAt,
      updatedAt: depositPayment.updatedAt
    };
  }

  /**
   * Update deposit payment status
   */
  static async updateDepositStatus(
    depositId: string, 
    status: 'PENDING' | 'PAID' | 'EXPIRED' | 'REFUNDED' | 'CANCELLED',
    additionalData?: {
      stripePaymentIntentId?: string;
      stripeSessionId?: string;
      paidAt?: Date;
      refundAmount?: number;
      refundReason?: string;
    }
  ): Promise<DepositPayment> {
    const updateData: any = { status };

    if (additionalData) {
      if (additionalData.stripePaymentIntentId) {
        updateData.stripePaymentIntentId = additionalData.stripePaymentIntentId;
      }
      if (additionalData.stripeSessionId) {
        updateData.stripeSessionId = additionalData.stripeSessionId;
      }
      if (additionalData.paidAt) {
        updateData.paidAt = additionalData.paidAt;
      }
      if (additionalData.refundAmount) {
        updateData.refundAmount = additionalData.refundAmount;
        updateData.refundedAt = new Date();
      }
      if (additionalData.refundReason) {
        updateData.refundReason = additionalData.refundReason;
      }
    }

    const depositPayment = await prisma.depositPayment.update({
      where: { id: depositId },
      data: updateData
    });

    return {
      id: depositPayment.id,
      clientId: depositPayment.clientId,
      appointmentId: depositPayment.appointmentId || undefined,
      userId: depositPayment.userId,
      amount: Number(depositPayment.amount),
      totalAmount: Number(depositPayment.totalAmount),
      remainingAmount: Number(depositPayment.remainingAmount),
      currency: depositPayment.currency,
      status: depositPayment.status as any,
      depositLink: depositPayment.depositLink,
      depositLinkExpiresAt: depositPayment.depositLinkExpiresAt,
      paidAt: depositPayment.paidAt || undefined,
      createdAt: depositPayment.createdAt,
      updatedAt: depositPayment.updatedAt
    };
  }

  /**
   * Get all deposit payments for a user
   */
  static async getUserDepositPayments(userId: string): Promise<DepositPayment[]> {
    const depositPayments = await prisma.depositPayment.findMany({
      where: { userId },
      include: {
        client: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return depositPayments.map(deposit => ({
      id: deposit.id,
      clientId: deposit.clientId,
      appointmentId: deposit.appointmentId || undefined,
      userId: deposit.userId,
      amount: Number(deposit.amount),
      totalAmount: Number(deposit.totalAmount),
      remainingAmount: Number(deposit.remainingAmount),
      currency: deposit.currency,
      status: deposit.status as any,
      depositLink: deposit.depositLink,
      depositLinkExpiresAt: deposit.depositLinkExpiresAt,
      paidAt: deposit.paidAt || undefined,
      createdAt: deposit.createdAt,
      updatedAt: deposit.updatedAt
    }));
  }

  /**
   * Get all deposit payments for a client
   */
  static async getClientDepositPayments(clientId: string): Promise<DepositPayment[]> {
    const depositPayments = await prisma.depositPayment.findMany({
      where: { clientId },
      include: {
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return depositPayments.map(deposit => ({
      id: deposit.id,
      clientId: deposit.clientId,
      appointmentId: deposit.appointmentId || undefined,
      userId: deposit.userId,
      amount: Number(deposit.amount),
      totalAmount: Number(deposit.totalAmount),
      remainingAmount: Number(deposit.remainingAmount),
      currency: deposit.currency,
      status: deposit.status as any,
      depositLink: deposit.depositLink,
      depositLinkExpiresAt: deposit.depositLinkExpiresAt,
      paidAt: deposit.paidAt || undefined,
      createdAt: deposit.createdAt,
      updatedAt: deposit.updatedAt
    }));
  }

  /**
   * Check if deposit link is expired
   */
  static async checkExpiredDeposits(): Promise<void> {
    await prisma.depositPayment.updateMany({
      where: {
        status: 'PENDING',
        depositLinkExpiresAt: {
          lt: new Date()
        }
      },
      data: {
        status: 'EXPIRED'
      }
    });
  }

  /**
   * Generate a unique deposit link
   */
  private static generateDepositLink(): string {
    const randomBytes = crypto.randomBytes(32);
    return `deposit_${randomBytes.toString('hex')}`;
  }

  /**
   * Get deposit payment statistics for a user
   */
  static async getDepositStats(userId: string): Promise<{
    totalDeposits: number;
    totalAmount: number;
    pendingDeposits: number;
    paidDeposits: number;
    expiredDeposits: number;
  }> {
    const deposits = await prisma.depositPayment.findMany({
      where: { userId }
    });

    const stats = {
      totalDeposits: deposits.length,
      totalAmount: deposits.reduce((sum, deposit) => sum + Number(deposit.amount), 0),
      pendingDeposits: deposits.filter(d => d.status === 'PENDING').length,
      paidDeposits: deposits.filter(d => d.status === 'PAID').length,
      expiredDeposits: deposits.filter(d => d.status === 'EXPIRED').length
    };

    return stats;
  }
}
