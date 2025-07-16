import { supabase } from './supabase'
import { PerformanceMonitor } from './performance'

// Optimized query helpers
export class OptimizedQueries {
  // Cache for frequently accessed data
  private static cache = new Map<string, { data: any; timestamp: number }>()
  private static CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  // Get cached data or fetch if expired
  private static async getCachedOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.CACHE_TTL
  ): Promise<T> {
    const cached = this.cache.get(key)
    const now = Date.now()

    if (cached && (now - cached.timestamp) < ttl) {
      return cached.data
    }

    const data = await fetchFn()
    this.cache.set(key, { data, timestamp: now })
    return data
  }

  // Optimized user queries
  static async getUsers(options: {
    role?: string
    limit?: number
    offset?: number
    search?: string
  } = {}) {
    const { role, limit = 50, offset = 0, search } = options

    return PerformanceMonitor.measureAsync('getUsers', async () => {
      let query = supabase
        .from('users')
        .select('id, name, email, role, is_active, created_at')
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (role) {
        query = query.eq('role', role)
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    })
  }

  // Optimized complaints queries
  static async getComplaints(options: {
    status?: string
    department_id?: string
    student_id?: string
    limit?: number
    offset?: number
  } = {}) {
    const { status, department_id, student_id, limit = 50, offset = 0 } = options

    return PerformanceMonitor.measureAsync('getComplaints', async () => {
      let query = supabase
        .from('complaints')
        .select(`
          id,
          complaint_id,
          title,
          status,
          priority,
          submitted_at,
          departments!inner(name, code),
          students!inner(
            matricule,
            users!inner(name, email)
          )
        `)
        .range(offset, offset + limit - 1)
        .order('submitted_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      if (department_id) {
        query = query.eq('department_id', department_id)
      }

      if (student_id) {
        query = query.eq('student_id', student_id)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    })
  }

  // Optimized dashboard statistics
  static async getDashboardStats() {
    const cacheKey = 'dashboard-stats'
    
    return this.getCachedOrFetch(cacheKey, async () => {
      return PerformanceMonitor.measureAsync('getDashboardStats', async () => {
        // Get all stats in parallel for better performance
        const [
          complaintsResult,
          usersResult,
          departmentsResult
        ] = await Promise.all([
          supabase.from('complaints').select('id, status, submitted_at'),
          supabase.from('users').select('id, role, is_active'),
          supabase.from('departments').select('id, name, is_active')
        ])

        if (complaintsResult.error) throw complaintsResult.error
        if (usersResult.error) throw usersResult.error
        if (departmentsResult.error) throw departmentsResult.error

        const complaints = complaintsResult.data || []
        const users = usersResult.data || []
        const departments = departmentsResult.data || []

        // Calculate statistics
        const stats = {
          complaints: {
            total: complaints.length,
            pending: complaints.filter(c => c.status === 'pending').length,
            in_progress: complaints.filter(c => c.status === 'in_progress').length,
            resolved: complaints.filter(c => c.status === 'resolved').length,
            rejected: complaints.filter(c => c.status === 'rejected').length
          },
          users: {
            total: users.length,
            students: users.filter(u => u.role === 'student').length,
            officers: users.filter(u => u.role === 'department_officer').length,
            admins: users.filter(u => u.role === 'admin').length,
            active: users.filter(u => u.is_active).length
          },
          departments: {
            total: departments.length,
            active: departments.filter(d => d.is_active !== false).length
          }
        }

        return stats
      })
    }, 2 * 60 * 1000) // Cache for 2 minutes
  }

  // Optimized students with complaints
  static async getStudentsWithComplaints(options: {
    limit?: number
    offset?: number
    search?: string
  } = {}) {
    const { limit = 20, offset = 0, search } = options

    return PerformanceMonitor.measureAsync('getStudentsWithComplaints', async () => {
      let query = supabase
        .from('students')
        .select(`
          id,
          matricule,
          year_of_study,
          department_id,
          departments(id, name, code),
          users!inner(id, name, email, is_active, created_at)
        `)
        .range(offset, offset + limit - 1)

      if (search) {
        query = query.or(`matricule.ilike.%${search}%,users.name.ilike.%${search}%`)
      }

      const { data: studentsData, error: studentsError } = await query
      if (studentsError) throw studentsError

      // Get complaint counts for each student in a single query
      const studentIds = studentsData?.map(s => s.id) || []
      const { data: complaintsData, error: complaintsError } = await supabase
        .from('complaints')
        .select('student_id, status')
        .in('student_id', studentIds)

      if (complaintsError) throw complaintsError

      // Process data efficiently
      const complaintsByStudent = (complaintsData || []).reduce((acc, complaint) => {
        if (!acc[complaint.student_id]) {
          acc[complaint.student_id] = { total: 0, resolved: 0, pending: 0 }
        }
        acc[complaint.student_id].total++
        if (complaint.status === 'resolved') acc[complaint.student_id].resolved++
        if (complaint.status === 'pending') acc[complaint.student_id].pending++
        return acc
      }, {} as Record<string, any>)

      return studentsData?.map(student => {
        const userInfo = Array.isArray(student.users) ? student.users[0] : student.users
        const complaints = complaintsByStudent[student.id] || { total: 0, resolved: 0, pending: 0 }

        return {
          id: student.id,
          user_id: userInfo?.id,
          name: userInfo?.name || 'Unknown',
          email: userInfo?.email || '',
          matricule: student.matricule,
          year_of_study: student.year_of_study,
          department: {
            id: student.departments?.id || '',
            name: student.departments?.name || 'Unknown Department',
            code: student.departments?.code || ''
          },
          is_active: userInfo?.is_active || false,
          created_at: userInfo?.created_at || '',
          complaints_count: complaints.total,
          resolved_complaints: complaints.resolved,
          pending_complaints: complaints.pending
        }
      }) || []
    })
  }

  // Clear cache when needed
  static clearCache(key?: string) {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }
}
