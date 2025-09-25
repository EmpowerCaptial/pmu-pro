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
  FileText,
  Bot,
  Target,
  BarChart3,
  Crown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useDemoAuth } from "@/hooks/use-demo-auth"

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <Home className="h-4 w-4" /> },
  { href: "/clients", label: "Clients", icon: <Users className="h-4 w-4" /> },
  { href: "/booking", label: "Booking", icon: <Calendar className="h-4 w-4" /> },
  { href: "/aftercare", label: "Aftercare", icon: <Heart className="h-4 w-4" /> },
  { href: "/pos", label: "POS", icon: <CreditCard className="h-4 w-4" /> },
  { href: "/features", label: "Features", icon: <Crown className="h-4 w-4" /> },
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
  const { logout } = useDemoAuth()

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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-gradient-to-r from-lavender to-lavender-600 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Image
              src="/images/pmu-guide-logo-transparent.png"
              alt="PMU Guide Logo"
              width={128}
              height={128}
              className="object-contain"
            />
            <span className="text-xl font-bold font-serif text-gray-900 hidden sm:block">PMU Pro</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-gray-900",
                  currentPath === item.href ? "text-gray-900 font-semibold" : "text-gray-700",
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
                        {user.initials || user.name?.split(' ').map(n => n[0]).join('') || user.email.charAt(0).toUpperCase()}
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

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden text-white hover:bg-white/20">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-80 bg-white border-lavender-600"
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
                          ? "text-gray-900 bg-lavender/20 font-semibold"
                          : "text-gray-800 hover:text-gray-900 hover:bg-gray-100",
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  <Link
                    href="/standard-documents"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 text-sm font-medium transition-colors p-2 rounded-md text-gray-800 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Standard Documents</span>
                  </Link>
                  <Link
                    href="/ai-settings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 text-sm font-medium transition-colors p-2 rounded-md text-gray-800 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <Bot className="mr-2 h-4 w-4" />
                    <span>AI Assistant</span>
                  </Link>
                  <Link
                    href="/brow-mapping"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 text-sm font-medium transition-colors p-2 rounded-md text-gray-800 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <Target className="mr-2 h-4 w-4" />
                    <span>Brow Mapping Tool</span>
                  </Link>
                  <div className="flex items-center space-x-3 text-sm font-medium p-2 rounded-md text-gray-400 cursor-not-allowed opacity-60">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span>Enhanced CRM</span>
                    <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full ml-auto">Coming Soon</span>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
