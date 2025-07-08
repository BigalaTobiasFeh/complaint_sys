import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes configuration
  const protectedRoutes = {
    '/dashboard': 'student',
    '/admin': 'admin',
    '/admin/dashboard': 'admin',
    '/admin/complaints': 'admin',
    '/admin/users': 'admin',
    '/department': 'department_officer',
    '/department/dashboard': 'department_officer',
    '/department/complaints': 'department_officer',
    '/department/settings': 'department_officer',
  }

  const pathname = req.nextUrl.pathname

  // Check if the current path is a protected route
  const requiredRole = protectedRoutes[pathname as keyof typeof protectedRoutes]

  if (requiredRole) {
    // If no session, redirect to appropriate login page
    if (!session) {
      const loginRoutes = {
        student: '/login',
        admin: '/admin/login',
        department_officer: '/department/login'
      }
      
      const loginUrl = new URL(loginRoutes[requiredRole as keyof typeof loginRoutes], req.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Get user profile to check role
    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (error || !user) {
      // If can't get user profile, redirect to login
      const loginUrl = new URL('/login', req.url)
      return NextResponse.redirect(loginUrl)
    }

    // Check if user has the required role
    if (user.role !== requiredRole) {
      // Redirect to appropriate dashboard based on user's actual role
      const dashboardRoutes = {
        student: '/dashboard',
        admin: '/admin/dashboard',
        department_officer: '/department/dashboard'
      }
      
      const dashboardUrl = new URL(dashboardRoutes[user.role as keyof typeof dashboardRoutes], req.url)
      return NextResponse.redirect(dashboardUrl)
    }
  }

  // If user is logged in and tries to access login pages, redirect to dashboard
  if (session) {
    const loginPages = ['/login', '/admin/login', '/department/login', '/register']
    
    if (loginPages.includes(pathname)) {
      // Get user role to redirect to appropriate dashboard
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (user) {
        const dashboardRoutes = {
          student: '/dashboard',
          admin: '/admin/dashboard',
          department_officer: '/department/dashboard'
        }
        
        const dashboardUrl = new URL(dashboardRoutes[user.role as keyof typeof dashboardRoutes], req.url)
        return NextResponse.redirect(dashboardUrl)
      }
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
