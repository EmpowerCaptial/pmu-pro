"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Upload, X, Check } from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'

interface ProfileImageUploadProps {
  onImageUpload: (file: File) => void
  currentImageUrl?: string
  userName?: string
  disabled?: boolean
}

export function ProfileImageUpload({ 
  onImageUpload, 
  currentImageUrl, 
  userName = 'User',
  disabled = false 
}: ProfileImageUploadProps) {
  const { currentUser } = useDemoAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setIsUploading(true)
    setUploadSuccess(false)

    try {
      // Create preview URL
      const preview = URL.createObjectURL(file)
      setPreviewUrl(preview)

      // Upload the file
      await onImageUpload(file)
      
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 2000)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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

  const displayImageUrl = previewUrl || currentImageUrl

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">Profile Picture</CardTitle>
        <CardDescription>
          Upload a professional photo for your instructor profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar Display */}
        <div className="flex justify-center">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-gray-200">
              <AvatarImage 
                src={displayImageUrl} 
                alt={`${userName} profile`}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-xl font-semibold">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            
            {/* Upload Success Indicator */}
            {uploadSuccess && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>

        {/* Upload Controls */}
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isUploading}
          />
          
          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="flex-1"
              variant="outline"
            >
              {isUploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Choose Photo
                </>
              )}
            </Button>
            
            {displayImageUrl && (
              <Button
                onClick={handleRemoveImage}
                disabled={disabled || isUploading}
                variant="outline"
                size="icon"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Image Guidelines */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Recommended: Square image, 400x400px or larger</p>
          <p>• Max file size: 5MB</p>
          <p>• Supported formats: JPG, PNG, WebP</p>
          <p>• Professional headshot recommended</p>
        </div>
      </CardContent>
    </Card>
  )
}
