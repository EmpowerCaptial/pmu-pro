"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Eye, EyeOff, Lock, AlertTriangle, Users, Crown, UserCheck } from 'lucide-react'
import { validateStaffLogin, type StaffMember, getStaffMembers } from '@/lib/staff-auth'

export default function StaffAdminLoginPage() {
  const [username, setUsername] = useState('')
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
      const staffMember = validateStaffLogin(username, password)
      
      if (staffMember) {
        // Check if this is a new user who needs to set their password
        const allStaff = getStaffMembers()
        const fullStaffMember = allStaff.find(s => s.id === staffMember.id)
        
        if (fullStaffMember && !fullStaffMember.passwordSet) {
          // Store minimal auth data and redirect to password change
          localStorage.setItem('staffAuth', JSON.stringify({
            id: staffMember.id,
            username: staffMember.username,
            role: staffMember.role,
            firstName: staffMember.firstName,
            lastName: staffMember.lastName,
            permissions: staffMember.permissions,
            timestamp: Date.now(),
            needsPasswordChange: true
          }))
          
          router.push('/staff-admin/change-password')
          return
        }
        
        // Store authentication in localStorage (in production, use proper session management)
        localStorage.setItem('staffAuth', JSON.stringify({
          id: staffMember.id,
          username: staffMember.username,
          role: staffMember.role,
          firstName: staffMember.firstName,
          lastName: staffMember.lastName,
          permissions: staffMember.permissions,
          timestamp: Date.now()
        }))
        
        router.push('/staff-admin/dashboard')
      } else {
        setError('Invalid credentials. Access denied.')
      }
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
              <Label htmlFor="username" className="text-gray-200">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
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
                  Access System
                </div>
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
            <h4 className="text-sm font-semibold text-gray-200 mb-2">Demo Credentials:</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <Crown className="w-3 h-3 text-yellow-400" />
                <span className="text-gray-300">Director:</span>
                <span className="text-gray-400">admin/pmupro2024</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-3 h-3 text-yellow-400" />
                <span className="text-gray-300">Director:</span>
                <span className="text-gray-400">director1/director2024</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 text-blue-400" />
                <span className="text-gray-300">Manager:</span>
                <span className="text-gray-400">manager1/manager2024</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-3 h-3 text-green-400" />
                <span className="text-gray-300">Representative:</span>
                <span className="text-gray-400">rep1/representative2024</span>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-700">
            <p>⚠️ This is a restricted administrative area</p>
            <p>Unauthorized access attempts will be logged</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
