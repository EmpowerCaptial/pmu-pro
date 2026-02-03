"use client"

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { useClockInOut } from '@/hooks/use-clock-in-out'

interface ClockIndicatorProps {
  className?: string
}

export function ClockIndicator({ className = "" }: ClockIndicatorProps) {
  const { clockStatus, isStudent, isLocationLoading, clockIn, clockOut } = useClockInOut()
  const [showTooltip, setShowTooltip] = useState(false)

  // Don't show for non-students
  if (!isStudent) {
    return null
  }

  const handleClick = async () => {
    if (isLocationLoading) return

    if (clockStatus.isClockedIn) {
      const result = await clockOut()
      if (result.success) {
        alert(result.message)
      } else {
        alert(`Error: ${result.message}`)
      }
    } else {
      const result = await clockIn()
      if (result.success) {
        alert(result.message)
      } else {
        alert(`Error: ${result.message}`)
      }
    }
  }

  const getClockColor = () => {
    if (isLocationLoading) return 'text-gray-400'
    return clockStatus.isClockedIn ? 'text-lavender' : 'text-red-500'
  }

  const getTooltipText = () => {
    if (isLocationLoading) return 'Checking location...'
    if (clockStatus.isClockedIn) {
      const clockInTime = clockStatus.clockInTime 
        ? new Date(clockStatus.clockInTime).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })
        : 'Unknown'
      return `Clocked in since ${clockInTime}\nClick to clock out`
    }
    return 'Click to clock in'
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleClick}
        disabled={isLocationLoading}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200 hover:scale-110 disabled:cursor-not-allowed"
        title={getTooltipText()}
      >
        <Clock 
          className={`w-4 h-4 ${getClockColor()} ${isLocationLoading ? 'animate-pulse' : ''}`}
        />
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-8 right-0 z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-pre-line shadow-lg">
          {getTooltipText()}
          <div className="absolute -top-1 right-3 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}

      {/* Status indicator dot */}
      <div 
        className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
          clockStatus.isClockedIn ? 'bg-lavender animate-pulse' : 'bg-red-500'
        }`}
      />
    </div>
  )
}
