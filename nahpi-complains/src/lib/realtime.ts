import React from 'react'
import { supabase } from './supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface RealtimeEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: any
  old_record?: any
}

export interface ComplaintUpdateEvent {
  complaintId: string
  status: string
  updatedBy: string
  timestamp: Date
  changes: Record<string, any>
}

export interface ResponseAddedEvent {
  complaintId: string
  responseId: string
  responderId: string
  message: string
  timestamp: Date
}

export class RealtimeService {
  private static channels: Map<string, RealtimeChannel> = new Map()
  private static callbacks: Map<string, Function[]> = new Map()

  // Subscribe to complaint updates for a specific user
  static subscribeToUserComplaints(
    userId: string,
    userRole: string,
    callback: (event: ComplaintUpdateEvent) => void
  ): string {
    const channelName = `user-complaints-${userId}`
    
    if (this.channels.has(channelName)) {
      // Add callback to existing channel
      const callbacks = this.callbacks.get(channelName) || []
      callbacks.push(callback)
      this.callbacks.set(channelName, callbacks)
      return channelName
    }

    // Create new channel
    const channel = supabase.channel(channelName)

    // Subscribe to complaint updates
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'complaints',
        filter: userRole === 'student' ? `student_id=eq.${userId}` : undefined
      },
      (payload: any) => {
        const event: ComplaintUpdateEvent = {
          complaintId: payload.new?.id || payload.old?.id,
          status: payload.new?.status,
          updatedBy: payload.new?.updated_by || 'system',
          timestamp: new Date(),
          changes: this.getChanges(payload.old, payload.new)
        }

        // Notify all callbacks
        const callbacks = this.callbacks.get(channelName) || []
        callbacks.forEach(cb => cb(event))
      }
    )

    // Subscribe to response updates
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'complaint_responses'
      },
      (payload: any) => {
        // Check if this response is for a complaint the user should see
        this.checkComplaintAccess(payload.new.complaint_id, userId, userRole)
          .then(hasAccess => {
            if (hasAccess) {
              const event: ResponseAddedEvent = {
                complaintId: payload.new.complaint_id,
                responseId: payload.new.id,
                responderId: payload.new.responder_id,
                message: payload.new.message,
                timestamp: new Date(payload.new.created_at)
              }

              // Notify callbacks about new response
              const callbacks = this.callbacks.get(channelName) || []
              callbacks.forEach(cb => cb(event))
            }
          })
      }
    )

    channel.subscribe()

    this.channels.set(channelName, channel)
    this.callbacks.set(channelName, [callback])

    return channelName
  }

  // Subscribe to department complaints (for officers)
  static subscribeToDepartmentComplaints(
    departmentId: string,
    callback: (event: ComplaintUpdateEvent) => void
  ): string {
    const channelName = `department-complaints-${departmentId}`
    
    if (this.channels.has(channelName)) {
      const callbacks = this.callbacks.get(channelName) || []
      callbacks.push(callback)
      this.callbacks.set(channelName, callbacks)
      return channelName
    }

    const channel = supabase.channel(channelName)

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'complaints',
        filter: `department_id=eq.${departmentId}`
      },
      (payload: any) => {
        const event: ComplaintUpdateEvent = {
          complaintId: payload.new?.id || payload.old?.id,
          status: payload.new?.status,
          updatedBy: payload.new?.updated_by || 'system',
          timestamp: new Date(),
          changes: this.getChanges(payload.old, payload.new)
        }

        const callbacks = this.callbacks.get(channelName) || []
        callbacks.forEach(cb => cb(event))
      }
    )

    channel.subscribe()

    this.channels.set(channelName, channel)
    this.callbacks.set(channelName, [callback])

    return channelName
  }

  // Subscribe to system-wide updates (for admins)
  static subscribeToSystemUpdates(
    callback: (event: ComplaintUpdateEvent) => void
  ): string {
    const channelName = 'system-updates'
    
    if (this.channels.has(channelName)) {
      const callbacks = this.callbacks.get(channelName) || []
      callbacks.push(callback)
      this.callbacks.set(channelName, callbacks)
      return channelName
    }

    const channel = supabase.channel(channelName)

    // Subscribe to all complaint changes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'complaints'
      },
      (payload: any) => {
        const event: ComplaintUpdateEvent = {
          complaintId: payload.new?.id || payload.old?.id,
          status: payload.new?.status,
          updatedBy: payload.new?.updated_by || 'system',
          timestamp: new Date(),
          changes: this.getChanges(payload.old, payload.new)
        }

        const callbacks = this.callbacks.get(channelName) || []
        callbacks.forEach(cb => cb(event))
      }
    )

    // Subscribe to user changes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'users'
      },
      (payload: any) => {
        // Handle user updates for admin dashboard
        const callbacks = this.callbacks.get(channelName) || []
        callbacks.forEach(cb => cb({
          complaintId: 'user-update',
          status: payload.new?.is_active ? 'active' : 'inactive',
          updatedBy: 'system',
          timestamp: new Date(),
          changes: this.getChanges(payload.old, payload.new)
        }))
      }
    )

    channel.subscribe()

    this.channels.set(channelName, channel)
    this.callbacks.set(channelName, [callback])

    return channelName
  }

  // Unsubscribe from a channel
  static unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName)
    if (channel) {
      supabase.removeChannel(channel)
      this.channels.delete(channelName)
      this.callbacks.delete(channelName)
    }
  }

  // Unsubscribe from all channels
  static unsubscribeAll(): void {
    this.channels.forEach((channel, channelName) => {
      supabase.removeChannel(channel)
    })
    this.channels.clear()
    this.callbacks.clear()
  }

  // Check if user has access to a complaint
  private static async checkComplaintAccess(
    complaintId: string,
    userId: string,
    userRole: string
  ): Promise<boolean> {
    try {
      if (userRole === 'admin') {
        return true // Admins can see all complaints
      }

      if (userRole === 'student') {
        // Students can only see their own complaints
        const { data, error } = await supabase
          .from('complaints')
          .select('student_id')
          .eq('id', complaintId)
          .single()

        return !error && data?.student_id === userId
      }

      if (userRole === 'department_officer') {
        // Officers can see complaints in their department
        const { data: officer, error: officerError } = await supabase
          .from('department_officers')
          .select('department_id')
          .eq('id', userId)
          .single()

        if (officerError || !officer) return false

        const { data: complaint, error: complaintError } = await supabase
          .from('complaints')
          .select('department_id')
          .eq('id', complaintId)
          .single()

        return !complaintError && complaint?.department_id === officer.department_id
      }

      return false
    } catch (error) {
      console.error('Error checking complaint access:', error)
      return false
    }
  }

  // Get changes between old and new records
  private static getChanges(oldRecord: any, newRecord: any): Record<string, any> {
    if (!oldRecord || !newRecord) return {}

    const changes: Record<string, any> = {}
    
    Object.keys(newRecord).forEach(key => {
      if (oldRecord[key] !== newRecord[key]) {
        changes[key] = {
          from: oldRecord[key],
          to: newRecord[key]
        }
      }
    })

    return changes
  }

  // Broadcast custom event
  static broadcastEvent(channelName: string, event: any): void {
    const channel = this.channels.get(channelName)
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'custom_event',
        payload: event
      })
    }
  }

  // Get connection status
  static getConnectionStatus(): string {
    // Check if any channels are connected
    for (const [, channel] of this.channels) {
      return channel.state
    }
    return 'closed'
  }

  // Reconnect all channels
  static reconnectAll(): void {
    this.channels.forEach((channel, channelName) => {
      if (channel.state === 'closed') {
        channel.subscribe()
      }
    })
  }

  // Handle connection events
  static onConnectionChange(callback: (status: string) => void): void {
    // Note: Supabase realtime connection events are handled differently
    // For now, we'll use a simple online/offline detection
    window.addEventListener('online', () => callback('connected'))
    window.addEventListener('offline', () => callback('disconnected'))
  }
}

// Hook for React components to use realtime updates
export function useRealtimeComplaints(userId: string, userRole: string) {
  const [isConnected, setIsConnected] = React.useState(false)
  const [lastUpdate, setLastUpdate] = React.useState<ComplaintUpdateEvent | null>(null)

  React.useEffect(() => {
    const channelName = RealtimeService.subscribeToUserComplaints(
      userId,
      userRole,
      (event) => {
        setLastUpdate(event)
      }
    )

    RealtimeService.onConnectionChange((status) => {
      setIsConnected(status === 'connected')
    })

    return () => {
      RealtimeService.unsubscribe(channelName)
    }
  }, [userId, userRole])

  return { isConnected, lastUpdate }
}
