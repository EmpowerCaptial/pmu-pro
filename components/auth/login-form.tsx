"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setIsSuccess(true)
        setMessage("Check your email for a magic link to sign in!")

        setTimeout(() => {
          localStorage.setItem("user", JSON.stringify({ email, name: "Demo PMU Artist" }))
          router.push("/dashboard")
        }, 2000)
      } else {
        setMessage("Something went wrong. Please try again.")
      }
    } catch (error) {
      setMessage("Network error. Please check your connection.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestAccess = () => {
    router.push("/request-access")
  }

  return (
    <Card className="border-border shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold text-center">Welcome back</CardTitle>
        <CardDescription className="text-center">Enter your email to receive a secure magic link</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="artist@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="bg-background"
            />
          </div>

          {message && (
            <Alert className={isSuccess ? "border-primary bg-primary/5" : "border-destructive bg-destructive/5"}>
              <Mail className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || !email}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending magic link...
              </>
            ) : (
              "Send magic link"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>New to PMU Pro?</p>
          <Button variant="link" className="p-0 h-auto font-normal" onClick={handleRequestAccess}>
            Request professional access
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
