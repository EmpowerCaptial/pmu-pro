'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DollarSign, TrendingUp, Clock, RefreshCw, AlertCircle } from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'

interface StaffEarnings {
  employmentType: 'commissioned' | 'booth_renter' | 'student' | null
  commissionRate: number
  totalRevenue: number
  commissionEarned: number
  commissionPaid: number
  commissionPending: number
  ownerShare: number
  transactionCount: number
  boothRentAmount?: number
}

export function StaffEarningsCard() {
  const { currentUser } = useDemoAuth()
  const [earnings, setEarnings] = useState<StaffEarnings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEarnings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id])

  const loadEarnings = async () => {
    if (!currentUser?.email) return
    
    // Only show for staff (not owners)
    if (currentUser.role === 'owner') return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/financial/staff-earnings', {
        headers: {
          'x-user-email': currentUser.email
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch earnings')
      }

      const data = await response.json()
      setEarnings(data.earnings)
      
    } catch (err: any) {
      console.error('Error loading staff earnings:', err)
      setError(err.message)
      
      // Show empty state instead of error for new staff
      setEarnings({
        employmentType: null,
        commissionRate: 0,
        totalRevenue: 0,
        commissionEarned: 0,
        commissionPaid: 0,
        commissionPending: 0,
        ownerShare: 0,
        transactionCount: 0
      })
    } finally {
      setLoading(false)
    }
  }

  // Don't show for owners
  if (currentUser?.role === 'owner') {
    return null
  }

  if (loading) {
    return (
      <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-violet-900">
            <DollarSign className="h-5 w-5" />
            Your Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-violet-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!earnings) {
    return null
  }

  return (
    <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-violet-900">
          <DollarSign className="h-5 w-5" />
          Your Earnings
        </CardTitle>
        <CardDescription>
          {earnings.employmentType === 'commissioned' 
            ? `Commissioned Artist (${earnings.commissionRate}% commission)`
            : earnings.employmentType === 'booth_renter'
            ? `Booth Renter (${earnings.boothRentAmount ? `$${earnings.boothRentAmount}/mo` : 'Rent TBD'})`
            : currentUser?.role === 'student'
            ? 'Student (Studio revenue)'
            : 'Employment type not set'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Not Set Warning */}
        {!earnings.employmentType && currentUser?.role !== 'student' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-900 text-sm">Payment Type Not Set</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Ask your studio owner to set your employment type in Team Management
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Commissioned Staff View */}
        {earnings.employmentType === 'commissioned' && (
          <>
            <div className="bg-white rounded-lg p-4 border border-violet-200">
              <p className="text-sm text-gray-600 mb-2">Total Revenue Generated</p>
              <p className="text-3xl font-bold text-gray-900">
                ${earnings.totalRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                From {earnings.transactionCount} services
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-xs text-green-700 mb-1">Your Commission ({earnings.commissionRate}%)</p>
                <p className="text-xl font-bold text-green-900">
                  ${earnings.commissionEarned.toFixed(2)}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Studio Share</p>
                <p className="text-xl font-bold text-gray-700">
                  ${earnings.ownerShare.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-yellow-900">Payment Status</p>
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-yellow-700">Pending:</span>
                  <span className="font-bold text-yellow-900">${earnings.commissionPending.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-700">Paid:</span>
                  <span className="font-medium text-green-900">${earnings.commissionPaid.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-xs text-yellow-600 mt-3">
                💡 Your studio owner handles commission payments separately
              </p>
            </div>
          </>
        )}

        {/* Booth Renter View */}
        {earnings.employmentType === 'booth_renter' && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700 mb-2">Your Direct Revenue</p>
              <p className="text-3xl font-bold text-blue-900">
                ${earnings.totalRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Payments go to your Stripe account
              </p>
            </div>

            {earnings.boothRentAmount && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-900 mb-2">
                  Monthly Booth Rent
                </p>
                <p className="text-2xl font-bold text-yellow-900">
                  ${earnings.boothRentAmount.toFixed(2)}
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Contact owner to arrange payment
                </p>
              </div>
            )}
          </>
        )}

        {/* Student View */}
        {currentUser?.role === 'student' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm font-medium text-blue-900 mb-2">
              📚 Student Services
            </p>
            <p className="text-2xl font-bold text-blue-900">
              ${earnings.totalRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Total revenue generated under supervision
            </p>
            <p className="text-xs text-blue-600 mt-2">
              All payments go to studio owner
            </p>
          </div>
        )}

        {/* No Data */}
        {earnings.transactionCount === 0 && (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">No services completed yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

