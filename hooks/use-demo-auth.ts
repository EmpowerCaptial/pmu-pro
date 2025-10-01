import { useState, useEffect } from 'react'
import { TrialService } from '@/lib/trial-service'

interface DemoUser {
  id: string
  name: string
  email: string
  role: string
  studioName?: string
  isRealAccount?: boolean
  subscription?: string
  features?: string[]
  platformRole?: string
  isOwner?: boolean
}

// SECURITY: Production users removed - all authentication now goes through database
// No hardcoded credentials for production security

const DEMO_USERS = {}

export function useDemoAuth() {
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('demoUser')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        // Only use saved user if it's a real account (not demo)
        if (user.isRealAccount) {
          setCurrentUser(user)
        } else {
          // Clear demo users from localStorage
          localStorage.removeItem('demoUser')
          localStorage.removeItem('userType')
        }
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('demoUser')
        localStorage.removeItem('userType')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // All authentication now goes through database API endpoints
    try {
      // Call the secure login API endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success && data.user) {
        const user = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role || 'artist',
          isRealAccount: true,
          subscription: data.user.selectedPlan || 'basic',
          features: ['all'],
          hasActiveSubscription: data.user.hasActiveSubscription,
          subscriptionStatus: data.user.subscriptionStatus,
          selectedPlan: data.user.selectedPlan
        }
        
        setCurrentUser(user)
        localStorage.setItem('demoUser', JSON.stringify(user))
        localStorage.setItem('userType', 'production')
        
        // Start trial if not already started
        if (!TrialService.getTrialUser()) {
          TrialService.startTrial(email)
        }
        
        return user
      } else {
        // Check if this is a password setup error
        if (data.needsPasswordSetup) {
          const error = new Error(data.error || 'Password setup required')
          ;(error as any).needsPasswordSetup = true
          ;(error as any).email = data.email
          throw error
        }
        throw new Error(data.error || 'Authentication failed')
      }
    } catch (error) {
      throw new Error('Invalid credentials')
    }
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('demoUser')
  }

  const isProductionUser = () => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('userType') === 'production'
  }

  const isDemoUser = () => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('userType') === 'demo'
  }

  return {
    currentUser,
    isLoading,
    login,
    logout,
    isAuthenticated: !!currentUser,
    isRealAccount: currentUser?.isRealAccount || false,
    isProductionUser: isProductionUser(),
    isDemoUser: isDemoUser()
  }
}
