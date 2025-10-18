import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Sign In - PMU Pro",
  description: "Sign in to your PMU Pro account",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      {/* Background Image with White Filter Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/loginbckgrnd.jpg)'
        }}
      />
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="w-full max-w-sm sm:max-w-md relative z-10">
        {/* Mobile Back Button */}
        <div className="md:hidden mb-4">
          <Link href="/">
            <Button variant="outline" className="border-lavender text-lavender hover:bg-lavender/5 bg-white/90 backdrop-blur-sm w-full">
              ← Back to Home
            </Button>
          </Link>
        </div>

        {/* Desktop Back Button */}
        <div className="hidden md:block mb-6">
          <Link href="/">
            <Button variant="outline" className="border-lavender text-lavender hover:bg-lavender/5 bg-white/90 backdrop-blur-sm">
              ← Back to Home
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-serif mb-2">PMU Pro</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Sign in to your professional account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
