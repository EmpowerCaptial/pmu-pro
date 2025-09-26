"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useDemoAuth } from "@/hooks/use-demo-auth"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const { login, isLoading: authLoading } = useDemoAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      const result = await login(email, password)
      setIsSuccess(true)
      setMessage("Login successful! Redirecting to dashboard...")
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (error) {
      setMessage("Invalid email or password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestAccess = () => {
    router.push("/artist-signup")
  }

  return (
    <Card className="border-border shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold text-center">Welcome back</CardTitle>
        <CardDescription className="text-center">Sign in to your PMU Pro account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
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

          {message && (
            <Alert className={isSuccess ? "border-primary bg-primary/5" : "border-destructive bg-destructive/5"}>
              {isSuccess ? <Mail className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full bg-lavender hover:bg-lavender-600 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
            disabled={isLoading || authLoading || !email || !password}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          <div className="text-center space-y-2">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-muted-foreground hover:text-primary underline"
            >
              Forgot your password?
            </Link>
            <div>
              <Button
                type="button"
                variant="link"
                onClick={handleRequestAccess}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Don't have an account? Request access
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
