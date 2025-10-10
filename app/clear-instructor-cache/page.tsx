'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, Trash2, RefreshCw } from 'lucide-react'

export default function ClearInstructorCachePage() {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'clearing' | 'success'>('idle')
  const [foundKeys, setFoundKeys] = useState<string[]>([])

  useEffect(() => {
    // Check what's in localStorage
    if (typeof window !== 'undefined') {
      const keys = []
      if (localStorage.getItem('studio-team-members')) keys.push('studio-team-members')
      if (localStorage.getItem('studio-instructors')) keys.push('studio-instructors')
      if (localStorage.getItem('supervisionInstructors')) keys.push('supervisionInstructors')
      setFoundKeys(keys)
    }
  }, [])

  const clearCache = () => {
    setStatus('clearing')
    
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        // Clear ALL instructor-related cache
        localStorage.removeItem('studio-team-members')
        localStorage.removeItem('studio-instructors')
        localStorage.removeItem('supervisionInstructors')
        localStorage.removeItem('instructor-availability')
        localStorage.removeItem('instructor-bookings')
        
        console.log('🗑️ Cleared all instructor cache from localStorage')
      }
      
      setStatus('success')
    }, 500)
  }

  const goToSupervision = () => {
    router.push('/studio/supervision')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6 pt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Trash2 className="h-6 w-6 text-purple-600" />
              Clear Instructor Cache
            </CardTitle>
            <CardDescription>
              Remove old cached instructor data and force refresh from database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {status === 'idle' && (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900">Old Instructor Data Detected</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your browser has cached {foundKeys.length} instructor data keys that may contain old fake instructors.
                      </p>
                      {foundKeys.length > 0 && (
                        <ul className="text-xs text-yellow-600 mt-2 space-y-1">
                          {foundKeys.map(key => (
                            <li key={key}>• {key}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={clearCache}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  size="lg"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cache & Refresh Instructors
                </Button>
              </>
            )}

            {status === 'clearing' && (
              <div className="text-center py-8">
                <RefreshCw className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
                <p className="text-lg font-medium">Clearing cache...</p>
              </div>
            )}

            {status === 'success' && (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <p className="text-lg font-medium text-green-900 mb-2">
                    Cache Cleared Successfully!
                  </p>
                  <p className="text-sm text-green-700">
                    Old instructor data has been removed. The supervision page will now load fresh data from the database.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={goToSupervision}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    Go to Supervision Booking
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Hard Refresh Page
                  </Button>
                </div>
              </>
            )}

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What This Does</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="text-purple-600">•</span>
                <span>Removes <code className="bg-gray-100 px-1 rounded">studio-team-members</code> cache</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-600">•</span>
                <span>Removes <code className="bg-gray-100 px-1 rounded">studio-instructors</code> cache</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-600">•</span>
                <span>Removes <code className="bg-gray-100 px-1 rounded">supervisionInstructors</code> cache</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-600">•</span>
                <span>Forces the next page load to fetch fresh data from the production database</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>This page will only be needed once to clear old cached data.</p>
          <p>Future visits will automatically use fresh data from the database.</p>
        </div>
      </div>
    </div>
  )
}

