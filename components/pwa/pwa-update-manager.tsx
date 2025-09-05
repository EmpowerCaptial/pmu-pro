"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw, Download, X } from 'lucide-react'

// Use the built-in ServiceWorkerRegistration type

export default function PWAUpdateManager() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Check for existing service worker registration
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          setRegistration(reg)
          
          // Check if there's a waiting service worker (update available)
          if (reg.waiting) {
            setUpdateAvailable(true)
          }
          
          // Listen for updates
          reg.addEventListener('updatefound', () => {
            console.log('🔄 Service Worker update found')
            const newWorker = reg.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 New Service Worker installed and ready')
                  setUpdateAvailable(true)
                }
              })
            }
          })
        }
      })

      // Listen for controller change (when new service worker takes control)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🎯 Service Worker controller changed - page will reload')
        window.location.reload()
      })
    }
  }, [])

  const handleUpdate = async () => {
    if (!registration?.waiting) return

    setIsUpdating(true)
    
    try {
      // Tell the waiting service worker to skip waiting and become active
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      
      // The page will automatically reload when the new service worker takes control
      console.log('🚀 Update initiated - page will reload shortly')
    } catch (error) {
      console.error('❌ Update failed:', error)
      setIsUpdating(false)
    }
  }

  const dismissUpdate = () => {
    setUpdateAvailable(false)
  }

  if (!updateAvailable) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="border-lavender/30 bg-white shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 text-lavender" />
              <CardTitle className="text-lg text-gray-900">Update Available</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissUpdate}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-sm text-gray-600">
            A new version of PMU Pro is ready to install
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Alert className="mb-4 border-blue-200 bg-blue-50">
            <Download className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              This update includes the new trial system and pricing plans. Install now to get the latest features.
            </AlertDescription>
          </Alert>
          <div className="flex space-x-2">
            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="flex-1 bg-lavender hover:bg-lavender-600 text-white"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Installing...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Install Update
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={dismissUpdate}
              className="px-3"
            >
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
