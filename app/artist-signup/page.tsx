import type { Metadata } from "next"
import { ArtistSignupForm } from "@/components/artist/artist-signup-form"

export const metadata: Metadata = {
  title: "Artist Registration - PMU Pro",
  description: "Join our network of licensed PMU professionals",
}

export default function ArtistSignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground font-serif mb-2">Join Our Artist Network</h1>
          <p className="text-muted-foreground">Connect with qualified clients and grow your PMU practice</p>
        </div>
        <ArtistSignupForm />
      </main>
    </div>
  )
}
