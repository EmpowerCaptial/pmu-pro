"use client"

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  Lock, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react'
import { ClientPortalService } from '@/lib/client-portal-service'
import { getEnhancedClientById } from '@/lib/enhanced-client-service'
import { ClientPortalUser } from '@/types/client-portal'
import { EnhancedClientProfile } from '@/types/client-pipeline'
import ClientPortalDashboard from '@/components/portal/client-portal-dashboard'

export default function ClientPortalPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const clientId = params.clientId as string
  const token = searchParams.get('token')

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [client, setClient] = useState<EnhancedClientProfile | null>(null)
  const [portalUser, setPortalUser] = useState<ClientPortalUser | null>(null)
  const [email, setEmail] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const portalService = ClientPortalService.getInstance()

  useEffect(() => {
    // Check if we have a token in URL
    if (token) {
      setAccessToken(token)
      // Try to find the client and authenticate
      authenticateWithToken(token)
    } else {
      setIsLoading(false)
    }
  }, [token])

  const authenticateWithToken = async (token: string) => {
    try {
      // Find client by token
      const user = portalService.getPortalUserByClientId(clientId)
      if (user && user.accessToken === token) {
        const clientData = getEnhancedClientById(clientId)
        if (clientData) {
          setClient(clientData)
          setPortalUser(user)
          setIsAuthenticated(true)
          setEmail(user.email)
        } else {
          setError('Client not found')
        }
      } else {
        setError('Invalid access token')
      }
    } catch (err) {
      setError('Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const user = portalService.authenticatePortalUser(email, accessToken)
      if (user) {
        const clientData = getEnhancedClientById(clientId)
        if (clientData) {
          setClient(clientData)
          setPortalUser(user)
          setIsAuthenticated(true)
        } else {
          setError('Client not found')
        }
      } else {
        setError('Invalid email or access token')
      }
    } catch (err) {
      setError('Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/10 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender mx-auto mb-4"></div>
          <p className="text-gray-600">Loading client portal...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated && client && portalUser) {
    return <ClientPortalDashboard client={client} portalUser={portalUser} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-lavender to-purple-500 rounded-full w-16 h-16 flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Client Portal</CardTitle>
            <CardDescription className="text-gray-600">
              Access your PMU Pro client information
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-white border border-gray-200"
                  />
                  <User className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token</Label>
                <div className="relative">
                  <Input
                    id="accessToken"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your access token"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    required
                    className="pl-10 pr-10 bg-white border border-gray-200"
                  />
                  <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1 p-1 h-6 w-6"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-lavender to-purple-500 hover:from-lavender/90 hover:to-purple-500/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Shield className="h-4 w-4" />
                <span>Secure client portal access</span>
              </div>
              
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>View appointments and documents</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Make payments and send messages</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Track your treatment progress</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact your PMU artist for access
          </p>
        </div>
      </div>
    </div>
  )
}
