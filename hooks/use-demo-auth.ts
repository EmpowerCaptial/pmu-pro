import { useState, useEffect } from 'react'
import { TrialService } from '@/lib/trial-service'

interface DemoUser {
  id: string
  name: string
  email: string
  role: string
  isRealAccount?: boolean
}

const PRODUCTION_USERS = {
  'universalbeautystudioacademy@gmail.com': {
    id: 'universal_studio_001',
    name: 'Universal Beauty Studio Academy',
    email: 'universalbeautystudioacademy@gmail.com',
    role: 'artist',
    isRealAccount: true,
    subscription: 'premium',
    features: ['all']
  },
  'admin@thepmuguide.com': {
    id: 'admin_pmu_001',
    name: 'PMU Pro Admin',
    email: 'admin@thepmuguide.com',
    role: 'owner',
    isRealAccount: true,
    subscription: 'enterprise',
    features: ['all', 'admin']
  },
  'ubsateam@thepmuguide.com': {
    id: 'ubsa_owner_001',
    name: 'UBSA Team',
    email: 'ubsateam@thepmuguide.com',
    role: 'owner',
    isRealAccount: true,
    subscription: 'enterprise',
    features: ['all', 'admin', 'production']
  }
}

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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Check PRODUCTION accounts first (real studio accounts)
    if (email === 'universalbeautystudioacademy@gmail.com' && password === 'adminteam!') {
      const user = PRODUCTION_USERS[email]
      setCurrentUser(user)
      localStorage.setItem('demoUser', JSON.stringify(user)) // Keep same key for compatibility
      localStorage.setItem('userType', 'production') // Mark as production user
      
      // Start trial if not already started
      if (!TrialService.getTrialUser()) {
        TrialService.startTrial(email)
      }
      
      return user
    } 
    // Check admin@thepmuguide.com
    else if (email === 'admin@thepmuguide.com' && password === 'ubsa2024!') {
      const user = PRODUCTION_USERS[email]
      setCurrentUser(user)
      localStorage.setItem('demoUser', JSON.stringify(user))
      localStorage.setItem('userType', 'production')
      
      if (!TrialService.getTrialUser()) {
        TrialService.startTrial(email)
      }
      
      return user
    }
    // Check ubsateam@thepmuguide.com  
    else if (email === 'ubsateam@thepmuguide.com' && password === 'ubsa2024!') {
      const user = PRODUCTION_USERS[email]
      setCurrentUser(user)
      localStorage.setItem('demoUser', JSON.stringify(user))
      localStorage.setItem('userType', 'production')
      
      if (!TrialService.getTrialUser()) {
        TrialService.startTrial(email)
      }
      
      return user
    }
    // Check DEMO accounts (test accounts)
    else if (email === 'demo@pmupro.com' && password === 'demopmu') {
      const user = DEMO_USERS[email]
      setCurrentUser(user)
      localStorage.setItem('demoUser', JSON.stringify(user))
      localStorage.setItem('userType', 'demo') // Mark as demo user
      
      // Start trial if not already started
      if (!TrialService.getTrialUser()) {
        TrialService.startTrial(email)
      }
      
      return user
    } else {
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
