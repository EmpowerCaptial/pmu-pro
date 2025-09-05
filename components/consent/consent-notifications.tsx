"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle, Clock, AlertCircle, Send, X } from "lucide-react"
import { SendConsentFormButton } from "./send-consent-form-button"

interface ConsentNotification {
  id: string
  type: "form-signed" | "reminder-needed" | "form-expired"
  clientId: string
  clientName: string
  formType: string
  message: string
  timestamp: Date
  isRead: boolean
  actionRequired: boolean
}

interface ConsentNotificationsProps {
  clientId?: string
  clientName?: string
}

const notificationConfig = {
  "form-signed": {
    icon: CheckCircle,
    color: "bg-green-100 text-green-800 border-green-200",
    label: "Form Signed"
  },
  "reminder-needed": {
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    label: "Reminder Needed"
  },
  "form-expired": {
    icon: AlertCircle,
    color: "bg-red-100 text-red-800 border-red-200",
    label: "Form Expired"
  }
}

export function ConsentNotifications({ clientId, clientName }: ConsentNotificationsProps) {
  const [notifications, setNotifications] = useState<ConsentNotification[]>([])
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    loadNotifications()
    // Check for reminders every hour
    const interval = setInterval(checkReminders, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [clientId])

  const loadNotifications = () => {
    try {
      const stored = localStorage.getItem("consent-notifications")
      if (stored) {
        let allNotifications: ConsentNotification[] = JSON.parse(stored)
        
        // Filter by client if specified
        if (clientId) {
          allNotifications = allNotifications.filter(n => n.clientId === clientId)
        }
        
        // Sort by timestamp (newest first)
        allNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        
        setNotifications(allNotifications)
      }
    } catch (error) {
      console.error("Error loading notifications:", error)
    }
  }

  const checkReminders = () => {
    try {
      const stored = localStorage.getItem("consent-forms")
      if (stored) {
        const forms: any[] = JSON.parse(stored)
        const now = new Date()
        
        forms.forEach(form => {
          if (form.status === "sent") {
            const sentTime = new Date(form.sentAt || form.createdAt)
            const hoursSinceSent = (now.getTime() - sentTime.getTime()) / (1000 * 60 * 60)
            
            // Check if 24 hours have passed and no reminder sent
            if (hoursSinceSent >= 24 && !form.reminderSent) {
              createReminderNotification(form)
              markReminderSent(form.id)
            }
          }
        })
      }
    } catch (error) {
      console.error("Error checking reminders:", error)
    }
  }

  const createReminderNotification = (form: any) => {
    const notification: ConsentNotification = {
      id: `reminder-${form.id}-${Date.now()}`,
      type: "reminder-needed",
      clientId: form.clientId,
      clientName: form.clientName,
      formType: form.formType,
      message: `Consent form sent 24+ hours ago. Consider sending a reminder.`,
      timestamp: new Date(),
      isRead: false,
      actionRequired: true
    }

    const existing = JSON.parse(localStorage.getItem("consent-notifications") || "[]")
    existing.push(notification)
    localStorage.setItem("consent-notifications", JSON.stringify(existing))
    
    loadNotifications()
  }

  const markReminderSent = (formId: string) => {
    try {
      const stored = localStorage.getItem("consent-forms")
      if (stored) {
        const forms: any[] = JSON.parse(stored)
        const updatedForms = forms.map(form => 
          form.id === formId ? { ...form, reminderSent: true } : form
        )
        localStorage.setItem("consent-forms", JSON.stringify(updatedForms))
      }
    } catch (error) {
      console.error("Error marking reminder sent:", error)
    }
  }

  const markAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    )
    setNotifications(updatedNotifications)
    
    // Update localStorage
    const allNotifications = JSON.parse(localStorage.getItem("consent-notifications") || "[]")
    const updatedAll = allNotifications.map((n: ConsentNotification) => 
      n.id === notificationId ? { ...n, isRead: true } : n
    )
    localStorage.setItem("consent-notifications", JSON.stringify(updatedAll))
  }

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }))
    setNotifications(updatedNotifications)
    
    // Update localStorage
    const allNotifications = JSON.parse(localStorage.getItem("consent-notifications") || "[]")
    const updatedAll = allNotifications.map((n: ConsentNotification) => ({ ...n, isRead: true }))
    localStorage.setItem("consent-notifications", JSON.stringify(updatedAll))
  }

  const getUnreadCount = () => notifications.filter(n => !n.isRead).length

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 3)
  const hasMore = notifications.length > 3

  if (notifications.length === 0) {
    return null
  }

  return (
    <Card className="border-lavender/30 bg-gradient-to-r from-lavender/5 to-purple/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-lavender" />
            <CardTitle className="text-lg font-semibold">Consent Form Notifications</CardTitle>
            {getUnreadCount() > 0 && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {getUnreadCount()} new
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {getUnreadCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-sm text-lavender hover:text-lavender/80"
              >
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-lavender hover:text-lavender/80"
            >
              {showAll ? "Show less" : `Show all (${notifications.length})`}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {displayedNotifications.map((notification) => {
            const config = notificationConfig[notification.type]
            const Icon = config.icon
            
            return (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${
                  notification.isRead 
                    ? "bg-gray-50 border-gray-200" 
                    : "bg-white border-lavender/20 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-full ${config.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={config.color}>
                          {config.label}
                        </Badge>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-lavender rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {notification.clientName}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {notification.actionRequired && (
                      <SendConsentFormButton
                        clientId={notification.clientId}
                        clientName={notification.clientName}
                        size="sm"
                        variant="outline"
                      />
                    )}
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {hasMore && !showAll && (
          <div className="pt-3 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(true)}
              className="w-full text-lavender hover:text-lavender/80"
            >
              View all {notifications.length} notifications
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


