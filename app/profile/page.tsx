"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/ui/navbar"
import { useDemoAuth } from "@/hooks/use-demo-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Camera, MapPin, Phone, Mail, Calendar, Award } from "lucide-react"

export default function ProfilePage() {
  const { currentUser, isAuthenticated } = useDemoAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [profile, setProfile] = useState({
    name: currentUser?.name || "PMU Artist",
    email: currentUser?.email || "",
    phone: "",
    website: "",
    instagram: "",
    location: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "US"
    },
    bio: "",
    certifications: [],
    experience: "",
    specialties: [],
    studioName: "",
    businessHours: {
      monday: "",
      tuesday: "",
      wednesday: "",
      thursday: "",
      friday: "",
      saturday: "",
      sunday: ""
    }
  })

  // Auto-migrate localStorage data silently
  const autoMigrateData = async () => {
    if (!currentUser?.email) return
    
    try {
      // Check for localStorage data
      const portfolioData = localStorage.getItem(`portfolio_${currentUser.email}`)
      const profileData = localStorage.getItem(`profile_${currentUser.email}`)
      const avatarData = localStorage.getItem(`profile_photo_${currentUser.email}`)
      const clientData = localStorage.getItem('pmu_clients')
      
      const hasData = portfolioData || profileData || avatarData || clientData
      
      if (hasData) {
        // Migrate silently
        const response = await fetch('/api/migrate-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': currentUser.email
          },
          body: JSON.stringify({
            portfolioData: portfolioData ? JSON.parse(portfolioData) : null,
            profileData: profileData ? JSON.parse(profileData) : null,
            avatarData: avatarData,
            clientData: clientData ? JSON.parse(clientData) : null
          })
        })

        if (response.ok) {
          // Clear localStorage after successful migration
          if (portfolioData) localStorage.removeItem(`portfolio_${currentUser.email}`)
          if (profileData) localStorage.removeItem(`profile_${currentUser.email}`)
          if (avatarData) localStorage.removeItem(`profile_photo_${currentUser.email}`)
          if (clientData) localStorage.removeItem('pmu_clients')
          
          console.log('Data migrated successfully')
        }
      }
    } catch (error) {
      console.error('Silent migration failed:', error)
      // Don't show error to user, just log it
    }
  }

  // Load saved profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      if (currentUser?.email) {
        try {
          // Load profile data from API
          const response = await fetch('/api/profile', {
            headers: {
              'x-user-email': currentUser.email
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            const apiProfile = data.profile
            
            setProfile(prev => ({
              ...prev,
              name: apiProfile.name || currentUser.name || prev.name,
              email: apiProfile.email || currentUser.email || prev.email,
              phone: apiProfile.phone || prev.phone,
              website: apiProfile.website || prev.website,
              instagram: apiProfile.instagram || prev.instagram,
              bio: apiProfile.bio || prev.bio,
              studioName: apiProfile.studioName || prev.studioName,
              address: apiProfile.address || prev.address,
              businessHours: apiProfile.businessHours || prev.businessHours,
              specialties: apiProfile.specialties || prev.specialties,
              experience: apiProfile.experience || prev.experience,
              certifications: apiProfile.certifications || prev.certifications
            }))
            
            if (apiProfile.avatar) {
              setProfilePhoto(apiProfile.avatar)
            }
          } else {
            // Fallback to localStorage for existing data
            const savedPhoto = localStorage.getItem(`profile_photo_${currentUser.email}`)
            if (savedPhoto) {
              setProfilePhoto(savedPhoto)
            }

            const savedProfile = localStorage.getItem(`profile_${currentUser.email}`)
            if (savedProfile) {
              const parsedProfile = JSON.parse(savedProfile)
              setProfile(prev => ({
                ...prev,
                ...parsedProfile,
                name: currentUser.name || prev.name,
                email: currentUser.email || prev.email
              }))
            } else {
              setProfile(prev => ({
                ...prev,
                name: currentUser.name || prev.name,
                email: currentUser.email || prev.email
              }))
            }
          }
        } catch (error) {
          console.error('Error loading profile:', error)
          
          // Fallback to localStorage
          const savedPhoto = localStorage.getItem(`profile_photo_${currentUser.email}`)
          if (savedPhoto) {
            setProfilePhoto(savedPhoto)
          }

          const savedProfile = localStorage.getItem(`profile_${currentUser.email}`)
          if (savedProfile) {
            const parsedProfile = JSON.parse(savedProfile)
            setProfile(prev => ({
              ...prev,
              ...parsedProfile,
              name: currentUser.name || prev.name,
              email: currentUser.email || prev.email
            }))
          } else {
            setProfile(prev => ({
              ...prev,
              name: currentUser.name || prev.name,
              email: currentUser.email || prev.email
            }))
          }
        }
      }
    }

    // Auto-migrate first, then load profile
    autoMigrateData().then(() => {
      loadProfile()
    })
  }, [currentUser])

  const handleSave = async () => {
    if (currentUser?.email) {
      try {
        const response = await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': currentUser.email
          },
          body: JSON.stringify({
            bio: profile.bio,
            studioName: profile.studioName,
            website: profile.website,
            instagram: profile.instagram,
            address: profile.address,
            businessHours: profile.businessHours,
            specialties: profile.specialties,
            experience: profile.experience,
            certifications: profile.certifications,
            avatar: profilePhoto
          })
        })

        if (response.ok) {
          // Also save to localStorage as backup
          localStorage.setItem(`profile_${currentUser.email}`, JSON.stringify(profile))
          if (profilePhoto) {
            localStorage.setItem(`profile_photo_${currentUser.email}`, profilePhoto)
          }
          alert("Profile saved successfully!")
        } else {
          throw new Error('Failed to save profile')
        }
      } catch (error) {
        console.error('Error saving profile:', error)
        
        // Fallback to localStorage only
        localStorage.setItem(`profile_${currentUser.email}`, JSON.stringify(profile))
        if (profilePhoto) {
          localStorage.setItem(`profile_photo_${currentUser.email}`, profilePhoto)
        }
        alert("Profile saved locally (connection issue)!")
      }
    }
    setIsEditing(false)
  }

  const handleChangePhoto = async () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file && currentUser?.email) {
        try {
          // Upload to Vercel Blob
          const formData = new FormData()
          formData.append('avatar', file)

          const response = await fetch('/api/avatar/upload', {
            method: 'POST',
            headers: {
              'x-user-email': currentUser.email
            },
            body: formData
          })

          if (response.ok) {
            const data = await response.json()
            setProfilePhoto(data.avatarUrl)
            
            // Also save to localStorage as backup
            localStorage.setItem(`profile_photo_${currentUser.email}`, data.avatarUrl)
            
            // Update the profile in the database with the new avatar URL
            try {
              const profileResponse = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'x-user-email': currentUser.email
                },
                body: JSON.stringify({
                  avatar: data.avatarUrl
                })
              })
              
              if (profileResponse.ok) {
                alert("Profile photo updated successfully!")
              } else {
                alert("Photo uploaded but profile update failed. Please try saving your profile again.")
              }
            } catch (profileError) {
              console.error('Error updating profile with avatar:', profileError)
              alert("Photo uploaded but profile update failed. Please try saving your profile again.")
            }
          } else {
            throw new Error('Upload failed')
          }
        } catch (error) {
          console.error('Error uploading avatar:', error)
          
          // Fallback to localStorage only
          const reader = new FileReader()
          reader.onload = (e) => {
            const imageUrl = e.target?.result as string
            localStorage.setItem(`profile_photo_${currentUser.email}`, imageUrl)
            setProfilePhoto(imageUrl)
            alert("Profile photo updated locally (upload failed)!")
          }
          reader.readAsDataURL(file)
        }
      }
    }
    input.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/20 via-beige/30 to-ivory">
      {/* Background Logo */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <img src="/images/pmu-guide-logo.png" alt="PMU Guide Logo" className="w-96 h-96 opacity-5 object-contain" />
      </div>

      <NavBar 
        currentPath="/profile" 
        user={currentUser ? {
          name: currentUser.name,
          email: currentUser.email,
          initials: currentUser.name?.split(' ').map(n => n[0]).join('') || currentUser.email.charAt(0).toUpperCase(),
          avatar: profilePhoto || undefined
        } : undefined} 
      />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Header */}
          {/* Mobile Layout */}
          <div className="md:hidden text-center mb-6">
            <h1 className="text-2xl font-bold font-serif text-ink mb-2">My Profile</h1>
            <p className="text-sm text-muted-foreground mb-4">Manage your professional information</p>
            <Button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="bg-white/90 backdrop-blur-sm border border-lavender text-lavender hover:bg-lavender hover:text-white font-semibold w-full"
            >
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-serif text-ink">My Profile</h1>
              <p className="text-muted-foreground">Manage your professional information</p>
            </div>
            <Button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="bg-white/90 backdrop-blur-sm border border-lavender text-lavender hover:bg-lavender hover:text-white font-semibold"
            >
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
          </div>

          {/* Profile Card */}
          <Card className="bg-white/90 backdrop-blur-sm border-lavender/20 shadow-lg">
            <CardHeader>
              {/* Mobile Layout */}
              <div className="md:hidden text-center mb-4">
                <Avatar className="h-16 w-16 mx-auto mb-3">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-lavender text-white text-lg">
                      {profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  )}
                </Avatar>
                <CardTitle className="text-xl font-serif text-ink">{profile.name}</CardTitle>
                <CardDescription className="text-base">Professional PMU Artist</CardDescription>
                <div className="flex flex-col items-center space-y-2 mt-3 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.address.street && profile.address.city ? 
                      `${profile.address.street}, ${profile.address.city}, ${profile.address.state}` : 
                      profile.location || "Location not set"
                    }</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{profile.experience} experience</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-lavender text-lavender hover:bg-lavender hover:text-white bg-transparent mt-3 w-full"
                  onClick={handleChangePhoto}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-lavender text-white text-xl">
                      {profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl font-serif text-ink">{profile.name}</CardTitle>
                  <CardDescription className="text-lg">Professional PMU Artist</CardDescription>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.address.street && profile.address.city ? 
                        `${profile.address.street}, ${profile.address.city}, ${profile.address.state}` : 
                        profile.location || "Location not set"
                      }</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{profile.experience} experience</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-lavender text-lavender hover:bg-lavender hover:text-white bg-transparent"
                  onClick={handleChangePhoto}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Studio Information */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Studio Information</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="studioName">Studio Name</Label>
                    {isEditing ? (
                      <Input
                        id="studioName"
                        value={profile.studioName}
                        onChange={(e) => setProfile({ ...profile, studioName: e.target.value })}
                        placeholder="Enter your studio name"
                      />
                    ) : (
                      <span>{profile.studioName || "Not provided"}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Contact Information</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {isEditing ? (
                        <Input
                          id="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        />
                      ) : (
                        <span>{profile.email}</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        />
                      ) : (
                        <span>{profile.phone}</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    {isEditing ? (
                      <Input
                        id="website"
                        value={profile.website}
                        onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                        placeholder="https://yourwebsite.com"
                      />
                    ) : (
                      <span>{profile.website || "Not provided"}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    {isEditing ? (
                      <Input
                        id="instagram"
                        value={profile.instagram}
                        onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                        placeholder="@yourusername"
                      />
                    ) : (
                      <span>{profile.instagram || "Not provided"}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Business Address */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Business Address</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {isEditing ? (
                        <Input
                          id="street"
                          value={profile.address.street}
                          onChange={(e) => setProfile({ 
                            ...profile, 
                            address: { ...profile.address, street: e.target.value }
                          })}
                          placeholder="123 Main Street"
                        />
                      ) : (
                        <span>{profile.address.street || "Not provided"}</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    {isEditing ? (
                      <Input
                        id="city"
                        value={profile.address.city}
                        onChange={(e) => setProfile({ 
                          ...profile, 
                          address: { ...profile.address, city: e.target.value }
                        })}
                        placeholder="Seattle"
                      />
                    ) : (
                      <span>{profile.address.city || "Not provided"}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    {isEditing ? (
                      <Input
                        id="state"
                        value={profile.address.state}
                        onChange={(e) => setProfile({ 
                          ...profile, 
                          address: { ...profile.address, state: e.target.value }
                        })}
                        placeholder="WA"
                      />
                    ) : (
                      <span>{profile.address.state || "Not provided"}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    {isEditing ? (
                      <Input
                        id="zipCode"
                        value={profile.address.zipCode}
                        onChange={(e) => setProfile({ 
                          ...profile, 
                          address: { ...profile.address, zipCode: e.target.value }
                        })}
                        placeholder="98101"
                      />
                    ) : (
                      <span>{profile.address.zipCode || "Not provided"}</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    {isEditing ? (
                      <Input
                        id="country"
                        value={profile.address.country}
                        onChange={(e) => setProfile({ 
                          ...profile, 
                          address: { ...profile.address, country: e.target.value }
                        })}
                        placeholder="US"
                      />
                    ) : (
                      <span>{profile.address.country || "US"}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={3}
                    placeholder="Tell clients about your experience, specialties, and what makes you unique..."
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{profile.bio || "No bio provided yet"}</p>
                )}
              </div>

              {/* Business Hours */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Business Hours</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'monday', label: 'Monday' },
                    { key: 'tuesday', label: 'Tuesday' },
                    { key: 'wednesday', label: 'Wednesday' },
                    { key: 'thursday', label: 'Thursday' },
                    { key: 'friday', label: 'Friday' },
                    { key: 'saturday', label: 'Saturday' },
                    { key: 'sunday', label: 'Sunday' }
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>{label}</Label>
                      {isEditing ? (
                        <Input
                          id={key}
                          value={profile.businessHours[key as keyof typeof profile.businessHours]}
                          onChange={(e) => setProfile({ 
                            ...profile, 
                            businessHours: { ...profile.businessHours, [key]: e.target.value }
                          })}
                          placeholder="9:00 AM - 6:00 PM"
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {profile.businessHours[key as keyof typeof profile.businessHours] || "Closed"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Specialties */}
              <div className="space-y-2">
                <Label>Specialties</Label>
                <div className="flex flex-wrap gap-2">
                  {profile.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="bg-lavender/20 text-lavender">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-2">
                <Label>Certifications</Label>
                <div className="space-y-2">
                  {profile.certifications.map((cert) => (
                    <div key={cert} className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-lavender" />
                      <span className="text-sm">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
