'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { AuthService, AuthUser, StudentAuthUser } from '@/lib/auth'
import { UserRole } from '@/types'

interface AuthContextType {
  user: AuthUser | null
  studentProfile: StudentAuthUser | null
  loading: boolean
  loggingOut: boolean
  login: (credentials: { email?: string; matricule?: string; password: string; userType: UserRole }) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<{ success: boolean; error?: string }>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [studentProfile, setStudentProfile] = useState<StudentAuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await loadUserProfile(session.user)
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadUserProfile(session.user)
        } else {
          setUser(null)
          setStudentProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (authUser: User) => {
    try {
      const profile = await AuthService.getCurrentUser()
      setUser(profile)

      // If user is a student, load student profile
      if (profile?.role === 'student') {
        const studentProfile = await AuthService.getStudentProfile(profile.id)
        setStudentProfile(studentProfile)
      } else {
        setStudentProfile(null)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      setUser(null)
      setStudentProfile(null)
    }
  }

  const login = async (credentials: { 
    email?: string; 
    matricule?: string; 
    password: string; 
    userType: UserRole 
  }) => {
    try {
      let result

      if (credentials.userType === 'student' && credentials.matricule) {
        result = await AuthService.loginStudent(credentials.matricule, credentials.password)
      } else if (credentials.email && (credentials.userType === 'admin' || credentials.userType === 'department_officer')) {
        result = await AuthService.loginWithEmail(credentials.email, credentials.password, credentials.userType)
      } else {
        return { success: false, error: 'Invalid login credentials' }
      }

      if (result.success) {
        // User profile will be loaded by the auth state change listener
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const logout = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoggingOut(true)

      // Clear local state immediately for better UX
      setUser(null)
      setStudentProfile(null)

      // Call Supabase logout
      const result = await AuthService.logout()

      // Clear any cached data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token')
        sessionStorage.clear()
      }

      return result
    } catch (error: any) {
      console.error('Logout error:', error)
      return { success: false, error: error.message }
    } finally {
      setLoggingOut(false)
    }
  }

  const refreshUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      await loadUserProfile(authUser)
    }
  }

  const value = {
    user,
    studentProfile,
    loading,
    loggingOut,
    login,
    logout,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook for protected routes
export function useRequireAuth(requiredRole?: UserRole) {
  const { user, loading } = useAuth()
  
  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login
      window.location.href = '/login'
    } else if (!loading && user && requiredRole && user.role !== requiredRole) {
      // Redirect to appropriate dashboard
      const dashboardRoutes = {
        student: '/dashboard',
        admin: '/admin/dashboard',
        department_officer: '/department/dashboard'
      }
      window.location.href = dashboardRoutes[user.role]
    }
  }, [user, loading, requiredRole])

  return { user, loading }
}
