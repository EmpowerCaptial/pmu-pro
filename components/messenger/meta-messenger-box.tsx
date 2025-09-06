"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Settings, ExternalLink, Facebook, Instagram, CheckCircle, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useMetaConnections } from "@/hooks/use-meta-connections"

interface Message {
  id: string
  platform: "facebook" | "instagram"
  sender: string
  message: string
  timestamp: string
  unread: boolean
}

export function MetaMessengerBox() {
  const { connections, isLoading, isConnected, refreshConnections } = useMetaConnections();
  const [messages, setMessages] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isSetupOpen, setIsSetupOpen] = useState(false)

  // Mock messages for demo
  useEffect(() => {
    if (isConnected) {
      const mockMessages: Message[] = [
        {
          id: "1",
          platform: "instagram",
          sender: "Sarah_beauty23",
          message: "Hi! I'm interested in eyebrow microblading. Can you tell me more about the process?",
          timestamp: "2 min ago",
          unread: true,
        },
        {
          id: "2",
          platform: "facebook",
          sender: "Maria Garcia",
          message: "Thank you for the consultation! When can we schedule the appointment?",
          timestamp: "15 min ago",
          unread: true,
        },
        {
          id: "3",
          platform: "instagram",
          sender: "Emma_wilson",
          message: "I saw your work on Instagram. Do you offer lip blushing services?",
          timestamp: "1 hour ago",
          unread: false,
        },
      ]
      setMessages(mockMessages)
      setUnreadCount(mockMessages.filter((m) => m.unread).length)
    }
  }, [isConnected])

  const handleConnect = () => {
    // Redirect to the seamless Meta integration page
    window.location.href = '/integrations/meta';
  };

  // Refresh connections when returning from integration page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshConnections();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refreshConnections]);

  const handleMessageClick = (messageId: string) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, unread: false } : msg)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  return (
    <Card className="border-border shadow-sm hover:shadow-md transition-shadow bg-white/90 backdrop-blur-sm border-lavender/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-lavender" />
            <CardTitle className="text-lg font-bold">Meta Messenger</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="bg-red-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Dialog open={isSetupOpen} onOpenChange={setIsSetupOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-ivory">
              <DialogHeader>
                <DialogTitle>Connect Meta Messenger</DialogTitle>
                <DialogDescription>
                  Connect your Facebook and Instagram business accounts seamlessly with one-click OAuth integration.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Facebook className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Seamless Facebook & Instagram Connection</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      One-click connection to your Facebook page and Instagram business account. 
                      No technical knowledge required!
                    </p>
                  </div>
                  <Button 
                    onClick={handleConnect}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Facebook className="h-4 w-4 mr-2" />
                    Connect with Facebook
                  </Button>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-800">
                      <strong>Seamless Experience:</strong> You'll be redirected to Facebook, 
                      log in with your account, and return automatically with your pages ready to connect.
                    </p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          {isConnected
            ? `Connected to ${connections.length} Facebook page${connections.length > 1 ? 's' : ''} with Instagram integration`
            : "Connect your Meta accounts to manage messages"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isConnected ? (
          <div className="text-center py-6">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Connect your Facebook and Instagram business accounts to start managing messages
            </p>
            <Button
              onClick={() => setIsSetupOpen(true)}
              className="bg-lavender hover:bg-lavender-600 text-white font-semibold"
            >
              Connect Meta Accounts
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No messages yet</p>
            ) : (
              messages.slice(0, 3).map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    message.unread ? "bg-lavender/5 border-lavender/30" : "bg-gray-50 border-gray-200"
                  }`}
                  onClick={() => handleMessageClick(message.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {message.platform === "facebook" ? (
                        <Facebook className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Instagram className="h-4 w-4 text-pink-600" />
                      )}
                      <span className="font-medium text-sm">{message.sender}</span>
                      {message.unread && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                    </div>
                    <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{message.message}</p>
                </div>
              ))
            )}
            {messages.length > 3 && (
              <Button
                variant="outline"
                className="w-full mt-3 text-lavender-700 border-lavender/30 hover:bg-lavender/10 bg-transparent"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View All Messages ({messages.length})
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
