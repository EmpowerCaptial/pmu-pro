/**
 * Secure password generation and validation utilities
 */

export function generateSecurePassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  
  // Ensure at least one of each character type
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*'
  
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

export function generateMemorablePassword(): string {
  const adjectives = ['Happy', 'Bright', 'Swift', 'Bold', 'Calm', 'Wise', 'Kind', 'Pure']
  const nouns = ['Star', 'Moon', 'Wave', 'Tree', 'Rock', 'Bird', 'Fish', 'Wind']
  const numbers = Math.floor(Math.random() * 99) + 10
  const symbols = ['!', '@', '#', '$', '%']
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const symbol = symbols[Math.floor(Math.random() * symbols.length)]
  
  return `${adjective}${noun}${numbers}${symbol}`
}

export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  
  if (password.length >= 12 && errors.length === 0) {
    strength = 'strong'
  } else if (password.length >= 8 && errors.length <= 1) {
    strength = 'medium'
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength
  }
}

export function maskPassword(password: string): string {
  if (password.length <= 4) {
    return '*'.repeat(password.length)
  }
  
  return password.substring(0, 2) + '*'.repeat(password.length - 4) + password.substring(password.length - 2)
}
