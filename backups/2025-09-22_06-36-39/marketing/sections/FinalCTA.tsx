'use client'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Send, CheckCircle } from 'lucide-react'

export function FinalCTA() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    plan: 'self_serve',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/marketing/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          plan: 'self_serve',
          notes: ''
        })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isSubmitted) {
    return (
      <section id="lead" className="container mx-auto px-6 py-16">
        <Card className="rounded-2xl bg-[#C6AA76] text-[#0a0a0a] p-8 md:p-12 max-w-2xl mx-auto">
          <CardContent className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-semibold mb-4">Thank You!</h3>
            <p className="text-lg opacity-90 mb-6">
              We've received your information and will be in touch within 24 hours to discuss your marketing goals.
            </p>
            <Button 
              onClick={() => setIsSubmitted(false)}
              className="bg-[#000] text-white hover:bg-gray-800 px-6 py-3 rounded-xl"
            >
              Submit Another Inquiry
            </Button>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section id="lead" className="container mx-auto px-6 py-16">
      <Card className="rounded-2xl bg-[#C6AA76] text-[#0a0a0a] p-8 md:p-12">
        <CardContent>
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-semibold mb-4">
              Start your first campaign in minutes
            </h3>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Connect Meta or Google, choose your plan, and we'll guide you the rest of the way.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Your full name"
                  required
                  className="rounded-xl bg-white border-gray-300 text-gray-900"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-sm font-medium mb-2 block">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="rounded-xl bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium mb-2 block">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className="rounded-xl bg-white border-gray-300 text-gray-900"
                />
              </div>
              
              <div>
                <Label htmlFor="company" className="text-sm font-medium mb-2 block">
                  Business Name
                </Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  placeholder="Your business name"
                  className="rounded-xl bg-white border-gray-300 text-gray-900"
                />
              </div>
            </div>

            <div className="mb-4">
              <Label htmlFor="plan" className="text-sm font-medium mb-2 block">
                Preferred Plan
              </Label>
              <Select value={formData.plan} onValueChange={(value) => handleInputChange('plan', value)}>
                <SelectTrigger className="rounded-xl bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200">
                  <SelectItem value="self_serve">Self-Serve ($97/mo)</SelectItem>
                  <SelectItem value="optimized">Optimized by Agents ($497/mo + 10% spend)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mb-6">
              <Label htmlFor="notes" className="text-sm font-medium mb-2 block">
                Tell us about your goals
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="What are your current booking challenges? What services do you offer? Any specific goals?"
                rows={4}
                className="rounded-xl bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="text-center">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#000] text-white hover:bg-gray-800 px-8 py-4 text-lg font-semibold rounded-xl"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Send Inquiry
                  </>
                )}
              </Button>
            </div>

            <p className="text-center text-sm opacity-80 mt-4">
              We'll respond within 24 hours • No spam, ever • Unsubscribe anytime
            </p>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
