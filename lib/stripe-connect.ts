// Stripe Connect Integration for PMU Pro
// Enables artists to receive direct payouts through Stripe Connect Express

export interface StripeConnectAccount {
  id: string
  artistId: string
  stripeAccountId: string
  status: 'pending' | 'active' | 'restricted' | 'disabled'
  businessType: 'individual' | 'company'
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
  requirements: AccountRequirements
  payoutSchedule: 'manual' | 'automatic'
  payoutDelay: number // days
  createdAt: string
  updatedAt: string
}

export interface AccountRequirements {
  currentlyDue: string[]
  eventuallyDue: string[]
  pastDue: string[]
  pendingVerification: string[]
  disabled: boolean
}

export interface BankAccount {
  id: string
  accountHolderName: string
  accountHolderType: 'individual' | 'company'
  bankName: string
  last4: string
  routingNumber: string
  country: string
  currency: string
  defaultForCurrency: boolean
}

export interface PayoutTransaction {
  id: string
  artistId: string
  stripeAccountId: string
  checkoutSessionId: string
  serviceId: string
  serviceName: string
  clientName: string
  grossAmount: number
  platformFee: number
  stripeFee: number
  netAmount: number
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled'
  payoutId?: string
  payoutDate?: string
  bankAccount: string
  createdAt: string
  updatedAt: string
}

export interface PayoutSummary {
  artistId: string
  totalGross: number
  totalPlatformFees: number
  totalStripeFees: number
  totalNet: number
  pendingAmount: number
  paidAmount: number
  failedAmount: number
  lastPayoutDate?: string
  nextPayoutDate?: string
}

export interface PlatformFeeStructure {
  type: 'percentage' | 'fixed'
  value: number
  minimumFee?: number
  maximumFee?: number
  description: string
}

// Platform fee configuration
export const PLATFORM_FEES: PlatformFeeStructure = {
  type: 'percentage',
  value: 0.10, // 10%
  minimumFee: 5, // $5 minimum
  maximumFee: 50, // $50 maximum
  description: '10% platform fee (min $5, max $50)'
}

// Calculate platform fee
export function calculatePlatformFee(serviceAmount: number): number {
  const percentageFee = serviceAmount * PLATFORM_FEES.value
  
  if (PLATFORM_FEES.minimumFee && percentageFee < PLATFORM_FEES.minimumFee) {
    return PLATFORM_FEES.minimumFee
  }
  
  if (PLATFORM_FEES.maximumFee && percentageFee > PLATFORM_FEES.maximumFee) {
    return PLATFORM_FEES.maximumFee
  }
  
  return Math.round(percentageFee * 100) / 100
}

// Calculate artist payout amount
export function calculateArtistPayout(
  serviceAmount: number, 
  stripeFee: number = 0
): {
  grossAmount: number
  platformFee: number
  stripeFee: number
  netAmount: number
} {
  const platformFee = calculatePlatformFee(serviceAmount)
  const estimatedStripeFee = stripeFee || (serviceAmount * 0.029 + 0.30) // 2.9% + $0.30
  const netAmount = serviceAmount - platformFee - estimatedStripeFee
  
  return {
    grossAmount: serviceAmount,
    platformFee: Math.round(platformFee * 100) / 100,
    stripeFee: Math.round(estimatedStripeFee * 100) / 100,
    netAmount: Math.round(netAmount * 100) / 100
  }
}

// Stripe Connect account status helpers
export function getAccountStatusColor(status: StripeConnectAccount['status']): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'restricted':
      return 'bg-red-100 text-red-800'
    case 'disabled':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getAccountStatusIcon(status: StripeConnectAccount['status']): string {
  switch (status) {
    case 'active':
      return '✅'
    case 'pending':
      return '⏳'
    case 'restricted':
      return '⚠️'
    case 'disabled':
      return '❌'
    default:
      return '❓'
  }
}

export function getAccountStatusText(status: StripeConnectAccount['status']): string {
  switch (status) {
    case 'active':
      return 'Active - Ready to receive payments'
    case 'pending':
      return 'Pending - Completing verification'
    case 'restricted':
      return 'Restricted - Account needs attention'
    case 'disabled':
      return 'Disabled - Account suspended'
    default:
      return 'Unknown status'
  }
}

// Payout status helpers
export function getPayoutStatusColor(status: PayoutTransaction['status']): string {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800'
    case 'processing':
      return 'bg-blue-100 text-blue-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    case 'cancelled':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getPayoutStatusIcon(status: PayoutTransaction['status']): string {
  switch (status) {
    case 'paid':
      return '✅'
    case 'processing':
      return '⏳'
    case 'pending':
      return '⏳'
    case 'failed':
      return '❌'
    case 'cancelled':
      return '🚫'
    default:
      return '❓'
  }
}

// Local storage keys
const STRIPE_CONNECT_ACCOUNTS_KEY = 'pmu_pro_stripe_connect_accounts'
const PAYOUT_TRANSACTIONS_KEY = 'pmu_pro_payout_transactions'

// Save data to local storage
function saveStripeConnectAccounts(accounts: StripeConnectAccount[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STRIPE_CONNECT_ACCOUNTS_KEY, JSON.stringify(accounts))
  }
}

function savePayoutTransactions(transactions: PayoutTransaction[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PAYOUT_TRANSACTIONS_KEY, JSON.stringify(transactions))
  }
}

// Load data from local storage
function loadStripeConnectAccounts(): StripeConnectAccount[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STRIPE_CONNECT_ACCOUNTS_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.error('Error parsing stored Stripe Connect accounts:', error)
      }
    }
  }
  return []
}

function loadPayoutTransactions(): PayoutTransaction[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(PAYOUT_TRANSACTIONS_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.error('Error parsing stored payout transactions:', error)
      }
    }
  }
  return []
}

// Mock data for demonstration
const mockStripeConnectAccounts: StripeConnectAccount[] = [
  {
    id: 'connect_001',
    artistId: 'artist_001',
    stripeAccountId: 'acct_mock123',
    status: 'active',
    businessType: 'individual',
    chargesEnabled: true,
    payoutsEnabled: true,
    detailsSubmitted: true,
    requirements: {
      currentlyDue: [],
      eventuallyDue: [],
      pastDue: [],
      pendingVerification: [],
      disabled: false
    },
    payoutSchedule: 'automatic',
    payoutDelay: 7,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

const mockPayoutTransactions: PayoutTransaction[] = [
  {
    id: 'payout_001',
    artistId: 'artist_001',
    stripeAccountId: 'acct_mock123',
    checkoutSessionId: 'checkout_001',
    serviceId: 'microblading',
    serviceName: 'Microblading',
    clientName: 'Sarah Johnson',
    grossAmount: 450,
    platformFee: 45,
    stripeFee: 13.35,
    netAmount: 391.65,
    status: 'paid',
    payoutId: 'po_mock123',
    payoutDate: '2024-01-15T00:00:00Z',
    bankAccount: '****1234',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  }
]

// CRUD operations for Stripe Connect accounts
export function createStripeConnectAccount(account: Omit<StripeConnectAccount, 'id' | 'createdAt' | 'updatedAt'>): StripeConnectAccount {
  const accounts = loadStripeConnectAccounts()
  const newAccount: StripeConnectAccount = {
    ...account,
    id: `connect_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  accounts.push(newAccount)
  saveStripeConnectAccounts(accounts)
  
  return newAccount
}

export function getStripeConnectAccountByArtistId(artistId: string): StripeConnectAccount | null {
  const accounts = loadStripeConnectAccounts()
  return accounts.find(account => account.artistId === artistId) || null
}

export function updateStripeConnectAccount(accountId: string, updates: Partial<StripeConnectAccount>): StripeConnectAccount | null {
  const accounts = loadStripeConnectAccounts()
  const accountIndex = accounts.findIndex(account => account.id === accountId)
  
  if (accountIndex === -1) return null
  
  const updatedAccount: StripeConnectAccount = {
    ...accounts[accountIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  accounts[accountIndex] = updatedAccount
  saveStripeConnectAccounts(accounts)
  
  return updatedAccount
}

// CRUD operations for payout transactions
export function createPayoutTransaction(transaction: Omit<PayoutTransaction, 'id' | 'createdAt' | 'updatedAt'>): PayoutTransaction {
  const transactions = loadPayoutTransactions()
  const newTransaction: PayoutTransaction = {
    ...transaction,
    id: `payout_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  transactions.push(newTransaction)
  savePayoutTransactions(transactions)
  
  return newTransaction
}

export function getPayoutTransactionsByArtist(artistId: string): PayoutTransaction[] {
  const transactions = loadPayoutTransactions()
  return transactions.filter(transaction => transaction.artistId === artistId)
}

export function updatePayoutTransaction(transactionId: string, updates: Partial<PayoutTransaction>): PayoutTransaction | null {
  const transactions = loadPayoutTransactions()
  const transactionIndex = transactions.findIndex(transaction => transaction.id === transactionId)
  
  if (transactionIndex === -1) return null
  
  const updatedTransaction: PayoutTransaction = {
    ...transactions[transactionIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  transactions[transactionIndex] = updatedTransaction
  savePayoutTransactions(transactions)
  
  return updatedTransaction
}

// Get payout summary for an artist
export function getPayoutSummary(artistId: string): PayoutSummary {
  const transactions = getPayoutTransactionsByArtist(artistId)
  
  const totalGross = transactions.reduce((sum, t) => sum + t.grossAmount, 0)
  const totalPlatformFees = transactions.reduce((sum, t) => sum + t.platformFee, 0)
  const totalStripeFees = transactions.reduce((sum, t) => sum + t.stripeFee, 0)
  const totalNet = transactions.reduce((sum, t) => sum + t.netAmount, 0)
  
  const pendingAmount = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.netAmount, 0)
  
  const paidAmount = transactions
    .filter(t => t.status === 'paid')
    .reduce((sum, t) => sum + t.netAmount, 0)
  
  const failedAmount = transactions
    .filter(t => t.status === 'failed')
    .reduce((sum, t) => sum + t.netAmount, 0)
  
  const lastPayoutDate = transactions
    .filter(t => t.payoutDate)
    .sort((a, b) => new Date(b.payoutDate!).getTime() - new Date(a.payoutDate!).getTime())[0]?.payoutDate
  
  return {
    artistId,
    totalGross: Math.round(totalGross * 100) / 100,
    totalPlatformFees: Math.round(totalPlatformFees * 100) / 100,
    totalStripeFees: Math.round(totalStripeFees * 100) / 100,
    totalNet: Math.round(totalNet * 100) / 100,
    pendingAmount: Math.round(pendingAmount * 100) / 100,
    paidAmount: Math.round(paidAmount * 100) / 100,
    failedAmount: Math.round(failedAmount * 100) / 100,
    lastPayoutDate,
    nextPayoutDate: lastPayoutDate ? 
      new Date(new Date(lastPayoutDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() : 
      undefined
  }
}

// Initialize with mock data if empty
export function initializeStripeConnectData(): void {
  const accounts = loadStripeConnectAccounts()
  const transactions = loadPayoutTransactions()
  
  if (accounts.length === 0) {
    saveStripeConnectAccounts(mockStripeConnectAccounts)
  }
  
  if (transactions.length === 0) {
    savePayoutTransactions(mockPayoutTransactions)
  }
}
