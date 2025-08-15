import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Sign In - PMU Pro",
  description: "Sign in to your PMU Pro account",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ivory via-background to-beige px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground font-serif mb-2">PMU Pro</h1>
          <p className="text-muted-foreground">Sign in to your professional account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
