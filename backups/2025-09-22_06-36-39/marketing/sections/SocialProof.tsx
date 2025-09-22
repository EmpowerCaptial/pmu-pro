'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Quote } from 'lucide-react'

export function SocialProof() {
  const testimonials = [
    {
      name: "Sarah Martinez",
      role: "PMU Artist, Miami",
      image: "/api/placeholder/80/80",
      content: "My bookings increased 300% in the first month. The AI responses are so natural, clients think I'm personally messaging them.",
      rating: 5
    },
    {
      name: "Jennifer Chen",
      role: "Medspa Owner, LA",
      image: "/api/placeholder/80/80",
      content: "Finally, a marketing platform that understands the PMU industry. The templates are spot-on and the optimization is incredible.",
      rating: 5
    },
    {
      name: "Maria Rodriguez",
      role: "Brow Specialist, NYC",
      image: "/api/placeholder/80/80",
      content: "I went from 5 clients a week to fully booked in 6 weeks. The ROI tracking shows exactly where every dollar goes.",
      rating: 5
    }
  ]

  return (
    <section className="container mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-serif font-bold mb-4">Trusted by PMU Artists</h2>
        <p className="text-lg opacity-80 max-w-2xl mx-auto">
          See how artists are growing their businesses with our marketing platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="rounded-2xl border hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <Quote className="h-8 w-8 text-[#C6AA76] mb-4" />
              
              <p className="text-gray-700 mb-6 italic">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-3">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm opacity-70">{testimonial.role}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-16 bg-[#000] text-white rounded-2xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-[#C6AA76] mb-2">300%</div>
            <div className="text-sm opacity-80">Average booking increase</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#C6AA76] mb-2">$2.50</div>
            <div className="text-sm opacity-80">Average cost per lead</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#C6AA76] mb-2">85%</div>
            <div className="text-sm opacity-80">Lead-to-booking rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#C6AA76] mb-2">24hr</div>
            <div className="text-sm opacity-80">Average response time</div>
          </div>
        </div>
      </div>
    </section>
  )
}
