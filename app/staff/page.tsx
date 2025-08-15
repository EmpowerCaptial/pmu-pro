"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield } from "lucide-react"
import Image from "next/image"

export default function StaffLoginPage() {
  const [credentials, setCredentials] = useState({ email: "", password: "", role: "" })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate authentication
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Redirect based on role
      switch (credentials.role) {
        case "developer":
          router.push("/staff/developer")
          break
        case "manager":
          router.push("/staff/manager")
          break
        case "representative":
          router.push("/staff/representative")
          break
        default:
          router.push("/staff/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-beige to-lavender/20 flex items-center justify-center p-4">
      {/* Background logo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <Image
          src="/images/pmu-guide-logo.png"
          alt="PMU Guide Background"
          width={600}
          height={600}
          className="object-contain"
        />
      </div>

      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-lavender/20 shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-lavender/10 rounded-full">
              <Shield className="h-8 w-8 text-lavender" />
            </div>
          </div>
          <CardTitle className="text-2xl font-serif text-lavender">Staff Access</CardTitle>
          <CardDescription>Secure login for PMU Pro staff members</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials((prev) => ({ ...prev, email: e.target.value }))}
                className="border-lavender/30 focus:border-lavender"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                className="border-lavender/30 focus:border-lavender"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Access Level</Label>
              <Select
                value={credentials.role}
                onValueChange={(value) => setCredentials((prev) => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="border-lavender/30 focus:border-lavender">
                  <SelectValue placeholder="Select your access level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="representative">Representative</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-white"
              disabled={isLoading}
            >
              {isLoading ? "Authenticating..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
