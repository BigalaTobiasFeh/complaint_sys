'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { NotificationDropdown, ConnectionStatus } from '@/components/ui/NotificationDropdown'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

interface HeaderProps {
  user?: {
    name: string
    role: string
    avatar?: string
  }
  notifications?: number
}

export function Header({ user, notifications = 0 }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <>
      <ConnectionStatus />
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">NC</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-primary">NAHPi Complains</h1>
                <p className="text-xs text-gray-500">Complaint Management System</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {user ? (
            <div className="hidden md:flex items-center space-x-4">
              {/* Navigation Links */}
              <nav className="flex space-x-4">
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                {user.role === 'student' && (
                  <>
                    <Link 
                      href="/complaints/new" 
                      className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      New Complaint
                    </Link>
                    <Link 
                      href="/complaints" 
                      className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      My Complaints
                    </Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <Link 
                      href="/admin/complaints" 
                      className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      All Complaints
                    </Link>
                    <Link 
                      href="/admin/users" 
                      className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Users
                    </Link>
                    <Link 
                      href="/admin/reports" 
                      className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Reports
                    </Link>
                  </>
                )}
                {user.role === 'department_officer' && (
                  <>
                    <Link 
                      href="/department/complaints" 
                      className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Department Complaints
                    </Link>
                    <Link 
                      href="/department/assigned" 
                      className="text-gray-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Assigned to Me
                    </Link>
                  </>
                )}
              </nav>

              {/* Notifications */}
              <NotificationDropdown />

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                >
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
                  </div>
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <Link
                      href="/notifications"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Notifications
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        handleLogout()
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary">Register</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {user ? (
              <div className="space-y-2">
                <Link 
                  href="/dashboard" 
                  className="block px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md"
                >
                  Dashboard
                </Link>
                {user.role === 'student' && (
                  <>
                    <Link 
                      href="/complaints/new" 
                      className="block px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md"
                    >
                      New Complaint
                    </Link>
                    <Link 
                      href="/complaints" 
                      className="block px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md"
                    >
                      My Complaints
                    </Link>
                  </>
                )}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
                  </div>
                  <button className="block w-full text-left px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Link 
                  href="/login" 
                  className="block px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="block px-3 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
    </>
  )
}
