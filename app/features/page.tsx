"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  BookOpen, 
  BarChart3, 
  CreditCard, 
  Users, 
  Clock, 
  MapPin,
  Receipt, 
  Mail, 
  Gift,
  Plus,
  Settings,
  Calendar,
  DollarSign,
  UserCheck,
  Timer,
  TrendingUp,
  Send,
  Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const features = [
  {
    id: 'services',
    title: 'Service Management',
    description: 'Manage your PMU services, pricing, and procedures',
    icon: BookOpen,
    href: '/services',
    color: 'bg-blue-500',
    status: 'active'
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    description: 'View business performance and client analytics',
    icon: BarChart3,
    href: '/reports',
    color: 'bg-green-500',
    status: 'coming-soon'
  },
  {
    id: 'payouts',
    title: 'Payouts & Payments',
    description: 'Manage artist payouts and payment processing',
    icon: CreditCard,
    href: '/payouts',
    color: 'bg-purple-500',
    status: 'coming-soon'
  },
  {
    id: 'teams',
    title: 'Team Management',
    description: 'Manage staff, roles, and permissions',
    icon: Users,
    href: '/staff',
    color: 'bg-indigo-500',
    status: 'active'
  },
  {
    id: 'time-clock',
    title: 'Time Clock',
    description: 'Track work hours with GPS location verification',
    icon: Clock,
    href: '/time-clock',
    color: 'bg-orange-500',
    status: 'coming-soon'
  },
  {
    id: 'geo-tracker',
    title: 'GPS Tracker',
    description: 'Location-based time tracking and verification',
    icon: MapPin,
    href: '/geo-tracker',
    color: 'bg-red-500',
    status: 'coming-soon'
  },
  {
    id: 'expenses',
    title: 'Expense Tracking',
    description: 'Track business expenses and receipts',
    icon: Receipt,
    href: '/expenses',
    color: 'bg-yellow-500',
    status: 'coming-soon'
  },
  {
    id: 'email-marketing',
    title: 'Email Marketing',
    description: 'Send newsletters and promotional campaigns',
    icon: Mail,
    href: '/email-marketing',
    color: 'bg-pink-500',
    status: 'coming-soon'
  },
  {
    id: 'gift-cards',
    title: 'Gift Cards',
    description: 'Create and manage gift card programs',
    icon: Gift,
    href: '/gift-cards',
    color: 'bg-teal-500',
    status: 'coming-soon'
  }
]

const quickActions = [
  {
    title: 'Add New Service',
    description: 'Create a new PMU service',
    icon: Plus,
    href: '/services/new',
    color: 'bg-lavender'
  },
  {
    title: 'View Reports',
    description: 'Check business analytics',
    icon: TrendingUp,
    href: '/reports',
    color: 'bg-green-600'
  },
  {
    title: 'Manage Staff',
    description: 'Team and permissions',
    icon: UserCheck,
    href: '/staff',
    color: 'bg-indigo-600'
  },
  {
    title: 'Track Time',
    description: 'Clock in/out with GPS',
    icon: Timer,
    href: '/time-clock',
    color: 'bg-orange-600'
  }
]

export default function FeaturesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredFeatures = features.filter(feature =>
    feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    feature.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      case 'coming-soon':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Coming Soon</Badge>
      case 'beta':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Beta</Badge>
      default:
        return null
    }
  }

  const handleFeatureClick = (feature: any) => {
    if (feature.status === 'active') {
      router.push(feature.href)
    } else {
      // Show coming soon message
      alert(`${feature.title} is coming soon! Stay tuned for updates.`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-ink mb-2">Features</h1>
            <p className="text-muted">Access all PMU Pro tools and features</p>
          </div>
          <div className="flex items-center space-x-2">
            <Settings className="h-6 w-6 text-gray-400" />
            <span className="text-sm text-gray-500">Settings</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-ink mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Card 
                key={action.title}
                className="cursor-pointer hover:shadow-md transition-shadow border-gray-200"
                onClick={() => router.push(action.href)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center mx-auto mb-3`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1">{action.title}</h3>
                  <p className="text-xs text-gray-600">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feature) => (
            <Card 
              key={feature.id}
              className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-gray-200 ${
                feature.status === 'active' ? 'hover:border-lavender/50' : 'opacity-75'
              }`}
              onClick={() => handleFeatureClick(feature)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  {getStatusBadge(feature.status)}
                </div>
                <CardTitle className="text-lg text-gray-900">{feature.title}</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {feature.status === 'active' ? 'Click to open' : 'Coming soon'}
                  </span>
                  <div className="flex items-center space-x-1">
                    {feature.status === 'active' && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                    {feature.status === 'coming-soon' && (
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12 p-6 bg-gradient-to-r from-lavender/10 to-purple/10 rounded-lg border border-lavender/20">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">More Features Coming Soon</h3>
            <p className="text-gray-600 mb-4">
              We're constantly adding new features to help you manage your PMU business better.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline" className="border-lavender/30 text-lavender">Advanced Analytics</Badge>
              <Badge variant="outline" className="border-lavender/30 text-lavender">Inventory Management</Badge>
              <Badge variant="outline" className="border-lavender/30 text-lavender">Client Portal</Badge>
              <Badge variant="outline" className="border-lavender/30 text-lavender">Automated Reminders</Badge>
              <Badge variant="outline" className="border-lavender/30 text-lavender">Social Media Integration</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
