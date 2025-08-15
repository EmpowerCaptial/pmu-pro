import type { Metadata } from "next"
import ClientAnalyzePage from "./ClientAnalyzePage"

export const metadata: Metadata = {
  title: "Skin Analysis - PMU Pro",
  description: "AI-powered Fitzpatrick and undertone analysis for PMU pigment matching",
}

export default function AnalyzePage() {
  return <ClientAnalyzePage />
}
