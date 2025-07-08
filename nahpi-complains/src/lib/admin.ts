import { supabase } from './supabase'
import { ComplaintService } from './complaints'
import { DeadlineService } from './deadlines'
import { WorkflowService } from './workflow'

export class AdminService {
  // Get system-wide statistics
  static async getSystemStats() {
    try {
      // Get all complaints
      const complaintsResult = await ComplaintService.getAllComplaints()
      if (!complaintsResult.success) throw new Error(complaintsResult.error)
      
      const complaints = complaintsResult.complaints || []

      // Get user counts
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('role')

      if (usersError) throw usersError

      // Get department counts
      const { data: departments, error: deptError } = await supabase
        .from('departments')
        .select('*')

      if (deptError) throw deptError

      // Calculate complaint statistics
      const totalComplaints = complaints.length
      const pendingComplaints = complaints.filter(c => c.status === 'pending').length
      const inProgressComplaints = complaints.filter(c => c.status === 'in_progress').length
      const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length
      const rejectedComplaints = complaints.filter(c => c.status === 'rejected').length

      // Calculate overdue complaints
      const overdueComplaints = complaints.filter(c => 
        DeadlineService.isOverdue(new Date(c.submitted_at), c.category, c.status)
      ).length

      // Calculate user statistics
      const userStats = {
        totalUsers: users?.length || 0,
        students: users?.filter(u => u.role === 'student').length || 0,
        departmentOfficers: users?.filter(u => u.role === 'department_officer').length || 0,
        admins: users?.filter(u => u.role === 'admin').length || 0
      }

      // Calculate resolution time
      const resolvedComplaintsWithTime = complaints.filter(c => 
        c.status === 'resolved' && c.resolved_at
      )
      
      let averageResolutionTime = 0
      if (resolvedComplaintsWithTime.length > 0) {
        const totalTime = resolvedComplaintsWithTime.reduce((sum, c) => {
          const submitted = new Date(c.submitted_at)
          const resolved = new Date(c.resolved_at)
          return sum + (resolved.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24)
        }, 0)
        averageResolutionTime = Math.round(totalTime / resolvedComplaintsWithTime.length)
      }

      // Calculate resolution rate
      const resolutionRate = totalComplaints > 0 
        ? Math.round((resolvedComplaints / totalComplaints) * 100)
        : 0

      return {
        success: true,
        stats: {
          complaints: {
            total: totalComplaints,
            pending: pendingComplaints,
            inProgress: inProgressComplaints,
            resolved: resolvedComplaints,
            rejected: rejectedComplaints,
            overdue: overdueComplaints,
            averageResolutionTime,
            resolutionRate
          },
          users: userStats,
          departments: {
            total: departments?.length || 0,
            active: departments?.filter(d => d.is_active).length || 0
          }
        }
      }
    } catch (error: any) {
      console.error('Error getting system stats:', error)
      return { success: false, error: error.message }
    }
  }

  // Get department performance analytics
  static async getDepartmentAnalytics() {
    try {
      const { data: departments, error: deptError } = await supabase
        .from('departments')
        .select(`
          *,
          complaints(
            id,
            status,
            category,
            submitted_at,
            resolved_at
          )
        `)

      if (deptError) throw deptError

      const analytics = departments?.map(dept => {
        const complaints = dept.complaints || []
        const totalComplaints = complaints.length
        const resolvedComplaints = complaints.filter((c: any) => c.status === 'resolved').length
        const pendingComplaints = complaints.filter((c: any) => c.status === 'pending').length
        const overdueComplaints = complaints.filter((c: any) =>
          DeadlineService.isOverdue(new Date(c.submitted_at), c.category, c.status)
        ).length

        // Calculate average resolution time
        const resolvedWithTime = complaints.filter((c: any) => c.status === 'resolved' && c.resolved_at)
        let avgResolutionTime = 0
        if (resolvedWithTime.length > 0) {
          const totalTime = resolvedWithTime.reduce((sum: number, c: any) => {
            const submitted = new Date(c.submitted_at)
            const resolved = new Date(c.resolved_at)
            return sum + (resolved.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24)
          }, 0)
          avgResolutionTime = Math.round(totalTime / resolvedWithTime.length)
        }

        const resolutionRate = totalComplaints > 0 
          ? Math.round((resolvedComplaints / totalComplaints) * 100)
          : 0

        return {
          id: dept.id,
          name: dept.name,
          code: dept.code,
          totalComplaints,
          resolvedComplaints,
          pendingComplaints,
          overdueComplaints,
          avgResolutionTime,
          resolutionRate,
          performance: resolutionRate >= 80 ? 'excellent' : resolutionRate >= 60 ? 'good' : 'needs_improvement'
        }
      }) || []

      return { success: true, analytics }
    } catch (error: any) {
      console.error('Error getting department analytics:', error)
      return { success: false, error: error.message }
    }
  }

  // Get complaint trends over time
  static async getComplaintTrends(days: number = 30) {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data: complaints, error } = await supabase
        .from('complaints')
        .select('submitted_at, status, category')
        .gte('submitted_at', startDate.toISOString())
        .order('submitted_at', { ascending: true })

      if (error) throw error

      // Group complaints by date
      const trendData: Record<string, any> = {}
      
      complaints?.forEach(complaint => {
        const date = new Date(complaint.submitted_at).toISOString().split('T')[0]
        if (!trendData[date]) {
          trendData[date] = {
            date,
            total: 0,
            ca_mark: 0,
            exam_mark: 0,
            other: 0,
            resolved: 0
          }
        }
        
        trendData[date].total++
        trendData[date][complaint.category]++
        if (complaint.status === 'resolved') {
          trendData[date].resolved++
        }
      })

      const trends = Object.values(trendData).sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )

      return { success: true, trends }
    } catch (error: any) {
      console.error('Error getting complaint trends:', error)
      return { success: false, error: error.message }
    }
  }

  // Get user management data
  static async getUserManagementData() {
    try {
      // Get all users with their profiles
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select(`
          *,
          students(*),
          department_officers(
            *,
            departments(name)
          ),
          admins(*)
        `)
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      // Get recent activity
      const { data: recentComplaints, error: complaintsError } = await supabase
        .from('complaints')
        .select(`
          id,
          title,
          status,
          submitted_at,
          students(users(name))
        `)
        .order('submitted_at', { ascending: false })
        .limit(10)

      if (complaintsError) throw complaintsError

      return {
        success: true,
        data: {
          users: users || [],
          recentActivity: recentComplaints || []
        }
      }
    } catch (error: any) {
      console.error('Error getting user management data:', error)
      return { success: false, error: error.message }
    }
  }

  // Update user status (activate/deactivate)
  static async updateUserStatus(userId: string, isActive: boolean) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: isActive })
        .eq('id', userId)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Error updating user status:', error)
      return { success: false, error: error.message }
    }
  }

  // Get system reports
  static async generateSystemReport(filters: {
    startDate?: Date
    endDate?: Date
    departmentId?: string
    status?: string
    category?: string
  }) {
    try {
      let query = supabase
        .from('complaints')
        .select(`
          *,
          students(
            matricule,
            users(name, email)
          ),
          departments(name, code),
          complaint_responses(
            id,
            created_at,
            users(name, role)
          )
        `)

      // Apply filters
      if (filters.startDate) {
        query = query.gte('submitted_at', filters.startDate.toISOString())
      }
      if (filters.endDate) {
        query = query.lte('submitted_at', filters.endDate.toISOString())
      }
      if (filters.departmentId) {
        query = query.eq('department_id', filters.departmentId)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      const { data: complaints, error } = await query.order('submitted_at', { ascending: false })

      if (error) throw error

      // Generate report summary
      const summary = {
        totalComplaints: complaints?.length || 0,
        byStatus: {
          pending: complaints?.filter(c => c.status === 'pending').length || 0,
          in_progress: complaints?.filter(c => c.status === 'in_progress').length || 0,
          resolved: complaints?.filter(c => c.status === 'resolved').length || 0,
          rejected: complaints?.filter(c => c.status === 'rejected').length || 0
        },
        byCategory: {
          ca_mark: complaints?.filter(c => c.category === 'ca_mark').length || 0,
          exam_mark: complaints?.filter(c => c.category === 'exam_mark').length || 0,
          other: complaints?.filter(c => c.category === 'other').length || 0
        },
        averageResolutionTime: 0,
        resolutionRate: 0
      }

      // Calculate resolution metrics
      const resolvedComplaints = complaints?.filter(c => c.status === 'resolved' && c.resolved_at) || []
      if (resolvedComplaints.length > 0) {
        const totalTime = resolvedComplaints.reduce((sum, c) => {
          const submitted = new Date(c.submitted_at)
          const resolved = new Date(c.resolved_at)
          return sum + (resolved.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24)
        }, 0)
        summary.averageResolutionTime = Math.round(totalTime / resolvedComplaints.length)
        summary.resolutionRate = Math.round((resolvedComplaints.length / summary.totalComplaints) * 100)
      }

      return {
        success: true,
        report: {
          filters,
          summary,
          complaints: complaints || [],
          generatedAt: new Date()
        }
      }
    } catch (error: any) {
      console.error('Error generating system report:', error)
      return { success: false, error: error.message }
    }
  }
}
