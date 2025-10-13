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
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Bell, Shield, Palette, CreditCard, Star, Check, Key, Eye, EyeOff } from "lucide-react"
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
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handleSave = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify(settings)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save settings')
      }

      const result = await response.json()
      
        // Update localStorage with the saved settings (use same key as auth hook)
        if (typeof window !== 'undefined' && currentUser) {
          const updatedUser = { ...currentUser, settings: result.settings }
          localStorage.setItem('demoUser', JSON.stringify(updatedUser))
        }
      
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please try again.')
    }
  }

  const handleUpgradePlan = (plan: 'starter' | 'professional' | 'studio') => {
    // Redirect to pricing page for plan upgrade (not billing page)
    window.location.href = '/pricing'
  }

  const handleManageBilling = async () => {
    try {
      if (!(currentUser as any)?.stripeCustomerId) {
        alert('No billing information found. Please contact support.')
        return
      }

      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser?.id,
          returnUrl: window.location.href
        })
      })

      const data = await response.json()

      if (data.success && data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to open billing portal. Please try again.')
      }
    } catch (error) {
      console.error('Billing portal error:', error)
      alert('Failed to open billing portal. Please try again.')
    }
  }

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Please fill in all password fields')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      alert('New password must be at least 8 characters long')
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (response.ok) {
        alert('Password changed successfully!')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setShowPasswordDialog(false)
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to change password')
      }
    } catch (error) {
      console.error('Password change error:', error)
      alert('An error occurred while changing password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/20 via-beige/30 to-ivory pb-20 sm:pb-0">
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

              {/* Password Change Section */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  <div className="space-y-0.5">
                    <Label className="text-sm sm:text-base">Password</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">Change your account password</p>
                  </div>
                  <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                        <Key className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Change Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                          Enter your current password and choose a new one.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="current-password"
                              type={showPasswords.current ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                              placeholder="Enter current password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                            >
                              {showPasswords.current ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <div className="relative">
                            <Input
                              id="new-password"
                              type={showPasswords.new ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                              placeholder="Enter new password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            >
                              {showPasswords.new ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <div className="relative">
                            <Input
                              id="confirm-password"
                              type={showPasswords.confirm ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                              placeholder="Confirm new password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            >
                              {showPasswords.confirm ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setShowPasswordDialog(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleChangePassword}
                            disabled={isChangingPassword}
                            className="flex-1 bg-lavender hover:bg-lavender/90"
                          >
                            {isChangingPassword ? 'Changing...' : 'Change Password'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
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

          {/* Subscription Management - Only for owners/independent artists, not students under enterprise */}
          {currentUser?.role !== 'student' && currentUser?.role !== 'instructor' && (
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
                    <h3 className="font-semibold text-base sm:text-lg">
                      Current Plan: {(currentUser as any)?.selectedPlan === 'demo' ? 'Trial Plan' : 
                                   (currentUser as any)?.selectedPlan === 'starter' ? 'Starter Plan' :
                                   (currentUser as any)?.selectedPlan === 'professional' ? 'Professional Plan' :
                                   (currentUser as any)?.selectedPlan === 'studio' ? 'Studio Enterprise Plan' :
                                   BILLING_PLANS[currentPlan as keyof typeof BILLING_PLANS].name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {(currentUser as any)?.selectedPlan === 'demo' ? 'Free Trial' : 
                       `$${BILLING_PLANS[currentPlan as keyof typeof BILLING_PLANS].price}/month`}
                    </p>
                  </div>
                  <Badge className={`text-xs sm:text-sm ${
                    (currentUser as any)?.hasActiveSubscription 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {(currentUser as any)?.hasActiveSubscription ? 'Active' : 'Trial'}
                  </Badge>
                </div>
                {!(currentUser as any)?.hasActiveSubscription && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-xs text-yellow-800">
                      You're currently on a trial. Subscribe to continue using PMU Pro after your trial expires.
                    </p>
                  </div>
                )}
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
                {(currentUser as any)?.hasActiveSubscription && (
                  <Button
                    variant="outline"
                    onClick={handleManageBilling}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    Manage Billing
                  </Button>
                )}
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
          )}
        </div>
      </div>
    </div>
  )
}
