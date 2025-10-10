"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Database, CheckCircle, AlertTriangle } from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'

export default function SetupDatabasePage() {
  const { currentUser } = useDemoAuth()
  const [results, setResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const runSetup = async () => {
    if (!currentUser?.email) {
      alert('Please log in first')
      return
    }

    setIsRunning(true)
    setResults([])
    
    try {
      setResults(prev => [...prev, '🔧 Creating production database table...'])
      
      const response = await fetch('/api/admin/setup-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminEmail: currentUser.email
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResults(prev => [...prev, ''])
        data.results.forEach((result: string) => {
          setResults(prev => [...prev, result])
        })
        setResults(prev => [...prev, ''])
        setResults(prev => [...prev, '🎉 Database setup complete!'])
        setResults(prev => [...prev, ''])
        setResults(prev => [...prev, 'You can now:'])
        setResults(prev => [...prev, '✅ Run the migration (migrate-to-database)'])
        setResults(prev => [...prev, '✅ Assign services (they\'ll save to database)'])
        setResults(prev => [...prev, '✅ Students will see assignments across all devices'])
        setIsComplete(true)
      } else {
        setResults(prev => [...prev, `❌ Error: ${data.error}`])
        setResults(prev => [...prev, `   ${data.details || ''}`])
      }
    } catch (error) {
      setResults(prev => [...prev, `❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`])
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-gray-700 shadow-2xl">
        <CardHeader className="bg-gray-800 text-white border-b border-gray-700">
          <CardTitle className="text-2xl flex items-center gap-3">
            <Database className="h-8 w-8" />
            Setup Production Database
          </CardTitle>
          <p className="text-gray-300 text-sm mt-2">
            One-time setup: Create service_assignments table in production
          </p>
        </CardHeader>
        <CardContent className="p-6 bg-gray-900">
          {results.length === 0 && (
            <div className="space-y-4 mb-6">
              <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 text-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold mb-2">Admin Only</p>
                    <p className="text-sm">
                      This creates the database table for service assignments in production.
                      Only needs to be run once.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={runSetup}
                disabled={isRunning}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
              >
                {isRunning ? 'Creating Table...' : 'Create Database Table'}
              </Button>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-3">
              <div className="bg-black/50 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto space-y-1">
                {results.map((msg, i) => (
                  <div key={i} className={
                    msg.includes('✅') ? 'text-green-400' :
                    msg.includes('❌') ? 'text-red-400' :
                    msg.includes('⚠️') || msg.includes('ℹ️') ? 'text-yellow-400' :
                    msg.includes('🎉') ? 'text-purple-400 font-bold' :
                    'text-gray-300'
                  }>
                    {msg}
                  </div>
                ))}
              </div>

              {isComplete && (
                <div className="bg-green-900/30 border-2 border-green-600/50 rounded-lg p-4 text-center">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
                  <p className="text-green-200 font-semibold">
                    Table created successfully! You can now use the migration page.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

