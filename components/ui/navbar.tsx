"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LogOut,
  Settings,
  User,
  Briefcase,
  FileText,
  Bot,
  Target,
  BarChart3,
  Crown,
  Package,
  Bell,
} from "lucide-react"
import { useDemoAuth } from "@/hooks/use-demo-auth"


interface NavBarProps {
  currentPath?: string
  user?: {
    name?: string
    email: string
    initials?: string
    avatar?: string
  }
}

export function NavBar({ currentPath, user }: NavBarProps) {
  const router = useRouter()
  const { logout, currentUser } = useDemoAuth()
  const [pendingFormsCount, setPendingFormsCount] = useState(0)
  const [notificationsCount, setNotificationsCount] = useState(0)

  // Load pending consent forms count
  useEffect(() => {
    const loadPendingCount = () => {
      try {
        const stored = localStorage.getItem("consent-forms")
        if (stored) {
          const forms = JSON.parse(stored)
          const pendingCount = forms.filter((form: any) => form.status === 'sent').length
          setPendingFormsCount(pendingCount)
        }
      } catch (error) {
        console.error("Error loading pending forms count:", error)
      }
    }

    loadPendingCount()
    
    // Check for updates every 30 seconds
    const interval = setInterval(loadPendingCount, 30000)
    return () => clearInterval(interval)
  }, [])

  // Load notifications count
  useEffect(() => {
    const loadNotificationsCount = async () => {
      if (currentUser?.email && typeof window !== 'undefined') {
        try {
          const response = await fetch('/api/notifications', {
            headers: {
              'x-user-email': currentUser.email
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            const unreadCount = (data.notifications || []).filter((n: any) => !n.isRead).length
            setNotificationsCount(unreadCount)
          }
        } catch (error) {
          console.error('Error loading notifications count:', error)
        }
      }
    }

    loadNotificationsCount()
    
    // Update count every 30 seconds
    const interval = setInterval(loadNotificationsCount, 30000)
    return () => clearInterval(interval)
  }, [currentUser?.email])

  const handleSignOut = async () => {
    try {
      // Use demo auth logout
      logout()
      
      // Redirect to login page
      router.push("/auth/login")
    } catch (error) {
      console.error("Sign out error:", error)
      // Still redirect even if API call fails
      router.push("/auth/login")
    }
  }



  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-lavender shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3">
            <Image
              src="/images/nobglotus.png"
              alt="PMU Guide Logo"
              width={48}
              height={48}
              className="object-contain"
            />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white tracking-wide leading-tight" 
                    style={{ 
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      fontWeight: '700',
                      letterSpacing: '0.5px',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                PMU GUIDE
              </span>
              <span className="text-xs text-white/80 font-medium tracking-wider uppercase hidden sm:block">
                Professional Management
              </span>
            </div>
          </Link>


          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/products">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 bg-transparent"
              >
                <Package className="mr-2 h-4 w-4" />
                Products
              </Button>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-10 w-10 rounded-full hover:bg-white/20 p-0 cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <Avatar className="h-10 w-10 border-2 border-white/30 pointer-events-none">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <AvatarFallback className="bg-white text-lavender font-semibold text-sm shadow-lg">
                          {user.initials || user.name?.split(' ').map(n => n[0]).join('') || user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-56 bg-lavender border-lavender-600 z-[60] shadow-lg" 
                  align="end"
                  style={{ 
                    zIndex: 9999,
                    position: 'fixed',
                    backgroundColor: '#8B5CF6',
                    border: '1px solid #7C3AED',
                    borderRadius: '8px',
                    padding: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-white">{user.name || "PMU Artist"}</p>
                      <p className="text-xs leading-none text-white/70">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem asChild className="text-white hover:bg-white/20">
                    <Link href="/portfolio" className="cursor-pointer">
                      <Briefcase className="mr-2 h-4 w-4" />
                      <span>Portfolio</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-white hover:bg-white/20">
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-white hover:bg-white/20">
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-white hover:bg-white/20">
                    <Link href="/consent-forms" className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Consent Forms</span>
                      {pendingFormsCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                          {pendingFormsCount > 9 ? '9+' : pendingFormsCount}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-white hover:bg-white/20">
                    <Link href="/dashboard" className="cursor-pointer">
                      <Bell className="mr-2 h-4 w-4" />
                      <span>Notifications</span>
                      {notificationsCount > 0 && (
                        <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                          {notificationsCount > 9 ? '9+' : notificationsCount}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-white hover:bg-white/20">
                    <Link href="/standard-documents" className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Standard Documents</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-white hover:bg-white/20">
                    <Link href="/ai-settings" className="cursor-pointer">
                      <Bot className="mr-2 h-4 w-4" />
                      <span>AI Assistant</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-white hover:bg-white/20">
                    <Link href="/brow-mapping" className="cursor-pointer">
                      <Target className="mr-2 h-4 w-4" />
                      <span>Brow Mapping Tool</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-white hover:bg-white/20">
                    <Link href="/pricing" className="cursor-pointer">
                      <Crown className="mr-2 h-4 w-4" />
                      <span>Upgrade Plan</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white/50 cursor-not-allowed opacity-50">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span>Enhanced CRM</span>
                    <span className="ml-auto text-xs text-white/40">Coming Soon</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-white hover:bg-white/20">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/30 text-white hover:bg-white/20 bg-transparent"
                >
                  Sign In
                </Button>
              </Link>
            )}

          </div>
        </div>
      </div>
    </header>
  )
}
