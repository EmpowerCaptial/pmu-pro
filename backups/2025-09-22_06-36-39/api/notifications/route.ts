import { NextRequest, NextResponse } from 'next/server'
import { notificationsStorage } from '@/lib/shared-storage'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const artistId = searchParams.get('artistId')
    
    if (!artistId) {
      return NextResponse.json(
        { error: 'Artist ID required' },
        { status: 400 }
      )
    }
    
    const notifications = notificationsStorage.get(artistId) || []
    
    return NextResponse.json({ notifications })
    
  } catch (error) {
    console.error('Error retrieving notifications:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { artistId, notification } = body
    
    if (!artistId || !notification) {
      return NextResponse.json(
        { error: 'Artist ID and notification required' },
        { status: 400 }
      )
    }
    
    const existingNotifications = notificationsStorage.get(artistId) || []
    existingNotifications.unshift(notification) // Add to beginning
    
    // Keep only last 50 notifications
    if (existingNotifications.length > 50) {
      existingNotifications.splice(50)
    }
    
    notificationsStorage.set(artistId, existingNotifications)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Notification created successfully' 
    })
    
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { artistId, notificationId, updates } = body
    
    if (!artistId || !notificationId) {
      return NextResponse.json(
        { error: 'Artist ID and notification ID required' },
        { status: 400 }
      )
    }
    
    const notifications = notificationsStorage.get(artistId) || []
    const notificationIndex = notifications.findIndex(n => n.id === notificationId)
    
    if (notificationIndex === -1) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }
    
    notifications[notificationIndex] = { ...notifications[notificationIndex], ...updates }
    notificationsStorage.set(artistId, notifications)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Notification updated successfully' 
    })
    
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}
