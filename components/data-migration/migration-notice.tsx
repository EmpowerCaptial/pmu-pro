"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertTriangle, Loader2, Database, Upload } from 'lucide-react'

interface MigrationNoticeProps {
  userEmail: string
  onMigrationComplete?: () => void
}

export function MigrationNotice({ userEmail, onMigrationComplete }: MigrationNoticeProps) {
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const checkLocalStorageData = () => {
    const portfolioData = localStorage.getItem(`portfolio_${userEmail}`)
    const profileData = localStorage.getItem(`profile_${userEmail}`)
    const avatarData = localStorage.getItem(`profile_photo_${userEmail}`)
    const clientData = localStorage.getItem('pmu_clients')
    
    return {
      hasPortfolio: !!portfolioData,
      hasProfile: !!profileData,
      hasAvatar: !!avatarData,
      hasClients: !!clientData,
      portfolioCount: portfolioData ? JSON.parse(portfolioData).length : 0,
      clientCount: clientData ? JSON.parse(clientData).length : 0
    }
  }

  const data = checkLocalStorageData()
  const hasData = data.hasPortfolio || data.hasProfile || data.hasAvatar || data.hasClients

  if (!hasData) {
    return null // Don't show if no data to migrate
  }

  const handleMigrate = async () => {
    setIsMigrating(true)
    setMigrationStatus('idle')
    setErrorMessage('')

    try {
      const portfolioData = localStorage.getItem(`portfolio_${userEmail}`)
      const profileData = localStorage.getItem(`profile_${userEmail}`)
      const avatarData = localStorage.getItem(`profile_photo_${userEmail}`)
      const clientData = localStorage.getItem('pmu_clients')

      const response = await fetch('/api/migrate-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail
        },
        body: JSON.stringify({
          portfolioData: portfolioData ? JSON.parse(portfolioData) : null,
          profileData: profileData ? JSON.parse(profileData) : null,
          avatarData: avatarData,
          clientData: clientData ? JSON.parse(clientData) : null
        })
      })

      if (response.ok) {
        const result = await response.json()
        setMigrationStatus('success')
        
        // Clear localStorage after successful migration
        if (portfolioData) localStorage.removeItem(`portfolio_${userEmail}`)
        if (profileData) localStorage.removeItem(`profile_${userEmail}`)
        if (avatarData) localStorage.removeItem(`profile_photo_${userEmail}`)
        if (clientData) localStorage.removeItem('pmu_clients')
        
        onMigrationComplete?.()
      } else {
        throw new Error('Migration failed')
      }
    } catch (error) {
      console.error('Migration error:', error)
      setMigrationStatus('error')
      setErrorMessage('Failed to migrate data. Please try again.')
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Database className="h-5 w-5" />
          Data Migration Available
        </CardTitle>
        <CardDescription className="text-orange-700">
          We've improved how your data is stored to prevent data loss during updates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Your profile data is currently stored locally and may be lost during app updates.
            Migrate your data to our secure database to ensure it's never lost.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h4 className="font-medium text-orange-800">Data to migrate:</h4>
          <ul className="text-sm text-orange-700 space-y-1">
            {data.hasPortfolio && (
              <li>• {data.portfolioCount} portfolio item(s)</li>
            )}
            {data.hasProfile && (
              <li>• Profile information (bio, studio details, etc.)</li>
            )}
            {data.hasAvatar && (
              <li>• Profile photo</li>
            )}
            {data.hasClients && (
              <li>• {data.clientCount} client record(s)</li>
            )}
          </ul>
        </div>

        {migrationStatus === 'success' && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Migration successful!</strong> Your data has been safely moved to our database.
            </AlertDescription>
          </Alert>
        )}

        {migrationStatus === 'error' && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleMigrate}
          disabled={isMigrating || migrationStatus === 'success'}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        >
          {isMigrating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Migrating Data...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Migrate My Data Now
            </>
          )}
        </Button>

        <p className="text-xs text-orange-600">
          Your data will be safely transferred to our secure database and backed up automatically.
        </p>
      </CardContent>
    </Card>
  )
}
