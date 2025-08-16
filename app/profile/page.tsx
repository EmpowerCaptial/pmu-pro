"use client"

import { useState } from "react"
import { NavBar } from "@/components/ui/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Camera, MapPin, Phone, Mail, Calendar, Award } from "lucide-react"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "Sarah Johnson",
    email: "sarah@pmuartist.com",
    phone: "(555) 123-4567",
    location: "Los Angeles, CA",
    bio: "Certified PMU artist with 5+ years of experience specializing in natural-looking eyebrows, lip blush, and eyeliner enhancement.",
    certifications: ["PMU Certification", "Microblading License", "Lip Blush Specialist"],
    experience: "5 years",
    specialties: ["Eyebrows", "Lips", "Eyeliner"],
  })

  const handleSave = () => {
    // Save profile logic here
    setIsEditing(false)
  }

  const handleChangePhoto = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string
          // In a real app, you'd upload to a server
          localStorage.setItem("profile_photo", imageUrl)
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

      <NavBar currentPath="/profile" user={{ name: profile.name, email: profile.email, initials: "SJ" }} />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
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
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-lavender text-white text-xl">
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl font-serif text-ink">{profile.name}</CardTitle>
                  <CardDescription className="text-lg">Professional PMU Artist</CardDescription>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
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
              {/* Contact Information */}
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
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{profile.bio}</p>
                )}
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
