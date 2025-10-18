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
  X,
  Trash2,
  Archive,
  MoreVertical,
  Mic,
  MicOff
} from 'lucide-react'
import { useDemoAuth } from '@/hooks/use-demo-auth'
import { NavBar } from '@/components/ui/navbar'
import { VoiceToText } from '@/components/voice/voice-to-text'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null)
  
  // Compose message state
  const [showComposeDialog, setShowComposeDialog] = useState(false)
  const [selectedRecipient, setSelectedRecipient] = useState('')
  const [messageSubject, setMessageSubject] = useState('')
  const [messageContent, setMessageContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  
  // Delete/Archive state
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)
  const [messageToArchive, setMessageToArchive] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Load recipients and messages
  useEffect(() => {
    if (currentUser?.email) {
      loadRecipients()
      loadMessages()
    }
  }, [currentUser])

  const loadRecipients = async () => {
    try {
      console.log('🔍 Loading recipients for:', currentUser?.email)
      
      const response = await fetch('/api/team-messages/recipients', {
        headers: {
          'x-user-email': currentUser?.email || ''
        }
      })
      
      console.log('📡 Recipients API response:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Recipients loaded:', data.recipients?.length || 0)
        setRecipients(data.recipients || [])
      } else {
        console.error('❌ Recipients API failed:', response.status)
        const errorText = await response.text()
        console.error('Error details:', errorText)
      }
    } catch (error) {
      console.error('❌ Error loading recipients:', error)
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

  const handleTranscriptionComplete = (transcribedText: string) => {
    setMessageContent(transcribedText)
    setShowVoiceInput(false)
  }

  const handleRewriteComplete = (rewrittenText: string) => {
    setMessageContent(rewrittenText)
  }

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await fetch('/api/team-messages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({ messageId, action: 'read' })
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

  const handleDeleteMessage = async (messageId: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/team-messages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({ messageId, action: 'delete' })
      })

      if (response.ok) {
        // Remove from sent messages
        setSentMessages(prev => prev.filter(msg => msg.id !== messageId))
        setMessageToDelete(null)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete message')
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      alert('Failed to delete message')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleArchiveMessage = async (messageId: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/team-messages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ''
        },
        body: JSON.stringify({ messageId, action: 'archive' })
      })

      if (response.ok) {
        // Remove from received messages
        setReceivedMessages(prev => prev.filter(msg => msg.id !== messageId))
        setMessageToArchive(null)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to archive message')
      }
    } catch (error) {
      console.error('Error archiving message:', error)
      alert('Failed to archive message')
    } finally {
      setIsProcessing(false)
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
        <NavBar user={currentUser ? {
          name: currentUser.name,
          email: currentUser.email,
          avatar: (currentUser as any).avatar
        } : undefined} />
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
        <NavBar user={undefined} />
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
      <NavBar user={currentUser ? {
        name: currentUser.name,
        email: currentUser.email,
        avatar: (currentUser as any).avatar
      } : undefined} />
      
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-lavender flex-shrink-0" />
                <span className="truncate">Team Messages</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Communicate with your studio team</p>
            </div>
            
            <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
              <DialogTrigger asChild>
                <Button className="bg-lavender hover:bg-lavender-600 flex-shrink-0">
                  <Send className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">New Message</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">Send Message to Team Member</DialogTitle>
                  <DialogDescription className="text-sm">
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="message">Message *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowVoiceInput(!showVoiceInput)}
                        className="flex items-center space-x-2"
                      >
                        {showVoiceInput ? (
                          <>
                            <MicOff className="h-4 w-4" />
                            <span>Hide Voice Input</span>
                          </>
                        ) : (
                          <>
                            <Mic className="h-4 w-4" />
                            <span>Voice Input</span>
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {showVoiceInput && (
                      <VoiceToText
                        onTranscriptionComplete={handleTranscriptionComplete}
                        onRewriteComplete={handleRewriteComplete}
                        placeholder="Click the microphone to dictate your team message..."
                        className="mb-4"
                      />
                    )}
                    
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
        <div className="mb-6 flex gap-2 overflow-x-auto">
          <Button
            variant={activeTab === 'inbox' ? 'default' : 'outline'}
            onClick={() => setActiveTab('inbox')}
            className={`flex-shrink-0 ${activeTab === 'inbox' ? 'bg-lavender hover:bg-lavender-600' : ''}`}
          >
            <Mail className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Inbox</span>
            {unreadCount > 0 && (
              <Badge className="ml-1 sm:ml-2 bg-red-500 text-xs">{unreadCount}</Badge>
            )}
          </Button>
          <Button
            variant={activeTab === 'sent' ? 'default' : 'outline'}
            onClick={() => setActiveTab('sent')}
            className={`flex-shrink-0 ${activeTab === 'sent' ? 'bg-lavender hover:bg-lavender-600' : ''}`}
          >
            <Send className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Sent</span>
            <span className="ml-1 sm:ml-0 text-xs">({sentMessages.length})</span>
          </Button>
        </div>

        {/* Messages List */}
        <div className="space-y-3">
          {activeTab === 'inbox' && (
            <>
              {receivedMessages.length > 0 ? (
                receivedMessages.map((msg) => {
                  const isExpanded = expandedMessageId === msg.id
                  return (
                    <Card 
                      key={msg.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${!msg.isRead ? 'border-lavender bg-lavender/5' : ''}`}
                      onClick={() => {
                        setExpandedMessageId(isExpanded ? null : msg.id)
                        if (!msg.isRead && !isExpanded) {
                          handleMarkAsRead(msg.id)
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        {/* Compact View */}
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={msg.sender?.avatar} />
                            <AvatarFallback className="text-sm">
                              {getInitials(msg.sender?.name || '')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-gray-900 text-sm truncate">
                                {msg.sender?.name}
                              </h3>
                              <Badge variant="outline" className={`text-xs ${getRoleColor(msg.sender?.role || '')}`}>
                                {getRoleName(msg.sender?.role || '')}
                              </Badge>
                              {!msg.isRead && (
                                <Badge className="bg-red-500 text-xs">New</Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <Clock className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">
                                {new Date(msg.createdAt).toLocaleDateString()} at {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            
                            {!isExpanded && msg.subject && (
                              <p className="text-sm text-gray-600 truncate mt-1">
                                {msg.subject}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex-shrink-0 flex items-center gap-2">
                            {isExpanded && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setMessageToArchive(msg.id)
                                    }}
                                    className="text-orange-600"
                                  >
                                    <Archive className="h-4 w-4 mr-2" />
                                    Archive
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                            {isExpanded ? (
                              <X className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Mail className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                        
                        {/* Expanded View */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            {msg.subject && (
                              <h4 className="font-medium text-gray-900 mb-3 break-words">
                                {msg.subject}
                              </h4>
                            )}
                            
                            <p className="text-gray-700 whitespace-pre-wrap break-words text-sm leading-relaxed">
                              {msg.message}
                            </p>
                            
                            {msg.readAt && (
                              <div className="flex items-center gap-1 text-xs text-green-600 mt-3">
                                <CheckCircle2 className="h-3 w-3" />
                                Read {new Date(msg.readAt).toLocaleString()}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <Card>
                  <CardContent className="p-8 sm:p-12 text-center">
                    <Mail className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-sm sm:text-base text-gray-600">When your team members send you messages, they'll appear here.</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {activeTab === 'sent' && (
            <>
              {sentMessages.length > 0 ? (
                sentMessages.map((msg) => {
                  const isExpanded = expandedMessageId === msg.id
                  return (
                    <Card 
                      key={msg.id}
                      className="cursor-pointer transition-all hover:shadow-md"
                      onClick={() => setExpandedMessageId(isExpanded ? null : msg.id)}
                    >
                      <CardContent className="p-4">
                        {/* Compact View */}
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={msg.recipient?.avatar} />
                            <AvatarFallback className="text-sm">
                              {getInitials(msg.recipient?.name || '')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-gray-500">To:</span>
                              <h3 className="font-semibold text-gray-900 text-sm truncate">
                                {msg.recipient?.name}
                              </h3>
                              <Badge variant="outline" className={`text-xs ${getRoleColor(msg.recipient?.role || '')}`}>
                                {getRoleName(msg.recipient?.role || '')}
                              </Badge>
                              {msg.isRead ? (
                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                              ) : (
                                <Mail className="h-3 w-3 text-gray-400" />
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <Clock className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">
                                {new Date(msg.createdAt).toLocaleDateString()} at {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            
                            {!isExpanded && msg.subject && (
                              <p className="text-sm text-gray-600 truncate mt-1">
                                {msg.subject}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex-shrink-0 flex items-center gap-2">
                            {isExpanded && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setMessageToDelete(msg.id)
                                    }}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                            {isExpanded ? (
                              <X className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Send className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                        
                        {/* Expanded View */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            {msg.subject && (
                              <h4 className="font-medium text-gray-900 mb-3 break-words">
                                {msg.subject}
                              </h4>
                            )}
                            
                            <p className="text-gray-700 whitespace-pre-wrap break-words text-sm leading-relaxed">
                              {msg.message}
                            </p>
                            
                            <div className="flex items-center gap-3 text-xs mt-3">
                              <div className="flex items-center gap-1 text-gray-500">
                                <Clock className="h-3 w-3" />
                                Sent {new Date(msg.createdAt).toLocaleString()}
                              </div>
                              {msg.isRead ? (
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Read
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-gray-500">
                                  <Mail className="h-3 w-3" />
                                  Unread
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <Card>
                  <CardContent className="p-8 sm:p-12 text-center">
                    <Send className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No sent messages</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!messageToDelete} onOpenChange={() => setMessageToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Message</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this message? This action cannot be undone.
                The recipient will no longer be able to see this message.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => messageToDelete && handleDeleteMessage(messageToDelete)}
                disabled={isProcessing}
                className="bg-red-600 hover:bg-red-700"
              >
                {isProcessing ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Archive Confirmation Dialog */}
        <AlertDialog open={!!messageToArchive} onOpenChange={() => setMessageToArchive(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archive Message</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to archive this message? It will be moved out of your inbox
                but can be retrieved later if needed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => messageToArchive && handleArchiveMessage(messageToArchive)}
                disabled={isProcessing}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isProcessing ? 'Archiving...' : 'Archive'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

