import { useState, useEffect } from 'react'
import { useDemoAuth } from './use-demo-auth'

interface FreshUserData {
  id: string
  email: string
  role: string
  selectedPlan: string
  isLicenseVerified: boolean
  hasActiveSubscription: boolean
}

export function useFreshUserData() {
  const { currentUser } = useDemoAuth()
  const [freshUserData, setFreshUserData] = useState<FreshUserData>({
    id: currentUser?.id || '',
    email: currentUser?.email || '',
    role: currentUser?.role || 'artist',
    selectedPlan: (currentUser as any)?.selectedPlan || currentUser?.subscription || 'starter',
    isLicenseVerified: (currentUser as any)?.isLicenseVerified || false,
    hasActiveSubscription: (currentUser as any)?.hasActiveSubscription || false
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const refreshUserData = async () => {
      if (!currentUser?.email) return
      
      setIsRefreshing(true)
      try {
        // Try to get fresh user data from user-data endpoint
        const response = await fetch('/api/auth/user-data', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-email': currentUser.email
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          const user = data.user || data
          
          const newUserData = {
            id: user.id || currentUser.id || '',
            email: user.email || currentUser.email || '',
            role: user.role || currentUser.role || 'artist',
            selectedPlan: user.selectedPlan || currentUser.subscription || 'starter',
            isLicenseVerified: user.isLicenseVerified || false,
            hasActiveSubscription: user.hasActiveSubscription || false
          }
          
          setFreshUserData(newUserData)
          
          // Update localStorage with fresh data
          const updatedUser = {
            ...currentUser,
            role: user.role || currentUser.role,
            selectedPlan: user.selectedPlan || currentUser.subscription,
            isLicenseVerified: user.isLicenseVerified || false,
            hasActiveSubscription: user.hasActiveSubscription || false
          }
          localStorage.setItem('demoUser', JSON.stringify(updatedUser))
        }
      } catch (error) {
        console.log('Could not refresh user data, using cached data')
      } finally {
        setIsRefreshing(false)
      }
    }
    
    refreshUserData()
  }, [currentUser?.email])

  const forceRefresh = async () => {
    if (!currentUser?.email) return
    
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/auth/user-data', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const user = data.user || data
        
        const newUserData = {
          id: user.id || currentUser.id || '',
          email: user.email || currentUser.email || '',
          role: user.role || currentUser.role || 'artist',
          selectedPlan: user.selectedPlan || currentUser.subscription || 'starter',
          isLicenseVerified: user.isLicenseVerified || false,
          hasActiveSubscription: user.hasActiveSubscription || false
        }
        
        setFreshUserData(newUserData)
        
        // Update localStorage with fresh data
        const updatedUser = {
          ...currentUser,
          role: user.role || currentUser.role,
          selectedPlan: user.selectedPlan || currentUser.subscription,
          isLicenseVerified: user.isLicenseVerified || false,
          hasActiveSubscription: user.hasActiveSubscription || false
        }
        localStorage.setItem('demoUser', JSON.stringify(updatedUser))
      }
    } catch (error) {
      console.log('Could not refresh user data')
    } finally {
      setIsRefreshing(false)
    }
  }

  return {
    freshUserData,
    isRefreshing,
    forceRefresh
  }
}
