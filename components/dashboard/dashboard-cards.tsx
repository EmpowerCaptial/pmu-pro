import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Camera,
  FileText,
  Users,
  Palette,
  TrendingUp,
  Clock,
  Share,
  Mail,
  Microscope,
  Brush,
  ClipboardList,
  HelpCircle,
  Zap,
  Activity,
  MessageSquare,
  Settings,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { MetaMessengerBox } from "@/components/messenger/meta-messenger-box"

export function DashboardCards() {
  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="grid md:grid-cols-6 gap-6">
        <Card className="relative overflow-hidden border-border shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-lavender/10 to-lavender/20 backdrop-blur-sm border-lavender/40 col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-lavender rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-lavender-800">Unified Client Onboarding</CardTitle>
            </div>
            <CardDescription className="text-lavender-700">
              Complete client screening, PMU intake, and consent forms in one comprehensive application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Link href="/unified-onboarding" className="flex-1">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-lavender to-lavender-600 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 py-4 px-6 text-center">
                    <span className="text-white font-bold text-lg text-shadow-lg shadow-black/50">
                      🎯 Start Client Onboarding
                    </span>
                    <p className="text-lavender-100 text-sm mt-1">
                      Screening • Intake • Consent • Assessment
                    </p>
                  </div>
                </div>
              </Link>
              
              <Link href="/clients/new" className="flex-1">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 py-4 px-6 text-center">
                    <span className="text-white font-bold text-lg text-shadow-lg shadow-black/50">
                      👤 Quick Add Client
                    </span>
                    <p className="text-blue-100 text-sm mt-1">
                      Basic info only
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border-lavender/30">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-lavender" />
              <CardTitle className="text-lg font-bold">Skin Analysis</CardTitle>
            </div>
            <CardDescription>Analyze skin tone and get pigment recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/analyze">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-lavender/20 rounded-xl border border-lavender/30 group-hover:bg-lavender/10 transition-colors"></div>
                <div className="relative z-10 py-3 px-4 text-center">
                  <span className="text-lavender-700 font-semibold text-shadow-sm shadow-white/80">
                    Start Skin Analysis
                  </span>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border-lavender/30">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Microscope className="h-5 w-5 text-lavender" />
              <CardTitle className="text-lg font-bold">ProCell Analysis</CardTitle>
            </div>
            <CardDescription>Advanced skin segmentation for therapy planning</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/procell-analysis">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-lavender/20 rounded-xl border border-lavender/30 group-hover:bg-lavender/10 transition-colors"></div>
                <div className="relative z-10 py-3 px-4 text-center">
                  <span className="text-lavender-700 font-semibold text-shadow-sm shadow-white/80">
                    Start ProCell Analysis
                  </span>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border-lavender/30">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-lavender" />
              <CardTitle className="text-lg font-bold">Color Correction</CardTitle>
            </div>
            <CardDescription>AI-powered pigment correction and neutralization tool</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/color-correction">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-lavender/20 rounded-xl border border-lavender/30 group-hover:bg-lavender/10 transition-colors"></div>
                <div className="relative z-10 py-3 px-4 text-center flex items-center justify-center gap-2">
                  <span className="text-lavender-700 font-semibold text-shadow-sm shadow-white/80">
                    Start Color Correction
                  </span>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border-lavender/30">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Share className="h-5 w-5 text-lavender" />
              <CardTitle className="text-lg font-bold">Send Client Analysis</CardTitle>
            </div>
            <CardDescription>Send skin analysis link to clients for remote consultation</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/send-analysis">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-lavender/20 rounded-xl border border-lavender/30 group-hover:bg-lavender/10 transition-colors"></div>
                <div className="relative z-10 py-3 px-4 text-center flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4 text-lavender-700" />
                  <span className="text-lavender-700 font-semibold text-shadow-sm shadow-white/80">
                    Send Analysis Link
                  </span>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border-lavender/30">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Brush className="h-5 w-5 text-lavender" />
              <CardTitle className="text-lg font-bold">Virtual Brow Try-On</CardTitle>
            </div>
            <CardDescription>Interactive brow shape and color visualization tool</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/trybrows">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-lavender/20 rounded-xl border border-lavender/30 group-hover:bg-lavender/10 transition-colors"></div>
                <div className="relative z-10 py-3 px-4 text-center flex items-center justify-center gap-2">
                  <Brush className="h-4 w-4 text-lavender-700" />
                  <span className="text-lavender-700 font-semibold text-shadow-sm shadow-white/80">
                    Open TryBrows Tool
                  </span>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border-lavender/30">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-lavender" />
              <CardTitle className="text-lg font-bold">Pigment Library</CardTitle>
            </div>
            <CardDescription>Professional pigment database with AI-powered matching</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/pigment-library">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-lavender/20 rounded-xl border border-lavender/30 group-hover:bg-lavender/10 transition-colors"></div>
                <div className="relative z-10 py-3 px-4 text-center flex items-center justify-center gap-2">
                  <Palette className="h-4 w-4 text-lavender-700" />
                  <span className="text-lavender-700 font-semibold text-shadow-sm shadow-white/80">
                    Browse Pigments
                  </span>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Service Management Card */}
        <Card className="relative overflow-hidden border-border shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500/10 to-blue-600/20 backdrop-blur-sm border-blue-400/40 col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <CardTitle className="text-xl font-bold text-blue-800">Service Management</CardTitle>
            </div>
            <CardDescription className="text-blue-700">
              View all procedures, edit prices, and select multiple services for checkout
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Link href="/services" className="flex-1">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 py-4 px-6 text-center">
                    <span className="text-white font-bold text-lg text-shadow-lg shadow-black/50">
                      🎯 Manage Services
                    </span>
                    <p className="text-blue-100 text-sm mt-1">
                      View • Edit • Select • Checkout
                    </p>
                  </div>
                </div>
              </Link>
              
              <Link href="/checkout" className="flex-1">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 py-4 px-6 text-center">
                    <span className="text-white font-bold text-lg text-shadow-lg shadow-black/50">
                      💳 Quick Checkout
                    </span>
                    <p className="text-green-100 text-sm mt-1">
                      Direct to checkout
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Service Checkout Card - Prominent placement */}
        <Card className="relative overflow-hidden border-border shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-lavender/10 to-lavender/20 backdrop-blur-sm border-lavender/40 col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-lavender rounded-full flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <CardTitle className="text-xl font-bold text-lavender-800">Service Checkout</CardTitle>
            </div>
            <CardDescription className="text-lavender-700">
              Complete client screening, PMU intake, and process payments with Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Link href="/checkout" className="flex-1">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-lavender to-lavender-600 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 py-4 px-6 text-center">
                    <span className="text-white font-bold text-lg text-shadow-lg shadow-black/50">
                      🎯 Start Service Checkout
                    </span>
                    <p className="text-lavender-100 text-sm mt-1">
                      Select services • Choose clients • Process payments
                    </p>
                  </div>
                </div>
              </Link>
              
              <Link href="/checkout-demo" className="flex-1">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 py-4 px-6 text-center">
                    <span className="text-white font-bold text-lg text-shadow-lg shadow-black/50">
                      🧪 Try Demo
                    </span>
                    <p className="text-blue-100 text-sm mt-1">
                      Test the checkout workflow
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Stripe Connect Card */}
        <Card className="relative overflow-hidden border-border shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-500/10 to-green-600/20 backdrop-blur-sm border-green-400/40 col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <CardTitle className="text-xl font-bold text-green-800">Stripe Connect</CardTitle>
            </div>
            <CardDescription className="text-green-700">
              Set up your payment account and manage payouts from client transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Link href="/stripe-connect" className="flex-1">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 py-4 px-6 text-center">
                    <span className="text-white font-bold text-lg text-shadow-lg shadow-black/50">
                      🏦 Manage Payouts
                    </span>
                    <p className="text-green-100 text-sm mt-1">
                      Set up account • View transactions • Get paid
                    </p>
                  </div>
                </div>
              </Link>
              
              <Link href="/stripe-connect?tab=onboarding" className="flex-1">
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 py-4 px-6 text-center">
                    <span className="text-white font-bold text-lg text-shadow-lg shadow-black/50">
                      ⚡ Quick Setup
                    </span>
                    <p className="text-blue-100 text-sm mt-1">
                      Connect your bank account
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-1 gap-6">
        <MetaMessengerBox />
      </div>

      {/* Help and Support */}
      <div className="grid md:grid-cols-1 gap-6">
        <Card className="border-border bg-gradient-to-r from-lavender/10 to-blue-500/10 backdrop-blur-sm border-lavender/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 font-bold text-lavender-700">
              <HelpCircle className="h-6 w-6" />
              <span>Need Help? Master PMU Pro!</span>
            </CardTitle>
            <CardDescription className="text-lavender-600">
              Learn how to use all features, get tips, and submit support tickets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-lavender-700">
                  🎯 Comprehensive feature guides • 🔍 Searchable help content • 🎫 Support ticket system
                </p>
                <p className="text-xs text-lavender-600">
                  Everything you need to become a PMU Pro expert!
                </p>
              </div>
              <Link href="/help">
                <Button className="bg-lavender hover:bg-lavender/90 text-white gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Get Help
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-border bg-white/90 backdrop-blur-sm border-lavender/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-bold">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+3 from last month</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-white/90 backdrop-blur-sm border-lavender/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-bold">Analyses This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-white/90 backdrop-blur-sm border-lavender/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-bold">Success Rate</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">Client satisfaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-border bg-white/90 backdrop-blur-sm border-lavender/30">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 font-bold">
            <Clock className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Sarah Johnson - Contraindication Screen</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Safe
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Maria Garcia - Skin Analysis</p>
                <p className="text-xs text-muted-foreground">5 hours ago</p>
              </div>
              <Badge variant="outline">Fitzpatrick III</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Emma Wilson - Contraindication Screen</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Precaution
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Analysis link sent to Jessica Chen</p>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                Pending
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Monitor - NEW! */}
      <Card className="hover:shadow-lg transition-shadow border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">Performance Monitor</CardTitle>
          <Zap className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-800">Undici Powered</div>
          <p className="text-xs text-blue-600 mb-2">
            Real-time performance monitoring
          </p>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Activity className="h-3 w-3 mr-1" />
              +25-40% Faster
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Zap className="h-3 w-3 mr-1" />
              Enhanced
            </Badge>
          </div>
          <div className="mt-4">
            <Link href="/performance">
              <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                View Performance
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
