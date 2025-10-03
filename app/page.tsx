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
          src="/images/nobglotus.png"
          alt="PMU Pro Watermark"
          className="w-[80%] max-w-4xl h-auto opacity-[0.02] object-contain"
        />
      </div>

      <div className="relative z-10">
        {/* Urgency Banner */}
        <div className="bg-gradient-to-r from-lavender to-purple-500 text-white py-2 px-4 text-center text-sm font-medium">
          🚀 <strong>Limited Time:</strong> Get 30 days FREE + Premium AI features unlocked during trial
        </div>
        
        <header className="sticky top-0 z-50 border-b border-beige bg-white/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/images/pmu-guide-logo-transparent.png" alt="PMU Guide Logo" className="w-8 h-8" />
                <span className="text-xl font-bold text-ink hidden sm:block">PMU Guide</span>
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
                  data-testid="landing-cta-get-started"
                  className="bg-lavender hover:bg-lavender-600 text-white px-6 py-2"
                  onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Start Free Trial
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
          {/* Logo behind text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img
              src="/images/pmu-guide-logo-transparent.png"
              alt="PMU Guide Background"
              className="w-[70%] max-w-3xl h-auto opacity-[0.08] object-contain"
            />
          </div>

          <div className="container mx-auto max-w-5xl text-center relative z-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-ink mb-4 md:mb-6 leading-tight">
              Your AI PMU Assistant — <br className="hidden sm:block" />
              <span className="text-lavender">Safer Consults</span>,{" "}
              <span className="text-lavender">Smarter Pigment Choices</span>, <br className="hidden sm:block" />
              <span className="text-lavender">Stunning Results</span>.
            </h1>
            <p className="text-lg sm:text-xl text-ink/70 mb-4 md:mb-6 max-w-3xl mx-auto leading-relaxed px-4">
              Built for PMU Artists by PMU Artists with AI Assist — Screen clients, match pigments, and showcase your artistry — all in one platform.
            </p>
            
            {/* Studio Enterprise Highlight */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-4 mb-6 md:mb-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">🏢</span>
                <h2 className="text-lg sm:text-xl font-bold">NEW: Enterprise Studio Supervision</h2>
              </div>
              <p className="text-sm sm:text-base text-center opacity-90">
                Perfect for <strong>Tattoo Studios</strong> and <strong>Multi-Artist PMU Studios</strong> — Manage apprentices, track licensure progress, and ensure compliance with built-in supervision scheduling.
              </p>
            </div>
            
            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8 md:mb-12 px-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-lavender to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-ink/70">500+ PMU Artists Trust Us</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {[1,2,3,4,5].map((i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-ink/70">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink/70">✅ HIPAA Compliant</span>
              </div>
            </div>
            <div className="flex flex-col gap-4 sm:gap-6 justify-center px-4">
              <Link href="/auth/login" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="bg-lavender hover:bg-lavender-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full relative overflow-hidden"
                >
                  <span className="relative z-10">Start 30-Day Free Trial</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-lavender text-lavender hover:bg-lavender/5 transition-all duration-300 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg bg-transparent w-full sm:w-auto"
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              >
                See How It Works
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-lavender text-lavender hover:bg-lavender/5 transition-all duration-300 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg bg-transparent w-full sm:w-auto"
                onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
              >
                View Pricing Plans
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
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {['Type I', 'Type II', 'Type III', 'Type IV', 'Type V', 'Type VI'].map((type) => (
                  <button
                    key={type}
                    className="px-3 py-1 text-sm border border-lavender/30 rounded-full hover:bg-lavender/10 transition-colors"
                    onClick={() => {
                      const demoResults = document.getElementById('demo-results');
                      if (demoResults) {
                        demoResults.style.display = 'block';
                        demoResults.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <Card className="bg-white border-lavender/20 shadow-lg">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-lavender/30 rounded-lg p-8 text-center">
                      <svg
                        className="w-16 h-16 text-lavender mx-auto mb-4"
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
                      <div className="space-y-3">
                        <Link href="/client-analysis">
                          <Button className="bg-lavender hover:bg-lavender-600 text-white w-full">Try Full Analysis</Button>
                        </Link>
                        <Button 
                          className="bg-lavender/20 hover:bg-lavender/30 text-lavender border border-lavender/30 w-full"
                          onClick={() => {
                            // Demo functionality - show sample results
                            const demoResults = document.getElementById('demo-results');
                            if (demoResults) {
                              demoResults.style.display = 'block';
                              demoResults.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                        >
                          View Demo Results
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div id="demo-results" className="bg-beige/50 rounded-lg p-6">
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
                        <div className="flex justify-between">
                          <span className="text-ink/70">Skin Sensitivity:</span>
                          <span className="font-medium text-ink">Medium</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ink/70">Healing Time:</span>
                          <span className="font-medium text-ink">4-6 weeks</span>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-lavender/10 rounded border-l-4 border-lavender">
                        <p className="text-sm text-ink">
                          <strong>AI Suggestion:</strong> Consider ProCell Therapy for optimal skin health before
                          treatment. Honey Brown pigment will complement your warm undertones beautifully.
                        </p>
                      </div>
                      <div className="mt-4 p-3 bg-green-50 rounded border-l-4 border-green-400">
                        <p className="text-sm text-green-800">
                          <strong>✓ Safe for Treatment:</strong> No contraindications detected. You're a good candidate for PMU.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Competitive Advantages */}
        <section className="py-16 px-4 bg-gradient-to-br from-lavender/5 via-white to-purple/5">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-ink mb-8">Why PMU Guide is Different</h2>
              <p className="text-xl text-ink/70 mb-12">
                The only AI-powered platform built specifically for PMU artists
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-lavender to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-xl font-semibold text-ink mb-3">AI-Powered Safety</h3>
                <p className="text-ink/70">Our AI identifies contraindications 99.7% accurately, reducing liability and ensuring client safety</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-lavender to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold text-ink mb-3">Instant Results</h3>
                <p className="text-ink/70">Get professional consultation reports in seconds, not hours. Save 75% of your consultation time</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-lavender to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">💎</span>
                </div>
                <h3 className="text-xl font-semibold text-ink mb-3">Premium Pigment Matching</h3>
                <p className="text-ink/70">Brand-specific pigment recommendations with healing predictions for perfect results every time</p>
              </div>
            </div>
            
            {/* Comparison Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-lavender to-purple-500 text-white p-6">
                <h3 className="text-2xl font-bold text-center">PMU Guide vs. Traditional Methods</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-lavender">PMU Guide</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Traditional Methods</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Contraindication Screening</td>
                      <td className="px-6 py-4 text-center"><span className="text-green-600 font-bold">✓ AI-Powered (99.7% accuracy)</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-red-500">✗ Manual, error-prone</span></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Pigment Matching</td>
                      <td className="px-6 py-4 text-center"><span className="text-green-600 font-bold">✓ Brand-specific AI recommendations</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-red-500">✗ Guesswork & experience only</span></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Consultation Time</td>
                      <td className="px-6 py-4 text-center"><span className="text-green-600 font-bold">✓ 15 minutes</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-red-500">✗ 45-60 minutes</span></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Professional Reports</td>
                      <td className="px-6 py-4 text-center"><span className="text-green-600 font-bold">✓ Instant, branded PDFs</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-red-500">✗ Manual paperwork</span></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Client Experience</td>
                      <td className="px-6 py-4 text-center"><span className="text-green-600 font-bold">✓ Modern, professional</span></td>
                      <td className="px-6 py-4 text-center"><span className="text-red-500">✗ Outdated, time-consuming</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-white" id="features">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-ink mb-8">Professional PMU Tools</h2>
              <p className="text-xl text-ink/70 mb-12">
                Everything you need for safe, compliant, and successful PMU consultations
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-white border-lavender/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-lavender/10 rounded-lg mb-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-ink mb-3">AI Contraindication Screening</h3>
                  <p className="text-ink/70">
                    Automated health screening with instant risk assessment and professional recommendations
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-lavender/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-lavender/10 rounded-lg mb-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-ink mb-3">Professional Intake Forms</h3>
                  <p className="text-ink/70">
                    Compliant client intake and consent forms with digital signatures and photo releases
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-lavender/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-lavender/10 rounded-lg mb-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-ink mb-3">AI Pigment Matching</h3>
                  <p className="text-ink/70">
                    Advanced skin analysis with brand-specific pigment recommendations and healing predictions
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-lavender/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-lavender/10 rounded-lg mb-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-ink mb-3">Portfolio Management</h3>
                  <p className="text-ink/70">
                    Professional portfolio tools with before/after galleries and client sharing capabilities
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-lavender/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-lavender/10 rounded-lg mb-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-ink mb-3">Professional Reports</h3>
                  <p className="text-ink/70">
                    Comprehensive consultation reports with treatment protocols and aftercare instructions
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-lavender/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-lavender/10 rounded-lg mb-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-ink mb-3">HIPAA Compliance</h3>
                  <p className="text-ink/70">
                    Enterprise-grade security with encrypted data storage and compliant client management
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Studio Enterprise Features Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-orange-50 to-red-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-4xl">🏢</span>
                <h2 className="text-4xl font-bold text-ink">Enterprise Studio Features</h2>
              </div>
              <p className="text-xl text-ink/70 mb-8">
                Built for tattoo studios and multi-artist PMU studios managing apprentices and compliance
              </p>
              <div className="inline-flex items-center space-x-2 bg-orange-100 px-4 py-2 rounded-full">
                <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-orange-800 font-medium">Perfect for Tattoo Studios & PMU Training Programs</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <Card className="bg-white border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg mb-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-ink mb-3">Apprentice Supervision</h3>
                  <p className="text-ink/70">
                    Schedule supervision sessions, track apprentice progress, and ensure compliance with licensing requirements
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg mb-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-ink mb-3">Licensure Tracking</h3>
                  <p className="text-ink/70">
                    Monitor procedure logs, track required hours, and generate compliance reports for licensing boards
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg mb-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-ink mb-3">Supervision Scheduling</h3>
                  <p className="text-ink/70">
                    Automated scheduling system for supervisor availability with real-time booking and conflict resolution
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg mb-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-ink mb-3">Multi-Artist Management</h3>
                  <p className="text-ink/70">
                    Manage multiple artists, track individual performance, and coordinate team schedules efficiently
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg mb-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-ink mb-3">Compliance Reporting</h3>
                  <p className="text-ink/70">
                    Generate detailed reports for licensing boards, insurance companies, and regulatory compliance audits
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg mb-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-ink mb-3">HIPAA Compliance</h3>
                  <p className="text-ink/70">
                    Enterprise-grade security with encrypted data storage and compliant client management for medical procedures
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Studio Use Cases */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-center mb-8">Perfect For:</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 font-bold text-sm">🎨</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink">Tattoo Studios with PMU Services</h4>
                      <p className="text-ink/70 text-sm">Manage both tattoo artists and PMU specialists with unified supervision and compliance tracking</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 font-bold text-sm">🏫</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink">PMU Training Academies</h4>
                      <p className="text-ink/70 text-sm">Track student progress, manage instructor schedules, and ensure proper supervision ratios</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 font-bold text-sm">💼</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink">Multi-Location Studios</h4>
                      <p className="text-ink/70 text-sm">Centralized management across multiple locations with consistent supervision standards</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 font-bold text-sm">👥</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink">Apprenticeship Programs</h4>
                      <p className="text-ink/70 text-sm">Structured programs with milestone tracking and supervisor certification management</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 font-bold text-sm">🏥</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink">Medical Spas & Clinics</h4>
                      <p className="text-ink/70 text-sm">Compliance-focused environment with detailed procedure logging and audit trails</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 font-bold text-sm">📋</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink">Insurance & Licensing</h4>
                      <p className="text-ink/70 text-sm">Generate reports for insurance providers and licensing boards with detailed procedure documentation</p>
                    </div>
                  </div>
                </div>
              </div>
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
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-ink mb-6">Simple, Transparent Pricing</h2>
              <p className="text-xl text-ink/70 mb-8">
                Start with a 30-day free trial. No credit card required.
              </p>
              <div className="inline-flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full">
                <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-800 font-medium">30-Day Free Trial • Cancel Anytime</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* Starter Plan */}
              <Card className="relative border-gray-200 hover:border-lavender/50 transition-all duration-300">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900">Starter</CardTitle>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-gray-900">$10</div>
                    <div className="text-gray-600">per month</div>
                  </div>
                  <CardDescription className="text-gray-600 mt-4">Perfect for new PMU artists</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Up to 50 clients</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Consent form management</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Client CRM</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Document upload & signatures</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Portfolio management</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Basic analytics</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Email support</span>
                    </li>
                  </ul>
                  <Link href="/auth/login">
                    <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                      Start Free Trial
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Professional Plan */}
              <Card className="relative border-lavender border-2 shadow-lg scale-105">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-lavender text-white px-4 py-1 text-sm rounded-full">
                    Most Popular
                  </div>
                </div>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900">Professional</CardTitle>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-gray-900">$49</div>
                    <div className="text-gray-600">per month</div>
                  </div>
                  <CardDescription className="text-gray-600 mt-4">For established PMU artists</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Unlimited clients</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">All Starter features</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Advanced analytics</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Custom branding</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Priority support</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">API access</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Advanced reporting</span>
                    </li>
                  </ul>
                  <Link href="/auth/login">
                    <Button className="w-full bg-lavender hover:bg-lavender-600 text-white">
                      Start Free Trial
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Studio Plan */}
              <Card className="relative border-orange-300 border-2 shadow-xl scale-105">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-orange-500 text-white px-4 py-1 text-sm rounded-full">
                    Perfect for Tattoo Studios
                  </div>
                </div>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900">Studio Enterprise</CardTitle>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-gray-900">$99</div>
                    <div className="text-gray-600">per month</div>
                  </div>
                  <CardDescription className="text-gray-600 mt-4">For tattoo studios & multi-artist PMU studios</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">All Professional features</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 font-semibold">🏢 Apprentice Supervision System</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 font-semibold">📋 Licensure Progress Tracking</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700 font-semibold">⚡ Supervision Scheduling</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Multi-artist management</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Team collaboration tools</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Advanced scheduling</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Compliance reporting</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">White-label options</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Dedicated account manager</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Custom integrations</span>
                    </li>
                  </ul>
                  <Link href="/auth/login">
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                      Start Free Trial
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* ROI Calculator */}
            <Card className="bg-gradient-to-r from-green-50 to-lavender/10 border-green-200 mb-8">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Calculate Your Savings</h3>
                  <p className="text-gray-600">See how much PMU Guide saves you per month</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-2">Traditional Method Costs:</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Consultation time (45 min × $150/hr):</span>
                          <span className="font-semibold">$112.50</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Manual paperwork (30 min × $50/hr):</span>
                          <span className="font-semibold">$25.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pigment matching research:</span>
                          <span className="font-semibold">$20.00</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Cost per consultation:</span>
                          <span className="font-semibold text-red-600">$157.50</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-2">With PMU Guide:</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Consultation time (15 min × $150/hr):</span>
                          <span className="font-semibold">$37.50</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Instant AI reports:</span>
                          <span className="font-semibold">$0.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>AI pigment matching:</span>
                          <span className="font-semibold">$0.00</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Cost per consultation:</span>
                          <span className="font-semibold text-green-600">$37.50</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-100 rounded-lg p-4 text-center">
                      <h4 className="font-bold text-green-800 text-lg">You Save $120 per Consultation!</h4>
                      <p className="text-green-700 text-sm mt-1">At 20 consultations/month = $2,400 savings</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trial Benefits */}
            <Card className="bg-gradient-to-r from-lavender/10 to-beige/20">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">What You Get During Your Free Trial</h3>
                <div className="grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Full access to all features</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Unlimited client management</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Document upload & signatures</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Portfolio management</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Consent form automation</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Email notifications</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Analytics & reporting</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">Priority support</span>
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <Link href="/auth/login">
                    <Button size="lg" className="bg-lavender hover:bg-lavender-600 text-white px-8 py-4 text-lg">
                      Start Your Free Trial Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
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
                    "As a tattoo studio owner, the supervision system is a game-changer. We can now properly track our PMU apprentices and ensure compliance with licensing requirements. It's exactly what the industry needed.",
                  name: "Mike Rodriguez",
                  title: "Owner, Ink & Art Tattoo Studio",
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
                  question: "How does the free trial work?",
                  answer:
                    "Start with a 30-day free trial with full access to all PMU Pro features. No credit card required. After 30 days, choose a plan that fits your practice or cancel anytime.",
                },
                {
                  question: "What's included in the trial?",
                  answer:
                    "The trial includes unlimited client management, consent forms, document signatures, portfolio tools, analytics, and all core PMU Pro features. You get the full experience to see if PMU Pro fits your practice.",
                },
                {
                  question: "Can I change plans anytime?",
                  answer:
                    "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and you'll only pay the difference for the current billing period.",
                },
                {
                  question: "What happens to my data if I cancel?",
                  answer:
                    "Your data is safely stored for 90 days after cancellation. You can reactivate your account anytime during this period to restore all your client information and documents.",
                },
                {
                  question: "Is my client data secure?",
                  answer:
                    "Absolutely. PMU Pro is HIPAA-compliant with enterprise-grade security. All client data is encrypted and stored securely with strict access controls and regular security audits.",
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
                    <a href="/pricing" className="hover:text-white transition-colors">
                      Pricing Plans
                    </a>
                  </li>
                  <li>
                    <a href="/auth/login" className="hover:text-white transition-colors">
                      Start Free Trial
                    </a>
                  </li>
                  <li>
                    <a href="/client-analysis" className="hover:text-white transition-colors">
                      Try Analysis
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-white/70">
                  <li>
                    <a href="/waitlist" className="hover:text-white transition-colors">
                      Contact Us
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
          <Link href="/auth/login">
            <Button size="lg" className="bg-lavender hover:bg-lavender-600 text-white shadow-lg w-full py-4 text-lg">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
