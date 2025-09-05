"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, Smartphone, Monitor, X, CheckCircle, Star, AlertCircle, RefreshCw } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`])
  }

  useEffect(() => {
    // Check if app is already installed
    const checkInstallation = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone === true
      
      if (isStandalone) {
        setIsInstalled(true)
        addDebugInfo('App detected as already installed (standalone mode)')
        return
      }

      addDebugInfo('App not in standalone mode - checking installability')
    }

    // Check if user dismissed the prompt
    const checkDismissed = () => {
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      if (dismissed) {
        setIsDismissed(true)
        addDebugInfo('Install prompt was previously dismissed by user')
        return
      }
      addDebugInfo('No previous dismissal found')
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      addDebugInfo('beforeinstallprompt event received!')
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      addDebugInfo('PWA was successfully installed!')
      console.log('PWA was installed')
    }

    // Check service worker status
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration()
          if (registration) {
            addDebugInfo(`Service Worker registered: ${registration.scope}`)
          } else {
            addDebugInfo('No Service Worker registration found')
          }
        } catch (error) {
          addDebugInfo(`Service Worker check failed: ${error}`)
        }
      } else {
        addDebugInfo('Service Worker not supported in this browser')
      }
    }

    // Check PWA criteria
    const checkPWACriteria = () => {
      const hasManifest = !!document.querySelector('link[rel="manifest"]')
      const hasServiceWorker = 'serviceWorker' in navigator
      const isHTTPS = window.location.protocol === 'https:' || window.location.hostname === 'localhost'
      
      addDebugInfo(`PWA Criteria: Manifest=${hasManifest}, SW=${hasServiceWorker}, HTTPS=${isHTTPS}`)
      
      if (!hasManifest || !hasServiceWorker || !isHTTPS) {
        addDebugInfo('PWA criteria not met - install prompt may not work')
      }
    }

    // Initialize
    checkInstallation()
    checkDismissed()
    checkServiceWorker()
    checkPWACriteria()

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Add a timeout to show manual install option if no prompt received
    const timeoutId = setTimeout(() => {
      if (!deferredPrompt && !isInstalled && !isDismissed) {
        addDebugInfo('No beforeinstallprompt received after 3 seconds - showing manual install option')
        setShowInstallPrompt(true)
      }
    }, 3000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      clearTimeout(timeoutId)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback: try to trigger install manually
      addDebugInfo('No deferred prompt - trying manual install')
      try {
        // Try to show browser's native install UI
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration()
          if (registration) {
            addDebugInfo('Attempting to show native install UI')
            // This might not work in all browsers, but worth trying
            window.location.reload()
          }
        }
      } catch (error) {
        addDebugInfo(`Manual install failed: ${error}`)
      }
      return
    }

    setIsLoading(true)
    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        addDebugInfo('User accepted the install prompt')
        setIsInstalled(true)
        setShowInstallPrompt(false)
      } else {
        addDebugInfo('User dismissed the install prompt')
      }
    } catch (error) {
      addDebugInfo(`Install prompt failed: ${error}`)
    } finally {
      setIsLoading(false)
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    setIsDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
    addDebugInfo('User dismissed install prompt')
  }

  const handleShowAgain = () => {
    setIsDismissed(false)
    localStorage.removeItem('pwa-install-dismissed')
    setShowInstallPrompt(true)
    addDebugInfo('Showing install prompt again')
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  // Don't show if already installed
  if (isInstalled) {
    return null
  }

  // Show "Show Again" button if dismissed
  if (isDismissed) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={handleShowAgain}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm border-purple-200 text-purple-700 hover:bg-purple-50"
        >
          <Download className="h-4 w-4 mr-2" />
          Show Install Prompt
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="bg-white/95 backdrop-blur-sm border-purple-200 shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-purple-800 flex items-center gap-2">
              <Download className="h-5 w-5" />
              Install PMU Pro
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-purple-600">
            {deferredPrompt ? 'Get the full app experience on your device' : 'Install PMU Pro as a native app'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Benefits */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Works offline</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Fast access from home screen</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Native app-like experience</span>
            </div>
          </div>

          {/* Device Icons */}
          <div className="flex items-center justify-center gap-4 py-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Smartphone className="h-5 w-5" />
              <span>Mobile</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Monitor className="h-5 w-5" />
              <span>Desktop</span>
            </div>
          </div>

          {/* Install Button */}
          <Button
            onClick={handleInstallClick}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
            size="lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Installing...
              </>
              ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                {deferredPrompt ? 'Install App' : 'Try Install'}
              </>
            )}
          </Button>

          {/* Manual Install Instructions */}
          {!deferredPrompt && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">Manual Install:</p>
                  <p>• <strong>Chrome/Edge:</strong> Click ⋮ → "Install PMU Pro"</p>
                  <p>• <strong>Safari:</strong> Click Share → "Add to Home Screen"</p>
                  <p>• <strong>Mobile:</strong> Look for "Add to Home Screen"</p>
                </div>
              </div>
            </div>
          )}

          {/* Debug Info (only in development) */}
          {process.env.NODE_ENV === 'development' && debugInfo.length > 0 && (
            <details className="text-xs">
              <summary className="cursor-pointer text-gray-500 hover:text-gray-700">Debug Info</summary>
              <div className="mt-2 p-2 bg-gray-100 rounded text-gray-600 max-h-32 overflow-y-auto">
                {debugInfo.map((info, index) => (
                  <div key={index} className="mb-1">{info}</div>
                ))}
              </div>
            </details>
          )}

          {/* Rating */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-xs text-gray-500">Professional PMU Business Management</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
