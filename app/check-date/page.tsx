'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CheckDatePage() {
  const [dates, setDates] = useState<any>({})

  useEffect(() => {
    const now = new Date()
    setDates({
      isoString: now.toISOString(),
      localeDateString: now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      }),
      month: now.getMonth() + 1, // +1 because getMonth() returns 0-11
      day: now.getDate(),
      year: now.getFullYear(),
      time: now.toLocaleTimeString(),
      timestamp: now.getTime()
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">🗓️ System Date Check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Current System Date:</h3>
              <div className="text-lg font-bold text-blue-800">
                {dates.localeDateString}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-600">Year</p>
                <p className="text-2xl font-bold text-gray-900">{dates.year}</p>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-600">Month</p>
                <p className="text-2xl font-bold text-gray-900">{dates.month}</p>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-600">Day</p>
                <p className="text-2xl font-bold text-gray-900">{dates.day}</p>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-600">Time</p>
                <p className="text-lg font-semibold text-gray-900">{dates.time}</p>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">ISO String:</h3>
              <code className="text-xs text-purple-800 break-all">{dates.isoString}</code>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Expected:</h3>
              <p className="text-lg font-bold text-green-800">
                Thursday, October 10, 2025
              </p>
            </div>

            {dates.year !== 2025 || dates.month !== 10 || dates.day !== 10 ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">⚠️ DATE MISMATCH!</h3>
                <p className="text-sm text-red-700">
                  The system date doesn't match the expected date (October 10, 2025).
                  This will cause issues with bookings and calendars.
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">✅ Date is Correct!</h3>
                <p className="text-sm text-green-700">
                  The system date matches the expected date.
                </p>
              </div>
            )}

            <Button 
              onClick={() => window.location.reload()} 
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Refresh Check
            </Button>

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calendar Test</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="block mb-2 text-sm font-medium">
              Date Input (should default to today):
            </label>
            <input 
              type="date" 
              className="border rounded px-3 py-2 w-full"
              defaultValue={new Date().toISOString().split('T')[0]}
            />
            
            <p className="text-xs text-gray-500 mt-2">
              Default value: {new Date().toISOString().split('T')[0]}
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

