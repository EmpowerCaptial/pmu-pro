"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Download,
  RefreshCw,
  Calendar,
  Banknote
} from 'lucide-react'
import { 
  PayoutTransaction,
  PayoutSummary,
  getPayoutTransactionsByArtist,
  getPayoutSummary,
  getPayoutStatusColor,
  getPayoutStatusIcon
} from '@/lib/stripe-connect'

interface PayoutDashboardProps {
  artistId: string
}

export default function PayoutDashboard({ artistId }: PayoutDashboardProps) {
  const [transactions, setTransactions] = useState<PayoutTransaction[]>([])
  const [summary, setSummary] = useState<PayoutSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  useEffect(() => {
    loadPayoutData()
  }, [artistId, selectedPeriod])

  const loadPayoutData = () => {
    setIsLoading(true)
    
    // Load transactions and summary
    const artistTransactions = getPayoutTransactionsByArtist(artistId)
    const artistSummary = getPayoutSummary(artistId)
    
    // Filter by period if needed
    let filteredTransactions = artistTransactions
    if (selectedPeriod !== 'all') {
      const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)
      
      filteredTransactions = artistTransactions.filter(t => 
        new Date(t.createdAt) >= cutoffDate
      )
    }
    
    setTransactions(filteredTransactions)
    setSummary(artistSummary)
    setIsLoading(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '7d': return 'Last 7 Days'
      case '30d': return 'Last 30 Days'
      case '90d': return 'Last 90 Days'
      case 'all': return 'All Time'
      default: return period
    }
  }

  const handleRefresh = () => {
    loadPayoutData()
  }

  const handleExportData = () => {
    // Export transactions to CSV
    const csvContent = [
      ['Date', 'Service', 'Client', 'Gross Amount', 'Platform Fee', 'Stripe Fee', 'Net Amount', 'Status'],
      ...transactions.map(t => [
        formatDate(t.createdAt),
        t.serviceName,
        t.clientName,
        formatCurrency(t.grossAmount),
        formatCurrency(t.platformFee),
        formatCurrency(t.stripeFee),
        formatCurrency(t.netAmount),
        t.status
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payout-transactions-${selectedPeriod}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-lavender" />
      </div>
    )
  }

  if (!summary) {
    return (
      <Card className="border-lavender/20 bg-white">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Payout Data</h3>
          <p className="text-gray-600">
            You haven't processed any payments yet. Start by checking out a client!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-lavender/20 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Gross</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.totalGross)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-lavender" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-lavender/20 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(summary.pendingAmount)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-lavender/20 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.paidAmount)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-lavender/20 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Platform Fees</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.totalPlatformFees)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period Selector and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Period:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-lavender"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="border-lavender text-lavender hover:bg-lavender/5"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleExportData}
            variant="outline"
            size="sm"
            className="border-lavender text-lavender hover:bg-lavender/5"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Next Payout Info */}
      {summary.nextPayoutDate && (
        <Card className="border-lavender/20 bg-lavender/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-lavender" />
              <div>
                <p className="text-sm font-medium text-lavender-700">
                  Next Payout: {formatDate(summary.nextPayoutDate)}
                </p>
                <p className="text-xs text-lavender-600">
                  Estimated amount: {formatCurrency(summary.pendingAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions Table */}
      <Card className="border-lavender/20 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lavender-700">
            <Banknote className="h-5 w-5" />
            Transaction History ({getPeriodLabel(selectedPeriod)})
          </CardTitle>
          <CardDescription>
            Detailed breakdown of all your payment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions found for this period.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Service</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Client</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Gross</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Platform Fee</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Net</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {transaction.serviceName}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {transaction.clientName}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900">
                        {formatCurrency(transaction.grossAmount)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-red-600">
                        -{formatCurrency(transaction.platformFee)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-green-600">
                        {formatCurrency(transaction.netAmount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={getPayoutStatusColor(transaction.status)}>
                          {getPayoutStatusIcon(transaction.status)} {transaction.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Footer */}
      <Card className="border-lavender/20 bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Showing {transactions.length} transactions for {getPeriodLabel(selectedPeriod)}
            </span>
            <div className="flex items-center gap-6 text-gray-600">
              <span>
                Total Net: <span className="font-medium text-gray-900">
                  {formatCurrency(summary.totalNet)}
                </span>
              </span>
              <span>
                Platform Fees: <span className="font-medium text-red-600">
                  {formatCurrency(summary.totalPlatformFees)}
                </span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
