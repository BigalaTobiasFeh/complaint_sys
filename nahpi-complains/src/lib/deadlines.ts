import { supabase } from './supabase'
import { NotificationService } from './notifications'

export class DeadlineService {
  // Default deadline configurations (in days)
  static readonly DEADLINES = {
    'ca_mark': 7,      // CA mark complaints: 7 days
    'exam_mark': 14,   // Exam mark complaints: 14 days
    'other': 10        // Other complaints: 10 days
  }

  // Calculate deadline for a complaint
  static calculateDeadline(submittedAt: Date, category: string): Date {
    const deadline = new Date(submittedAt)
    const days = this.DEADLINES[category as keyof typeof this.DEADLINES] || this.DEADLINES.other
    deadline.setDate(deadline.getDate() + days)
    return deadline
  }

  // Check if complaint is overdue
  static isOverdue(submittedAt: Date, category: string, currentStatus: string): boolean {
    if (currentStatus === 'resolved' || currentStatus === 'rejected') {
      return false // Resolved complaints are not overdue
    }
    
    const deadline = this.calculateDeadline(submittedAt, category)
    return new Date() > deadline
  }

  // Get days until deadline (negative if overdue)
  static getDaysUntilDeadline(submittedAt: Date, category: string): number {
    const deadline = this.calculateDeadline(submittedAt, category)
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Get overdue complaints for a department
  static async getOverdueComplaints(departmentId?: string) {
    try {
      let query = supabase
        .from('complaints')
        .select(`
          *,
          students(
            matricule,
            users(name, email)
          ),
          departments(name, code)
        `)
        .in('status', ['pending', 'in_progress'])

      if (departmentId) {
        query = query.eq('department_id', departmentId)
      }

      const { data: complaints, error } = await query

      if (error) throw error

      // Filter overdue complaints
      const overdueComplaints = complaints?.filter(complaint => 
        this.isOverdue(new Date(complaint.submitted_at), complaint.category, complaint.status)
      ) || []

      return { success: true, complaints: overdueComplaints }
    } catch (error: any) {
      console.error('Error getting overdue complaints:', error)
      return { success: false, error: error.message }
    }
  }

  // Get complaints approaching deadline (within 2 days)
  static async getApproachingDeadlineComplaints(departmentId?: string) {
    try {
      let query = supabase
        .from('complaints')
        .select(`
          *,
          students(
            matricule,
            users(name, email)
          ),
          departments(name, code)
        `)
        .in('status', ['pending', 'in_progress'])

      if (departmentId) {
        query = query.eq('department_id', departmentId)
      }

      const { data: complaints, error } = await query

      if (error) throw error

      // Filter complaints approaching deadline (1-2 days remaining)
      const approachingComplaints = complaints?.filter(complaint => {
        const daysUntil = this.getDaysUntilDeadline(new Date(complaint.submitted_at), complaint.category)
        return daysUntil >= 0 && daysUntil <= 2
      }) || []

      return { success: true, complaints: approachingComplaints }
    } catch (error: any) {
      console.error('Error getting approaching deadline complaints:', error)
      return { success: false, error: error.message }
    }
  }

  // Send deadline reminders
  static async sendDeadlineReminders() {
    try {
      // Get all overdue complaints
      const overdueResult = await this.getOverdueComplaints()
      if (overdueResult.success && overdueResult.complaints) {
        for (const complaint of overdueResult.complaints) {
          const daysOverdue = Math.abs(this.getDaysUntilDeadline(
            new Date(complaint.submitted_at), 
            complaint.category
          ))
          
          await NotificationService.notifyDeadlineReminder(complaint.id, daysOverdue)
        }
      }

      // Get complaints approaching deadline
      const approachingResult = await this.getApproachingDeadlineComplaints()
      if (approachingResult.success && approachingResult.complaints) {
        for (const complaint of approachingResult.complaints) {
          const daysUntil = this.getDaysUntilDeadline(
            new Date(complaint.submitted_at), 
            complaint.category
          )
          
          // Send reminder notification
          await NotificationService.createNotification(
            complaint.assigned_to || 'system',
            'deadline_reminder',
            'Complaint Deadline Approaching',
            `Complaint "${complaint.title}" (ID: ${complaint.complaint_id}) has ${daysUntil} day(s) remaining until deadline.`,
            complaint.id
          )
        }
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error sending deadline reminders:', error)
      return { success: false, error: error.message }
    }
  }

  // Get deadline statistics for a department
  static async getDeadlineStats(departmentId?: string) {
    try {
      let query = supabase
        .from('complaints')
        .select('*')
        .in('status', ['pending', 'in_progress'])

      if (departmentId) {
        query = query.eq('department_id', departmentId)
      }

      const { data: complaints, error } = await query

      if (error) throw error

      if (!complaints) {
        return {
          success: true,
          stats: {
            totalActive: 0,
            overdue: 0,
            approachingDeadline: 0,
            onTrack: 0
          }
        }
      }

      const stats = {
        totalActive: complaints.length,
        overdue: 0,
        approachingDeadline: 0,
        onTrack: 0
      }

      complaints.forEach(complaint => {
        const daysUntil = this.getDaysUntilDeadline(
          new Date(complaint.submitted_at), 
          complaint.category
        )

        if (daysUntil < 0) {
          stats.overdue++
        } else if (daysUntil <= 2) {
          stats.approachingDeadline++
        } else {
          stats.onTrack++
        }
      })

      return { success: true, stats }
    } catch (error: any) {
      console.error('Error getting deadline stats:', error)
      return { success: false, error: error.message }
    }
  }

  // Update deadline configuration (admin only)
  static async updateDeadlineConfig(category: string, days: number) {
    try {
      // This would typically be stored in a configuration table
      // For now, we'll just validate the input
      if (days < 1 || days > 30) {
        throw new Error('Deadline must be between 1 and 30 days')
      }

      // In a real implementation, you would update a configuration table
      // const { error } = await supabase
      //   .from('deadline_config')
      //   .upsert({ category, days })

      return { success: true }
    } catch (error: any) {
      console.error('Error updating deadline config:', error)
      return { success: false, error: error.message }
    }
  }

  // Get resolution time statistics
  static async getResolutionTimeStats(departmentId?: string) {
    try {
      let query = supabase
        .from('complaints')
        .select('submitted_at, resolved_at, category')
        .not('resolved_at', 'is', null)

      if (departmentId) {
        query = query.eq('department_id', departmentId)
      }

      const { data: complaints, error } = await query

      if (error) throw error

      if (!complaints || complaints.length === 0) {
        return {
          success: true,
          stats: {
            averageResolutionTime: 0,
            totalResolved: 0,
            withinDeadline: 0,
            beyondDeadline: 0
          }
        }
      }

      let totalResolutionTime = 0
      let withinDeadline = 0
      let beyondDeadline = 0

      complaints.forEach(complaint => {
        const submittedAt = new Date(complaint.submitted_at)
        const resolvedAt = new Date(complaint.resolved_at)
        const resolutionTime = (resolvedAt.getTime() - submittedAt.getTime()) / (1000 * 60 * 60 * 24)
        
        totalResolutionTime += resolutionTime

        const deadline = this.calculateDeadline(submittedAt, complaint.category)
        if (resolvedAt <= deadline) {
          withinDeadline++
        } else {
          beyondDeadline++
        }
      })

      const stats = {
        averageResolutionTime: Math.round(totalResolutionTime / complaints.length),
        totalResolved: complaints.length,
        withinDeadline,
        beyondDeadline,
        onTimePercentage: Math.round((withinDeadline / complaints.length) * 100)
      }

      return { success: true, stats }
    } catch (error: any) {
      console.error('Error getting resolution time stats:', error)
      return { success: false, error: error.message }
    }
  }
}
