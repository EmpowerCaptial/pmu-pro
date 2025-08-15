import type { Metadata } from "next"
import { NavBar } from "@/components/ui/navbar"
import { ContraindicationWorkflow } from "@/components/intake/contraindication-workflow"

export const metadata: Metadata = {
  title: "Contraindication Screening - PMU Pro",
  description: "AI-powered contraindication assessment for PMU safety",
}

export default function IntakePage() {
  const mockUser = {
    name: "Demo PMU Artist",
    email: "demo@pmupro.com",
    initials: "DA",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      <NavBar currentPath="/intake" user={mockUser} />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground font-serif mb-2">Contraindication Screening</h1>
          <p className="text-muted-foreground">AI-powered safety assessment to determine PMU procedure suitability</p>
        </div>
        <ContraindicationWorkflow />
      </main>
    </div>
  )
}
