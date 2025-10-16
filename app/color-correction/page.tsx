"use client"

import { PMUColorCorrectionTool } from "@/components/color-correction/pmu-color-correction-tool"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { NavBar } from "@/components/ui/navbar"
import { useDemoAuth } from "@/hooks/use-demo-auth"

export default function ColorCorrectionPage() {
  const { currentUser } = useDemoAuth()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-50 to-white">
      {/* Watermark Logo */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img src="/pmu-guide-logo.png" alt="PMU Guide" className="w-full max-w-2xl opacity-15 object-contain" />
      </div>

      <div className="relative z-10">
        <NavBar 
          currentPath="/color-correction"
          user={currentUser ? {
            name: currentUser.name,
            email: currentUser.email,
            initials: currentUser.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U',
            avatar: currentUser.avatar
          } : undefined} 
        />
        {/* Header */}
        <div className="p-4 md:p-6 border-b bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            {/* Mobile Layout */}
            <div className="md:hidden text-center mb-4">
              <div className="mb-3">
                <Link href="/dashboard">
                  <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-lavender/10 hover:bg-lavender/20 transition-colors w-full">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="font-medium">Return to Dashboard</span>
                  </button>
                </Link>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PMU Color Correction Tool</h1>
                <p className="text-sm text-gray-600">AI-powered pigment analysis and correction recommendations</p>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/dashboard">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-lavender/10 hover:bg-lavender/20 transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="font-medium">Return to Dashboard</span>
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PMU Color Correction Tool</h1>
                <p className="text-gray-600">AI-powered pigment analysis and correction recommendations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <PMUColorCorrectionTool />
        </div>
      </div>
    </div>
  )
}
