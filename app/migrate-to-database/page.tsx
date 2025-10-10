"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertTriangle, Database } from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'

export default function MigrateToDatabasePage() {
  const { currentUser } = useDemoAuth()
  const [status, setStatus] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)

  const addStatus = (msg: string) => {
    setStatus(prev => [...prev, msg])
  }

  const runMigration = async () => {
    if (!currentUser?.email) {
      alert('Please log in first')
      return
    }

    setIsMigrating(true)
    setStatus([])
    
    try {
      addStatus('🔄 Starting migration from localStorage to database...')
      addStatus('')
      
      // Get localStorage data
      const teamMembers = JSON.parse(localStorage.getItem('studio-team-members') || '[]')
      const localAssignments = JSON.parse(localStorage.getItem('service-assignments') || '[]')
      
      addStatus(`📦 Found ${localAssignments.length} assignments in localStorage`)
      addStatus(`👥 Found ${teamMembers.length} team members`)
      addStatus('')
      
      if (localAssignments.length === 0) {
        addStatus('⚠️ No assignments to migrate')
        setIsComplete(true)
        return
      }
      
      // Save to database
      addStatus('💾 Saving to production database...')
      addStatus(`   Endpoint: POST /api/service-assignments`)
      addStatus(`   User Email: ${currentUser.email}`)
      addStatus(`   Assignments Count: ${localAssignments.length}`)
      
      const response = await fetch('/api/service-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({ assignments: localAssignments })
      })
      
      addStatus(`   Response Status: ${response.status} ${response.statusText}`)
      
      if (response.ok) {
        const data = await response.json()
        addStatus(`✅ Successfully migrated ${data.assignments?.length || 0} assignments to database`)
        addStatus(`   Database confirmed: ${data.message || 'Saved'}`)
        addStatus('')
        addStatus('🎉 MIGRATION COMPLETE!')
        addStatus('')
        addStatus('What happened:')
        addStatus('✅ Service assignments now stored in database')
        addStatus('✅ Available across all devices')
        addStatus('✅ Survives browser cache clear')
        addStatus('✅ Production-grade persistence')
        addStatus('')
        addStatus('You can now:')
        addStatus('1. Clear browser cache safely')
        addStatus('2. Access from any device')
        addStatus('3. Students will see assignments immediately')
        
        // Clear localStorage as it's no longer needed
        localStorage.removeItem('service-assignments')
        addStatus('')
        addStatus('🗑️ Cleaned up localStorage (no longer needed)')
        
        setIsComplete(true)
      } else {
        const errorData = await response.json()
        addStatus(`❌ Migration failed: ${errorData.error}`)
        addStatus(`   Details: ${errorData.details || 'No details provided'}`)
        addStatus(`   Status Code: ${response.status}`)
        
        if (response.status === 403) {
          addStatus('')
          addStatus('⚠️ Permission denied. Make sure you\'re logged in as owner/manager.')
        } else if (response.status === 500) {
          addStatus('')
          addStatus('⚠️ Database error. Check that the service_assignments table exists.')
        }
      }
      
    } catch (error) {
      addStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl border-blue-200 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardTitle className="text-2xl flex items-center gap-3">
            <Database className="h-8 w-8" />
            Migrate to Production Database
          </CardTitle>
          <p className="text-blue-100 text-sm mt-2">
            One-time migration: Move service assignments from browser storage to production database
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {!isComplete && status.length === 0 && (
            <div className="space-y-4 mb-6">
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-yellow-900 mb-2">Important: One-Time Migration</h3>
                    <p className="text-yellow-800 text-sm mb-2">
                      This will migrate your service assignments from browser localStorage to the production database.
                    </p>
                    <ul className="text-yellow-800 text-sm space-y-1 list-disc list-inside">
                      <li>Service assignments will be available across all devices</li>
                      <li>Data will survive browser cache clears</li>
                      <li>Multi-device support enabled</li>
                      <li>Production-grade reliability</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={runMigration}
                disabled={isMigrating || !currentUser}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg py-6"
              >
                {isMigrating ? 'Migrating...' : 'Start Migration'}
              </Button>
            </div>
          )}

          {status.length > 0 && (
            <div className="space-y-2 bg-gray-900 text-gray-100 p-6 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {status.map((msg, i) => (
                <div key={i} className={
                  msg.includes('✅') ? 'text-green-400' :
                  msg.includes('❌') ? 'text-red-400' :
                  msg.includes('⚠️') ? 'text-yellow-400' :
                  msg.includes('🎉') ? 'text-purple-400 font-bold text-lg' :
                  msg.includes('📊') || msg.includes('📦') || msg.includes('👥') || msg.includes('💾') || msg.includes('🗑️') ? 'text-blue-400' :
                  'text-gray-300'
                }>
                  {msg}
                </div>
              ))}
            </div>
          )}
          
          {isComplete && (
            <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-900 mb-3">
                Migration Complete!
              </h3>
              <p className="text-green-800 mb-4">
                Your service assignments are now stored in the production database.
              </p>
              <div className="bg-white rounded-lg p-4 text-left text-sm space-y-2">
                <p className="font-semibold text-gray-900">Next Steps:</p>
                <ul className="space-y-1 text-gray-700">
                  <li>✅ Students can now see assignments from any device</li>
                  <li>✅ Data persists even if browser cache is cleared</li>
                  <li>✅ Changes sync across all devices in real-time</li>
                  <li>✅ Production-ready for commercial use</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

