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
    value: '$12,450',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-600'
  },
  {
    title: 'Active Clients',
    value: '156',
    change: '+8.2%',
    trend: 'up',
    icon: Users,
    color: 'text-blue-600'
  },
  {
    title: 'Appointments',
    value: '89',
    change: '+15.3%',
    trend: 'up',
    icon: Calendar,
    color: 'text-purple-600'
  },
  {
    title: 'Services Completed',
    value: '234',
    change: '+5.7%',
    trend: 'up',
    icon: BarChart3,
    color: 'text-orange-600'
  }
]

const recentReports = [
  {
    id: 1,
    title: 'Monthly Revenue Report',
    date: '2024-01-15',
    type: 'Revenue',
    status: 'completed'
  },
  {
    id: 2,
    title: 'Client Retention Analysis',
    date: '2024-01-14',
    type: 'Analytics',
    status: 'completed'
  },
  {
    id: 3,
    title: 'Service Performance Report',
    date: '2024-01-13',
    type: 'Performance',
    status: 'completed'
  },
  {
    id: 4,
    title: 'Staff Productivity Report',
    date: '2024-01-12',
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-ink mb-2">Reports & Analytics</h1>
            <p className="text-muted">Track your business performance and growth</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          {['7d', '30d', '90d', '1y'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
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
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">{stat.change}</span>
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
                <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{report.title}</h3>
                      <p className="text-sm text-gray-600">{report.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-blue-200 text-blue-800">
                      {report.type}
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {report.status}
                    </Badge>
                    <Button variant="outline" size="sm">
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
