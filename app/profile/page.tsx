"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Award, 
  Camera,
  Save,
  Edit
} from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { NavBar } from '@/components/ui/navbar'
import { ProfileImageUpload } from '@/components/profile/profile-image-upload'

export default function ProfilePage() {
  const { currentUser, isLoading } = useDemoAuth()
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    studioName: '',
    address: '',
    bio: '',
    specialties: '',
    certifications: '',
    avatar: '',
    website: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    twitter: '',
    youtube: '',
    businessHours: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: (currentUser as any)?.phone || '',
        businessName: (currentUser as any)?.businessName || '',
        studioName: (currentUser as any)?.studioName || '',
        address: (currentUser as any)?.address || '',
        bio: (currentUser as any)?.bio || '',
        specialties: (currentUser as any)?.specialties || '',
        certifications: (currentUser as any)?.certifications || '',
        avatar: (currentUser as any)?.avatar || '',
        website: (currentUser as any)?.website || '',
        instagram: (currentUser as any)?.instagram || '',
        facebook: (currentUser as any)?.facebook || '',
        tiktok: (currentUser as any)?.tiktok || '',
        twitter: (currentUser as any)?.twitter || '',
        youtube: (currentUser as any)?.youtube || '',
        businessHours: (currentUser as any)?.businessHours || ''
      })
    }
  }, [currentUser])

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/profile/upload-image', {
          method: 'POST',
          headers: {
          'x-user-email': currentUser?.email || ''
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const result = await response.json()
      setProfileData(prev => ({ ...prev, avatar: result.imageUrl }))
      
      // Update currentUser in localStorage or trigger a refresh
      if (typeof window !== 'undefined') {
        const updatedUser = { ...currentUser, avatar: result.imageUrl }
        localStorage.setItem('demoUser', JSON.stringify(updatedUser))
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({
          name: profileData.name,
          phone: profileData.phone,
          businessName: profileData.businessName,
          studioName: profileData.studioName,
          address: profileData.address,
          bio: profileData.bio,
          specialties: profileData.specialties,
          certifications: profileData.certifications,
          avatar: profileData.avatar,
          website: profileData.website,
          instagram: profileData.instagram,
          facebook: profileData.facebook,
          tiktok: profileData.tiktok,
          twitter: profileData.twitter,
          youtube: profileData.youtube,
          businessHours: profileData.businessHours
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save profile')
      }

      const result = await response.json()
      
        // Update localStorage with the saved data (use same key as auth hook)
        if (typeof window !== 'undefined' && currentUser) {
          const updatedUser = {
            ...currentUser,
            name: profileData.name,
            phone: profileData.phone,
            businessName: profileData.businessName,
            studioName: profileData.studioName,
            address: profileData.address,
            bio: profileData.bio,
            specialties: profileData.specialties,
            certifications: profileData.certifications,
            avatar: profileData.avatar
          }
          localStorage.setItem('demoUser', JSON.stringify(updatedUser))
        }
      
      setSaveSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300">Studio Owner</Badge>
      case 'instructor':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Instructor</Badge>
      case 'licensed':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Licensed Artist</Badge>
      case 'student':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">Student</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-lavender-600/5">
        <NavBar user={currentUser ? {
          name: currentUser.name,
          email: currentUser.email,
          avatar: (currentUser as any).avatar
        } : undefined} />
        <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lavender mx-auto mb-4"></div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Check if user is authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-lavender-600/5">
        <NavBar 
          currentPath="/profile"
          user={undefined} 
        />
        <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
              <p className="text-gray-600 mb-6">Please sign in to access your profile settings.</p>
              <button 
                onClick={() => window.location.href = '/auth/login'}
                className="bg-lavender hover:bg-lavender-600 text-white px-6 py-2 rounded-lg font-medium"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-lavender-600/5">
      <NavBar user={currentUser ? {
        name: currentUser.name,
        email: currentUser.email,
        avatar: (currentUser as any).avatar
      } : undefined} />
      
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
          {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600 mt-2">Manage your profile information and preferences</p>
            </div>
            <div className="flex items-center space-x-3">
              {getRoleBadge(currentUser?.role || 'artist')}
            <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
              >
                {isEditing ? (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </>
                )}
                </Button>
              </div>
                    </div>
                  </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image */}
          <div className="lg:col-span-1">
            <ProfileImageUpload
              onImageUpload={handleImageUpload}
              currentImageUrl={profileData.avatar}
              userName={profileData.name}
              disabled={!isEditing}
            />
                </div>

          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-violet-600" />
                  <span>Basic Information</span>
                </CardTitle>
                <CardDescription>
                  Your personal and contact information
                </CardDescription>
            </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                      <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-gray-50"
                    />
                </div>
              </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                        />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                      <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-violet-600" />
                  <span>Business Information</span>
                </CardTitle>
                <CardDescription>
                  Your business and studio details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                        <Input
                      id="businessName"
                      value={profileData.businessName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, businessName: e.target.value }))}
                      disabled={!isEditing}
                    />
                    <p className="text-xs text-gray-500 mt-1">Your personal or business branding name</p>
                  </div>
                  <div>
                    <Label htmlFor="studioName">Studio Name</Label>
                      <Input
                      id="studioName"
                      value={profileData.studioName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, studioName: e.target.value }))}
                      disabled={!isEditing || ['instructor', 'student', 'licensed'].includes(currentUser?.role || '')}
                      className={['instructor', 'student', 'licensed'].includes(currentUser?.role || '') ? 'bg-gray-50' : ''}
                    />
                    {['instructor', 'student', 'licensed'].includes(currentUser?.role || '') && (
                      <p className="text-xs text-amber-600 mt-1">
                        ⚠️ Studio name is managed by your studio owner and cannot be changed
                      </p>
                    )}
                    {!['instructor', 'student', 'licensed'].includes(currentUser?.role || '') && (
                      <p className="text-xs text-gray-500 mt-1">The studio your team members will be linked to</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-violet-600" />
                  <span>Professional Information</span>
                </CardTitle>
                <CardDescription>
                  Your specialties, certifications, and bio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:bg-gray-50"
                    placeholder="Tell us about yourself..."
                  />
              </div>

                <div>
                  <Label htmlFor="specialties">Specialties</Label>
                        <Input
                    id="specialties"
                    value={profileData.specialties}
                    onChange={(e) => setProfileData(prev => ({ ...prev, specialties: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="e.g., Microblading, Powder Brows, Lip Blush"
                  />
              </div>

                <div>
                  <Label htmlFor="certifications">Certifications</Label>
                  <Input
                    id="certifications"
                    value={profileData.certifications}
                    onChange={(e) => setProfileData(prev => ({ ...prev, certifications: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="e.g., Certified PMU Artist, Licensed Esthetician"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Media & Online Presence */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="h-5 w-5 text-violet-600" />
                  <span>Social Media & Online Presence</span>
                </CardTitle>
                <CardDescription>
                  Your website and social media handles (shown on your public booking page)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={profileData.instagram}
                      onChange={(e) => setProfileData(prev => ({ ...prev, instagram: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="@yourusername"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={profileData.facebook}
                      onChange={(e) => setProfileData(prev => ({ ...prev, facebook: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="facebook.com/yourpage"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tiktok">TikTok</Label>
                    <Input
                      id="tiktok"
                      value={profileData.tiktok}
                      onChange={(e) => setProfileData(prev => ({ ...prev, tiktok: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="@yourusername"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="twitter">Twitter/X</Label>
                    <Input
                      id="twitter"
                      value={profileData.twitter}
                      onChange={(e) => setProfileData(prev => ({ ...prev, twitter: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="@yourusername"
                    />
                  </div>
                  <div>
                    <Label htmlFor="youtube">YouTube</Label>
                    <Input
                      id="youtube"
                      value={profileData.youtube}
                      onChange={(e) => setProfileData(prev => ({ ...prev, youtube: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="youtube.com/@yourchannel"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-violet-600" />
                  <span>Business Hours</span>
                </CardTitle>
                <CardDescription>
                  Your operating hours (shown on your public booking page)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="businessHours">Business Hours</Label>
                  <textarea
                    id="businessHours"
                    value={profileData.businessHours}
                    onChange={(e) => setProfileData(prev => ({ ...prev, businessHours: e.target.value }))}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:bg-gray-50"
                    placeholder="Mon-Fri: 9:00 AM - 6:00 PM&#10;Saturday: 10:00 AM - 4:00 PM&#10;Sunday: Closed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter your business hours (one day per line)</p>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            {isEditing && (
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <Save className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Save className="h-4 w-4 mr-2 text-green-500" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
              </div>
        </div>
      </div>
    </div>
  )
}