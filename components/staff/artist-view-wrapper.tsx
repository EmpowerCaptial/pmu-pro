"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  isInArtistViewMode, 
  getCurrentUserContext, 
  clearArtistViewMode,
  type ArtistViewMode 
} from '@/lib/artist-view-mode'
import ArtistViewBanner from './artist-view-banner'

interface ArtistViewWrapperProps {
  children: React.ReactNode
}

export default function ArtistViewWrapper({ children }: ArtistViewWrapperProps) {
  const [viewMode, setViewMode] = useState<ArtistViewMode | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if we're in staff view mode
    const isStaffView = searchParams.get('staff-view') === 'true'
    
    if (isStaffView && isInArtistViewMode()) {
      const currentViewMode = getCurrentUserContext()
      if (currentViewMode) {
        setViewMode(currentViewMode)
        setShowBanner(true)
      }
    }
  }, [searchParams])

  const handleExitViewMode = () => {
    clearArtistViewMode()
    setShowBanner(false)
    setViewMode(null)
    // Redirect back to staff dashboard
    window.location.href = '/staff-admin/dashboard'
  }

  if (!showBanner || !viewMode) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen">
      {/* Artist View Mode Banner */}
      <ArtistViewBanner 
        viewMode={viewMode} 
        onExit={handleExitViewMode} 
      />
      
      {/* Main content with top margin to account for banner */}
      <div className="pt-24">
        {children}
      </div>
    </div>
  )
}
