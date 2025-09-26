"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Lock, CheckCircle, Eye, EyeOff } from "lucide-react"

export function SetupPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [pendingUser, setPendingUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Get pending user data from localStorage
    const stored = localStorage.getItem('pendingUser')
    if (stored) {
      setPendingUser(JSON.parse(stored))
    } else {
      // No pending user, redirect to login
      router.push('/auth/login')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")
    setIsSuccess(false)

    if (!pendingUser) {
      setMessage("No pending user found. Please try signing up again.")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters long.")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/setup-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: pendingUser.email,
          newPassword: password 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        setMessage("Password set successfully! Redirecting to dashboard...")
        
        // Clear pending user data
        localStorage.removeItem('pendingUser')
        
        // Create user session
        const tempUser = {
          id: pendingUser.id,
          name: pendingUser.name,
          email: pendingUser.email,
          role: 'artist',
          isRealAccount: true,
          subscription: 'trial',
          features: ['all']
        }

        localStorage.setItem('demoUser', JSON.stringify(tempUser))
        localStorage.setItem('userType', 'production')

        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        setIsSuccess(false)
        setMessage(data.error || "Failed to set password. Please try again.")
      }
    } catch (error) {
      setIsSuccess(false)
      setMessage("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!pendingUser) {
    return (
      <Card className="border-border shadow-lg">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-lavender mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold text-center">Setup Password</CardTitle>
        <CardDescription className="text-center">
          Create a secure password for {pendingUser.email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-background pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-background pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {message && (
            <Alert className={isSuccess ? "border-primary bg-primary/5" : "border-destructive bg-destructive/5"}>
              {isSuccess ? <CheckCircle className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              <AlertTitle>{isSuccess ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-lavender hover:bg-lavender-600 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            disabled={isLoading || !password || !confirmPassword || password.length < 8 || password !== confirmPassword}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting Password...
              </>
            ) : (
              "Set Password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
