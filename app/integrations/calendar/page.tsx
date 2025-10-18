"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Calendar, 
  Plus, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  ExternalLink,
  Clock,
  ArrowLeftRight,
  Download,
  Upload
} from "lucide-react";
import { useDemoAuth } from "@/hooks/use-demo-auth";
import { CALENDAR_PROVIDERS } from "@/lib/calendar-integration";

interface CalendarIntegration {
  id: string;
  provider: string;
  providerName: string;
  calendarId?: string;
  calendarName?: string;
  isActive: boolean;
  syncDirection: 'IMPORT_ONLY' | 'EXPORT_ONLY' | 'BIDIRECTIONAL';
  lastSyncAt?: string;
  syncFrequency: number;
  createdAt: string;
}

export default function CalendarIntegrationPage() {
  const { currentUser, isAuthenticated } = useDemoAuth();
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([]);
  const [availableProviders] = useState(CALENDAR_PROVIDERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Integration form state
  const [showIntegrationForm, setShowIntegrationForm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [apiKey, setApiKey] = useState("");
  const [calendarId, setCalendarId] = useState("");
  const [calendarName, setCalendarName] = useState("");
  const [syncDirection, setSyncDirection] = useState<'IMPORT_ONLY' | 'EXPORT_ONLY' | 'BIDIRECTIONAL'>('BIDIRECTIONAL');
  const [syncFrequency, setSyncFrequency] = useState(15);
  const [testingConnection, setTestingConnection] = useState(false);
  const [availableCalendars, setAvailableCalendars] = useState<any[]>([]);

  // Load existing integrations on mount
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadIntegrations();
    }
  }, [isAuthenticated, currentUser?.email]);

  const loadIntegrations = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/calendar-integrations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.integrations || []);
      }
    } catch (error) {
      console.error("Failed to load integrations:", error);
    }
  };

  const handleGoogleCalendarConnect = async () => {
    setTestingConnection(true);
    setError(null);

    try {
      // Get current user email
      const userEmail = currentUser?.email;
      if (!userEmail) {
        setError("Please log in to connect your Google Calendar");
        setTestingConnection(false);
        return;
      }

      // Redirect to Google Calendar OAuth with user email
      window.location.href = `/api/oauth/google-calendar/authorize?email=${encodeURIComponent(userEmail)}`;
    } catch (error) {
      setError("Failed to start Google Calendar connection");
      setTestingConnection(false);
    }
  };

  const handleOutlookConnect = async () => {
    setTestingConnection(true);
    setError(null);

    try {
      // Get current user email
      const userEmail = currentUser?.email;
      if (!userEmail) {
        setError("Please log in to connect your Outlook Calendar");
        setTestingConnection(false);
        return;
      }

      // Redirect to Outlook OAuth with user email
      window.location.href = `/api/oauth/outlook/authorize?email=${encodeURIComponent(userEmail)}`;
    } catch (error) {
      setError("Failed to start Outlook Calendar connection");
      setTestingConnection(false);
    }
  };

  const testConnection = async () => {
    if (!selectedProvider || !apiKey) {
      setError("Please select a provider and enter API key");
      return;
    }

    setTestingConnection(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError("Authentication required");
        return;
      }

      const response = await fetch('/api/calendar-integrations/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: selectedProvider,
          providerName: availableProviders.find(p => p.id === selectedProvider)?.name,
          apiKey,
          calendarId: calendarId || undefined,
          calendarName: calendarName || undefined,
          syncDirection,
          syncFrequency
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Connection test failed');
      }

      const data = await response.json();
      setAvailableCalendars(data.availableCalendars || []);
      setSuccess(`Successfully connected to ${data.integration.providerName}!`);
      
      // Add to integrations list
      setIntegrations([data.integration, ...integrations]);
      setShowIntegrationForm(false);
      
      // Reset form
      setSelectedProvider("");
      setApiKey("");
      setCalendarId("");
      setCalendarName("");
      setAvailableCalendars([]);

    } catch (error) {
      setError(error instanceof Error ? error.message : "Connection test failed");
    } finally {
      setTestingConnection(false);
    }
  };

  const syncIntegration = async (integrationId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError("Authentication required");
        return;
      }

      const response = await fetch('/api/calendar-integrations/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ integrationId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Sync failed');
      }

      const data = await response.json();
      setSuccess(`Synced ${data.eventCount} events from ${integrations.find(i => i.id === integrationId)?.providerName}`);
      
      // Refresh integrations to update last sync time
      loadIntegrations();

    } catch (error) {
      setError(error instanceof Error ? error.message : "Sync failed");
    }
  };

  const toggleIntegration = async (integrationId: string, isActive: boolean) => {
    // In a real implementation, this would update the integration status
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, isActive }
          : integration
      )
    );
  };

  const getProviderInfo = (providerId: string) => {
    return availableProviders.find(p => p.id === providerId);
  };

  const getSyncDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'IMPORT_ONLY':
        return <Download className="h-4 w-4" />;
      case 'EXPORT_ONLY':
        return <Upload className="h-4 w-4" />;
      case 'BIDIRECTIONAL':
        return <ArrowLeftRight className="h-4 w-4" />;
      default:
        return <ArrowLeftRight className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 p-3 sm:p-4 pb-16 sm:pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-1 sm:mb-2">Calendar Integration</h1>
          <p className="text-sm sm:text-base text-muted">Connect your existing booking systems with PMU Pro's calendar</p>
        </div>

        {/* Integration Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900 text-sm sm:text-base">Easy OAuth Integration</h3>
              </div>
              <p className="text-xs sm:text-sm text-green-800 mb-2">
                No coding required! Just sign in with your account.
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge className="bg-green-100 text-green-800 text-xs">Google Calendar</Badge>
                <Badge className="bg-green-100 text-green-800 text-xs">Outlook Calendar</Badge>
                <Badge className="bg-green-100 text-green-800 text-xs">Facebook/Meta</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900 text-sm sm:text-base">API Key Integration</h3>
              </div>
              <p className="text-xs sm:text-sm text-blue-800 mb-2">
                Requires API key from your booking platform.
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge className="bg-blue-100 text-blue-800 text-xs">Calendly</Badge>
                <Badge className="bg-blue-100 text-blue-800 text-xs">Acuity</Badge>
                <Badge className="bg-blue-100 text-blue-800 text-xs">Bookly</Badge>
                <Badge className="bg-blue-100 text-blue-800 text-xs">SimplyBook</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            <span className="text-red-800 text-sm sm:text-base">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            <span className="text-green-800 text-sm sm:text-base">{success}</span>
          </div>
        )}

        {/* Add Integration Button */}
        <div className="mb-6 sm:mb-8">
          <Button
            onClick={() => setShowIntegrationForm(true)}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm sm:text-base"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Add Calendar Integration
          </Button>
        </div>

        {/* Integration Form */}
        {showIntegrationForm && (
          <Card className="mb-6 sm:mb-8">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-base sm:text-lg">Add Calendar Integration</CardTitle>
              <CardDescription className="text-sm sm:text-base">Connect your existing booking system with PMU Pro</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider" className="text-sm sm:text-base">Calendar Provider</Label>
                    <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                      <SelectTrigger className="h-9 sm:h-10">
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProviders.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            <div className="flex items-center gap-2">
                              <span>{provider.logo}</span>
                              <span>{provider.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedProvider === 'GOOGLE_CALENDAR' ? (
                    <div className="space-y-2">
                      <Label className="text-sm sm:text-base">Google Calendar Connection</Label>
                      <Button
                        onClick={handleGoogleCalendarConnect}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 sm:h-10"
                        disabled={testingConnection}
                      >
                        {testingConnection ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Calendar className="h-4 w-4 mr-2" />
                            Connect with Google Calendar
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-gray-600">
                        No API keys needed! Just sign in with your Google account.
                      </p>
                    </div>
                  ) : selectedProvider === 'OUTLOOK_CALENDAR' ? (
                    <div className="space-y-2">
                      <Label className="text-sm sm:text-base">Outlook Calendar Connection</Label>
                      <Button
                        onClick={handleOutlookConnect}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 sm:h-10"
                        disabled={testingConnection}
                      >
                        {testingConnection ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Calendar className="h-4 w-4 mr-2" />
                            Connect with Outlook Calendar
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-gray-600">
                        No API keys needed! Just sign in with your Microsoft account.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="apiKey" className="text-sm sm:text-base">API Key / Access Token</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="Enter your API key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="force-white-bg force-gray-border force-dark-text h-9 sm:h-10 text-sm sm:text-base"
                      />
                      <div className="bg-yellow-50 p-2 rounded-lg">
                        <p className="text-xs text-yellow-800">
                          <strong>Need help?</strong> Click the setup guide below for step-by-step instructions.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="calendarId" className="text-sm sm:text-base">Calendar ID (Optional)</Label>
                    <Input
                      id="calendarId"
                      placeholder="Enter calendar ID if known"
                      value={calendarId}
                      onChange={(e) => setCalendarId(e.target.value)}
                      className="force-white-bg force-gray-border force-dark-text h-9 sm:h-10 text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="syncDirection" className="text-sm sm:text-base">Sync Direction</Label>
                    <Select value={syncDirection} onValueChange={(value: any) => setSyncDirection(value)}>
                      <SelectTrigger className="h-9 sm:h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BIDIRECTIONAL">
                          <div className="flex items-center gap-2">
                            <ArrowLeftRight className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Two-way sync</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="IMPORT_ONLY">
                          <div className="flex items-center gap-2">
                            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Import only</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="EXPORT_ONLY">
                          <div className="flex items-center gap-2">
                            <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Export only</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="syncFrequency" className="text-sm sm:text-base">Sync Frequency (minutes)</Label>
                    <Select value={syncFrequency.toString()} onValueChange={(value) => setSyncFrequency(parseInt(value))}>
                      <SelectTrigger className="h-9 sm:h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">Every 5 minutes</SelectItem>
                        <SelectItem value="15">Every 15 minutes</SelectItem>
                        <SelectItem value="30">Every 30 minutes</SelectItem>
                        <SelectItem value="60">Every hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedProvider && (
                    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">
                        {getProviderInfo(selectedProvider)?.name} Setup
                      </h4>
                      <p className="text-xs sm:text-sm text-blue-800 mb-2">
                        {getProviderInfo(selectedProvider)?.setupInstructions}
                      </p>
                      
                      {selectedProvider === 'CALENDLY' && (
                        <div className="mt-3 space-y-2">
                          <h5 className="font-medium text-blue-900 text-xs sm:text-sm">Step-by-Step Guide:</h5>
                          <ol className="text-xs sm:text-sm text-blue-800 space-y-1 list-decimal list-inside">
                            <li>Log into your Calendly account</li>
                            <li>Go to Settings → Integrations → API & Webhooks</li>
                            <li>Click "Generate New Token"</li>
                            <li>Copy the token and paste it above</li>
                          </ol>
                        </div>
                      )}
                      
                      {selectedProvider === 'ACUITY_SCHEDULING' && (
                        <div className="mt-3 space-y-2">
                          <h5 className="font-medium text-blue-900 text-xs sm:text-sm">Step-by-Step Guide:</h5>
                          <ol className="text-xs sm:text-sm text-blue-800 space-y-1 list-decimal list-inside">
                            <li>Log into your Acuity Scheduling account</li>
                            <li>Go to Settings → Integrations → API</li>
                            <li>Click "Generate API Credentials"</li>
                            <li>Copy the API Key and paste it above</li>
                          </ol>
                        </div>
                      )}
                      
                      <a 
                        href={getProviderInfo(selectedProvider)?.apiDocumentation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm text-blue-600 hover:underline flex items-center gap-1 mt-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                        API Documentation
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {selectedProvider === 'GOOGLE_CALENDAR' ? (
                  <Button
                    onClick={handleGoogleCalendarConnect}
                    disabled={testingConnection}
                    className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
                  >
                    {testingConnection ? (
                      <>
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Connect with Google
                      </>
                    )}
                  </Button>
                ) : selectedProvider === 'OUTLOOK_CALENDAR' ? (
                  <Button
                    onClick={handleOutlookConnect}
                    disabled={testingConnection}
                    className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
                  >
                    {testingConnection ? (
                      <>
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Connect with Outlook
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={testConnection}
                    disabled={testingConnection || !selectedProvider || !apiKey}
                    className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
                  >
                    {testingConnection ? (
                      <>
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Test & Connect
                      </>
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowIntegrationForm(false)}
                  className="text-sm sm:text-base"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing Integrations */}
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold">Connected Calendars</h2>
          
          {integrations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 sm:py-12 p-4 sm:p-6">
                <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">No Calendar Integrations</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                  Connect your existing booking system to sync appointments with PMU Pro
                </p>
                <Button
                  onClick={() => setShowIntegrationForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Add Integration
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {integrations.map((integration) => (
                <Card key={integration.id} className={`${integration.isActive ? 'ring-2 ring-green-200' : 'opacity-75'}`}>
                  <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="text-xl sm:text-2xl">
                          {getProviderInfo(integration.provider)?.logo}
                        </div>
                        <div>
                          <CardTitle className="text-base sm:text-lg">{integration.providerName}</CardTitle>
                          {integration.calendarName && (
                            <p className="text-xs sm:text-sm text-gray-600">{integration.calendarName}</p>
                          )}
                        </div>
                      </div>
                      <Switch
                        checked={integration.isActive}
                        onCheckedChange={(checked) => toggleIntegration(integration.id, checked)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${integration.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} text-xs sm:text-sm`}>
                        {integration.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1 text-xs sm:text-sm">
                        {getSyncDirectionIcon(integration.syncDirection)}
                        <span className="text-xs">
                          {integration.syncDirection === 'BIDIRECTIONAL' ? 'Two-way' :
                           integration.syncDirection === 'IMPORT_ONLY' ? 'Import' : 'Export'}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3 p-3 sm:p-4">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Syncs every {integration.syncFrequency} minutes</span>
                    </div>
                    
                    {integration.lastSyncAt && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Last sync: {new Date(integration.lastSyncAt).toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => syncIntegration(integration.id)}
                        className="flex-1 text-xs sm:text-sm"
                      >
                        <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Sync Now
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {/* Open settings */}}
                        className="text-xs sm:text-sm"
                      >
                        <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Benefits Section */}
        <Card className="mt-6 sm:mt-8">
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              Calendar Integration Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2 sm:space-y-3">
                <h4 className="font-semibold text-sm sm:text-base">Unified Booking Experience</h4>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                  <li>• Sync appointments from Calendly, Acuity, Google Calendar</li>
                  <li>• View all bookings in PMU Pro's calendar</li>
                  <li>• Maintain existing client workflows</li>
                  <li>• Two-way sync keeps everything updated</li>
                </ul>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h4 className="font-semibold text-sm sm:text-base">Seamless Integration</h4>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                  <li>• No disruption to existing processes</li>
                  <li>• Automatic sync every 15 minutes</li>
                  <li>• Real-time webhook support</li>
                  <li>• Import/Export or bidirectional sync</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
