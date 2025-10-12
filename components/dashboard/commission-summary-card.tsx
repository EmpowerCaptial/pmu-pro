'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, Users, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import Link from 'next/link'

interface CommissionSummary {
  totalRevenue: number
  totalCommissionOwed: number
  totalOwnerKeeps: number
  totalPaid: number
  totalPending: number
  transactionCount: number
  staffCount: number
}

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
}

export function CommissionSummaryCard() {
  const { currentUser } = useDemoAuth()
  const [summary, setSummary] = useState<CommissionSummary | null>(null)
  const [staffCommissions, setStaffCommissions] = useState<StaffCommission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [range, setRange] = useState<'week' | 'month' | 'all'>('week')

  useEffect(() => {
    loadCommissions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, range])

  const loadCommissions = async () => {
    if (!currentUser?.email || currentUser.role !== 'owner') return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/financial/commissions?range=${range}`, {
        headers: {
          'x-user-email': currentUser.email
        }
      })

      if (!response.ok) {
        // Silently handle - API may not be available yet or no commission data
        setSummary({
          totalRevenue: 0,
          totalCommissionOwed: 0,
          totalOwnerKeeps: 0,
          totalPaid: 0,
          totalPending: 0,
          transactionCount: 0,
          staffCount: 0
        })
        setStaffCommissions([])
        setError(null) // Clear error to show empty state
        return
      }

      const data = await response.json()
      setSummary(data.summary)
      setStaffCommissions(data.byStaff || [])
      
    } catch (err: any) {
      // Silently fail - don't spam console
      setSummary({
        totalRevenue: 0,
        totalCommissionOwed: 0,
        totalOwnerKeeps: 0,
        totalPaid: 0,
        totalPending: 0,
        transactionCount: 0,
        staffCount: 0
      })
      setStaffCommissions([])
      setError(null)
    } finally {
      setLoading(false)
    }
  }

  // Only show for owners
  if (currentUser?.role !== 'owner') {
    return null
  }

  if (loading) {
    return (
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <DollarSign className="h-5 w-5" />
            Commission Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-green-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !summary) {
    return (
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <AlertCircle className="h-5 w-5" />
            Commission Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">{error || 'No commission data available'}</p>
          <Button onClick={loadCommissions} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <DollarSign className="h-5 w-5" />
              Commission & Payments
            </CardTitle>
            <CardDescription>
              {range === 'week' ? 'This week' : range === 'month' ? 'This month' : 'All time'}
            </CardDescription>
          </div>
          {/* Range Selector */}
          <div className="flex gap-1 bg-white border border-green-200 rounded-lg p-1">
            <button
              onClick={() => setRange('week')}
              className={`px-3 py-1 text-xs rounded ${
                range === 'week' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setRange('month')}
              className={`px-3 py-1 text-xs rounded ${
                range === 'month' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setRange('all')}
              className={`px-3 py-1 text-xs rounded ${
                range === 'all' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <p className="text-xs text-gray-600 mb-1">Total Revenue</p>
            <p className="text-xl font-bold text-gray-900">
              ${summary.totalRevenue.toFixed(2)}
            </p>
          </div>
          
          <div className="bg-green-100 rounded-lg p-3 border border-green-300">
            <p className="text-xs text-green-700 mb-1">You Keep</p>
            <p className="text-xl font-bold text-green-900">
              ${summary.totalOwnerKeeps.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-yellow-900">Commission Owed</p>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              {summary.staffCount} staff
            </Badge>
          </div>
          <p className="text-2xl font-bold text-yellow-900">
            ${summary.totalPending.toFixed(2)}
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            ${summary.totalPaid.toFixed(2)} already paid
          </p>
        </div>

        {/* Staff Breakdown */}
        {staffCommissions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900">By Staff Member:</h4>
            {staffCommissions.slice(0, 3).map(staff => (
              <div key={staff.staffId} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{staff.staffName}</p>
                    <p className="text-xs text-gray-500">
                      {staff.transactionCount} services • {staff.employmentType === 'commissioned' ? 'Commissioned' : 'Booth Renter'}
                    </p>
                  </div>
                  <Badge variant={staff.totalPending > 0 ? 'default' : 'secondary'} className="text-xs">
                    ${staff.totalPending.toFixed(2)} owed
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>Generated: ${staff.totalRevenue.toFixed(2)}</span>
                  <span>•</span>
                  <span>Paid: ${staff.totalPaid.toFixed(2)}</span>
                </div>
              </div>
            ))}
            
            {staffCommissions.length > 3 && (
              <p className="text-xs text-gray-500 text-center">
                +{staffCommissions.length - 3} more staff members
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link href="/studio/commissions" className="flex-1">
            <Button className="w-full bg-green-600 hover:bg-green-700" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Manage Commissions
            </Button>
          </Link>
          <Button onClick={loadCommissions} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {summary.totalPending === 0 && summary.transactionCount > 0 && (
          <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
            <p className="text-sm font-medium text-green-900">✅ All caught up!</p>
            <p className="text-xs text-green-700">No pending commissions</p>
          </div>
        )}

        {summary.transactionCount === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">No commissioned services yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

