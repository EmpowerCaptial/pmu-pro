"use client"

import { useRouter } from "next/navigation"
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
import { LogOut, Settings, User, Target } from "lucide-react"
import Link from "next/link"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { useDemoAuth } from "@/hooks/use-demo-auth"

export function DashboardHeader() {
  const router = useRouter()
  const { currentUser } = useDemoAuth()

  const handleSignOut = async () => {
    try {
      localStorage.removeItem("user")
      sessionStorage.clear()
      await fetch("/api/auth/signout", { method: "POST" })
      router.push("/auth/login")
    } catch (error) {
      console.error("Sign out error:", error)
      router.push("/auth/login")
    }
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-foreground font-serif">PMU Pro</h1>
            <nav className="hidden md:flex space-x-6">
              <Button variant="ghost" size="sm" onClick={() => handleNavigation("/dashboard")}>
                Dashboard
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleNavigation("/clients")}>
                Clients
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleNavigation("/library")}>
                Library
              </Button>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {currentUser?.name?.split(' ').map(n => n[0]).join('') || currentUser?.email?.charAt(0).toUpperCase() || 'PA'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {currentUser?.name || 'PMU Artist'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser?.email || 'artist@example.com'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/brow-mapping" className="cursor-pointer">
                    <Target className="mr-2 h-4 w-4" />
                    <span>Brow Mapping Tool</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
