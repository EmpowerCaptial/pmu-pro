"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useRef } from "react"

interface BlogPost {
  id: string
  title: string
  image: string
  link: string
  category: string
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Perfect Eyebrow Shape Guide",
    image: "/images/blog/eyebrow-shape.jpg",
    link: "/blog/perfect-eyebrow-shape-guide",
    category: "Eyebrows"
  },
  {
    id: "2", 
    title: "Lip Blush Aftercare Tips",
    image: "/images/blog/lip-blush-aftercare.jpg",
    link: "/blog/lip-blush-aftercare-tips",
    category: "Lips"
  },
  {
    id: "3",
    title: "Pigment Color Matching",
    image: "/images/blog/pigment-matching.jpg", 
    link: "/blog/pigment-color-matching",
    category: "Techniques"
  },
  {
    id: "4",
    title: "Client Consultation Process",
    image: "/images/blog/consultation-process.jpg",
    link: "/blog/client-consultation-process", 
    category: "Business"
  },
  {
    id: "5",
    title: "PMU Healing Timeline",
    image: "/images/blog/healing-timeline.jpg",
    link: "/blog/pmu-healing-timeline",
    category: "Aftercare"
  },
  {
    id: "6",
    title: "Studio Setup Essentials",
    image: "/images/blog/studio-setup.jpg",
    link: "/blog/studio-setup-essentials",
    category: "Business"
  }
]

export function BlogSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280 // Width of one card + gap
      const newScrollLeft = direction === 'left' 
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount
      
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
      
      setTimeout(checkScrollButtons, 300)
    }
  }

  const handleScroll = () => {
    checkScrollButtons()
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">PMU Blog & Resources</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable Blog Cards */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {blogPosts.map((post) => (
          <Card 
            key={post.id}
            className="flex-shrink-0 w-64 cursor-pointer hover:shadow-md transition-shadow duration-200 group"
            onClick={() => window.open(post.link, '_blank')}
          >
            <CardContent className="p-0">
              {/* Image */}
              <div className="relative h-32 bg-gray-100 rounded-t-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-lavender/20 to-purple/20 flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <div className="w-12 h-12 bg-gray-300 rounded-lg mx-auto mb-2"></div>
                    <p className="text-xs">Blog Image</p>
                  </div>
                </div>
                {/* Category Badge */}
                <div className="absolute top-2 left-2">
                  <span className="bg-white/90 backdrop-blur-sm text-xs px-2 py-1 rounded-full font-medium text-gray-700">
                    {post.category}
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-lavender transition-colors">
                  {post.title}
                </h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">Read More</span>
                  <div className="w-4 h-4 bg-lavender/20 rounded-full flex items-center justify-center group-hover:bg-lavender/30 transition-colors">
                    <ChevronRight className="h-3 w-3 text-lavender" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
