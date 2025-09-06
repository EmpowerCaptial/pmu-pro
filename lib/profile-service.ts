// Profile service for managing artist profile data
export interface ArtistProfile {
  name: string
  email: string
  phone: string
  location: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  bio: string
  certifications: string[]
  experience: string
  specialties: string[]
}

export class ProfileService {
  private static readonly PROFILE_KEY_PREFIX = 'profile_'
  
  /**
   * Get artist profile by email
   */
  static getProfile(email: string): ArtistProfile | null {
    if (typeof window === 'undefined') return null
    
    try {
      const savedProfile = localStorage.getItem(`${this.PROFILE_KEY_PREFIX}${email}`)
      if (savedProfile) {
        return JSON.parse(savedProfile)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
    
    return null
  }
  
  /**
   * Save artist profile
   */
  static saveProfile(email: string, profile: ArtistProfile): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(`${this.PROFILE_KEY_PREFIX}${email}`, JSON.stringify(profile))
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }
  
  /**
   * Get artist address for Stripe checkout
   */
  static getArtistAddress(email: string): {
    line1: string
    city: string
    state: string
    postal_code: string
    country: string
  } | null {
    const profile = this.getProfile(email)
    
    if (!profile || !profile.address.street || !profile.address.city) {
      return null
    }
    
    return {
      line1: profile.address.street,
      city: profile.address.city,
      state: profile.address.state,
      postal_code: profile.address.zipCode,
      country: profile.address.country || 'US'
    }
  }
  
  /**
   * Check if artist has complete address
   */
  static hasCompleteAddress(email: string): boolean {
    const address = this.getArtistAddress(email)
    return !!(address && address.line1 && address.city && address.state && address.postal_code)
  }
}


