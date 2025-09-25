"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  CreditCard,
  ArrowUpRight,
  RefreshCw,
  AlertCircle
} from "lucide-react"
import { useDemoAuth } from "@/hooks/use-demo-auth"

interface WeeklyBalanceData {
  totalRevenue: number
  serviceCount: number
  topService: string
  growthPercentage: number
}

interface DailyBalanceData {
  todaysRevenue: number
  stripeBalance: number
  systemBalance: number
  transactionCount: number
  canPayout: boolean
}

export function WeeklyBalanceCard() {
  const { currentUser } = useDemoAuth()
  const [data, setData] = useState<WeeklyBalanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadWeeklyData()
  }, [currentUser])

  const loadWeeklyData = async () => {
    if (!currentUser?.email) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/financial/weekly', {
        headers: {
          'x-user-email': currentUser.email,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch weekly data: ${response.statusText}`)
      }

      const apiData = await response.json()
      
      const weeklyData: WeeklyBalanceData = {
        totalRevenue: apiData.totalRevenue || 0,
        serviceCount: apiData.serviceCount || 0,
        topService: apiData.topService || 'No services',
        growthPercentage: apiData.growthPercentage || 0
      }
      
      setData(weeklyData)
    } catch (err) {
      console.error('Error loading weekly data:', err)
      
      // For new artists, show $0.00 instead of error
      const emptyData: WeeklyBalanceData = {
        totalRevenue: 0.00,
        serviceCount: 0,
        topService: "No services yet",
        growthPercentage: 0
      }
      setData(emptyData)
      setError(null) // Clear error to show the empty state
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border-lavender/30">
        <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-lavender" />
            <CardTitle className="text-base sm:text-lg font-bold">Weekly Balance</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="flex items-center justify-center py-6 sm:py-8">
            <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-lavender" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border-lavender/30">
        <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
            <CardTitle className="text-base sm:text-lg font-bold">Weekly Balance</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="text-center py-3 sm:py-4">
            <p className="text-red-600 text-xs sm:text-sm mb-2">{error}</p>
            <Button onClick={loadWeeklyData} variant="outline" size="sm" className="text-xs sm:text-sm">
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border-lavender/30">
      <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-lavender" />
            <CardTitle className="text-base sm:text-lg font-bold">Weekly Balance</CardTitle>
          </div>
          {data?.growthPercentage && data.growthPercentage > 0 ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs sm:text-sm">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +{data.growthPercentage}%
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs sm:text-sm">
              <TrendingUp className="h-3 w-3 mr-1" />
              Starting fresh
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="space-y-3 sm:space-y-4">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              ${data?.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Total revenue this week</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2">
            <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className="text-base sm:text-lg font-semibold text-gray-900">{data?.serviceCount}</div>
              <div className="text-xs text-gray-600">Services</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{data?.topService}</div>
              <div className="text-xs text-gray-600">Top Service</div>
            </div>
          </div>
          
          <Button 
            onClick={() => window.location.href = '/reports'}
            className="w-full bg-lavender hover:bg-lavender-600 text-white py-2 text-sm sm:text-base"
          >
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            View Weekly Report
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function DailyBalanceCard() {
  const { currentUser } = useDemoAuth()
  const [data, setData] = useState<DailyBalanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [payoutLoading, setPayoutLoading] = useState(false)

  useEffect(() => {
    loadDailyData()
  }, [currentUser])

  const loadDailyData = async () => {
    if (!currentUser?.email) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/financial/daily', {
        headers: {
          'x-user-email': currentUser.email,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch daily data: ${response.statusText}`)
      }

      const apiData = await response.json()
      
      const dailyData: DailyBalanceData = {
        todaysRevenue: apiData.todaysRevenue || 0,
        stripeBalance: apiData.stripeBalance || 0,
        systemBalance: apiData.systemBalance || 0,
        transactionCount: apiData.transactionCount || 0,
        canPayout: apiData.canPayout || false
      }
      
      setData(dailyData)
    } catch (err) {
      console.error('Error loading daily data:', err)
      
      // For new artists, show $0.00 instead of error
      const emptyData: DailyBalanceData = {
        todaysRevenue: 0.00,
        stripeBalance: 0.00,
        systemBalance: 0.00,
        transactionCount: 0,
        canPayout: false
      }
      setData(emptyData)
      setError(null) // Clear error to show the empty state
    } finally {
      setLoading(false)
    }
  }

  const handleImmediatePayout = async () => {
    if (!data?.canPayout || !currentUser?.email) return
    
    setPayoutLoading(true)
    try {
      const response = await fetch('/api/financial/daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process payout')
      }

      const result = await response.json()
      
      alert(`Successfully initiated payout of $${result.amount.toFixed(2)} to your bank account. Payout ID: ${result.payoutId}`)
      
      // Reload data after payout
      await loadDailyData()
    } catch (err) {
      console.error('Error processing payout:', err)
      alert(`Failed to process payout: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setPayoutLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border-lavender/30">
        <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-lavender" />
            <CardTitle className="text-base sm:text-lg font-bold">Daily Balance</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="flex items-center justify-center py-6 sm:py-8">
            <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-lavender" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border-lavender/30">
        <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
            <CardTitle className="text-base sm:text-lg font-bold">Daily Balance</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="text-center py-3 sm:py-4">
            <p className="text-red-600 text-xs sm:text-sm mb-2">{error}</p>
            <Button onClick={loadDailyData} variant="outline" size="sm" className="text-xs sm:text-sm">
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border-lavender/30">
      <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-lavender" />
          <CardTitle className="text-base sm:text-lg font-bold">Daily Balance</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="space-y-3 sm:space-y-4">
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              ${data?.todaysRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Today's revenue</p>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <div className="text-base sm:text-lg font-semibold text-green-800">
                  ${data?.stripeBalance.toFixed(2)}
                </div>
                <div className="text-xs text-green-600">Stripe Balance</div>
              </div>
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
            
            <div className="flex justify-between items-center p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <div className="text-base sm:text-lg font-semibold text-blue-800">
                  ${data?.systemBalance.toFixed(2)}
                </div>
                <div className="text-xs text-blue-600">System Balance</div>
              </div>
              <div className="text-xs sm:text-sm text-blue-600">{data?.transactionCount} transactions</div>
            </div>
          </div>
          
          <Button 
            onClick={handleImmediatePayout}
            disabled={!data?.canPayout || payoutLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400 py-2 text-sm sm:text-base"
          >
            {payoutLoading ? (
              <>
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : data?.canPayout ? (
              <>
                <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Immediate Payout - ${data?.stripeBalance.toFixed(2)}
              </>
            ) : (
              <>
                <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Connect Stripe to enable payouts
              </>
            )}
          </Button>
          
          {!data?.canPayout && (
            <p className="text-xs text-gray-500 text-center">
              {data?.stripeBalance === 0 ? 
                "Complete your first service to start earning" : 
                "Minimum payout threshold not met"
              }
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
