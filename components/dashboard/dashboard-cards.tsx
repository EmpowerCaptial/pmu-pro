import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, FileText, Users, Palette, TrendingUp, Clock, Share, Mail, Microscope, Brush } from "lucide-react"
import Link from "next/link"

export function DashboardCards() {
  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border-lavender/30">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-lavender" />
              <CardTitle className="text-lg font-bold">New Client Screening</CardTitle>
            </div>
            <CardDescription>Start contraindication assessment for a new client</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/intake">
              <Button className="w-full bg-lavender hover:bg-lavender-600 text-white font-semibold">
                Start Contraindication Screen
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border-lavender/30">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-lavender" />
              <CardTitle className="text-lg font-bold">Skin Analysis</CardTitle>
            </div>
            <CardDescription>Analyze skin tone and get pigment recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/analyze">
              <Button
                variant="outline"
                className="w-full bg-white/90 backdrop-blur-sm border-lavender/30 text-lavender-700 font-semibold hover:bg-lavender/10"
              >
                Start Skin Analysis
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border-lavender/30">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Microscope className="h-5 w-5 text-lavender" />
              <CardTitle className="text-lg font-bold">ProCell Analysis</CardTitle>
            </div>
            <CardDescription>Advanced skin segmentation for therapy planning</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/procell-analysis">
              <Button
                variant="outline"
                className="w-full bg-white/90 backdrop-blur-sm border-lavender/30 text-lavender-700 font-semibold hover:bg-lavender/10"
              >
                Start ProCell Analysis
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border-lavender/30">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Share className="h-5 w-5 text-lavender" />
              <CardTitle className="text-lg font-bold">Send Client Analysis</CardTitle>
            </div>
            <CardDescription>Send skin analysis link to clients for remote consultation</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/send-analysis">
              <Button
                variant="outline"
                className="w-full bg-white/90 backdrop-blur-sm border-lavender/30 text-lavender-700 font-semibold hover:bg-lavender/10"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Analysis Link
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border-lavender/30">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-2">
              <Brush className="h-5 w-5 text-lavender" />
              <CardTitle className="text-lg font-bold">Virtual Brow Try-On</CardTitle>
            </div>
            <CardDescription>Interactive brow shape and color visualization tool</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/trybrows">
              <Button
                variant="outline"
                className="w-full bg-white/90 backdrop-blur-sm border-lavender/30 text-lavender-700 font-semibold hover:bg-lavender/10"
              >
                <Brush className="h-4 w-4 mr-2" />
                Open TryBrows Tool
              </Button>
            </Link>
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
    </div>
  )
}
