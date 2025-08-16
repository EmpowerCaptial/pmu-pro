"use client"

import type React from "react"

import { useState } from "react"
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu,
  LogOut,
  Settings,
  User,
  Home,
  Users,
  Camera,
  Palette,
  CreditCard,
  Calendar,
  Heart,
  Briefcase,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <Home className="h-4 w-4" /> },
  { href: "/clients", label: "Clients", icon: <Users className="h-4 w-4" /> },
  { href: "/analyze", label: "Analyze", icon: <Camera className="h-4 w-4" /> },
  { href: "/booking", label: "Booking", icon: <Calendar className="h-4 w-4" /> },
  { href: "/aftercare", label: "Aftercare", icon: <Heart className="h-4 w-4" /> },
  { href: "/library", label: "Pigment Library", icon: <Palette className="h-4 w-4" /> },
  { href: "/billing", label: "Billing", icon: <CreditCard className="h-4 w-4" /> },
]

interface NavBarProps {
  currentPath?: string
  user?: {
    name?: string
    email: string
    initials?: string
  }
}

export function NavBar({ currentPath, user }: NavBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      // Clear any local storage or session data
      localStorage.removeItem("user")
      sessionStorage.clear()

      // Call sign out API if needed
      await fetch("/api/auth/signout", { method: "POST" })

      // Redirect to login page
      router.push("/auth/login")
    } catch (error) {
      console.error("Sign out error:", error)
      // Still redirect even if API call fails
      router.push("/auth/login")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-gradient-to-r from-lavender to-lavender-600 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center">
              <Image
                src="/images/pmu-guide-logo.png"
                alt="PMU Guide Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold font-serif text-white">PMU Pro</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-white/90",
                  currentPath === item.href ? "text-white" : "text-white/70",
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/20 p-0">
                    <Avatar className="h-10 w-10 border-2 border-white/30">
                      <AvatarFallback className="bg-white text-lavender font-semibold text-sm shadow-lg">
                        {user.initials || user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-lavender border-lavender-600" align="end" forceMount>
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

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden text-white hover:bg-white/20">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-80 bg-gradient-to-b from-lavender to-lavender-600 border-lavender-600"
              >
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 text-sm font-medium transition-colors p-2 rounded-md",
                        currentPath === item.href
                          ? "text-white bg-white/20"
                          : "text-white/70 hover:text-white hover:bg-white/10",
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
