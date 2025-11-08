"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Eye, EyeOff, Lock, AlertTriangle, Users, Crown, UserCheck } from 'lucide-react'

type StaffSession = {
  id: string
  name?: string | null
  email?: string | null
  role: string
  businessName?: string | null
  studioName?: string | null
  permissions?: any
}

export default function StaffAdminLoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/staff/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier, password })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data?.needsPasswordChange && data?.staff) {
          localStorage.setItem('staffAuth', JSON.stringify({
            ...data.staff,
            permissions: [],
            timestamp: Date.now(),
            needsPasswordChange: true
          }))
          router.push('/staff-admin/change-password')
          return
        }

        setError(data?.error || 'Invalid credentials. Access denied.')
        return
      }

      const staff = data.staff as StaffSession

      localStorage.setItem('staffAuth', JSON.stringify({
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        businessName: (staff as any).businessName,
        studioName: (staff as any).studioName,
        permissions: staff.permissions ?? [],
        timestamp: Date.now()
      }))

      router.push('/staff-admin/dashboard')
    } catch (error) {
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" />
      
      <Card className="w-full max-w-md relative z-10 border-gray-700 bg-gray-800/90 text-white">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-white">
              Staff Admin Access
            </CardTitle>
            <CardDescription className="text-gray-300">
              Restricted area - Authorized personnel only
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-gray-200">Email or Username</Label>
              <Input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your staff email or username"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <Alert className="border-red-500/50 bg-red-500/10">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Authenticating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Sign In
                </div>
              )}
            </Button>
          </form>

          <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-700">
            <p>⚠️ This is a restricted administrative area</p>
            <p>Unauthorized access attempts are logged and monitored</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

