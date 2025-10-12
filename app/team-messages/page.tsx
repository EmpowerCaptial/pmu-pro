"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MessageSquare, 
  Send, 
  Users, 
  User, 
  Mail,
  Clock,
  CheckCircle2,
  X
} from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { NavBar } from '@/components/ui/navbar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
}

interface Message {
  id: string
  subject?: string
  message: string
  isRead: boolean
  readAt?: Date
  createdAt: Date
  sender?: TeamMember
  recipient?: TeamMember
}

export default function TeamMessagesPage() {
  const { currentUser, isLoading } = useDemoAuth()
  const [recipients, setRecipients] = useState<TeamMember[]>([])
  const [sentMessages, setSentMessages] = useState<Message[]>([])
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox')
  
  // Compose message state
  const [showComposeDialog, setShowComposeDialog] = useState(false)
  const [selectedRecipient, setSelectedRecipient] = useState('')
  const [messageSubject, setMessageSubject] = useState('')
  const [messageContent, setMessageContent] = useState('')
  const [isSending, setIsSending] = useState(false)

  // Load recipients and messages
  useEffect(() => {
    if (currentUser?.email) {
      loadRecipients()
      loadMessages()
    }
  }, [currentUser])

  const loadRecipients = async () => {
    try {
      const response = await fetch('/api/team-messages/recipients', {
        headers: {
          'x-user-email': currentUser?.email || ''
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setRecipients(data.recipients || [])
      }
    } catch (error) {
      console.error('Error loading recipients:', error)
    }
  }

  const loadMessages = async () => {
    try {
      const response = await fetch('/api/team-messages', {
        headers: {
          'x-user-email': currentUser?.email || ''
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSentMessages(data.sentMessages || [])
        setReceivedMessages(data.receivedMessages || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!selectedRecipient || !messageContent.trim()) return

    setIsSending(true)
    try {
      const response = await fetch('/api/team-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({
          recipientId: selectedRecipient,
          subject: messageSubject || null,
          message: messageContent
        })
      })

      if (response.ok) {
        // Reset form
        setSelectedRecipient('')
        setMessageSubject('')
        setMessageContent('')
        setShowComposeDialog(false)
        
        // Reload messages
        loadMessages()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await fetch('/api/team-messages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({ messageId })
      })

      // Update local state
      setReceivedMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, isRead: true, readAt: new Date() } : msg
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800'
      case 'instructor':
        return 'bg-blue-100 text-blue-800'
      case 'licensed':
        return 'bg-green-100 text-green-800'
      case 'student':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleName = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Owner'
      case 'instructor':
        return 'Instructor'
      case 'licensed':
        return 'Licensed'
      case 'student':
        return 'Student'
      default:
        return role
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-lavender-600/5">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lavender mx-auto mb-4"></div>
              <p className="text-gray-600">Loading messages...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-lavender-600/5">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600">Please sign in to access team messages.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-lavender-600/5">
      <NavBar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-lavender" />
                Team Messages
              </h1>
              <p className="text-gray-600 mt-2">Communicate with your studio team members</p>
            </div>
            
            <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
              <DialogTrigger asChild>
                <Button className="bg-lavender hover:bg-lavender-600">
                  <Send className="h-4 w-4 mr-2" />
                  New Message
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Send Message to Team Member</DialogTitle>
                  <DialogDescription>
                    Choose a recipient and compose your message
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  {/* Recipient Selector */}
                  <div className="space-y-2">
                    <Label htmlFor="recipient">Recipient *</Label>
                    <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team member..." />
                      </SelectTrigger>
                      <SelectContent>
                        {recipients.map((recipient) => (
                          <SelectItem key={recipient.id} value={recipient.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={recipient.avatar} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(recipient.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{recipient.name}</span>
                              <Badge variant="outline" className={`text-xs ${getRoleColor(recipient.role)}`}>
                                {getRoleName(recipient.role)}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {recipients.length === 0 && (
                      <p className="text-sm text-orange-600">
                        No team members found in your studio
                      </p>
                    )}
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject (optional)</Label>
                    <Input
                      id="subject"
                      placeholder="Message subject..."
                      value={messageSubject}
                      onChange={(e) => setMessageSubject(e.target.value)}
                    />
                  </div>

                  {/* Message Content */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Type your message here..."
                      rows={8}
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">{messageContent.length} characters</p>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowComposeDialog(false)}
                      disabled={isSending}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!selectedRecipient || !messageContent.trim() || isSending}
                      className="bg-lavender hover:bg-lavender-600"
                    >
                      {isSending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={activeTab === 'inbox' ? 'default' : 'outline'}
            onClick={() => setActiveTab('inbox')}
            className={activeTab === 'inbox' ? 'bg-lavender hover:bg-lavender-600' : ''}
          >
            <Mail className="h-4 w-4 mr-2" />
            Inbox
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500">{unreadCount}</Badge>
            )}
          </Button>
          <Button
            variant={activeTab === 'sent' ? 'default' : 'outline'}
            onClick={() => setActiveTab('sent')}
            className={activeTab === 'sent' ? 'bg-lavender hover:bg-lavender-600' : ''}
          >
            <Send className="h-4 w-4 mr-2" />
            Sent ({sentMessages.length})
          </Button>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {activeTab === 'inbox' && (
            <>
              {receivedMessages.length > 0 ? (
                receivedMessages.map((msg) => (
                  <Card key={msg.id} className={!msg.isRead ? 'border-lavender bg-lavender/5' : ''}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={msg.sender?.avatar} />
                            <AvatarFallback>
                              {getInitials(msg.sender?.name || '')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900">
                                {msg.sender?.name}
                              </h3>
                              <Badge variant="outline" className={`text-xs ${getRoleColor(msg.sender?.role || '')}`}>
                                {getRoleName(msg.sender?.role || '')}
                              </Badge>
                              {!msg.isRead && (
                                <Badge className="bg-red-500 text-xs">New</Badge>
                              )}
                            </div>
                            
                            {msg.subject && (
                              <h4 className="font-medium text-gray-700 mb-2">{msg.subject}</h4>
                            )}
                            
                            <p className="text-gray-600 whitespace-pre-wrap">{msg.message}</p>
                            
                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(msg.createdAt).toLocaleString()}
                              </div>
                              {msg.isRead && msg.readAt && (
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Read {new Date(msg.readAt).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {!msg.isRead && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsRead(msg.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-gray-600">When your team members send you messages, they'll appear here.</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {activeTab === 'sent' && (
            <>
              {sentMessages.length > 0 ? (
                sentMessages.map((msg) => (
                  <Card key={msg.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={msg.recipient?.avatar} />
                          <AvatarFallback>
                            {getInitials(msg.recipient?.name || '')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-500">To:</span>
                            <h3 className="font-semibold text-gray-900">
                              {msg.recipient?.name}
                            </h3>
                            <Badge variant="outline" className={`text-xs ${getRoleColor(msg.recipient?.role || '')}`}>
                              {getRoleName(msg.recipient?.role || '')}
                            </Badge>
                          </div>
                          
                          {msg.subject && (
                            <h4 className="font-medium text-gray-700 mb-2">{msg.subject}</h4>
                          )}
                          
                          <p className="text-gray-600 whitespace-pre-wrap">{msg.message}</p>
                          
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <div className="flex items-center gap-1 text-gray-500">
                              <Clock className="h-3 w-3" />
                              Sent {new Date(msg.createdAt).toLocaleString()}
                            </div>
                            {msg.isRead ? (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="h-3 w-3" />
                                Read by recipient
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-gray-500">
                                <Mail className="h-3 w-3" />
                                Unread
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No sent messages</h3>
                    <p className="text-gray-600 mb-4">
                      Start a conversation with your team members.
                    </p>
                    <Button
                      onClick={() => setShowComposeDialog(true)}
                      className="bg-lavender hover:bg-lavender-600"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Your First Message
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

