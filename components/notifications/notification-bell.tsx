"use client"

import React, { useState } from "react"
import { Bell, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Demo notifications for testing
const demoNotifications = [
  {
    id: "demo-notification-001",
    type: "form-completed",
    clientId: "demo-client",
    clientName: "Demo Client",
    formType: "general-consent",
    formId: "demo-form-001",
    message: "Demo Client has completed their general-consent consent form",
    timestamp: "2024-01-01T12:00:00.000Z",
    isRead: false,
    actionRequired: false,
    priority: 'medium' as const,
    pdfUrl: "/api/consent-forms/demo-client/demo-token/pdf"
  },
  {
    id: "demo-notification-002",
    type: "form-completed",
    clientId: "demo-client-2",
    clientName: "Sarah Johnson",
    formType: "medical-history",
    formId: "demo-form-002",
    message: "Sarah Johnson has completed their medical-history consent form",
    timestamp: "2024-01-15T14:30:00.000Z",
    isRead: true,
    actionRequired: false,
    priority: 'medium' as const,
    pdfUrl: "/api/consent-forms/demo-client-2/demo-token-2/pdf"
  }
]

interface Notification {
  id: string
  type: string
  clientId: string
  clientName: string
  formType: string
  formId: string
  message: string
  timestamp: string
  isRead: boolean
  actionRequired: boolean
  priority: 'low' | 'medium' | 'high'
  pdfUrl?: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>(demoNotifications)
  const [isOpen, setIsOpen] = useState(false)

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    )
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-96 overflow-y-auto" align="end">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                notifications.forEach(n => !n.isRead && markAsRead(n.id))
              }}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.slice(0, 10).map((notification) => (
              <Card 
                key={notification.id} 
                className={`cursor-pointer transition-colors ${
                  !notification.isRead ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(notification.priority)}`}
                        >
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                      {notification.pdfUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-6 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(notification.pdfUrl, '_blank')
                          }}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          View Form
                        </Button>
                      )}
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
