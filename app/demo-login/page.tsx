"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  EyeOff, 
  Play, 
  Shield, 
  Clock, 
  Users, 
  Palette,
  Brain,
  FileText,
  Smartphone
} from 'lucide-react'
import { DEMO_CREDENTIALS, setDemoMode } from '@/lib/demo-auth'
import { useRouter } from 'next/navigation'

export default function DemoLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (username === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password) {
      setDemoMode(true)
      router.push('/dashboard')
    } else {
      setError('Invalid demo credentials. Please check your username and password.')
    }
    
    setIsLoading(false)
  }

  const handleQuickLogin = () => {
    setUsername(DEMO_CREDENTIALS.username)
    setPassword(DEMO_CREDENTIALS.password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Play className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">PMU Pro Demo</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the full power of PMU Pro with our interactive demo. 
            Explore all features with sample data that resets after your session.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Login Form */}
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-purple-800">Demo Access</CardTitle>
              <CardDescription className="text-purple-600">
                Login to explore PMU Pro features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-700">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter demo username"
                    className="border-purple-200 focus:border-purple-400"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter demo password"
                      className="border-purple-200 focus:border-purple-400 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Accessing Demo...' : 'Access Demo'}
                </Button>
              </form>

              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={handleQuickLogin}
                  className="text-purple-600 border-purple-300 hover:bg-purple-50"
                >
                  Quick Fill Demo Credentials
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Demo Features */}
          <div className="space-y-6">
            {/* Demo Credentials */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Demo Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-white p-3 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Username:</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      {DEMO_CREDENTIALS.username}
                    </Badge>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Password:</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      {DEMO_CREDENTIALS.password}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Demo Restrictions */}
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-800 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Demo Session Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span>Session Duration: <strong>2 hours</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-amber-600" />
                  <span>Max Demo Clients: <strong>5</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Brain className="h-4 w-4 text-amber-600" />
                  <span>Max Analyses: <strong>10</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-amber-600" />
                  <span>Data expires after session</span>
                </div>
              </CardContent>
            </Card>

            {/* Available Features */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Available Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Palette className="h-4 w-4 text-blue-600" />
                    <span>Skin Analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>Client Management</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <span>AI Tools</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span>Resource Library</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Smartphone className="h-4 w-4 text-blue-600" />
                    <span>Mobile Experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span>Staff Dashboard</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>This is a demonstration environment. No real data will be saved or transmitted.</p>
          <p className="mt-1">For production access, please contact <a href="mailto:admin@thepmuguide.com" className="text-purple-600 hover:underline">admin@thepmuguide.com</a></p>
        </div>
      </div>
    </div>
  )
}
