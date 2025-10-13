"use client"

import { useState, useEffect, useCallback } from 'react'
import { useDemoAuth } from './use-demo-auth'

interface ClockStatus {
  isClockedIn: boolean
  clockInTime: string | null
  totalHoursToday: number
  location: {
    lat: number | null
    lng: number | null
    address: string | null
  }
  lastLocationCheck: string | null
}

interface StudioLocation {
  lat: number
  lng: number
  address: string
  radius: number // in meters (50 feet ≈ 15.24 meters)
}

// Default studio location - will be overridden by user settings
const DEFAULT_STUDIO_LOCATION: StudioLocation = {
  lat: 40.7128, // Example coordinates - replace with actual studio address
  lng: -74.0060,
  address: "123 Studio Street, New York, NY 10001",
  radius: 100 // 100 meters (328 feet)
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180
  const φ2 = lat2 * Math.PI/180
  const Δφ = (lat2-lat1) * Math.PI/180
  const Δλ = (lon2-lon1) * Math.PI/180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c // Distance in meters
}

// Helper function to get local date/time string
function getLocalDateTime(): string {
  const now = new Date()
  // Get local timezone offset in minutes
  const timezoneOffset = now.getTimezoneOffset()
  // Create a new date adjusted for timezone
  const localDate = new Date(now.getTime() - (timezoneOffset * 60000))
  return localDate.toISOString()
}

// Helper function to get local date string (YYYY-MM-DD)
function getLocalDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function useClockInOut() {
  const { currentUser } = useDemoAuth()
  const [clockStatus, setClockStatus] = useState<ClockStatus>({
    isClockedIn: false,
    clockInTime: null,
    totalHoursToday: 0,
    location: {
      lat: null,
      lng: null,
      address: null
    },
    lastLocationCheck: null
  })
  const [isLocationLoading, setIsLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [studioLocation, setStudioLocation] = useState<StudioLocation>(DEFAULT_STUDIO_LOCATION)

  // Load configured studio location
  const loadStudioLocation = useCallback(async () => {
    if (currentUser?.email && typeof window !== 'undefined') {
      try {
        // Load from database API
        const response = await fetch('/api/studio/geolocation-settings', {
          headers: {
            'x-user-email': currentUser.email
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.settings && data.settings.isConfigured) {
            setStudioLocation({
              lat: data.settings.lat,
              lng: data.settings.lng,
              address: data.settings.address,
              radius: data.settings.radius || 100
            })
          } else {
            // Not configured - use defaults
            setStudioLocation(DEFAULT_STUDIO_LOCATION)
          }
        } else {
          // API error or forbidden - use defaults
          setStudioLocation(DEFAULT_STUDIO_LOCATION)
        }
      } catch (error) {
        console.error('Error loading studio location:', error)
        // Fall back to default location
        setStudioLocation(DEFAULT_STUDIO_LOCATION)
      }
    }
  }, [currentUser])

  // Load clock status and studio location from localStorage/API
  useEffect(() => {
    if (typeof window !== 'undefined' && currentUser?.email) {
      const savedStatus = localStorage.getItem(`clock-status-${currentUser.email}`)
      if (savedStatus) {
        try {
          const parsed = JSON.parse(savedStatus)
          setClockStatus(parsed)
        } catch (error) {
          console.error('Error parsing clock status:', error)
        }
      }
      
      // Load configured studio location
      loadStudioLocation()
    }
  }, [currentUser, loadStudioLocation])

  // Save clock status to localStorage
  const saveClockStatus = useCallback((status: ClockStatus) => {
    if (typeof window !== 'undefined' && currentUser?.email) {
      localStorage.setItem(`clock-status-${currentUser.email}`, JSON.stringify(status))
    }
  }, [currentUser])

  // Get current location
  const getCurrentLocation = useCallback((): Promise<{lat: number, lng: number, address: string}> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      setIsLocationLoading(true)
      setLocationError(null)

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          
          // Try to get address from coordinates (mock for now)
          const address = await getAddressFromCoordinates(latitude, longitude)
          
          setIsLocationLoading(false)
          resolve({
            lat: latitude,
            lng: longitude,
            address
          })
        },
        (error) => {
          setIsLocationLoading(false)
          let errorMessage = 'Unable to get location'
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.'
              break
          }
          
          setLocationError(errorMessage)
          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }, [])

  // Mock function to get address from coordinates
  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    // In production, use a geocoding service like Google Maps API
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }

  // Check if location is within studio radius
  const isWithinStudioRadius = useCallback((userLat: number, userLng: number): boolean => {
    const distance = calculateDistance(
      studioLocation.lat,
      studioLocation.lng,
      userLat,
      userLng
    )
    return distance <= studioLocation.radius
  }, [studioLocation])

  // Clock in
  const clockIn = useCallback(async () => {
    try {
      // Check if studio location is configured
      if (studioLocation.lat === 40.7128 && studioLocation.lng === -74.0060) {
        // Studio location NOT configured - show helpful error
        throw new Error('Studio location not configured. Please ask your studio owner to set up the geolocation settings before clocking in.')
      }

      // Get current location - REQUIRED for clock-in
      const location = await getCurrentLocation()
      
      // ALWAYS enforce location check for students
      if (!isWithinStudioRadius(location.lat, location.lng)) {
        const distance = calculateDistance(studioLocation.lat, studioLocation.lng, location.lat, location.lng)
        throw new Error(`You must be within 50 feet of the studio to clock in. You are currently ${distance.toFixed(0)} meters (${(distance * 3.28084).toFixed(0)} feet) away.`)
      }

      const now = getLocalDateTime()
      const newStatus: ClockStatus = {
        isClockedIn: true,
        clockInTime: now,
        totalHoursToday: clockStatus.totalHoursToday,
        location,
        lastLocationCheck: now
      }

      setClockStatus(newStatus)
      saveClockStatus(newStatus)
      
      // Start location monitoring every 15 minutes
      startLocationMonitoring()
      
      return { success: true, message: 'Successfully clocked in!' }
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to clock in' 
      }
    }
  }, [clockStatus.totalHoursToday, getCurrentLocation, isWithinStudioRadius, saveClockStatus, studioLocation])

  // Clock out
  const clockOut = useCallback(async () => {
    try {
      if (!clockStatus.isClockedIn || !clockStatus.clockInTime) {
        throw new Error('Not currently clocked in')
      }

      // Calculate hours worked
      const clockInTime = new Date(clockStatus.clockInTime)
      const clockOutTime = new Date()
      const hoursWorked = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)
      
      const newStatus: ClockStatus = {
        isClockedIn: false,
        clockInTime: null,
        totalHoursToday: clockStatus.totalHoursToday + hoursWorked,
        location: clockStatus.location,
        lastLocationCheck: getLocalDateTime()
      }

      setClockStatus(newStatus)
      saveClockStatus(newStatus)
      
      // Stop location monitoring
      stopLocationMonitoring()
      
      return { 
        success: true, 
        message: `Successfully clocked out! You worked ${hoursWorked.toFixed(2)} hours today.`,
        hoursWorked
      }
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to clock out' 
      }
    }
  }, [clockStatus, saveClockStatus])

  // Location monitoring timer
  const [locationTimer, setLocationTimer] = useState<NodeJS.Timeout | null>(null)

  const startLocationMonitoring = useCallback(() => {
    if (locationTimer) {
      clearInterval(locationTimer)
    }

    const timer = setInterval(async () => {
      if (!clockStatus.isClockedIn) return

      try {
        const location = await getCurrentLocation()
        
        if (!isWithinStudioRadius(location.lat, location.lng)) {
          // Auto clock out if not within radius
          await clockOut()
          alert('You have been automatically clocked out because you are no longer within the studio radius.')
        } else {
          // Update location silently
          setClockStatus(prev => ({
            ...prev,
            location,
            lastLocationCheck: getLocalDateTime()
          }))
        }
      } catch (error) {
        console.error('Location monitoring error:', error)
      }
    }, 15 * 60 * 1000) // 15 minutes

    setLocationTimer(timer)
  }, [clockStatus.isClockedIn, getCurrentLocation, isWithinStudioRadius, clockOut, locationTimer])

  const stopLocationMonitoring = useCallback(() => {
    if (locationTimer) {
      clearInterval(locationTimer)
      setLocationTimer(null)
    }
  }, [locationTimer])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLocationMonitoring()
    }
  }, [stopLocationMonitoring])

  // Check if user is a student (needs clock in/out)
  const isStudent = currentUser?.role === 'student' || currentUser?.role === 'apprentice'

  return {
    clockStatus,
    isLocationLoading,
    locationError,
    isStudent,
    clockIn,
    clockOut,
    isWithinStudioRadius,
    studioLocation
  }
}
