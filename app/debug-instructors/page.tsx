'use client'

import { useEffect, useState } from 'react'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function DebugInstructorsPage() {
  const { currentUser } = useDemoAuth()
  const [apiData, setApiData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🔍 Fetching team members from API...')
      
      const response = await fetch('/api/studio/team-members', {
        headers: {
          'x-user-email': currentUser?.email || ''
        }
      })
      
      const data = await response.json()
      
      console.log('📊 API Response:', data)
      setApiData(data)
      
    } catch (err: any) {
      setError(err.message)
      console.error('❌ Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser?.email) {
      fetchData()
    }
  }, [currentUser])

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading user...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6 pt-8">
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center justify-between">
              <span>🔍 Live Instructor Debug</span>
              <Button onClick={fetchData} disabled={loading} size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Current User:</h3>
              <div className="text-sm space-y-1 text-blue-800">
                <p><strong>Name:</strong> {currentUser.name}</p>
                <p><strong>Email:</strong> {currentUser.email}</p>
                <p><strong>Role:</strong> {currentUser.role}</p>
                <p><strong>Studio:</strong> {(currentUser as any).studioName || '❌ NOT SET'}</p>
              </div>
            </div>

            {loading && (
              <div className="text-center py-8">
                <RefreshCw className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
                <p>Loading API data...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-900">Error</p>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {apiData && (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">API Response:</h3>
                  <div className="text-sm space-y-1 text-green-800">
                    <p><strong>Success:</strong> {apiData.success ? '✅ Yes' : '❌ No'}</p>
                    <p><strong>Studio:</strong> {apiData.studioName || 'Not set'}</p>
                    <p><strong>Team Members Count:</strong> {apiData.count || 0}</p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Team Members from Database:
                  </h3>
                  
                  {apiData.teamMembers && apiData.teamMembers.length > 0 ? (
                    <div className="space-y-3">
                      {apiData.teamMembers.map((member: any, index: number) => (
                        <div 
                          key={index}
                          className={`p-3 rounded-lg border-2 ${
                            member.role === 'instructor' || member.role === 'owner' || member.role === 'licensed'
                              ? 'bg-purple-50 border-purple-300'
                              : 'bg-gray-50 border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{member.name}</p>
                              <p className="text-sm text-gray-600">{member.email}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              member.role === 'instructor' ? 'bg-purple-200 text-purple-900' :
                              member.role === 'owner' ? 'bg-blue-200 text-blue-900' :
                              member.role === 'licensed' ? 'bg-green-200 text-green-900' :
                              'bg-gray-200 text-gray-900'
                            }`}>
                              {member.role}
                            </span>
                          </div>
                          <div className="mt-2 text-xs text-gray-500 space-y-1">
                            <p>Studio: {member.studioName || '❌ NOT SET'}</p>
                            {member.specialties && <p>Specialties: {member.specialties}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No team members found</p>
                  )}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">
                    Instructors (filtered):
                  </h3>
                  {apiData.teamMembers && (() => {
                    const instructors = apiData.teamMembers.filter((m: any) => 
                      m.role === 'instructor' || m.role === 'owner' || m.role === 'licensed'
                    )
                    return instructors.length > 0 ? (
                      <ul className="text-sm space-y-1 text-yellow-800">
                        {instructors.map((i: any, idx: number) => (
                          <li key={idx}>
                            ✅ {i.name} ({i.email}) - {i.role}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-yellow-700">❌ No instructors found</p>
                    )
                  })()}
                </div>

                <details className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                  <summary className="cursor-pointer font-semibold text-gray-900">
                    Raw JSON Response (click to expand)
                  </summary>
                  <pre className="mt-3 text-xs overflow-auto bg-white p-3 rounded border">
                    {JSON.stringify(apiData, null, 2)}
                  </pre>
                </details>
              </>
            )}

          </CardContent>
        </Card>

      </div>
    </div>
  )
}

