"use client"

import { useState, useEffect } from "react"
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
import { Bell, Shield, Palette, CreditCard, Star, Check, Key, Eye, EyeOff, FileSpreadsheet, Upload, Loader2, AlertCircle } from "lucide-react"
import { BILLING_PLANS } from "@/lib/billing-config"
import { Progress } from "@/components/ui/progress"
import * as XLSX from 'xlsx'

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
  
  // Set current plan based on user's selectedPlan
  useEffect(() => {
    if ((currentUser as any)?.selectedPlan) {
      // Map selectedPlan to feature-access plan types
      const plan = (currentUser as any).selectedPlan
      if (plan === 'studio') {
        setCurrentPlan('studio')
      } else if (plan === 'professional') {
        setCurrentPlan('premium')
      } else if (plan === 'starter') {
        setCurrentPlan('basic')
      } else {
        setCurrentPlan('starter')
      }
    }
  }, [currentUser])
  
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
  
  // Client import state
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importPreview, setImportPreview] = useState<any[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 })
  const [importResults, setImportResults] = useState<{ success: number; failed: number; errors: string[] }>({ success: 0, failed: 0, errors: [] })

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

  // Handle Excel/CSV file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportFile(file)
    setImportPreview([])
    setImportResults({ success: 0, failed: 0, errors: [] })

    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

      if (data.length < 2) {
        alert('Excel file must have at least a header row and one data row')
        setImportFile(null)
        return
      }

      // Get headers (first row)
      const headers = data[0].map((h: any) => String(h || '').toLowerCase().trim())
      
      // Map common column names to our client fields
      const columnMap: Record<string, string> = {
        'name': 'name',
        'full name': 'name',
        'client name': 'name',
        'email': 'email',
        'email address': 'email',
        'phone': 'phone',
        'phone number': 'phone',
        'telephone': 'phone',
        'mobile': 'phone',
        'date of birth': 'dateOfBirth',
        'dob': 'dateOfBirth',
        'birthday': 'dateOfBirth',
        'emergency contact': 'emergencyContact',
        'emergency': 'emergencyContact',
        'medical history': 'medicalHistory',
        'medical': 'medicalHistory',
        'allergies': 'allergies',
        'allergy': 'allergies',
        'skin type': 'skinType',
        'fitzpatrick': 'skinType',
        'fitz': 'skinType',
        'notes': 'notes',
        'note': 'notes',
        'comments': 'notes'
      }

      // Find column indices
      const columnIndices: Record<string, number> = {}
      Object.keys(columnMap).forEach(key => {
        const index = headers.findIndex(h => h.includes(key))
        if (index >= 0) {
          columnIndices[columnMap[key]] = index
        }
      })

      // Parse data rows (limit to first 100 rows for preview)
      const preview = data.slice(1, Math.min(101, data.length)).map((row, idx) => {
        const client: any = {}
        Object.entries(columnIndices).forEach(([field, colIndex]) => {
          const value = row[colIndex]
          if (value !== undefined && value !== null && value !== '') {
            client[field] = String(value).trim()
          }
        })
        return { ...client, _rowIndex: idx + 2 } // +2 because row 1 is header, and we're 0-indexed
      })

      setImportPreview(preview)
    } catch (error) {
      console.error('Error parsing Excel file:', error)
      alert('Error reading Excel file. Please make sure it\'s a valid .xlsx or .csv file.')
      setImportFile(null)
    }
  }

  // Handle importing clients from preview
  const handleImportClients = async () => {
    if (!importFile || importPreview.length === 0) return

    setIsImporting(true)
    setImportProgress({ current: 0, total: importPreview.length })
    setImportResults({ success: 0, failed: 0, errors: [] })

    const results = { success: 0, failed: 0, errors: [] as string[] }

    for (let i = 0; i < importPreview.length; i++) {
      const clientData = importPreview[i]
      setImportProgress({ current: i + 1, total: importPreview.length })

      // Skip if no name (required field)
      if (!clientData.name || clientData.name.trim() === '') {
        results.failed++
        results.errors.push(`Row ${clientData._rowIndex}: Missing required field "name"`)
        continue
      }

      try {
        const response = await fetch('/api/clients', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-user-email': currentUser?.email || '',
          },
          body: JSON.stringify({
            name: clientData.name,
            email: clientData.email || '',
            phone: clientData.phone || '',
            dateOfBirth: clientData.dateOfBirth || '',
            emergencyContact: clientData.emergencyContact || '',
            medicalHistory: clientData.medicalHistory || '',
            allergies: clientData.allergies || '',
            skinType: clientData.skinType || '',
            notes: clientData.notes || ''
          }),
        })

        if (response.ok) {
          results.success++
        } else {
          const errorData = await response.json()
          results.failed++
          results.errors.push(`Row ${clientData._rowIndex}: ${errorData.error || 'Failed to create client'}`)
        }
      } catch (error) {
        results.failed++
        results.errors.push(`Row ${clientData._rowIndex}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    setImportResults(results)
    setIsImporting(false)
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

          {/* Client Import */}
          {currentUser?.role !== 'student' && currentUser?.role !== 'instructor' && (
          <Card className="bg-white/90 backdrop-blur-sm border-lavender/20 shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <FileSpreadsheet className="h-4 w-4 sm:h-5 sm:w-5 text-lavender" />
                <span>Import Clients</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">Bulk import clients from Excel or CSV files</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Button
                onClick={() => setIsImportDialogOpen(true)}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Import Clients from Excel/CSV
              </Button>
            </CardContent>
          </Card>
          )}

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

          {/* Import Clients Dialog */}
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Import Clients from Excel/CSV
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 p-4 sm:p-6 pt-0">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="import-file" className="text-sm sm:text-base">Select Excel or CSV File</Label>
                  <Input
                    id="import-file"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500">
                    Supported formats: .xlsx, .xls, .csv. The first row should contain column headers.
                  </p>
                </div>

                {/* Preview */}
                {importPreview.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base">Preview ({importPreview.length} clients)</Label>
                    <div className="border rounded-lg overflow-x-auto max-h-64">
                      <table className="w-full text-xs sm:text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-2 py-1 text-left border">Name</th>
                            <th className="px-2 py-1 text-left border">Email</th>
                            <th className="px-2 py-1 text-left border">Phone</th>
                            <th className="px-2 py-1 text-left border">Date of Birth</th>
                            <th className="px-2 py-1 text-left border">Skin Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importPreview.map((client, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-2 py-1 border">{client.name || '-'}</td>
                              <td className="px-2 py-1 border">{client.email || '-'}</td>
                              <td className="px-2 py-1 border">{client.phone || '-'}</td>
                              <td className="px-2 py-1 border">{client.dateOfBirth || '-'}</td>
                              <td className="px-2 py-1 border">{client.skinType || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Import Progress */}
                {isImporting && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Importing clients...</span>
                      <span>{importProgress.current} / {importProgress.total}</span>
                    </div>
                    <Progress value={(importProgress.current / importProgress.total) * 100} />
                  </div>
                )}

                {/* Import Results */}
                {!isImporting && importResults.success + importResults.failed > 0 && (
                  <div className="space-y-2">
                    <div className={`p-3 rounded-lg ${importResults.failed === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {importResults.failed === 0 ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        )}
                        <span className="font-semibold">
                          Import Complete: {importResults.success} succeeded, {importResults.failed} failed
                        </span>
                      </div>
                      {importResults.errors.length > 0 && (
                        <div className="mt-2 max-h-32 overflow-y-auto">
                          <p className="text-xs font-semibold mb-1">Errors:</p>
                          <ul className="text-xs space-y-1">
                            {importResults.errors.slice(0, 10).map((error, idx) => (
                              <li key={idx} className="text-red-600">• {error}</li>
                            ))}
                            {importResults.errors.length > 10 && (
                              <li className="text-gray-500">... and {importResults.errors.length - 10} more errors</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsImportDialogOpen(false)
                      setImportFile(null)
                      setImportPreview([])
                      setImportResults({ success: 0, failed: 0, errors: [] })
                    }}
                    className="w-full sm:w-auto text-sm sm:text-base"
                    disabled={isImporting}
                  >
                    {importResults.success + importResults.failed > 0 ? 'Close' : 'Cancel'}
                  </Button>
                  {importPreview.length > 0 && (
                    <Button 
                      onClick={handleImportClients}
                      disabled={isImporting}
                      className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-sm sm:text-base"
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Import {importPreview.length} Client{importPreview.length !== 1 ? 's' : ''}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
