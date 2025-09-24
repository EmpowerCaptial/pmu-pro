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
  Tag,
  FileText,
  Camera,
  Palette,
  Shield,
  Bell,
  Zap,
  Target,
  Star,
  Heart,
  MessageSquare,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Info,
  Package,
  Share
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Core Business Features
const coreFeatures = [
  {
    id: 'services',
    title: 'Services',
    description: 'Manage services & pricing',
    icon: BookOpen,
    href: '/services',
    color: 'bg-blue-500',
    status: 'active',
    category: 'core'
  },
  {
    id: 'clients',
    title: 'Clients',
    description: 'Client management',
    icon: Users,
    href: '/clients',
    color: 'bg-green-500',
    status: 'active',
    category: 'core'
  },
  {
    id: 'booking',
    title: 'Booking',
    description: 'Appointment scheduling',
    icon: Calendar,
    href: '/booking',
    color: 'bg-purple-500',
    status: 'active',
    category: 'core'
  },
  {
    id: 'billing',
    title: 'Billing',
    description: 'Accept client payments',
    icon: CreditCard,
    href: '/billing',
    color: 'bg-indigo-500',
    status: 'active',
    category: 'core'
  },
  {
    id: 'pos',
    title: 'POS',
    description: 'Point of Sale system',
    icon: Receipt,
    href: '/pos',
    color: 'bg-green-600',
    status: 'active',
    category: 'core'
  }
]

// Business Management Features
const businessFeatures = [
  {
    id: 'reports',
    title: 'Reports',
    description: 'Business analytics',
    icon: BarChart3,
    href: '/reports',
    color: 'bg-emerald-500',
    status: 'active',
    category: 'business'
  },
  {
    id: 'enterprise-staff',
    title: 'Team',
    description: 'Manage team roles & permissions (Studio Enterprise)',
    icon: Shield,
    href: '/enterprise/staff',
    color: 'bg-orange-500',
    status: 'active',
    category: 'business',
    enterprise: true
  },
  {
    id: 'time-clock',
    title: 'Time Clock',
    description: 'Track work hours (Enterprise)',
    icon: Clock,
    href: '/time-tracking',
    color: 'bg-red-500',
    status: 'active',
    category: 'business'
  },
  {
    id: 'expenses',
    title: 'Expenses',
    description: 'Track costs',
    icon: Receipt,
    href: '/expenses',
    color: 'bg-yellow-500',
    status: 'active',
    category: 'business'
  },
  {
    id: 'payouts',
    title: 'Payouts',
    description: 'Artist payments',
    icon: DollarSign,
    href: '/payouts',
    color: 'bg-teal-500',
    status: 'active',
    category: 'business'
  },
  {
    id: 'inventory',
    title: 'Inventory',
    description: 'Product tracking',
    icon: Package,
    href: '/inventory',
    color: 'bg-pink-500',
    status: 'active',
    category: 'business'
  }
]

// Marketing & Growth Features
const marketingFeatures = [
  {
    id: 'gift-cards',
    title: 'Gift Cards',
    description: 'Create & manage',
    icon: Gift,
    href: '/gift-cards',
    color: 'bg-violet-500',
    status: 'coming-soon',
    category: 'marketing'
  },
  {
    id: 'loyalty',
    title: 'Loyalty Program',
    description: 'Reward customers',
    icon: Star,
    href: '/loyalty',
    color: 'bg-amber-500',
    status: 'coming-soon',
    category: 'marketing'
  },
  {
    id: 'reviews',
    title: 'Reviews',
    description: 'Manage feedback',
    icon: MessageSquare,
    href: '/reviews',
    color: 'bg-cyan-500',
    status: 'active',
    category: 'marketing'
  },
  {
    id: 'social',
    title: 'Marketing',
    description: 'Meta & Google ads automation',
    icon: Share,
    href: '/marketing',
    color: 'bg-sky-500',
    status: 'active',
    category: 'marketing'
  },
  {
    id: 'referrals',
    title: 'Referrals',
    description: 'Referral program',
    icon: Users,
    href: '/referrals',
    color: 'bg-lime-500',
    status: 'active',
    category: 'marketing'
  },
  {
    id: 'meta-integration',
    title: 'Meta Integration',
    description: 'AI-powered Instagram DM responses',
    icon: MessageSquare,
    href: '/integrations/meta',
    color: 'bg-pink-500',
    status: 'active',
    category: 'marketing'
  },
  {
    id: 'calendar-integration',
    title: 'Calendar Integration',
    description: 'Sync with Calendly, Acuity, Google Calendar',
    icon: Calendar,
    href: '/integrations/calendar',
    color: 'bg-blue-500',
    status: 'active',
    category: 'marketing'
  }
]

// Professional Tools
const professionalFeatures = [
  {
    id: 'analysis',
    title: 'Skin Analysis',
    description: 'AI-powered analysis',
    icon: Camera,
    href: '/analyze',
    color: 'bg-fuchsia-500',
    status: 'active',
    category: 'professional'
  },
  {
    id: 'pigment-library',
    title: 'Pigment Library',
    description: 'Color matching',
    icon: Palette,
    href: '/pigment-library',
    color: 'bg-slate-500',
    status: 'active',
    category: 'professional'
  },
  {
    id: 'aftercare',
    title: 'Aftercare',
    description: 'Client instructions',
    icon: Heart,
    href: '/aftercare',
    color: 'bg-emerald-600',
    status: 'active',
    category: 'professional'
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    description: 'Showcase work',
    icon: Camera,
    href: '/portfolio',
    color: 'bg-indigo-600',
    status: 'active',
    category: 'professional'
  },
  {
    id: 'training',
    title: 'Training',
    description: 'Staff education',
    icon: BookOpen,
    href: '/training',
    color: 'bg-purple-600',
    status: 'coming-soon',
    category: 'professional'
  }
]

// All features combined
const allFeatures = [...coreFeatures, ...businessFeatures, ...marketingFeatures, ...professionalFeatures]

export default function FeaturesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory] = useState('all') // Always show all features

  const categories = [
    { id: 'all', name: 'All Features', count: allFeatures.length },
    { id: 'core', name: 'Core', count: coreFeatures.length },
    { id: 'business', name: 'Business', count: businessFeatures.length },
    { id: 'marketing', name: 'Marketing', count: marketingFeatures.length },
    { id: 'professional', name: 'Professional', count: professionalFeatures.length }
  ]

  const filteredFeatures = allFeatures.filter(feature => {
    const matchesSearch = feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || feature.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      case 'coming-soon':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
      case 'beta':
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-lavender/20 via-white to-purple/10 p-3 sm:p-4 pb-16 sm:pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-1 sm:mb-2">Features</h1>
            <p className="text-muted text-sm sm:text-base">Complete PMU business management suite</p>
          </div>
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


        {/* Search */}
        <div className="relative mb-4 sm:mb-6">
          <input
            type="text"
            placeholder="Search features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex h-9 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {/* Features Grid - Apple-style layout: 4 rows of 6 */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4 md:gap-6 max-w-6xl mx-auto">
          {filteredFeatures.map((feature) => (
            <div
              key={feature.id}
              className={`
                flex flex-col items-center justify-start
                rounded-2xl border border-gray-200 bg-white
                p-3 sm:p-4 shadow-sm transition-all duration-200
                ${feature.status === 'active' 
                  ? 'hover:shadow-lg hover:shadow-gray-200 hover:scale-105 cursor-pointer' 
                  : 'opacity-60 cursor-default'
                }
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-300
              `}
              onClick={() => handleFeatureClick(feature)}
              role="button"
              tabIndex={feature.status === 'active' ? 0 : -1}
            >
              {/* Apple-style icon */}
              <div className={`
                w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-3
                ${feature.color} shadow-sm
              `}>
                <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>

              {/* Feature name underneath */}
              <div className="text-center">
                <h3 className="font-medium text-xs sm:text-sm text-gray-900 leading-tight">
                  {feature.title}
                </h3>
              </div>

              {/* Status indicator - smaller and positioned */}
              <div className="mt-2">
                {feature.status === 'active' ? (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                ) : (
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-blue-100 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                {allFeatures.filter(f => f.status === 'active').length}
              </div>
              <div className="text-xs sm:text-sm text-gray-700">Active Features</div>
            </CardContent>
          </Card>
          <Card className="border-blue-100 bg-gradient-to-br from-amber-50 to-yellow-50">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-amber-600 mb-1">
                {allFeatures.filter(f => f.status === 'coming-soon').length}
              </div>
              <div className="text-xs sm:text-sm text-gray-700">Coming Soon</div>
            </CardContent>
          </Card>
          <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
                {allFeatures.length}
              </div>
              <div className="text-xs sm:text-sm text-gray-700">Total Features</div>
            </CardContent>
          </Card>
          <Card className="border-blue-100 bg-gradient-to-br from-purple-50 to-violet-50">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">
                4
              </div>
              <div className="text-xs sm:text-sm text-gray-700">Categories</div>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Section */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50/50 to-teal-50/50 rounded-lg border border-blue-200">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">More Features Coming Soon</h3>
            <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
              We're constantly adding new features to help you manage your PMU business better.
            </p>
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 text-xs sm:text-sm">Advanced Analytics</Badge>
              <Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-700 text-xs sm:text-sm">Inventory Management</Badge>
              <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700 text-xs sm:text-sm">Client Portal</Badge>
              <Badge variant="outline" className="border-cyan-200 bg-cyan-50 text-cyan-700 text-xs sm:text-sm">Automated Reminders</Badge>
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-xs sm:text-sm">Social Media Integration</Badge>
              <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700 text-xs sm:text-sm">GPS Time Tracking</Badge>
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 text-xs sm:text-sm">Expense Tracking</Badge>
              <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700 text-xs sm:text-sm">Email Marketing</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
