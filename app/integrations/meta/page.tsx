"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Facebook, 
  Instagram, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  MessageSquare,
  Copy,
  RefreshCw
} from "lucide-react";
import { useDemoAuth } from "@/hooks/use-demo-auth";

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  expires_in?: number;
  hasInstagram: boolean;
  instagramId?: string;
}

interface MetaConnection {
  id: string;
  pageId: string;
  pageName: string;
  hasInstagram: boolean;
  igUsername?: string;
  expiresAt?: string;
}

export default function MetaIntegrationPage() {
  const { currentUser, isAuthenticated } = useDemoAuth();
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [connections, setConnections] = useState<MetaConnection[]>([]);
  const [step, setStep] = useState<"idle" | "pages" | "connected">("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // AI Reply Testing
  const [testMessage, setTestMessage] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Load existing connections on mount
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadConnections();
    }
  }, [isAuthenticated, currentUser?.email]);

  // Handle OAuth callback parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pagesParam = urlParams.get('pages');
    const successMessage = urlParams.get('success');
    const errorMessage = urlParams.get('error');

    if (successMessage) {
      setSuccess(decodeURIComponent(successMessage));
    }

    if (errorMessage) {
      setError(decodeURIComponent(errorMessage));
    }

    if (pagesParam) {
      try {
        const parsedPages = JSON.parse(decodeURIComponent(pagesParam));
        setPages(parsedPages);
        setStep("pages");
        
        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Failed to parse pages parameter:', error);
        setError('Failed to load Facebook pages');
      }
    }
  }, []);

  const loadConnections = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/meta/connections', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections || []);
        if (data.connections?.length > 0) {
          setStep("connected");
        }
      }
    } catch (error) {
      console.error("Failed to load connections:", error);
    }
  };

  const connectFacebook = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Redirect to Facebook OAuth for seamless connection
      const facebookAuthUrl = `https://www.facebook.com/v20.0/dialog/oauth?` +
        `client_id=${process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(window.location.origin + '/integrations/meta/callback')}&` +
        `scope=email,public_profile,pages_show_list,pages_read_engagement,pages_manage_metadata,instagram_basic&` +
        `response_type=code&` +
        `state=${currentUser?.id || 'demo'}`;
      
      // Redirect to Facebook OAuth
      window.location.href = facebookAuthUrl;
    } catch (error) {
      setError("Failed to connect to Facebook. Please try again.");
      setLoading(false);
    }
  };

  const selectPage = async (page: FacebookPage) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError("Authentication required");
        return;
      }

      const response = await fetch('/api/meta/select-page', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pageId: page.id,
          pageName: page.name,
          pageAccessToken: page.access_token,
          pageTokenExpiresIn: page.expires_in
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save page connection');
      }

      const data = await response.json();
      setConnections([...connections, data.connection]);
      setStep("connected");
      setSuccess(`Successfully connected to ${page.name}!`);
      
      if (page.hasInstagram) {
        setSuccess(`Successfully connected to ${page.name} and Instagram!`);
      } else {
        setSuccess(`Successfully connected to ${page.name}! Note: Instagram is not linked to this page.`);
      }
    } catch (error) {
      setError("Failed to save page connection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const testAIReply = async () => {
    if (!testMessage.trim()) {
      setError("Please enter a test message");
      return;
    }

    setAiLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError("Authentication required");
        return;
      }

      const response = await fetch('/api/ai/ig-reply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: testMessage,
          brandTone: "friendly, expert PMU instructor",
          service: "permanent makeup"
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI reply');
      }

      const data = await response.json();
      setAiReply(data.reply);
    } catch (error) {
      setError("Failed to generate AI reply. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/10 via-white to-purple/5 p-3 sm:p-4 pb-16 sm:pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-1 sm:mb-2">Facebook & Instagram Integration</h1>
          <p className="text-sm sm:text-base text-muted">Connect your Facebook page and Instagram account for AI-powered DM responses</p>
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

        {/* Connection Status */}
        {step === "connected" && connections.length > 0 && (
          <Card className="mb-6 sm:mb-8">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                Connected Accounts
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">Your Facebook pages and Instagram accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4">
              {connections.map((connection) => (
                <div key={connection.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3 sm:gap-0">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Facebook className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                    <div>
                      <div className="font-semibold text-sm sm:text-base">{connection.pageName}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Page ID: {connection.pageId}</div>
                      {connection.hasInstagram && connection.igUsername && (
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-pink-600">
                          <Instagram className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>@{connection.igUsername}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {connection.hasInstagram ? (
                      <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm">Instagram Linked</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs sm:text-sm">Facebook Only</Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Connection Section */}
          <Card>
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                Connect Facebook & Instagram
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">Link your Facebook page and Instagram business account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-4">
              {step === "idle" && (
                <div className="text-center space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Facebook className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-sm sm:text-base">Connect Your Facebook Page</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                      One-click connection to your Facebook page and Instagram business account. 
                      No coding or technical knowledge required!
                    </p>
                  </div>
                  <Button 
                    onClick={connectFacebook}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                        Redirecting to Facebook...
                      </>
                    ) : (
                      <>
                        <Facebook className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Connect with Facebook
                      </>
                    )}
                  </Button>
                  <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
                    <p className="text-xs text-green-800">
                      <strong>Seamless Experience:</strong> You'll be redirected to Facebook, 
                      log in with your account, and return automatically with your pages ready to connect.
                    </p>
                  </div>
                </div>
              )}

              {step === "pages" && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-semibold text-sm sm:text-base">Choose a Facebook Page</h3>
                  <div className="space-y-2 sm:space-y-3">
                    {pages.map((page) => (
                      <div key={page.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 border rounded-lg gap-2 sm:gap-0">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Facebook className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                          <div>
                            <div className="font-medium text-sm sm:text-base">{page.name}</div>
                            <div className="text-xs text-gray-500">Page ID: {page.id}</div>
                            {page.hasInstagram && (
                              <div className="flex items-center gap-1 text-xs text-pink-600">
                                <Instagram className="h-3 w-3" />
                                <span>Instagram Linked</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => selectPage(page)}
                          disabled={loading}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm w-full sm:w-auto"
                        >
                          {loading ? (
                            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                          ) : (
                            "Connect"
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Requirements</h4>
                <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                  <li>• Your Instagram must be a <strong>Professional</strong> account</li>
                  <li>• Instagram must be linked to your Facebook Page</li>
                  <li>• You must be an admin of the Facebook Page</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* AI Testing Section */}
          <Card>
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                AI Reply Testing
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">Test AI-powered Instagram DM responses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4">
              <div className="space-y-2">
                <Label htmlFor="test-message" className="text-sm sm:text-base">Test Message</Label>
                <Textarea
                  id="test-message"
                  placeholder="Enter a sample DM message from a potential client..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="force-white-bg force-gray-border force-dark-text text-sm sm:text-base"
                  rows={3}
                />
              </div>

              <Button
                onClick={testAIReply}
                disabled={aiLoading || !testMessage.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 text-sm sm:text-base"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                    Generating Reply...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Generate AI Reply
                  </>
                )}
              </Button>

              {aiReply && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm sm:text-base">AI Generated Reply</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(aiReply)}
                      className="text-xs sm:text-sm"
                    >
                      <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="p-2 sm:p-3 bg-gray-50 rounded-lg border">
                    <p className="text-xs sm:text-sm whitespace-pre-wrap">{aiReply}</p>
                  </div>
                </div>
              )}

              <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2 text-sm sm:text-base">AI Features</h4>
                <ul className="text-xs sm:text-sm text-purple-800 space-y-1">
                  <li>• Generates professional, friendly responses</li>
                  <li>• Tailored to PMU industry tone</li>
                  <li>• Includes follow-up questions</li>
                  <li>• 80-120 word optimal length</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
