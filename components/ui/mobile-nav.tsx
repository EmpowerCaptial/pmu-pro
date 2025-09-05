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
  Plus
} from 'lucide-react'

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    color: 'text-blue-600'
  },
  {
    name: 'Checkout',
    href: '/billing',
    icon: CreditCard,
    color: 'text-green-600'
  },
  {
    name: 'Calendar',
    href: '/booking',
    icon: Calendar,
    color: 'text-purple-600'
  },
  {
    name: 'Services',
    href: '/services',
    icon: BookOpen,
    color: 'text-orange-600'
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
    
    // Handle scroll visibility
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false)
      } else {
        // Scrolling up
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
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-lavender/10 text-lavender' 
                  : 'text-gray-600 hover:text-lavender hover:bg-lavender/5'
              }`}
            >
              <Icon 
                className={`w-6 h-6 mb-1 ${isActive ? item.color : ''}`} 
              />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
        
        {/* Add Service Button */}
        <Link
          href="/services/new"
          className="flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 text-gray-600 hover:text-lavender hover:bg-lavender/5"
        >
          <div className="w-6 h-6 mb-1 rounded-full bg-lavender/20 flex items-center justify-center">
            <Plus className="w-4 h-4 text-lavender" />
          </div>
          <span className="text-xs font-medium">Add</span>
        </Link>
      </div>
    </div>
  )
}
