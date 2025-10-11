'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NavBar } from '@/components/ui/navbar'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  Download,
  Filter,
  User,
  TrendingUp
} from 'lucide-react'

interface StaffCommission {
  staffId: string
  staffName: string
  staffEmail: string
  staffRole: string
  employmentType: string
  totalRevenue: number
  totalCommissionOwed: number
  totalPaid: number
  totalPending: number
  transactionCount: number
  transactions: any[]
}

export default function CommissionsPage() {
  const { currentUser, isLoading } = useDemoAuth()
  const router = useRouter()
  const [staffCommissions, setStaffCommissions] = useState<StaffCommission[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<'week' | 'month' | 'all'>('week')
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null)
  const [markingPaid, setMarkingPaid] = useState(false)
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])

  useEffect(() => {
    if (currentUser?.role === 'owner') {
      loadCommissions()
    }
  }, [currentUser, range])

  const loadCommissions = async () => {
    if (!currentUser?.email) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/financial/commissions?range=${range}`, {
        headers: { 'x-user-email': currentUser.email }
      })

      if (response.ok) {
        const data = await response.json()
        setSummary(data.summary)
        setStaffCommissions(data.byStaff || [])
      }
    } catch (error) {
      console.error('Error loading commissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsPaid = async (transactionIds: string[], staffName: string) => {
    if (!currentUser?.email) return

    const paymentMethod = prompt('How did you pay? (cash/check/venmo/stripe/other):')
    if (!paymentMethod) return

    setMarkingPaid(true)
    try {
      const response = await fetch('/api/financial/commissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          transactionIds,
          paidMethod: paymentMethod,
          notes: `Paid to ${staffName} on ${new Date().toLocaleDateString()}`
        })
      })

      if (response.ok) {
        alert(`✅ Marked commissions as paid!`)
        loadCommissions()
        setSelectedTransactions([])
      } else {
        throw new Error('Failed to mark as paid')
      }
    } catch (error) {
      console.error('Error marking as paid:', error)
      alert('Failed to mark as paid')
    } finally {
      setMarkingPaid(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
        <NavBar user={currentUser ? {
          name: currentUser.name,
          email: currentUser.email,
          avatar: (currentUser as any).avatar
        } : undefined} />
        <div className="max-w-7xl mx-auto p-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
          </div>
        </div>
      </div>
    )
  }

  if (currentUser?.role !== 'owner') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
        <NavBar user={currentUser ? {
          name: currentUser.name,
          email: currentUser.email,
          avatar: (currentUser as any).avatar
        } : undefined} />
        <div className="max-w-7xl mx-auto p-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-600">This page is only for studio owners.</p>
              <Button onClick={() => router.push('/dashboard')} className="mt-4">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white pb-24 md:pb-8">
      <NavBar user={currentUser ? {
        name: currentUser.name,
        email: currentUser.email,
        avatar: (currentUser as any).avatar
      } : undefined} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-600" />
                Commission & Payment Management
              </h1>
              <p className="text-gray-600 mt-2">
                Track and manage commission payments to your staff
              </p>
            </div>
            
            {/* Range Selector */}
            <div className="flex gap-2 bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setRange('week')}
                className={`px-4 py-2 text-sm rounded ${
                  range === 'week' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setRange('month')}
                className={`px-4 py-2 text-sm rounded ${
                  range === 'month' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setRange('all')}
                className={`px-4 py-2 text-sm rounded ${
                  range === 'all' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All Time
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs">Total Revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">
                  ${summary.totalRevenue.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-1">{summary.transactionCount} services</p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs text-green-700">You Keep</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-900">
                  ${summary.totalOwnerKeeps.toFixed(2)}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {summary.totalRevenue > 0 
                    ? `${((summary.totalOwnerKeeps / summary.totalRevenue) * 100).toFixed(1)}% of revenue`
                    : 'No revenue yet'
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs text-yellow-700">Pending Commissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-900">
                  ${summary.totalPending.toFixed(2)}
                </p>
                <p className="text-sm text-yellow-600 mt-1">Owed to {summary.staffCount} staff</p>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs text-blue-700">Already Paid</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-900">
                  ${summary.totalPaid.toFixed(2)}
                </p>
                <p className="text-sm text-blue-600 mt-1">Commission payments</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Staff Breakdown */}
        <div className="space-y-6">
          {staffCommissions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Commission Data</h3>
                <p className="text-gray-600 mb-4">
                  No commissioned services found for the selected time range
                </p>
                <Button onClick={() => router.push('/studio/team')} variant="outline">
                  Set Up Team Employment Types
                </Button>
              </CardContent>
            </Card>
          ) : (
            staffCommissions.map((staff) => (
              <Card key={staff.staffId} className="border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-violet-600" />
                        {staff.staffName}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {staff.staffEmail} • {staff.staffRole === 'instructor' ? 'Instructor' : 'Licensed Artist'} • {staff.employmentType === 'commissioned' ? 'Commissioned' : 'Booth Renter'}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={staff.totalPending > 0 ? 'default' : 'secondary'}
                      className={staff.totalPending > 0 ? 'bg-yellow-500' : 'bg-gray-400'}
                    >
                      ${staff.totalPending.toFixed(2)} pending
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Summary Row */}
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Total Revenue</p>
                      <p className="text-lg font-bold text-gray-900">${staff.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-green-600 mb-1">Commission Owed</p>
                      <p className="text-lg font-bold text-green-900">${staff.totalCommissionOwed.toFixed(2)}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-600 mb-1">Already Paid</p>
                      <p className="text-lg font-bold text-blue-900">${staff.totalPaid.toFixed(2)}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <p className="text-xs text-yellow-600 mb-1">Pending</p>
                      <p className="text-lg font-bold text-yellow-900">${staff.totalPending.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Transactions */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-3 hover:text-gray-900">
                      View {staff.transactionCount} Transactions
                    </summary>
                    <div className="space-y-2">
                      {staff.transactions.map((transaction: any) => (
                        <div 
                          key={transaction.id}
                          className={`p-3 rounded-lg border ${
                            transaction.status === 'paid' 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-yellow-50 border-yellow-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                Service: ${transaction.amount.toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-600">
                                Commission ({transaction.commissionRate}%): ${transaction.commissionAmount.toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(transaction.createdAt).toLocaleDateString()} • {transaction.notes || 'No notes'}
                              </p>
                            </div>
                            <Badge variant={transaction.status === 'paid' ? 'secondary' : 'default'}>
                              {transaction.status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                            </Badge>
                          </div>
                          {transaction.status === 'paid' && transaction.paidAt && (
                            <p className="text-xs text-green-600 mt-2">
                              Paid on {new Date(transaction.paidAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>

                  {/* Mark as Paid Button */}
                  {staff.totalPending > 0 && (
                    <Button
                      onClick={() => {
                        const pendingIds = staff.transactions
                          .filter((t: any) => t.status === 'pending')
                          .map((t: any) => t.id)
                        handleMarkAsPaid(pendingIds, staff.staffName)
                      }}
                      className="w-full mt-4 bg-green-600 hover:bg-green-700"
                      disabled={markingPaid}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {markingPaid ? 'Processing...' : `Mark All as Paid ($${staff.totalPending.toFixed(2)})`}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Export Button */}
        {staffCommissions.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
              <Download className="h-4 w-4 mr-2" />
              Export Commission Report (CSV)
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

