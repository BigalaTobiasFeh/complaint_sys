'use client'

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { NotificationService } from '@/lib/notifications'
import { supabase } from '@/lib/supabase'

interface NotificationData {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  relatedComplaintId?: string
  createdAt: Date
}

interface NotificationContextType {
  notifications: NotificationData[]
  unreadCount: number
  isLoading: boolean
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    if (user) {
      loadNotifications()
      subscriptionRef.current = setupRealtimeSubscription()
    }

    return () => {
      // Cleanup subscription when component unmounts
      if (subscriptionRef.current) {
        NotificationService.unsubscribeFromNotifications(subscriptionRef.current)
        subscriptionRef.current = null
      }
    }
  }, [user])

  const loadNotifications = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const result = await NotificationService.getUserNotifications(user.id)
      if (result.success && result.notifications) {
        const formattedNotifications = result.notifications.map(n => ({
          ...n,
          createdAt: new Date(n.created_at)
        }))
        setNotifications(formattedNotifications)
        
        // Update unread count
        const unread = formattedNotifications.filter(n => !n.is_read).length
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    if (!user) return

    const subscription = NotificationService.subscribeToNotifications(
      user.id,
      (payload) => {
        console.log('New notification received:', payload)
        
        // Add new notification to the list
        const newNotification = {
          ...payload.new,
          createdAt: new Date(payload.new.created_at)
        }
        
        setNotifications(prev => [newNotification, ...prev])
        setUnreadCount(prev => prev + 1)
        
        // Show browser notification if permission granted
        showBrowserNotification(newNotification)
      }
    )

    return subscription
  }

  const showBrowserNotification = (notification: NotificationData) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      })
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const result = await NotificationService.markAsRead(notificationId)
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!user) return

    try {
      const result = await NotificationService.markAllAsRead(user.id)
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, isRead: true }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const result = await NotificationService.deleteNotification(notificationId)
      if (result.success) {
        const notification = notifications.find(n => n.id === notificationId)
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        
        if (notification && !notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const refreshNotifications = async () => {
    await loadNotifications()
  }

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

// Hook to request notification permission
export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    }
    return 'denied'
  }

  return { permission, requestPermission }
}

// Notification toast component
export function NotificationToast({
  notification,
  onClose
}: {
  notification: NotificationData
  onClose: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000) // Auto-close after 5 seconds

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4">
      <div className="flex items-start">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Global notification manager
export class NotificationManager {
  private static toasts: Set<string> = new Set()

  static showToast(notification: NotificationData) {
    if (this.toasts.has(notification.id)) return

    this.toasts.add(notification.id)
    
    // Create toast element
    const toastContainer = document.createElement('div')
    toastContainer.id = `toast-${notification.id}`
    document.body.appendChild(toastContainer)

    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.removeToast(notification.id)
    }, 5000)
  }

  static removeToast(notificationId: string) {
    this.toasts.delete(notificationId)
    const element = document.getElementById(`toast-${notificationId}`)
    if (element) {
      element.remove()
    }
  }
}
