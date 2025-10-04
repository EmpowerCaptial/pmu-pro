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
  radius: number // in meters (5 feet ≈ 1.5 meters)
}

// Mock studio location - in production this would come from user settings
const STUDIO_LOCATION: StudioLocation = {
  lat: 40.7128, // Example coordinates - replace with actual studio address
  lng: -74.0060,
  address: "123 Studio Street, New York, NY 10001",
  radius: 1.5 // 5 feet in meters
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

  // Load clock status from localStorage
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
    }
  }, [currentUser])

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
      STUDIO_LOCATION.lat,
      STUDIO_LOCATION.lng,
      userLat,
      userLng
    )
    return distance <= STUDIO_LOCATION.radius
  }, [])

  // Clock in
  const clockIn = useCallback(async () => {
    try {
      const location = await getCurrentLocation()
      
      if (!isWithinStudioRadius(location.lat, location.lng)) {
        throw new Error(`You must be within 5 feet of the studio to clock in. Current distance: ${calculateDistance(STUDIO_LOCATION.lat, STUDIO_LOCATION.lng, location.lat, location.lng).toFixed(1)} meters`)
      }

      const now = new Date().toISOString()
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
  }, [clockStatus.totalHoursToday, getCurrentLocation, isWithinStudioRadius, saveClockStatus])

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
        lastLocationCheck: null
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
            lastLocationCheck: new Date().toISOString()
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
    STUDIO_LOCATION
  }
}
