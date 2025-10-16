"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Brush, ExternalLink } from "lucide-react"
import Link from "next/link"
import { NavBar } from "@/components/ui/navbar"
import { useDemoAuth } from "@/hooks/use-demo-auth"

export default function TryBrowsPage() {
  const { currentUser } = useDemoAuth()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-beige/30 to-lavender/20 relative">
      <div
        className="fixed inset-0 bg-no-repeat bg-center bg-contain opacity-[0.02] pointer-events-none z-0"
        style={{
          backgroundImage: "url('/images/pmu-guide-logo-transparent.png')",
          backgroundSize: "40%",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <NavBar 
          currentPath="/trybrows"
          user={currentUser ? {
            name: currentUser.name,
            email: currentUser.email,
            initials: currentUser.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U',
            avatar: currentUser.avatar
          } : undefined} 
        />
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="bg-white/90 backdrop-blur-sm border-lavender/30 text-lavender-700 font-semibold hover:bg-lavender/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-charcoal mb-2">Virtual Brow Try-On</h1>
            <p className="text-muted-foreground">Interactive brow shape and color visualization tool</p>
          </div>
          <div className="w-32" /> {/* Spacer for centering */}
        </div>

        <Card className="border-border shadow-lg bg-white/95 backdrop-blur-sm border-lavender/30 max-w-6xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Brush className="h-6 w-6 text-lavender" />
              <CardTitle className="text-2xl font-bold">TryBrows Virtual Try-On Tool</CardTitle>
            </div>
            <CardDescription className="text-lg">
              Help clients visualize different brow shapes and colors before their appointment
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="rounded-lg overflow-hidden border border-lavender/20 shadow-inner">
                <iframe
                  style={{ borderRadius: "12px" }}
                  src="https://www.trybrows.com/widget/en/5003e2dc-f9b5-46c0-ac25-68dcabeddd4b"
                  width="100%"
                  height="700"
                  frameBorder="0"
                  scrolling="no"
                  loading="lazy"
                  allow="web-share; clipboard-write"
                  title="TryBrows Virtual Try-On Tool"
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-lavender/20">
                <div>
                  <h3 className="font-semibold text-charcoal mb-1">Professional Features</h3>
                  <p className="text-sm text-muted-foreground">
                    Use this tool during consultations to show clients different brow options and help them make
                    informed decisions
                  </p>
                </div>
                <Link
                  href="https://www.trybrows.com/u/263db762-ad22-4a4c-95a9-ed644468e653"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-lavender hover:bg-lavender-600 text-white font-semibold">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Gallery
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 max-w-4xl mx-auto">
          <Card className="border-border bg-white/90 backdrop-blur-sm border-lavender/30">
            <CardHeader>
              <CardTitle className="text-xl font-bold">How to Use This Tool</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-charcoal mb-2">During Consultations</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Show clients different brow shapes and styles</li>
                    <li>• Help them visualize color options</li>
                    <li>• Save preferred looks for reference</li>
                    <li>• Use as a communication tool</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-charcoal mb-2">Professional Benefits</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Reduce consultation time</li>
                    <li>• Improve client satisfaction</li>
                    <li>• Set clear expectations</li>
                    <li>• Showcase your expertise</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
