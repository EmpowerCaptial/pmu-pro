import { Suspense } from 'react'
import { Hero } from './sections/Hero'
import { PlanToggle } from './sections/PlanToggle'
import { Features } from './sections/Features'
import { ConnectStrip } from './sections/ConnectStrip'
import { FAQ } from './sections/FAQ'
import { FinalCTA } from './sections/FinalCTA'
import { SocialProof } from './sections/SocialProof'

export default function MarketingPage() {
  return (
    <main className="bg-[#F5F1EA] text-[#0a0a0a] min-h-screen">
      <Hero />
      <Suspense fallback={<div className="container mx-auto px-6 py-8">Loading connections...</div>}>
        <ConnectStrip />
      </Suspense>
      <PlanToggle />
      <Features />
      <SocialProof />
      <FAQ />
      <FinalCTA />
    </main>
  )
}
