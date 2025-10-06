"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  CreditCard, 
  Users, 
  Shield, 
  Building2,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { NavBar } from '@/components/ui/navbar'
import { hasEnterpriseStudioAccess, isStudioOwner } from '@/lib/stripe-management'

interface StudioStripeSettings {
  ownerStripeAccountId: string | null
  allowArtistStripeAccounts: boolean
  defaultTransactionMode: 'owner' | 'artist'
}

interface ArtistStripePermission {
  artistId: string
  artistName: string
  artistEmail: string
  hasStripeAccount: boolean
  stripeAccountId: string | null
  canProcessPayments: boolean
}

export default function StudioSettingsPage() {
  const { currentUser, isLoading } = useDemoAuth()
  const [settings, setSettings] = useState<StudioStripeSettings | null>(null)
  const [artists, setArtists] = useState<ArtistStripePermission[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load settings on mount
  useEffect(() => {
    if (currentUser?.email) {
      loadSettings()
    }
  }, [currentUser])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/studio/stripe-settings', {
        headers: {
          'x-user-email': currentUser?.email || ''
        }
      })

      if (!response.ok) {
        if (response.status === 403) {
          const data = await response.json()
          if (data.requiresUpgrade) {
            setError('Enterprise Studio subscription required to access Stripe settings')
          } else {
            setError(data.error || 'Access denied')
          }
          return
        }
        throw new Error('Failed to load settings')
      }

      const data = await response.json()
      setSettings(data.settings)
      setArtists(data.artists)
    } catch (error) {
      console.error('Error loading settings:', error)
      setError('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings: Partial<StudioStripeSettings>) => {
    try {
      setSaving(true)
      setError(null)

      const response = await fetch('/api/studio/stripe-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify(newSettings)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update settings')
      }

      const data = await response.json()
      setSettings(prev => prev ? { ...prev, ...newSettings } : null)
      
      // Show success message
      alert(data.message || 'Settings updated successfully')
    } catch (error) {
      console.error('Error updating settings:', error)
      setError(error instanceof Error ? error.message : 'Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  const handleAllowArtistAccountsChange = (checked: boolean) => {
    updateSettings({ allowArtistStripeAccounts: checked })
  }

  const handleTransactionModeChange = (mode: 'owner' | 'artist') => {
    updateSettings({ defaultTransactionMode: mode })
  }

  // Check access
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-lavender-600/5">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lavender mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Check Enterprise Studio access
  if (!hasEnterpriseStudioAccess(currentUser)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-lavender-600/5">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <h2 className="text-xl font-bold text-red-800">Enterprise Studio Required</h2>
                  <p className="text-red-600 mt-1">
                    Stripe management features are only available with an Enterprise Studio subscription.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Check owner access
  if (!isStudioOwner(currentUser)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-lavender-600/5">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-orange-600" />
                <div>
                  <h2 className="text-xl font-bold text-orange-800">Owner Access Required</h2>
                  <p className="text-orange-600 mt-1">
                    Only studio owners can manage Stripe settings and artist permissions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-lavender-600/5">
      <NavBar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Studio Settings</h1>
              <p className="text-gray-600">Manage your studio's Stripe payment settings</p>
            </div>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lavender mx-auto mb-4"></div>
              <p className="text-gray-600">Loading settings...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stripe Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-violet-600" />
                  <span>Payment Settings</span>
                </CardTitle>
                <CardDescription>
                  Configure how payments are processed in your studio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Default Transaction Mode */}
                <div>
                  <Label className="text-base font-medium">Default Transaction Mode</Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Choose which Stripe account processes payments by default
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="owner-mode"
                        name="transactionMode"
                        value="owner"
                        checked={settings?.defaultTransactionMode === 'owner'}
                        onChange={() => handleTransactionModeChange('owner')}
                        className="text-violet-600"
                      />
                      <Label htmlFor="owner-mode" className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4" />
                        <span>Studio Owner Account</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="artist-mode"
                        name="transactionMode"
                        value="artist"
                        checked={settings?.defaultTransactionMode === 'artist'}
                        onChange={() => handleTransactionModeChange('artist')}
                        className="text-violet-600"
                        disabled={!settings?.allowArtistStripeAccounts}
                      />
                      <Label htmlFor="artist-mode" className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Individual Artist Accounts</span>
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Allow Artist Accounts */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <Label className="text-base font-medium">Allow Artist Stripe Accounts</Label>
                    <p className="text-sm text-gray-600">
                      Let artists use their own Stripe accounts for transactions
                    </p>
                  </div>
                  <Switch
                    checked={settings?.allowArtistStripeAccounts || false}
                    onCheckedChange={handleAllowArtistAccountsChange}
                    disabled={saving}
                  />
                </div>

                {/* Info Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">How it works</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        By default, all transactions run through your studio owner account. 
                        You can optionally allow artists to use their own Stripe accounts, 
                        but they must be set up with Stripe Connect first.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Artist Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-violet-600" />
                  <span>Artist Permissions</span>
                </CardTitle>
                <CardDescription>
                  View and manage artist Stripe account permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {artists.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No artists found</h3>
                    <p className="text-gray-600">
                      Artists will appear here once they join your studio
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {artists.map((artist) => (
                      <div key={artist.artistId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {artist.artistName.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{artist.artistName}</h3>
                              <p className="text-sm text-gray-600">{artist.artistEmail}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {artist.hasStripeAccount ? (
                            <Badge className="bg-green-100 text-green-800 border-green-300">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Stripe Connected
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              No Stripe Account
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
