"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  CreditCard, 
  Calendar,
  BookOpen,
  Users, 
  Settings,
  Plus,
  Link as LinkIcon,
  Package
} from 'lucide-react'

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    color: 'text-blue-600'
  },
  {
    name: 'Features',
    href: '/features',
    icon: BookOpen,
    color: 'text-orange-600'
  },
  {
    name: 'Calendar',
    href: '/booking',
    icon: Calendar,
    color: 'text-purple-600'
  },
  {
    name: 'Clients',
    href: '/clients',
    icon: Users,
    color: 'text-pink-600'
  }
]

export default function MobileNav() {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // Handle scroll visibility with improved logic
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const documentHeight = document.documentElement.scrollHeight
      const windowHeight = window.innerHeight
      const scrollPercentage = (currentScrollY + windowHeight) / documentHeight
      
      // Hide navbar when scrolling down, not at top, and not near bottom
      if (currentScrollY > lastScrollY && currentScrollY > 50 && scrollPercentage < 0.9) {
        setIsVisible(false)
      } 
      // Show navbar when scrolling up, at top, or near bottom
      else if (currentScrollY < lastScrollY || currentScrollY <= 50 || scrollPercentage >= 0.9) {
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    // Add scroll listener
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  if (!isMounted) {
    return null
  }

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isComingSoon = 'comingSoon' in item ? (item as any).comingSoon : false
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 relative ${
                isActive 
                  ? 'bg-lavender/10 text-lavender' 
                  : isComingSoon
                    ? 'text-gray-400 cursor-not-allowed opacity-60'
                    : 'text-gray-600 hover:text-lavender hover:bg-lavender/5'
              }`}
            >
              <Icon 
                className={`w-6 h-6 mb-1 ${isActive ? item.color : isComingSoon ? 'text-gray-400' : ''}`} 
              />
              <span className="text-xs font-medium">{item.name}</span>
              {isComingSoon && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
              )}
            </Link>
          )
        })}
        
        {/* Checkout Button */}
        <Link
          href="/pos"
          className="flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 text-gray-600 hover:text-lavender hover:bg-lavender/5"
        >
          <CreditCard className="w-6 h-6 mb-1 text-lavender" />
          <span className="text-xs font-medium">Checkout</span>
        </Link>
      </div>
    </div>
  )
}
