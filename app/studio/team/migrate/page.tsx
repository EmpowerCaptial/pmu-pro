"use client"

import { useState } from 'react'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { NavBar } from '@/components/ui/navbar'
import { RefreshCw, Database, AlertTriangle, CheckCircle } from 'lucide-react'

export default function MigrateTeamMembersPage() {
  const { currentUser } = useDemoAuth()
  const [isChecking, setIsChecking] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const checkLocalStorage = async () => {
    if (!currentUser?.email) return

    setIsChecking(true)
    setError(null)
    setSuccess(null)
    setAnalysis(null)

    try {
      // Get localStorage data from client
      const teamMembers = JSON.parse(localStorage.getItem('studio-team-members') || '[]')

      if (teamMembers.length === 0) {
        setError('No team members found in localStorage. Either they\'ve been migrated, or the page needs to load team members first.')
        setIsChecking(false)
        return
      }

      // Send to API for analysis
      const response = await fetch('/api/migrate/check-localstorage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({ teamMembers })
      })

      if (!response.ok) {
        throw new Error('Failed to check localStorage data')
      }

      const data = await response.json()
      setAnalysis(data.analysis)
      
      if (data.membersToMigrate && data.membersToMigrate.length > 0) {
        setSuccess(`Found ${data.membersToMigrate.length} team members that need migration. Click "Migrate All" to add them to the database.`)
      } else {
        setSuccess('All team members are already in the database!')
      }

    } catch (err) {
      console.error('Error checking localStorage:', err)
      setError(err instanceof Error ? err.message : 'Failed to check localStorage data')
    } finally {
      setIsChecking(false)
    }
  }

  const migrateAll = async () => {
    if (!currentUser?.email) return

    setIsMigrating(true)
    setError(null)
    setSuccess(null)

    try {
      // Get localStorage data
      const teamMembers = JSON.parse(localStorage.getItem('studio-team-members') || '[]')

      if (teamMembers.length === 0) {
        setError('No team members found in localStorage')
        setIsMigrating(false)
        return
      }

      // Migrate to database
      const response = await fetch('/api/migrate/localstorage-to-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          teamMembers,
          staffMembers: [],
          artistProfiles: []
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to migrate data')
      }

      const result = await response.json()
      
      setSuccess(`Migration completed! Created: ${result.results.teamMembers.created}, Skipped: ${result.results.teamMembers.skipped}`)
      
      // Clear localStorage after successful migration
      localStorage.removeItem('studio-team-members')
      
      // Refresh the analysis
      setTimeout(() => {
        checkLocalStorage()
      }, 1000)

    } catch (err) {
      console.error('Error migrating:', err)
      setError(err instanceof Error ? err.message : 'Failed to migrate data')
    } finally {
      setIsMigrating(false)
    }
  }

  const user = currentUser ? {
    name: currentUser.name,
    email: currentUser.email,
    initials: currentUser.name?.split(' ').map(n => n[0]).join('') || currentUser.email.charAt(0).toUpperCase(),
    avatar: currentUser.avatar
  } : {
    name: "PMU Artist",
    email: "user@pmupro.com",
    initials: "PA",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <NavBar currentPath="/studio/team/migrate" user={user} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Migrate Team Members to Database</CardTitle>
            <CardDescription>
              Check localStorage for team members and migrate them to the database so they persist after refresh.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4">
              <Button
                onClick={checkLocalStorage}
                disabled={isChecking || isMigrating}
                className="flex-1"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                {isChecking ? 'Checking...' : 'Check localStorage'}
              </Button>
              
              <Button
                onClick={migrateAll}
                disabled={isChecking || isMigrating || !analysis}
                variant="default"
                className="flex-1"
              >
                <Database className={`h-4 w-4 mr-2 ${isMigrating ? 'animate-spin' : ''}`} />
                {isMigrating ? 'Migrating...' : 'Migrate All to Database'}
              </Button>
            </div>

            {analysis && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Migration Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">localStorage</p>
                        <p className="text-2xl font-bold">{analysis.localStorageTotal}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Database</p>
                        <p className="text-2xl font-bold">{analysis.databaseTotal}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Need Migration</p>
                        <p className="text-2xl font-bold text-orange-600">{analysis.needsMigration}</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold mb-3">By Role:</p>
                      <div className="space-y-2">
                        {Object.entries(analysis.byRole).map(([role, counts]: [string, any]) => (
                          <div key={role} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium capitalize">{role}</span>
                            <div className="flex gap-4 text-sm">
                              <span>LS: {counts.localStorage}</span>
                              <span>DB: {counts.database}</span>
                              {counts.toMigrate > 0 && (
                                <span className="text-orange-600 font-semibold">→ {counts.toMigrate}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>How it works</AlertTitle>
              <AlertDescription>
                <ol className="list-decimal list-inside space-y-1 mt-2">
                  <li>Click "Check localStorage" to see what team members are stored locally</li>
                  <li>The analysis will show how many need to be migrated to the database</li>
                  <li>Click "Migrate All to Database" to save them permanently</li>
                  <li>After migration, team members will persist even after page refresh</li>
                </ol>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

