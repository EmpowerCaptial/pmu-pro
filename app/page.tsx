"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-background to-beige">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-serif tracking-tight">PMU Pro</h1>
              <p className="text-sm text-muted-foreground font-medium">Professional Permanent Makeup Analysis</p>
            </div>
            <div className="flex gap-3">
              <Link href="/client-analysis">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-lavender/10 hover:border-lavender transition-all duration-300 bg-transparent"
                >
                  Free Analysis
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-lavender/10 hover:border-lavender transition-all duration-300 bg-transparent"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src="/images/pmu-guide-logo.png"
            alt="PMU Guide Logo"
            className="w-[80%] max-w-4xl h-auto opacity-5 object-contain"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-lavender/5 via-transparent to-beige/10"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-32 h-32 bg-lavender/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-beige/30 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-lavender/10 text-lavender-600 rounded-full text-sm font-medium mb-6">
              AI-Powered PMU Assistant
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold text-foreground mb-8 font-serif leading-tight">
            Your AI PMU Assistant — <br />
            <span className="text-lavender">From Client Screening</span> to{" "}
            <span className="text-lavender-600">Perfect Pigment</span>.
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Screen clients, match pigments, and showcase your work — all in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="#pricing">
              <Button
                size="lg"
                className="bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 px-8 py-4 text-lg"
              >
                Join Founders' Beta — $23.99/month
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-lavender/30 hover:border-lavender hover:bg-lavender/5 transition-all duration-300 px-8 py-4 text-lg bg-transparent"
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            >
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Visual Feature Blocks */}
      <section className="py-16 px-4 bg-gradient-to-r from-lavender/5 to-beige/10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border/50 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-card/80 backdrop-blur-sm group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-lavender to-lavender-600 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-xl font-semibold text-foreground font-serif">AI Contraindications</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Screen meds & conditions instantly for client safety.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-card/80 backdrop-blur-sm group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-lavender to-lavender-600 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-xl font-semibold text-foreground font-serif">
                  Pigment Match Intelligence
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Get brand-agnostic pigment picks with healing prediction.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-card/80 backdrop-blur-sm group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-lavender to-lavender-600 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-xl font-semibold text-foreground font-serif">Portfolio Share</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Import before/after photos and export client-ready galleries.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Proof Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4 font-serif">See PMU Pro in Action</h3>
            <p className="text-lg text-muted-foreground">Real screenshots from the platform</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-lavender/10 to-beige/20 rounded-lg p-6 text-center">
              <div className="w-full h-32 bg-lavender/20 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <img
                  src="/images/contraindication-screenshot.png"
                  alt="Contraindication Screening Interface"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <p className="text-sm text-muted-foreground">AI Contraindication Analysis</p>
            </div>
            <div className="bg-gradient-to-br from-lavender/10 to-beige/20 rounded-lg p-6 text-center">
              <div className="w-full h-32 bg-lavender/20 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <img
                  src="/images/analysis-report-screenshot.png"
                  alt="Professional Analysis Report"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <p className="text-sm text-muted-foreground">Pigment Matching Results</p>
            </div>
            <div className="bg-gradient-to-br from-lavender/10 to-beige/20 rounded-lg p-6 text-center">
              <div className="w-full h-32 bg-lavender/20 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <img
                  src="/images/portfolio-screenshot.png"
                  alt="Portfolio Management Interface"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <p className="text-sm text-muted-foreground">Client Portfolio Gallery</p>
            </div>
            <div className="bg-gradient-to-br from-lavender/10 to-beige/20 rounded-lg p-6 text-center">
              <div className="w-full h-32 bg-lavender/20 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <img
                  src="/images/treatment-protocol-screenshot.png"
                  alt="Treatment Protocol Interface"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <p className="text-sm text-muted-foreground">Professional Reports</p>
            </div>
          </div>
        </div>
      </section>

      {/* Founders' Beta CTA Banner */}
      <section className="py-12 px-4 bg-gradient-to-r from-lavender/20 to-lavender/10" id="pricing">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-r from-lavender/10 to-beige/20 rounded-2xl p-8 border border-lavender/20">
            <h3 className="text-3xl font-bold text-foreground mb-4 font-serif">
              Founders' Beta — $23.99/month (Lock in for life)
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              Full access during beta. Cancel anytime. Limited spots available.
            </p>
            <Link href="/billing">
              <Button
                size="lg"
                className="bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 px-8 py-4 text-lg"
              >
                Join Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Workflow Illustration Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-beige/10 to-lavender/5" id="how-it-works">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4 font-serif">
              How You'll Use PMU Pro in Every Appointment
            </h3>
            <p className="text-lg text-muted-foreground">Streamlined workflow from consultation to portfolio</p>
          </div>
          <div className="grid md:grid-cols-5 gap-6">
            {[
              { step: 1, title: "Intake Form", desc: "Client completes health screening" },
              { step: 2, title: "AI Analysis", desc: "Instant contraindication & skin assessment" },
              { step: 3, title: "Pigment Recommendation", desc: "Brand-specific color matches" },
              { step: 4, title: "Export Report", desc: "Professional consultation summary" },
              { step: 5, title: "Portfolio Share", desc: "Before/after gallery creation" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-lavender to-lavender-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl">
                  {item.step}
                </div>
                <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-beige/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-foreground mb-4 font-serif">Professional Tools</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced AI analysis designed specifically for permanent makeup professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-border/50 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-card/80 backdrop-blur-sm group">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-lavender to-lavender-600 rounded-xl mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-2xl font-semibold text-foreground font-serif">
                  AI Contraindications Check
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground leading-relaxed">
                  Instant risk assessment based on medications, conditions, and medical history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-lavender rounded-full"></div>
                    <span>Comprehensive medication database</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-lavender rounded-full"></div>
                    <span>Real-time risk classification</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-lavender rounded-full"></div>
                    <span>Downloadable consent forms</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-lavender rounded-full"></div>
                    <span>Professional recommendations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-card/80 backdrop-blur-sm group">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-lavender-600 to-lavender rounded-xl mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-2xl font-semibold text-foreground font-serif">
                  Fitzpatrick & Pigment Match
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground leading-relaxed">
                  AI-powered skin analysis with personalized pigment recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-lavender-600 rounded-full"></div>
                    <span>Accurate Fitzpatrick classification</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-lavender-600 rounded-full"></div>
                    <span>Undertone detection</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-lavender-600 rounded-full"></div>
                    <span>3 pigment recommendations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-lavender-600 rounded-full"></div>
                    <span>Healing prediction analysis</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-16 px-4 bg-gradient-to-r from-beige/30 to-lavender/10">
        <div className="container mx-auto text-center">
          <div className="mb-8">
            <h4 className="text-3xl font-bold text-foreground font-serif mb-4">Ready to elevate your PMU business?</h4>
            <p className="text-lg text-muted-foreground mb-6">
              Join the Founders' Beta today and keep your special rate for life.
            </p>
            <Link href="/billing">
              <Button
                size="lg"
                className="bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 px-8 py-4 text-lg"
              >
                Join Beta Now — $23.99/month
              </Button>
            </Link>
          </div>
          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/artist-signup">
              <Button variant="outline" className="border-lavender text-lavender hover:bg-lavender/10 bg-transparent">
                Join as Licensed Artist
              </Button>
            </Link>
            <Link href="/client-analysis">
              <Button variant="outline" className="border-lavender text-lavender hover:bg-lavender/10 bg-transparent">
                Free Client Analysis
              </Button>
            </Link>
          </div>
          <div className="mb-4">
            <h4 className="text-2xl font-bold text-foreground font-serif mb-2">PMU Pro</h4>
            <p className="text-muted-foreground">Professional permanent makeup analysis platform</p>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 PMU Pro. Empowering PMU professionals with AI-driven precision.
          </p>
        </div>
      </footer>
    </div>
  )
}
