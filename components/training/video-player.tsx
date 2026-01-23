"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VideoPlayerProps {
  url: string
  title: string
  open: boolean
  onClose: () => void
}

// Convert various video URLs to embed URLs
function getEmbedUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    
    // YouTube
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
      let videoId = ''
      
      if (urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.slice(1)
      } else if (urlObj.searchParams.has('v')) {
        videoId = urlObj.searchParams.get('v') || ''
      }
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }
    }
    
    // Vimeo
    if (urlObj.hostname.includes('vimeo.com')) {
      const videoId = urlObj.pathname.split('/').filter(Boolean).pop()
      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`
      }
    }
    
    // If we can't convert it, return the original URL (might work as iframe src)
    return url
  } catch {
    // If URL parsing fails, return original
    return url
  }
}

export function VideoPlayer({ url, title, open, onClose }: VideoPlayerProps) {
  const embedUrl = getEmbedUrl(url)
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

