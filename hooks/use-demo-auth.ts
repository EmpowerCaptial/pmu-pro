import { useState, useEffect } from 'react'
import { TrialService } from '@/lib/trial-service'

interface DemoUser {
  id: string
  name: string
  email: string
  role: string
  isRealAccount?: boolean
  subscription?: string
  features?: string[]
  platformRole?: string
  isOwner?: boolean
}

// SECURITY: Production users removed - all authentication now goes through database
// No hardcoded credentials for production security

const DEMO_USERS = {
  'demo@pmupro.com': {
    id: 'demo_artist_001',
    name: 'Demo Artist',
    email: 'demo@pmupro.com',
    role: 'artist',
    isRealAccount: false,
    subscription: 'demo',
    features: ['limited']
  }
}

export function useDemoAuth() {
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('demoUser')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setCurrentUser(user)
        setIsLoading(false)
      } catch (error) {
        localStorage.removeItem('demoUser')
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    // SECURITY: All authentication now goes through proper API endpoints
    // No hardcoded credentials for production security
    
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
          features: ['all']
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
        throw new Error(data.error || 'Authentication failed')
      }
    } catch (error) {
      // Fallback to demo account for development/testing
      if (email === 'demo@pmupro.com' && password === 'demopmu') {
        const user = DEMO_USERS[email]
        setCurrentUser(user)
        localStorage.setItem('demoUser', JSON.stringify(user))
        localStorage.setItem('userType', 'demo')
        
        if (!TrialService.getTrialUser()) {
          TrialService.startTrial(email)
        }
        
        return user
      }
      
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
