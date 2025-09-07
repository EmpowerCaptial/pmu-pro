'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Palette, 
  MessageSquare, 
  Webhook, 
  Gift, 
  BarChart3, 
  Bell,
  Target,
  Zap,
  Shield,
  Clock
} from 'lucide-react'

export function Features() {
  const features = [
    {
      icon: Palette,
      title: 'Ad Templates for PMU',
      description: 'Pre-built campaigns for brows, lips, eyeliner, and medspa services',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: MessageSquare,
      title: 'AI Inbox',
      description: 'Automated responses for Instagram, Messenger, and WhatsApp',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Webhook,
      title: 'Lead Capture Webhooks',
      description: 'Instant lead delivery from Meta and Google lead forms',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Gift,
      title: 'Points & Membership',
      description: 'Integrate with loyalty programs and membership tiers',
      color: 'bg-pink-100 text-pink-600'
    },
    {
      icon: BarChart3,
      title: 'Spend & Lead Reporting',
      description: 'Daily sync with real-time metrics and ROI tracking',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: Bell,
      title: 'Alerts & Guardrails',
      description: 'Notifications for disapprovals, zero-delivery, and budget caps',
      color: 'bg-red-100 text-red-600'
    }
  ]

  return (
    <section className="container mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-serif font-bold mb-4">Everything You Need to Scale</h2>
        <p className="text-lg opacity-80 max-w-2xl mx-auto">
          Complete marketing automation built specifically for PMU artists and medspas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="rounded-2xl border hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-4">
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="opacity-80">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Benefits */}
      <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm">
        <h3 className="text-2xl font-serif font-bold text-center mb-8">Why Choose PMU Guide Marketing?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#C6AA76] rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h4 className="font-semibold mb-2">PMU-Specific</h4>
            <p className="text-sm opacity-80">Built for permanent makeup artists and medspas</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-[#C6AA76] rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h4 className="font-semibold mb-2">Instant Setup</h4>
            <p className="text-sm opacity-80">Launch campaigns in minutes, not weeks</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-[#C6AA76] rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h4 className="font-semibold mb-2">Compliance Ready</h4>
            <p className="text-sm opacity-80">HIPAA-aware with secure data practices</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-[#C6AA76] rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <h4 className="font-semibold mb-2">24/7 Monitoring</h4>
            <p className="text-sm opacity-80">Always-on campaign optimization</p>
          </div>
        </div>
      </div>
    </section>
  )
}
