"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Home, Mail, Phone, User } from "lucide-react"
import Link from "next/link"

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-foreground font-serif mb-2">Join Our Waitlist</h1>
            <p className="text-muted-foreground">Get early access to PMU Guide when we launch</p>
          </div>
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 hover:bg-lavender/10 hover:border-lavender bg-white/90 backdrop-blur-sm border-lavender/30 text-lavender-700 font-semibold"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>

        <Card className="border-lavender/20 bg-gradient-to-r from-white to-beige/30">
          <CardHeader>
            <CardTitle className="font-serif text-lavender-600 text-center">Free Waitlist Registration</CardTitle>
            <p className="text-center text-muted-foreground">
              Be the first to know when PMU Guide launches. No commitment required.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="role">I am a...</Label>
                <select
                  id="role"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="">Select your role</option>
                  <option value="pmu-artist">Licensed PMU Artist</option>
                  <option value="pmu-educator">PMU Educator</option>
                  <option value="beauty-professional">Beauty Professional</option>
                  <option value="client">Potential Client</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Label htmlFor="message">Additional Comments</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us what you're looking for in PMU Guide..."
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-lavender hover:bg-lavender-600 text-white"
                onClick={(e) => {
                  e.preventDefault()
                  alert("Thank you for joining our waitlist! We'll notify you when PMU Guide launches.")
                }}
              >
                Join Waitlist
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-lavender/20">
              <p className="text-sm text-muted-foreground mb-2">
                Want immediate access to all features?
              </p>
              <Link href="/artist-signup">
                <Button variant="outline" className="border-lavender text-lavender hover:bg-lavender/5">
                  Join Founders' Beta — $23.99/mo
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
