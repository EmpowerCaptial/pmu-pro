'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "Do I keep my ad accounts?",
      answer: "Yes, absolutely. Ads run in your own Meta and Google ad accounts. You grant secure access and can revoke it anytime. We never take ownership of your accounts."
    },
    {
      question: "Is there a percentage of spend fee?",
      answer: "Only on the Optimized plan (10% of ad spend). The Self-Serve plan is a flat monthly subscription with no additional fees."
    },
    {
      question: "Does the AI reply to DMs automatically?",
      answer: "Yes, within platform messaging policies and time windows. The AI responds to Instagram DMs, Facebook Messenger, and WhatsApp messages with natural, personalized responses that book consultations."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes, both plans are month-to-month with no long-term contracts. You can cancel anytime and we offer a 30-day money-back guarantee."
    },
    {
      question: "What if I don't have ad accounts yet?",
      answer: "No problem! We'll help you set up Meta Business Manager and Google Ads accounts during onboarding. Our team guides you through the entire process."
    },
    {
      question: "How quickly can I see results?",
      answer: "Most artists see their first leads within 24-48 hours of launching campaigns. Significant booking increases typically occur within the first 2-4 weeks."
    },
    {
      question: "Do you provide creative assets?",
      answer: "Yes! We provide PMU-specific ad templates, images, and copy that's proven to convert. You can also upload your own creative assets."
    },
    {
      question: "Is my client data secure?",
      answer: "Absolutely. We use HIPAA-aware data practices, encrypt all data in transit and at rest, and are SOC 2 compliant. Your client information is always secure."
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="container mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-serif font-bold mb-4">Frequently Asked Questions</h2>
        <p className="text-lg opacity-80 max-w-2xl mx-auto">
          Everything you need to know about our marketing platform
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <Card key={index} className="rounded-2xl border hover:shadow-md transition-all duration-200">
            <CardHeader 
              className="cursor-pointer"
              onClick={() => toggleFAQ(index)}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg pr-4">{faq.question}</h3>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-[#C6AA76] flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
              </div>
            </CardHeader>
            {openIndex === index && (
              <CardContent className="pt-0">
                <p className="opacity-80 leading-relaxed">{faq.answer}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </section>
  )
}
