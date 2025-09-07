'use client'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Shield, CreditCard, Zap } from 'lucide-react'

export function Hero() {
  return (
    <section className="bg-[#000] text-white">
      <div className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            Grow Bookings on Autopilot
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-3xl">
            Run Meta & Google ads inside PMU Guide. Choose <strong>Self-Serve</strong> or <strong>Optimized by our Agents</strong>—your AI inbox answers leads instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button 
              size="lg" 
              className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl"
              onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get Started (Self-Serve)
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg font-semibold rounded-xl"
              onClick={() => document.getElementById('lead')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Talk to an Expert (Optimized)
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center gap-8 text-sm opacity-80">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span>HIPAA-aware data practices</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <span>Stripe-secured billing</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <span>Meta + Google ready</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
