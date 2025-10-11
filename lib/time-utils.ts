/**
 * Time formatting utilities for consistent 12-hour format across the app
 */

/**
 * Convert 24-hour time string to 12-hour format
 * @param time24 - Time in 24-hour format (e.g., "09:30", "13:00", "16:00")
 * @returns Time in 12-hour format (e.g., "9:30 AM", "1:00 PM", "4:00 PM")
 */
export function formatTo12Hour(time24: string): string {
  if (!time24) return ''
  
  // Handle if already in 12-hour format (has AM/PM)
  if (time24.includes('AM') || time24.includes('PM')) {
    return time24
  }
  
  const [hoursStr, minutesStr] = time24.split(':')
  let hours = parseInt(hoursStr, 10)
  const minutes = minutesStr || '00'
  
  const period = hours >= 12 ? 'PM' : 'AM'
  
  // Convert to 12-hour
  if (hours === 0) {
    hours = 12 // Midnight
  } else if (hours > 12) {
    hours = hours - 12
  }
  
  return `${hours}:${minutes} ${period}`
}

/**
 * Convert Date object to 12-hour time string
 * @param date - Date object
 * @returns Time in 12-hour format (e.g., "9:30 AM")
 */
export function dateToTime12Hour(date: Date): string {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const period = hours >= 12 ? 'PM' : 'AM'
  
  let hours12 = hours % 12
  if (hours12 === 0) hours12 = 12
  
  const minutesStr = minutes.toString().padStart(2, '0')
  
  return `${hours12}:${minutesStr} ${period}`
}

/**
 * Convert 12-hour time to 24-hour format
 * @param time12 - Time in 12-hour format (e.g., "9:30 AM", "1:00 PM")
 * @returns Time in 24-hour format (e.g., "09:30", "13:00")
 */
export function formatTo24Hour(time12: string): string {
  if (!time12) return ''
  
  // Already in 24-hour format
  if (!time12.includes('AM') && !time12.includes('PM')) {
    return time12
  }
  
  const [timePart, period] = time12.split(' ')
  let [hours, minutes] = timePart.split(':')
  let hoursNum = parseInt(hours, 10)
  
  if (period === 'PM' && hoursNum !== 12) {
    hoursNum += 12
  } else if (period === 'AM' && hoursNum === 12) {
    hoursNum = 0
  }
  
  const hoursStr = hoursNum.toString().padStart(2, '0')
  
  return `${hoursStr}:${minutes}`
}

