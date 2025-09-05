import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { LeahChat } from "@/components/chat/leah-chat"
import PWARegistration from "@/components/pwa/pwa-registration"
import PWAUpdateManager from "@/components/pwa/pwa-update-manager"
import MobileNav from "@/components/ui/mobile-nav"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "PMU Pro - AI Contraindications & Pigment Match",
  description:
    "Professional permanent makeup analysis with AI-powered contraindication screening and pigment matching for PMU artists.",
  generator: "PMU Pro",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.thepmuguide.com",
    title: "PMU Pro - Professional PMU Business Management",
    description: "Complete PMU business management system with skin analysis, client management, and professional tools",
    siteName: "PMU Pro",
  },
  twitter: {
    card: "summary_large_image",
    title: "PMU Pro - Professional PMU Business Management",
    description: "Complete PMU business management system with skin analysis, client management, and professional tools",
  },
  icons: {
    icon: [
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#8b5cf6",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} antialiased`}>
      <head>
        <PWARegistration />
      </head>
      <body>
        {children}
        <LeahChat />
        <PWAUpdateManager />
        <MobileNav />
      </body>
    </html>
  )
}
