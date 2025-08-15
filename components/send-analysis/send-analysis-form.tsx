"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Copy, Check, User, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation"

export function SendAnalysisForm() {
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [linkGenerated, setLinkGenerated] = useState(false)
  const [analysisLink, setAnalysisLink] = useState("")
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const generateAnalysisLink = () => {
    // Generate unique analysis link for client
    const linkId = Math.random().toString(36).substring(2, 15)
    const link = `${window.location.origin}/client-analysis?id=${linkId}&artist=${encodeURIComponent("Demo PMU Artist")}`
    setAnalysisLink(link)
    setLinkGenerated(true)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(analysisLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  const handleSendEmail = async () => {
    setIsLoading(true)

    // Simulate sending email
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsLoading(false)

    // Show success and redirect to dashboard
    alert(`Analysis link sent successfully to ${clientEmail}!`)
    router.push("/dashboard")
  }

  const defaultMessage = `Hi ${clientName || "[Client Name]"},

I hope this message finds you well! As part of our consultation process, I'd like to invite you to complete a complimentary skin analysis that will help me provide you with the best possible PMU service.

This analysis will help determine:
• Your Fitzpatrick skin type
• Skin undertones for perfect pigment matching
• Personalized recommendations for your procedure

The analysis takes just a few minutes and will provide valuable insights for your PMU journey.

Please click the link below to get started:

Best regards,
Demo PMU Artist
PMU Pro Certified Artist`

  return (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm border-lavender/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-bold">
            <User className="h-5 w-5 text-lavender" />
            Client Information
          </CardTitle>
          <CardDescription>Enter your client's details to send them a personalized analysis link</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName" className="font-semibold">
                Client Name
              </Label>
              <Input
                id="clientName"
                placeholder="Enter client's full name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="bg-white/90 backdrop-blur-sm border-lavender/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientEmail" className="font-semibold">
                Client Email
              </Label>
              <Input
                id="clientEmail"
                type="email"
                placeholder="client@example.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="bg-white/90 backdrop-blur-sm border-lavender/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="font-semibold">
              Personal Message (Optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to your client..."
              value={message || defaultMessage}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="bg-white/90 backdrop-blur-sm border-lavender/30"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-lavender/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-bold">
            <MessageSquare className="h-5 w-5 text-lavender" />
            Analysis Link
          </CardTitle>
          <CardDescription>Generate and send the analysis link to your client</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!linkGenerated ? (
            <Button
              onClick={generateAnalysisLink}
              className="w-full bg-lavender hover:bg-lavender-600 text-white font-semibold"
              disabled={!clientName || !clientEmail}
            >
              Generate Analysis Link
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-lavender/20">
                <p className="text-sm text-gray-600 mb-2 font-semibold">Generated Analysis Link:</p>
                <p className="text-xs text-gray-800 break-all font-mono">{analysisLink}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="flex-1 bg-white/90 backdrop-blur-sm border-lavender/30 text-lavender-700 font-semibold hover:bg-lavender/10"
                >
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? "Copied!" : "Copy Link"}
                </Button>

                <Button
                  onClick={handleSendEmail}
                  disabled={isLoading}
                  className="flex-1 bg-lavender hover:bg-lavender-600 text-white font-semibold"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {isLoading ? "Sending..." : "Send Email"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
