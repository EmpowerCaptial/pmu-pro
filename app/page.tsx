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
              AI-Powered Professional Analysis
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold text-foreground mb-8 font-serif leading-tight">
            Decide with <span className="text-lavender">confidence</span>.
            <br />
            Correct with <span className="text-lavender-600">precision</span>.
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            AI-powered contraindication screening and pigment matching for professional PMU artists. Make informed
            decisions with instant analysis and expert recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/intake">
              <Button
                size="lg"
                className="bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 px-8 py-4 text-lg"
              >
                Start Contraindication Screen
              </Button>
            </Link>
            <Link href="/analyze">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-lavender/30 hover:border-lavender hover:bg-lavender/5 transition-all duration-300 px-8 py-4 text-lg bg-transparent"
              >
                Start Skin Analysis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-r from-lavender/5 to-beige/10">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-lavender/20 shadow-xl bg-gradient-to-r from-white to-beige/30">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-foreground font-serif mb-4">
                Free Skin Analysis for Clients
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover your perfect PMU match with our AI-powered Fitzpatrick skin type analysis and connect with
                licensed artists near you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Fitzpatrick Explanation */}
              <div className="bg-gradient-to-r from-lavender/10 to-beige/20 rounded-lg p-6">
                <h4 className="text-xl font-semibold text-lavender-600 mb-3">What is the Fitzpatrick Scale?</h4>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  The Fitzpatrick Scale is a scientific classification system that categorizes skin types based on how
                  they react to UV exposure. For PMU, this helps determine the best pigment colors and techniques for
                  your unique skin tone.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-pink-100 to-pink-200 rounded border"></div>
                      <span>
                        <strong>Type I-II:</strong> Very fair to fair skin
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-amber-100 to-amber-200 rounded border"></div>
                      <span>
                        <strong>Type III-IV:</strong> Medium to olive skin
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-amber-300 to-amber-400 rounded border"></div>
                      <span>
                        <strong>Type V:</strong> Brown skin
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-amber-600 to-amber-700 rounded border"></div>
                      <span>
                        <strong>Type VI:</strong> Dark brown to black skin
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Factors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-lavender to-lavender-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <h5 className="font-semibold text-lavender-600 mb-2">Eye Color</h5>
                  <p className="text-sm text-muted-foreground">
                    Helps determine complementary pigment tones and placement on the Fitzpatrick scale
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-lavender to-lavender-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2"
                      />
                    </svg>
                  </div>
                  <h5 className="font-semibold text-lavender-600 mb-2">Undertone</h5>
                  <p className="text-sm text-muted-foreground">
                    Warm, cool, or neutral undertones guide pigment selection for natural results
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-lavender to-lavender-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
                      />
                    </svg>
                  </div>
                  <h5 className="font-semibold text-lavender-600 mb-2">Sun Sensitivity</h5>
                  <p className="text-sm text-muted-foreground">
                    How your skin reacts to sun exposure affects pigment retention and healing
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center pt-6">
                <Link href="/client-analysis">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-lavender to-lavender-600 hover:from-lavender-600 hover:to-lavender text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 px-8 py-4 text-lg"
                  >
                    Start Your Free Analysis
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground mt-3">
                  Get personalized recommendations and connect with licensed PMU artists in your area
                </p>
              </div>
            </CardContent>
          </Card>
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
      <footer className="border-t border-border/50 py-12 px-4 bg-gradient-to-r from-beige/30 to-lavender/10">
        <div className="container mx-auto text-center">
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
