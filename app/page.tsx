"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useState } from "react"

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white relative">
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img
          src="/images/pmu-guide-logo-transparent.png"
          alt="PMU Guide Watermark"
          className="w-[80%] max-w-4xl h-auto opacity-[0.02] object-contain"
        />
      </div>

      <div className="relative z-10">
        <header className="sticky top-0 z-50 border-b border-beige bg-white/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/images/pmu-guide-logo-transparent.png" alt="PMU Guide Logo" className="w-8 h-8" />
                <span className="text-xl font-bold text-ink">PMU Guide</span>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <a href="#features" className="text-ink hover:text-lavender transition-colors">
                  Features
                </a>
                <a href="#how-it-works" className="text-ink hover:text-lavender transition-colors">
                  How It Works
                </a>
                <a href="#pricing" className="text-ink hover:text-lavender transition-colors">
                  Pricing
                </a>
                <a href="#faq" className="text-ink hover:text-lavender transition-colors">
                  FAQ
                </a>
                <a href="#contact" className="text-ink hover:text-lavender transition-colors">
                  Contact
                </a>
              </nav>

              <div className="flex items-center gap-3">
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    className="border-lavender text-lavender hover:bg-lavender/5 px-4 py-2 bg-transparent"
                  >
                    Login
                  </Button>
                </Link>

                <Button
                  className="bg-lavender hover:bg-lavender-600 text-white px-6 py-2"
                  onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Join Founders' Beta
                </Button>

                {/* Mobile Menu Button */}
                <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
              <div className="md:hidden mt-4 pb-4 border-t border-beige">
                <nav className="flex flex-col gap-4 pt-4">
                  <a href="#features" className="text-ink hover:text-lavender transition-colors">
                    Features
                  </a>
                  <a href="#how-it-works" className="text-ink hover:text-lavender transition-colors">
                    How It Works
                  </a>
                  <a href="#pricing" className="text-ink hover:text-lavender transition-colors">
                    Pricing
                  </a>
                  <a href="#faq" className="text-ink hover:text-lavender transition-colors">
                    FAQ
                  </a>
                  <a href="#contact" className="text-ink hover:text-lavender transition-colors">
                    Contact
                  </a>
                  <Link href="/auth/login" className="text-ink hover:text-lavender transition-colors">
                    Login
                  </Link>
                </nav>
              </div>
            )}
          </div>
        </header>

        <section className="relative py-20 px-4 bg-gradient-to-br from-white via-beige/30 to-lavender/10">
          <div className="container mx-auto max-w-5xl text-center relative z-10">
            <h1 className="text-5xl md:text-7xl font-bold text-ink mb-6 leading-tight">
              Your AI PMU Assistant — <br />
              <span className="text-lavender">Safer Consults</span>,{" "}
              <span className="text-lavender">Smarter Pigment Choices</span>, <br />
              <span className="text-lavender">Stunning Results</span>.
            </h1>
            <p className="text-xl text-ink/70 mb-12 max-w-3xl mx-auto leading-relaxed">
              Screen clients, match pigments, and showcase your artistry — all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/artist-signup">
                <Button
                  size="lg"
                  className="bg-lavender hover:bg-lavender-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 px-8 py-4 text-lg"
                >
                  Join Founders' Beta — $23.99/mo
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-lavender text-lavender hover:bg-lavender/5 transition-all duration-300 px-8 py-4 text-lg bg-transparent"
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              >
                See How It Works
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-beige/30">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-ink mb-4">Try Our AI Skin Analysis</h2>
              <p className="text-lg text-ink/70">
                Upload or take a photo to see instant skin analysis and pigment recommendations
              </p>
            </div>

            <Card className="bg-white border-lavender/20 shadow-lg">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-lavender/30 rounded-lg p-8 text-center">
                      <svg
                        className="w-12 h-12 text-lavender mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <p className="text-ink/70 mb-4">Upload photo or use camera</p>
                      <Button className="bg-lavender hover:bg-lavender-600 text-white">Try Demo Analysis</Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-beige/50 rounded-lg p-6">
                      <h3 className="font-semibold text-ink mb-3">AI Analysis Results:</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-ink/70">Fitzpatrick Type:</span>
                          <span className="font-medium text-ink">Type III</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink/70">Undertone:</span>
                          <span className="font-medium text-ink">Warm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink/70">Recommended Pigment:</span>
                          <span className="font-medium text-lavender">Honey Brown</span>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-lavender/10 rounded border-l-4 border-lavender">
                        <p className="text-sm text-ink">
                          <strong>AI Suggestion:</strong> Consider ProCell Therapy for optimal skin health before
                          treatment.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-12 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-lavender/10 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-ink">Built by PMU Educators</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-lavender/10 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-ink">AI-Powered Analysis</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-lavender/10 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-ink">HIPAA-Compliant</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-lavender/10 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-ink">Artists in 15+ Countries</span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-gradient-to-br from-lavender/10 to-beige/30" id="features">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-ink mb-4">Professional PMU Tools</h2>
              <p className="text-lg text-ink/70 max-w-2xl mx-auto">
                Everything you need for safer, smarter permanent makeup consultations
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-white border-lavender/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-lavender/10 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:bg-lavender/20 transition-colors">
                    <svg className="w-8 h-8 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <CardTitle className="text-xl font-semibold text-ink">AI Contraindications Check</CardTitle>
                  <CardDescription className="text-ink/70">
                    Flags risks instantly with comprehensive medication and condition screening
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-white border-lavender/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-lavender/10 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:bg-lavender/20 transition-colors">
                    <svg className="w-8 h-8 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <CardTitle className="text-xl font-semibold text-ink">Fitzpatrick & Undertone Detection</CardTitle>
                  <CardDescription className="text-ink/70">
                    Precision pigment matching with AI-powered skin analysis
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-white border-lavender/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-lavender/10 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:bg-lavender/20 transition-colors">
                    <svg className="w-8 h-8 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4z"
                      />
                    </svg>
                  </div>
                  <CardTitle className="text-xl font-semibold text-ink">Brand-Agnostic Pigment Match</CardTitle>
                  <CardDescription className="text-ink/70">
                    Healing predictions included with every recommendation
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-white border-lavender/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-lavender/10 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:bg-lavender/20 transition-colors">
                    <svg className="w-8 h-8 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <CardTitle className="text-xl font-semibold text-ink">Healing Timeline & Aftercare</CardTitle>
                  <CardDescription className="text-ink/70">
                    Automated aftercare instructions and healing progress tracking
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-white border-lavender/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-lavender/10 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:bg-lavender/20 transition-colors">
                    <svg className="w-8 h-8 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <CardTitle className="text-xl font-semibold text-ink">Portfolio Import/Export Tools</CardTitle>
                  <CardDescription className="text-ink/70">
                    Showcase your work with professional before/after galleries
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-white border-lavender/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-lavender/10 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:bg-lavender/20 transition-colors">
                    <svg className="w-8 h-8 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <CardTitle className="text-xl font-semibold text-ink">PDF Compliance Reports</CardTitle>
                  <CardDescription className="text-ink/70">
                    Professional documentation for client files and insurance
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-white" id="how-it-works">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-ink mb-4">How It Works</h2>
              <p className="text-lg text-ink/70">Simple 5-step process for every consultation</p>
            </div>
            <div className="grid md:grid-cols-5 gap-6">
              {[
                { step: 1, title: "Intake", desc: "Client completes health screening", icon: "📋" },
                { step: 2, title: "AI Analysis", desc: "Instant contraindication & skin assessment", icon: "🤖" },
                { step: 3, title: "Pigment Match", desc: "Brand-specific color recommendations", icon: "🎨" },
                { step: 4, title: "Save Report", desc: "Professional consultation summary", icon: "💾" },
                { step: 5, title: "Share", desc: "Send results to client", icon: "📤" },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-lavender rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-ink mb-2">{item.title}</h3>
                  <p className="text-sm text-ink/70">{item.desc}</p>
                  {index < 4 && (
                    <div className="hidden md:block absolute top-8 left-full w-full">
                      <svg
                        className="w-8 h-8 text-lavender/30 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-beige/20">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-ink mb-4">See PMU Guide in Action</h2>
              <p className="text-lg text-ink/70">Real screenshots from the platform</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { img: "/images/contraindication-screenshot.png", title: "Contraindication Report" },
                { img: "/images/analysis-report-screenshot.png", title: "Pigment Match Results" },
                { img: "/images/portfolio-screenshot.png", title: "Portfolio Gallery" },
                { img: "/images/treatment-protocol-screenshot.png", title: "Professional Reports" },
              ].map((item, index) => (
                <Card
                  key={index}
                  className="bg-white border-lavender/20 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={item.img || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-ink text-center">{item.title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-gradient-to-br from-lavender/10 to-beige/30" id="pricing">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl font-bold text-ink mb-6">Founders' Beta Pricing</h2>
            <Card className="bg-white border-lavender/20 shadow-xl p-8">
              <div className="mb-6">
                <div className="text-5xl font-bold text-lavender mb-2">$23.99</div>
                <div className="text-lg text-ink/70">per month • includes all tools & local artist search</div>
              </div>
              <ul className="space-y-3 mb-8 text-left max-w-md mx-auto">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-ink">Unlimited contraindication screenings</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-ink">AI pigment matching & recommendations</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-ink">Professional portfolio tools</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-ink">Local artist search & directory listing</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-ink">PDF compliance reports</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-ink">Cancel anytime</span>
                </li>
              </ul>
              <div className="space-y-4">
                <Link href="/artist-signup">
                  <Button
                    size="lg"
                    className="bg-lavender hover:bg-lavender-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 px-8 py-4 text-lg w-full"
                  >
                    Join Founders' Beta Now
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-lavender text-lavender hover:bg-lavender/5 px-8 py-4 text-lg w-full bg-transparent"
                >
                  Join Free Waitlist
                </Button>
              </div>
            </Card>
          </div>
        </section>

        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-ink mb-4">What PMU Artists Say</h2>
              <p className="text-lg text-ink/70">Trusted by professionals worldwide</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote:
                    "PMU Guide has revolutionized my consultation process. The AI contraindication screening gives me confidence and my clients peace of mind.",
                  name: "Sarah Chen",
                  title: "Licensed PMU Artist, 8 years experience",
                },
                {
                  quote:
                    "The pigment matching is incredibly accurate. I've seen better healing results since using the AI recommendations.",
                  name: "Maria Rodriguez",
                  title: "Master PMU Educator",
                },
                {
                  quote:
                    "Finally, a tool that understands the complexity of permanent makeup. The professional reports are a game-changer.",
                  name: "Jennifer Kim",
                  title: "PMU Studio Owner",
                },
              ].map((testimonial, index) => (
                <Card key={index} className="bg-beige/20 border-lavender/20 shadow-lg">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <svg className="w-8 h-8 text-lavender/30" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                      </svg>
                    </div>
                    <p className="text-ink/80 mb-4 italic">"{testimonial.quote}"</p>
                    <div>
                      <div className="font-semibold text-ink">{testimonial.name}</div>
                      <div className="text-sm text-ink/70">{testimonial.title}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-beige/20" id="faq">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-ink mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-ink/70">Everything you need to know about PMU Guide</p>
            </div>
            <div className="space-y-4">
              {[
                {
                  question: "Who is PMU Guide for?",
                  answer:
                    "PMU Guide is designed for licensed permanent makeup artists, PMU educators, and beauty professionals who want to provide safer, more accurate consultations with AI-powered analysis.",
                },
                {
                  question: "What's included in the beta?",
                  answer:
                    "The Founders' Beta includes all core features: AI contraindication screening, Fitzpatrick analysis, pigment matching, portfolio tools, and professional reporting. You'll also get priority support and input on new features.",
                },
                {
                  question: "Can I cancel anytime?",
                  answer:
                    "Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees.",
                },
                {
                  question: "Will my price go up?",
                  answer:
                    "No! Founders' Beta members lock in the $23.99/month rate for life. This price will never increase for early adopters.",
                },
                {
                  question: "Is my client data secure?",
                  answer:
                    "Absolutely. PMU Guide is HIPAA-compliant with enterprise-grade security. All client data is encrypted and stored securely with strict access controls.",
                },
              ].map((faq, index) => (
                <Card key={index} className="bg-white border-lavender/20">
                  <CardHeader className="cursor-pointer hover:bg-beige/10 transition-colors">
                    <CardTitle className="text-lg text-ink flex items-center justify-between">
                      {faq.question}
                      <svg className="w-5 h-5 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-ink/70">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-lavender/20 py-16 px-4 bg-ink text-white" id="contact">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <img
                    src="/images/pmu-guide-logo-transparent.png"
                    alt="PMU Guide Logo"
                    className="w-8 h-8 brightness-0 invert"
                  />
                  <span className="text-xl font-bold">PMU Guide</span>
                </div>
                <p className="text-white/70">
                  AI-powered permanent makeup consultation platform for professional artists.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Features</h3>
                <ul className="space-y-2 text-white/70">
                  <li>
                    <a href="#features" className="hover:text-white transition-colors">
                      AI Analysis
                    </a>
                  </li>
                  <li>
                    <a href="#features" className="hover:text-white transition-colors">
                      Pigment Matching
                    </a>
                  </li>
                  <li>
                    <a href="#features" className="hover:text-white transition-colors">
                      Portfolio Tools
                    </a>
                  </li>
                  <li>
                    <a href="#features" className="hover:text-white transition-colors">
                      Compliance Reports
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-white/70">
                  <li>
                    <a href="#faq" className="hover:text-white transition-colors">
                      FAQ
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Training
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Community
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-white/70">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/20 pt-8 text-center">
              <p className="text-white/70">
                © 2024 PMU Guide. All rights reserved. Empowering PMU professionals with AI-driven precision.
              </p>
            </div>
          </div>
        </footer>

        <div className="fixed bottom-4 left-4 right-4 md:hidden z-50">
          <Link href="/artist-signup">
            <Button size="lg" className="bg-lavender hover:bg-lavender-600 text-white shadow-lg w-full py-4 text-lg">
              Join Beta — $23.99/mo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
