"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ExternalLink, Settings, CheckCircle, AlertCircle } from "lucide-react"

interface BookingIntegration {
  id: string
  name: string
  description: string
  logo: string
  connected: boolean
  features: string[]
  setupUrl: string
}

export function BookingIntegrations() {
  const [integrations, setIntegrations] = useState<BookingIntegration[]>([
    {
      id: "calendly",
      name: "Calendly",
      description: "Popular scheduling platform with automated booking",
      logo: "📅",
      connected: false,
      features: ["Automated scheduling", "Email reminders", "Payment integration"],
      setupUrl: "https://calendly.com",
    },
    {
      id: "acuity",
      name: "Acuity Scheduling",
      description: "Professional appointment scheduling with client management",
      logo: "🗓️",
      connected: true,
      features: ["Client intake forms", "Package booking", "SMS notifications"],
      setupUrl: "https://acuityscheduling.com",
    },
    {
      id: "square",
      name: "Square Appointments",
      description: "Booking with integrated payment processing",
      logo: "⬜",
      connected: false,
      features: ["Payment processing", "Staff management", "Customer database"],
      setupUrl: "https://squareup.com/appointments",
    },
    {
      id: "booksy",
      name: "Booksy",
      description: "Beauty industry focused booking platform",
      logo: "💄",
      connected: false,
      features: ["Beauty-specific features", "Client reviews", "Marketing tools"],
      setupUrl: "https://booksy.com",
    },
    {
      id: "fresha",
      name: "Fresha",
      description: "All-in-one beauty business management platform",
      logo: "✨",
      connected: false,
      features: ["POS system", "Inventory management", "Marketing campaigns"],
      setupUrl: "https://fresha.com",
    },
  ])

  const toggleConnection = (id: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === id ? { ...integration, connected: !integration.connected } : integration,
      ),
    )
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-sage/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sage-600">
          <Settings className="h-5 w-5" />
          Booking Integrations
        </CardTitle>
        <CardDescription>Connect with popular booking platforms to streamline your scheduling</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="p-4 rounded-lg border border-sage/20 bg-white/50 hover:bg-white/70 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{integration.logo}</span>
                <div>
                  <h3 className="font-medium text-foreground flex items-center gap-2">
                    {integration.name}
                    {integration.connected ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={integration.connected} onCheckedChange={() => toggleConnection(integration.id)} />
                <Badge variant={integration.connected ? "default" : "secondary"}>
                  {integration.connected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-2">Key Features:</p>
              <div className="flex flex-wrap gap-1">
                {integration.features.map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-sage/30 text-sage-600 hover:bg-sage/10 bg-transparent"
                onClick={() => window.open(integration.setupUrl, "_blank")}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Setup
              </Button>
              {integration.connected && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-sage/30 text-sage-600 hover:bg-sage/10 bg-transparent"
                >
                  Configure
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
