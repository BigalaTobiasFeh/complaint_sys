import { supabase } from './supabase'
import { NotificationType } from '@/types'

export class NotificationService {
  // Create a new notification
  static async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedComplaintId?: string
  ) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          related_complaint_id: relatedComplaintId,
          is_read: false
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, notification: data }
    } catch (error: any) {
      console.error('Error creating notification:', error)
      return { success: false, error: error.message }
    }
  }

  // Get notifications for a user
  static async getUserNotifications(userId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        // If notifications table doesn't exist, return empty array
        if (error.message.includes('relation "public.notifications" does not exist')) {
          return { success: true, notifications: [] }
        }
        throw error
      }
      return { success: true, notifications: data || [] }
    } catch (error: any) {
      console.error('Error fetching notifications:', error)
      // Return empty notifications instead of failing
      return { success: true, notifications: [] }
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error('Error marking notification as read:', error)
      return { success: false, error: error.message }
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error)
      return { success: false, error: error.message }
    }
  }

  // Get unread notification count
  static async getUnreadCount(userId: string) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) throw error
      return { success: true, count: count || 0 }
    } catch (error: any) {
      console.error('Error getting unread count:', error)
      return { success: false, error: error.message }
    }
  }

  // Delete notification
  static async deleteNotification(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error('Error deleting notification:', error)
      return { success: false, error: error.message }
    }
  }

  // Notification templates for different events
  static async notifyComplaintSubmitted(complaintId: string, studentId: string, departmentId: string) {
    try {
      // Get complaint details
      const { data: complaint, error: complaintError } = await supabase
        .from('complaints')
        .select(`
          *,
          students(users(name)),
          departments(name)
        `)
        .eq('id', complaintId)
        .single()

      if (complaintError) throw complaintError

      // Get department officers
      const { data: officers, error: officersError } = await supabase
        .from('department_officers')
        .select('id')
        .eq('department_id', departmentId)

      if (officersError) throw officersError

      // Notify all department officers
      const notifications = officers.map(officer => 
        this.createNotification(
          officer.id,
          'complaint_submitted',
          'New Complaint Submitted',
          `A new complaint "${complaint.title}" has been submitted by ${complaint.students.users.name} in ${complaint.departments.name}.`,
          complaintId
        )
      )

      await Promise.all(notifications)
      return { success: true }
    } catch (error: any) {
      console.error('Error sending complaint submitted notifications:', error)
      return { success: false, error: error.message }
    }
  }

  static async notifyComplaintStatusUpdate(complaintId: string, newStatus: string, updatedBy: string) {
    try {
      // Get complaint details
      const { data: complaint, error: complaintError } = await supabase
        .from('complaints')
        .select(`
          *,
          students(users(name))
        `)
        .eq('id', complaintId)
        .single()

      if (complaintError) throw complaintError

      // Get updater details
      const { data: updater, error: updaterError } = await supabase
        .from('users')
        .select('name, role')
        .eq('id', updatedBy)
        .single()

      if (updaterError) throw updaterError

      // Notify student
      await this.createNotification(
        complaint.student_id,
        'complaint_updated',
        'Complaint Status Updated',
        `Your complaint "${complaint.title}" has been updated to "${newStatus.replace('_', ' ')}" by ${updater.name}.`,
        complaintId
      )

      return { success: true }
    } catch (error: any) {
      console.error('Error sending status update notification:', error)
      return { success: false, error: error.message }
    }
  }

  static async notifyComplaintAssigned(complaintId: string, assignedTo: string, assignedBy: string) {
    try {
      // Get complaint details
      const { data: complaint, error: complaintError } = await supabase
        .from('complaints')
        .select('*')
        .eq('id', complaintId)
        .single()

      if (complaintError) throw complaintError

      // Notify assigned officer
      await this.createNotification(
        assignedTo,
        'complaint_assigned',
        'Complaint Assigned to You',
        `You have been assigned to handle complaint "${complaint.title}" (ID: ${complaint.complaint_id}).`,
        complaintId
      )

      return { success: true }
    } catch (error: any) {
      console.error('Error sending assignment notification:', error)
      return { success: false, error: error.message }
    }
  }

  static async notifyComplaintResolved(complaintId: string, resolvedBy: string) {
    try {
      // Get complaint details
      const { data: complaint, error: complaintError } = await supabase
        .from('complaints')
        .select(`
          *,
          students(users(name))
        `)
        .eq('id', complaintId)
        .single()

      if (complaintError) throw complaintError

      // Notify student
      await this.createNotification(
        complaint.student_id,
        'complaint_resolved',
        'Complaint Resolved',
        `Your complaint "${complaint.title}" has been resolved. Please check the details and provide feedback if needed.`,
        complaintId
      )

      return { success: true }
    } catch (error: any) {
      console.error('Error sending resolution notification:', error)
      return { success: false, error: error.message }
    }
  }

  static async notifyDeadlineReminder(complaintId: string, daysOverdue: number) {
    try {
      // Get complaint details
      const { data: complaint, error: complaintError } = await supabase
        .from('complaints')
        .select(`
          *,
          departments(*)
        `)
        .eq('id', complaintId)
        .single()

      if (complaintError) throw complaintError

      // Get department officers
      const { data: officers, error: officersError } = await supabase
        .from('department_officers')
        .select('id')
        .eq('department_id', complaint.department_id)

      if (officersError) throw officersError

      // Notify all department officers
      const notifications = officers.map(officer => 
        this.createNotification(
          officer.id,
          'deadline_reminder',
          'Complaint Deadline Reminder',
          `Complaint "${complaint.title}" (ID: ${complaint.complaint_id}) is ${daysOverdue} days overdue and requires immediate attention.`,
          complaintId
        )
      )

      await Promise.all(notifications)
      return { success: true }
    } catch (error: any) {
      console.error('Error sending deadline reminder:', error)
      return { success: false, error: error.message }
    }
  }

  // Subscribe to real-time notifications
  static subscribeToNotifications(userId: string, callback: (notification: any) => void) {
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()

    return subscription
  }

  // Unsubscribe from notifications
  static unsubscribeFromNotifications(subscription: any) {
    if (subscription) {
      try {
        // First unsubscribe from the channel
        subscription.unsubscribe()
        // Then remove the channel
        supabase.removeChannel(subscription)
      } catch (error) {
        console.error('Error unsubscribing from notifications:', error)
      }
    }
  }
}
