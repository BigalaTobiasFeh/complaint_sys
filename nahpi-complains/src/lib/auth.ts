import { supabase, supabaseAdmin } from './supabase'
import { UserRole, Student, Admin, DepartmentOfficer, RegisterFormData } from '@/types'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  isActive: boolean
}

export interface StudentAuthUser extends AuthUser {
  role: 'student'
  matricule: string
  department: string
  yearOfStudy: number
  phoneNumber: string
  academicYear: string
}

export interface LoginCredentials {
  email?: string
  matricule?: string
  password: string
  userType: UserRole
}

export class AuthService {
  // Student Registration
  static async registerStudent(data: RegisterFormData) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: 'student'
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user')

      // Get department ID
      const { data: departments, error: deptError } = await supabase
        .from('departments')
        .select('id')
        .eq('name', data.department)
        .single()

      if (deptError) throw new Error('Invalid department')

      // Create user profile
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: data.email,
          name: data.name,
          role: 'student'
        })

      if (userError) throw userError

      // Create student profile
      const { error: studentError } = await supabase
        .from('students')
        .insert({
          id: authData.user.id,
          matricule: data.matricule,
          department_id: departments.id,
          year_of_study: data.yearOfStudy,
          phone_number: data.phoneNumber,
          academic_year: data.academicYear,
          verification_method: data.verificationMethod
        })

      if (studentError) throw studentError

      return { success: true, user: authData.user }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Student Login (with matricule)
  static async loginStudent(matricule: string, password: string) {
    try {
      // Get student email by matricule
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select(`
          id,
          matricule,
          users!inner(email)
        `)
        .eq('matricule', matricule)
        .single()

      if (studentError || !student) {
        throw new Error('Invalid matricule number - student not found')
      }

      // Login with email and password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: (student.users as any).email,
        password: password
      })

      if (authError) {
        throw authError
      }

      return { success: true, user: authData.user }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Admin/Department Officer Login (with email)
  static async loginWithEmail(email: string, password: string, expectedRole: 'admin' | 'department_officer') {
    try {
      // console.log(`Attempting login for ${expectedRole}:`, email)

      // Login with email and password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })

      if (authError) {
        throw authError
      }

      // Check if user profile exists in our users table
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('role, name, email')
        .eq('id', authData.user?.id)
        .single()

      // If user doesn't exist in our users table, it means they were created directly in Supabase
      if (userError && userError.code === 'PGRST116') {
        await supabase.auth.signOut()
        throw new Error(`User profile not found. Please contact administrator to complete your account setup.`)
      }

      if (userError) {
        await supabase.auth.signOut()
        throw userError
      }

      if (!user || user.role !== expectedRole) {
        await supabase.auth.signOut()
        const actualRole = user?.role || 'unknown'
        throw new Error(`Unauthorized access - expected ${expectedRole}, but user has role: ${actualRole}`)
      }
      return { success: true, user: authData.user }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Get current user with profile
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        return null
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        return null
      }

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        isActive: profile.is_active
      }
    } catch (error) {
      return null
    }
  }

  // Get student profile
  static async getStudentProfile(userId: string): Promise<StudentAuthUser | null> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          users!inner(*),
          departments!inner(name)
        `)
        .eq('id', userId)
        .single()

      if (error || !data) return null

      return {
        id: data.id,
        email: data.users.email,
        name: data.users.name,
        role: 'student',
        isActive: data.users.is_active,
        matricule: data.matricule,
        department: data.departments.name,
        yearOfStudy: data.year_of_study,
        phoneNumber: data.phone_number,
        academicYear: data.academic_year
      }
    } catch (error) {
      return null
    }
  }

  // Logout
  static async logout() {
    const { error } = await supabase.auth.signOut()
    return { success: !error, error: error?.message }
  }

  // Password reset
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Create admin user (for seeding)
  static async createAdmin(email: string, password: string, name: string) {
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create admin user')

      // Create user profile
      const { error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id,
          email: email,
          name: name,
          role: 'admin'
        })

      if (userError) throw userError

      // Create admin profile
      const { error: adminError } = await supabaseAdmin
        .from('admins')
        .insert({
          id: authData.user.id,
          permissions: ['manage_users', 'manage_complaints', 'generate_reports']
        })

      if (adminError) throw adminError

      return { success: true, user: authData.user }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // Create department officer (for seeding)
  static async createDepartmentOfficer(
    email: string, 
    password: string, 
    name: string, 
    departmentCode: string, 
    position: string
  ) {
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create department officer')

      // Get department ID
      const { data: department, error: deptError } = await supabaseAdmin
        .from('departments')
        .select('id')
        .eq('code', departmentCode)
        .single()

      if (deptError) throw new Error('Invalid department code')

      // Create user profile
      const { error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id,
          email: email,
          name: name,
          role: 'department_officer'
        })

      if (userError) throw userError

      // Create department officer profile
      const { error: officerError } = await supabaseAdmin
        .from('department_officers')
        .insert({
          id: authData.user.id,
          department_id: department.id,
          position: position
        })

      if (officerError) throw officerError

      return { success: true, user: authData.user }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}
