import type { Metadata } from "next"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Reset Password - PMU Pro",
  description: "Set your new PMU Pro account password",
}

interface ResetPasswordPageProps {
  params: {
    token: string
  }
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-serif mb-2">Set New Password</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Enter your new password below</p>
        </div>
        <ResetPasswordForm token={params.token} />
      </div>
    </div>
  )
}
