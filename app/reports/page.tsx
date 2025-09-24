"use client"

import { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const stats = [
  {
    title: 'Total Revenue',
    value: 'Loading...',
    change: '--',
    trend: 'neutral',
    icon: DollarSign,
    color: 'text-green-600'
  },
  {
    title: 'Active Clients',
    value: 'Loading...',
    change: '--',
    trend: 'neutral',
    icon: Users,
    color: 'text-blue-600'
  },
  {
    title: 'Appointments',
    value: 'Loading...',
    change: '--',
    trend: 'neutral',
    icon: Calendar,
    color: 'text-purple-600'
  },
  {
    title: 'Services Completed',
    value: 'Loading...',
    change: '--',
    trend: 'neutral',
    icon: BarChart3,
    color: 'text-orange-600'
  }
]

const recentReports = [
  {
    id: 1,
    title: 'Monthly Revenue Report',
    date: new Date().toISOString().split('T')[0],
    type: 'Revenue',
    status: 'completed'
  },
  {
    id: 2,
    title: 'Client Retention Analysis',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    type: 'Analytics',
    status: 'completed'
  },
  {
    id: 3,
    title: 'Service Performance Report',
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    type: 'Performance',
    status: 'completed'
  },
  {
    id: 4,
    title: 'Staff Productivity Report',
    date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
    type: 'Staff',
    status: 'completed'
  }
]

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 p-4 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-2">Reports & Analytics</h1>
            <p className="text-muted">Track your business performance and growth</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button size="sm" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['7d', '30d', '90d', '1y'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className="flex-1 sm:flex-none min-w-0"
            >
              {period}
            </Button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      {stat.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500 mr-1" />}
                      {stat.trend === 'down' && <TrendingUp className="h-4 w-4 text-red-500 mr-1 rotate-180" />}
                      {stat.trend === 'neutral' && <div className="h-4 w-4 mr-1" />}
                      <span className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Chart visualization coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Service Performance</CardTitle>
              <CardDescription>Most popular services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Chart visualization coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Your latest generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div key={report.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">{report.title}</h3>
                      <p className="text-sm text-gray-600">{report.date}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Badge variant="outline" className="border-blue-200 text-blue-800 text-xs">
                      {report.type}
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                      {report.status}
                    </Badge>
                    <Button variant="outline" size="sm" className="flex-shrink-0">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
