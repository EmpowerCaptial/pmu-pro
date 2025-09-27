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

  // Load saved profile data on component mount
  useEffect(() => {
    if (currentUser) {
      // Load profile photo
      const savedPhoto = localStorage.getItem(`profile_photo_${currentUser.email}`)
      if (savedPhoto) {
        setProfilePhoto(savedPhoto)
      }

      // Load profile data
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
        // Initialize with current user data
        setProfile(prev => ({
          ...prev,
          name: currentUser.name || prev.name,
          email: currentUser.email || prev.email
        }))
      }
    }
  }, [currentUser])

  const handleSave = () => {
    if (currentUser) {
      // Save profile to localStorage with user-specific key
      localStorage.setItem(`profile_${currentUser.email}`, JSON.stringify(profile))
      alert("Profile saved successfully!")
    }
    setIsEditing(false)
  }

  const handleChangePhoto = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file && currentUser) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string
          // Save photo with user-specific key
          localStorage.setItem(`profile_photo_${currentUser.email}`, imageUrl)
          setProfilePhoto(imageUrl)
          alert("Profile photo updated successfully!")
        }
        reader.readAsDataURL(file)
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
