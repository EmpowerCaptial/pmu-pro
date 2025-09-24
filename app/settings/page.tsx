"use client"

import { useState } from "react"
import { NavBar } from "@/components/ui/navbar"
import { useDemoAuth } from "@/hooks/use-demo-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Bell, Shield, Palette, CreditCard, Star, Check } from "lucide-react"
import { BILLING_PLANS } from "@/lib/billing-config"

export default function SettingsPage() {
  const { currentUser, isAuthenticated } = useDemoAuth()
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    appointmentReminders: true,
    clientUpdates: true,
    timezone: "America/Los_Angeles",
    language: "en",
    theme: "light",
    twoFactorAuth: false,
    publicProfile: true,
    showPhone: false,
    showEmail: true,
  })

  const [currentPlan, setCurrentPlan] = useState('starter') // Default to starter plan

  const handleSave = () => {
    // Save settings logic here
    console.log("Settings saved:", settings)
  }

  const handleUpgradePlan = (plan: 'starter' | 'professional' | 'studio') => {
    // Redirect to billing page for plan upgrade
    window.location.href = '/billing'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/20 via-beige/30 to-ivory">
      {/* Background Logo */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <img src="/images/pmu-guide-logo.png" alt="PMU Guide Logo" className="w-96 h-96 opacity-5 object-contain" />
      </div>

      <NavBar 
        currentPath="/settings" 
        user={currentUser ? {
          name: currentUser.name,
          email: currentUser.email,
          initials: currentUser.name?.split(' ').map(n => n[0]).join('') || currentUser.email.charAt(0).toUpperCase()
        } : undefined} 
      />

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 relative z-10">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-ink">Settings</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Manage your account preferences</p>
            </div>
            <Button
              onClick={handleSave}
              className="bg-white/90 backdrop-blur-sm border border-lavender text-lavender hover:bg-lavender hover:text-white font-semibold text-sm sm:text-base w-full sm:w-auto"
            >
              Save Changes
            </Button>
          </div>

          {/* Notifications */}
          <Card className="bg-white/90 backdrop-blur-sm border-lavender/20 shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-lavender" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <div className="space-y-0.5">
                  <Label className="text-sm sm:text-base">Email Notifications</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                  className="data-[state=checked]:bg-lavender data-[state=unchecked]:bg-gray-300"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <div className="space-y-0.5">
                  <Label className="text-sm sm:text-base">SMS Notifications</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Receive notifications via text message</p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
                  className="data-[state=checked]:bg-lavender data-[state=unchecked]:bg-gray-300"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <div className="space-y-0.5">
                  <Label className="text-sm sm:text-base">Appointment Reminders</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Get reminded about upcoming appointments</p>
                </div>
                <Switch
                  checked={settings.appointmentReminders}
                  onCheckedChange={(checked) => setSettings({ ...settings, appointmentReminders: checked })}
                  className="data-[state=checked]:bg-lavender data-[state=unchecked]:bg-gray-300"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <div className="space-y-0.5">
                  <Label className="text-sm sm:text-base">Client Updates</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Notifications about client activity</p>
                </div>
                <Switch
                  checked={settings.clientUpdates}
                  onCheckedChange={(checked) => setSettings({ ...settings, clientUpdates: checked })}
                  className="data-[state=checked]:bg-lavender data-[state=unchecked]:bg-gray-300"
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="bg-white/90 backdrop-blur-sm border-lavender/20 shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-lavender" />
                <span>Privacy & Security</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">Control your privacy and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <div className="space-y-0.5">
                  <Label className="text-sm sm:text-base">Two-Factor Authentication</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })}
                  className="data-[state=checked]:bg-lavender data-[state=unchecked]:bg-gray-300"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <div className="space-y-0.5">
                  <Label className="text-sm sm:text-base">Public Profile</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Allow clients to find your profile</p>
                </div>
                <Switch
                  checked={settings.publicProfile}
                  onCheckedChange={(checked) => setSettings({ ...settings, publicProfile: checked })}
                  className="data-[state=checked]:bg-lavender data-[state=unchecked]:bg-gray-300"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <div className="space-y-0.5">
                  <Label className="text-sm sm:text-base">Show Email</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Display email on public profile</p>
                </div>
                <Switch
                  checked={settings.showEmail}
                  onCheckedChange={(checked) => setSettings({ ...settings, showEmail: checked })}
                  className="data-[state=checked]:bg-lavender data-[state=unchecked]:bg-gray-300"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <div className="space-y-0.5">
                  <Label className="text-sm sm:text-base">Show Phone</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Display phone number on public profile</p>
                </div>
                <Switch
                  checked={settings.showPhone}
                  onCheckedChange={(checked) => setSettings({ ...settings, showPhone: checked })}
                  className="data-[state=checked]:bg-lavender data-[state=unchecked]:bg-gray-300"
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="bg-white/90 backdrop-blur-sm border-lavender/20 shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Palette className="h-4 w-4 sm:h-5 sm:w-5 text-lavender" />
                <span>Preferences</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">Customize your app experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Timezone</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) => setSettings({ ...settings, timezone: value })}
                  >
                    <SelectTrigger className="h-9 sm:h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Language</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) => setSettings({ ...settings, language: value })}
                  >
                    <SelectTrigger className="h-9 sm:h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Management */}
          <Card className="bg-white/90 backdrop-blur-sm border-lavender/20 shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-lavender" />
                <span>Subscription Management</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">Manage your PMU Pro subscription plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              {/* Current Plan */}
              <div className="bg-gradient-to-r from-lavender/10 to-purple/10 p-3 sm:p-4 rounded-lg border border-lavender/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">Current Plan: {BILLING_PLANS[currentPlan as keyof typeof BILLING_PLANS].name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">${BILLING_PLANS[currentPlan as keyof typeof BILLING_PLANS].price}/month</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm">Active</Badge>
                </div>
              </div>

              {/* Plan Comparison */}
              <div className="space-y-3 sm:space-y-4">
                <h4 className="font-semibold text-sm sm:text-base">Available Plans</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {Object.entries(BILLING_PLANS).map(([key, plan]) => (
                    <div key={key} className={`p-3 sm:p-4 rounded-lg border ${
                      currentPlan === key 
                        ? 'border-lavender bg-lavender/10' 
                        : 'border-gray-200 bg-white'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-sm sm:text-base">{plan.name}</h5>
                        {plan.popular && <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />}
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-lavender mb-2">${plan.price}</div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3">{plan.description}</p>
                      
                      <ul className="space-y-1 mb-3 sm:mb-4">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center text-xs sm:text-sm">
                            <Check className="w-3 h-3 text-green-500 mr-2" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {currentPlan !== key && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpgradePlan(key as 'starter' | 'professional' | 'studio')}
                          className="w-full text-xs sm:text-sm"
                        >
                          {currentPlan === 'starter' && key === 'professional' ? 'Upgrade' : 
                           currentPlan === 'professional' && key === 'studio' ? 'Upgrade' : 
                           'Change Plan'}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Billing Actions */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => alert('Billing history coming soon!')}
                  className="flex-1 text-xs sm:text-sm"
                >
                  Billing History
                </Button>
                <Button
                  variant="outline"
                  onClick={() => alert('Cancel subscription coming soon!')}
                  className="flex-1 text-xs sm:text-sm"
                >
                  Cancel Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
