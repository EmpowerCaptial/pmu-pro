import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SetupPasswordForm } from "@/components/auth/setup-password-form"

export const metadata: Metadata = {
  title: "Setup Password - PMU Pro",
  description: "Set up your PMU Pro account password",
}

export default function SetupPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ivory via-background to-beige px-4">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Mobile Back Button */}
        <div className="md:hidden mb-4">
          <Link href="/auth/login">
            <Button variant="outline" className="border-lavender text-lavender hover:bg-lavender/5 bg-transparent w-full">
              ← Back to Login
            </Button>
          </Link>
        </div>

        {/* Desktop Back Button */}
        <div className="hidden md:block mb-6">
          <Link href="/auth/login">
            <Button variant="outline" className="border-lavender text-lavender hover:bg-lavender/5 bg-transparent">
              ← Back to Login
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-serif mb-2">Setup Your Password</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Create a secure password for your PMU Pro account</p>
        </div>
        <SetupPasswordForm />
      </div>
    </div>
  )
}
