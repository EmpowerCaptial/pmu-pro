"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Settings, 
  Save, 
  CheckCircle,
  AlertTriangle,
  Navigation,
  Clock
} from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { NavBar } from '@/components/ui/navbar'

interface GeolocationSettings {
  address: string
  lat: number | null
  lng: number | null
  radius: number // in meters
  isConfigured: boolean
}

export default function GeolocationSettingsPage() {
  const { currentUser } = useDemoAuth()
  const [settings, setSettings] = useState<GeolocationSettings>({
    address: '',
    lat: null,
    lng: null,
    radius: 1.5, // 5 feet in meters
    isConfigured: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null)
  const [distance, setDistance] = useState<number | null>(null)

  // Prepare user object for NavBar
  const user = currentUser ? {
    name: currentUser.name,
    email: currentUser.email,
    initials: currentUser.name?.split(' ').map(n => n[0]).join('') || currentUser.email.charAt(0).toUpperCase(),
    avatar: currentUser.avatar
  } : {
    name: "PMU User",
    email: "user@pmupro.com",
    initials: "PU",
  }

  // Load existing settings
  useEffect(() => {
    const loadSettings = async () => {
      if (currentUser?.email) {
        try {
          const response = await fetch('/api/studio/geolocation-settings', {
            headers: {
              'x-user-email': currentUser.email
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            setSettings(data.settings || {
              address: '',
              lat: null,
              lng: null,
              radius: 1.5,
              isConfigured: false
            })
          }
        } catch (error) {
          console.error('Error loading geolocation settings:', error)
        }
      }
    }

    loadSettings()
  }, [currentUser])

  // Geocode address to get coordinates
  const geocodeAddress = async (address: string): Promise<{lat: number, lng: number} | null> => {
    try {
      // Using a free geocoding service (you can replace with Google Maps API for better accuracy)
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`)
      const data = await response.json()
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        }
      }
      return null
    } catch (error) {
      console.error('Geocoding error:', error)
      return null
    }
  }

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser')
      return
    }

    setIsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCurrentLocation({ lat: latitude, lng: longitude })
        
        // Calculate distance if studio location is configured
        if (settings.lat && settings.lng) {
          const dist = calculateDistance(latitude, longitude, settings.lat, settings.lng)
          setDistance(dist)
        }
        
        setIsLoading(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Unable to get your current location. Please check your browser permissions.')
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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

  // Handle address change and geocode
  const handleAddressChange = async (address: string) => {
    setSettings(prev => ({ ...prev, address }))
    
    if (address.length > 10) { // Only geocode if address is substantial
      setIsLoading(true)
      const coords = await geocodeAddress(address)
      
      if (coords) {
        setSettings(prev => ({
          ...prev,
          lat: coords.lat,
          lng: coords.lng,
          isConfigured: true
        }))
      }
      setIsLoading(false)
    }
  }

  // Save settings
  const handleSave = async () => {
    if (!settings.address || !settings.lat || !settings.lng) {
      alert('Please enter a valid address')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/studio/geolocation-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        alert('Geolocation settings saved successfully!')
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Access control - only owners, managers, directors can access
  const canAccess = currentUser?.role === 'owner' || 
                   currentUser?.role === 'manager' || 
                   currentUser?.role === 'director'

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
        <NavBar currentPath="/studio/geolocation-settings" user={user} />
        <main className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
          <div className="text-center py-16">
            <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
            <p className="text-gray-600 mb-4">
              Geolocation settings can only be configured by studio owners and managers.
            </p>
            <p className="text-sm text-gray-500">
              Your current role: <span className="font-medium">{currentUser?.role || 'Unknown'}</span>
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <NavBar currentPath="/studio/geolocation-settings" user={user} />
      <main className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Geolocation Settings</h1>
              <p className="text-gray-600">Configure your studio location for clock in/out tracking</p>
            </div>
          </div>
        </div>

        {/* Settings Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <span>Studio Location</span>
            </CardTitle>
            <CardDescription>
              Set your studio address for geolocation-based clock in/out. Students must be within 5 feet of this location to clock in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Address Input */}
            <div className="space-y-2">
              <Label htmlFor="address">Studio Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="Enter your studio's full address (e.g., 123 Main St, City, State 12345)"
                value={settings.address}
                onChange={(e) => handleAddressChange(e.target.value)}
                className="w-full"
              />
              {isLoading && (
                <p className="text-sm text-blue-600 flex items-center gap-2">
                  <Navigation className="h-4 w-4 animate-spin" />
                  Looking up coordinates...
                </p>
              )}
            </div>

            {/* Coordinates Display */}
            {settings.lat && settings.lng && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Location Found</span>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>Latitude:</strong> {settings.lat.toFixed(6)}</p>
                  <p><strong>Longitude:</strong> {settings.lng.toFixed(6)}</p>
                  <p><strong>Radius:</strong> {settings.radius} meters (≈5 feet)</p>
                </div>
              </div>
            )}

            {/* Current Location Test */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Test Current Location</h3>
                <Button
                  onClick={getCurrentLocation}
                  disabled={isLoading || !settings.isConfigured}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  {isLoading ? 'Getting Location...' : 'Get My Location'}
                </Button>
              </div>

              {currentLocation && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>Your Current Location:</strong></p>
                    <p>Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}</p>
                    {distance !== null && (
                      <div className="flex items-center gap-2 mt-2">
                        <span><strong>Distance from studio:</strong></span>
                        <Badge variant={distance <= settings.radius ? "default" : "destructive"}>
                          {distance.toFixed(1)}m {distance <= settings.radius ? '(Within range)' : '(Outside range)'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={!settings.isConfigured || isSaving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <span>How It Works</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs">1</div>
                <div>
                  <p className="font-medium">Set Studio Address</p>
                  <p>Enter your studio's complete address above. The system will automatically find the coordinates.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs">2</div>
                <div>
                  <p className="font-medium">Test Location</p>
                  <p>Use the "Get My Location" button to test if you're within the 5-foot radius of your studio.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs">3</div>
                <div>
                  <p className="font-medium">Students Clock In</p>
                  <p>Students can only clock in when they're physically within 5 feet of your studio location.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs">4</div>
                <div>
                  <p className="font-medium">Automatic Monitoring</p>
                  <p>The system checks location every 15 minutes and automatically clocks out students who leave the area.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
