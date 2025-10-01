"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  BookOpen, 
  Users, 
  CalendarDays,
  CreditCard,
  Settings, 
  MessageSquare, 
  CheckCircle, 
  Star,
  HelpCircle,
  Mail,
  Lightbulb,
  ExternalLink,
  Rocket,
  Sparkles,
  Brush,
  Microscope,
  Heart,
  DollarSign,
  Package,
  Shield,
  Image
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// Feature Help Guide - organized by feature categories
const coreFeaturesGuide = [
  {
    id: 'services',
    title: 'Services',
    description: 'Manage services & pricing',
    icon: Sparkles,
    href: '/services',
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    status: 'active',
    helpSteps: [
      'Click "Add Service" to create new procedures',
      'Set your standard pricing for each service',
      'Add detailed descriptions and duration',
      'Use "Active/Inactive" toggle to control availability',
      'Export service list for easy reference'
    ],
    tips: [
      'Create service packages for popular combinations',
      'Set different prices for different service types',
      'Include detailed aftercare instructions'
    ]
  },
  {
    id: 'clients',
    title: 'Clients',
    description: 'Client management & profiles',
    icon: Users,
    href: '/clients',
    color: 'bg-gradient-to-br from-green-500 to-green-600',
    status: 'active',
    helpSteps: [
      'Page to add new clients and track history',
      'Use search to quickly find clients',
      'Add appointment and procedure history'
    ],
    tips: [
      'Always collect contact info before first appointment',
      'Add medical history and skin type notes'
    ]
  },
  {
    id: 'pos',
    title: 'POS',
    description: 'Point of sale system',
    icon: CreditCard,
    href: '/pos',
    color: 'bg-gradient-to-br from-teal-500 to-teal-600',
    status: 'active',
    helpSteps: [
      'Select services and services for checkout',
      'Process payments and generate receipts',
      'Save transaction history'
    ],
    tips: [
      'Combine multiple services into packages',
      'Track popular combinations'
    ]
  }
]

const allFeaturesGuide = [...coreFeaturesGuide]

export default function HelpPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Features', count: allFeaturesGuide.length },
    { id: 'core', name: 'Core', count: coreFeaturesGuide.length }
  ]

  const filteredFeatures = allFeaturesGuide.filter(feature => {
    const matchesSearch = feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (feature.helpSteps && feature.helpSteps.some(step => step.toLowerCase().includes(searchQuery.toLowerCase())))
    return matchesSearch
  })

  const handleFeatureClick = (feature: any) => {
    router.push(feature.href)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/20 via-white to-purple/10 p-3 sm:p-4 pb-16 sm:pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-1 sm:mb-2">Help & Support</h1>
            <p className="text-muted text-sm sm:text-base">Learn how to use all PMU Pro features</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/features')}
              className="flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base"
            >
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
              Features
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/settings')}
              className="flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4 sm:mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search help topics, features, or steps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-xs sm:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="text-xs sm:text-sm"
            >
              {category.name} ({category.count})
            </Button>
          ))}
        </div>

        {/* Quick Start Guide */}
        <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50/50 to-teal-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Rocket className="h-5 w-5" />
              Quick Start Guide
            </CardTitle>
            <CardDescription>
              Get up and running with PMU Pro in just a few steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <h4 className="font-medium">Set Up Services</h4>
                </div>
                <p className="text-sm text-gray-600">Add your PMU services with descriptions and pricing</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <h4 className="font-medium">Add Clients</h4>
                </div>
                <p className="text-sm text-gray-600">Import or manually add client information</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <h4 className="font-medium">Schedule & Track</h4>
                </div>
                <p className="text-sm text-gray-600">Book appointments and track procedures</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Guide Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredFeatures.map((feature) => (
            <Card key={feature.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleFeatureClick(feature)}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${feature.color} shadow-sm`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription className="text-sm">{feature.description}</CardDescription>
                  </div>
                  <Badge variant={feature.status === 'active' ? "default" : 'secondary'} className="text-xs">
                    {feature.status === 'active' ? 'Active' : 'Coming Soon'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {feature.helpSteps && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-gray-900 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      How to Use:
                    </h4>
                    <ol className="space-y-2 text-xs text-gray-600">
                      {feature.helpSteps.slice(0, 3).map((step, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 font-medium mt-0.5">{index + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {feature.tips && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <h4 className="font-medium text-sm text-gray-900 flex items-center gap-1 mb-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Pro Tips:
                    </h4>
                    <ul className="space-y-1 text-xs text-gray-600">
                      {feature.tips.slice(0, 2).map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Star className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open Feature
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <Card className="mt-6 border-lavender/20 bg-gradient-to-r from-lavender/5 to-purple/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lavender">
              <HelpCircle className="h-5 w-5" />
              Need More Help?
            </CardTitle>
            <CardDescription>
              Can't find what you're looking for? Our support team is here to help.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Support
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Live Chat
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Video Tutorials
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feature Stats */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                {coreFeaturesGuide.length}
              </div>
              <div className="text-xs sm:text-sm text-gray-700">Core Features</div>
            </CardContent>
          </Card>
          <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
                {allFeaturesGuide.length}
              </div>
              <div className="text-xs sm:text-sm text-gray-700">Total Features</div>
            </CardContent>
          </Card>
          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-violet-50">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">
                4
              </div>
              <div className="text-xs sm:text-sm text-gray-700">Categories</div>
            </CardContent>
          </Card>
          <Card className="border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-orange-600 mb-1">
                24/7
              </div>
              <div className="text-xs sm:text-sm text-gray-700">Support</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
