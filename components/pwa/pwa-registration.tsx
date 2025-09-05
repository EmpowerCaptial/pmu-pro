"use client"

import { useEffect } from 'react'

export default function PWARegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          console.log('🔄 Attempting to register Service Worker...')
          
          // Check if already registered
          const existingRegistration = await navigator.serviceWorker.getRegistration()
          if (existingRegistration) {
            console.log('✅ Service Worker already registered:', existingRegistration.scope)
            return
          }

          // Register new service worker
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          })
          
          console.log('✅ Service Worker registered successfully:', registration)
          console.log('📍 Scope:', registration.scope)
          console.log('🔄 Update via:', registration.updateViaCache)
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            console.log('🔄 Service Worker update found')
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 New Service Worker installed and ready')
                }
              })
            }
          })
          
          // Handle service worker errors
          registration.addEventListener('error', (event) => {
            console.error('❌ Service Worker registration error:', event)
          })
          
        } catch (error) {
          console.error('❌ Service Worker registration failed:', error)
          
          // Log specific error details
          if (error instanceof Error) {
            console.error('Error name:', error.name)
            console.error('Error message:', error.message)
            console.error('Error stack:', error.stack)
          }
        }
      }

      // Wait for page to load before registering
      if (document.readyState === 'loading') {
        window.addEventListener('load', registerServiceWorker)
      } else {
        registerServiceWorker()
      }
    } else {
      console.log('⚠️ Service Worker not supported in this browser')
    }
  }, [])

  return null
}
