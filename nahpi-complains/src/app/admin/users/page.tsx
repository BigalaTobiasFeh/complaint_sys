'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

// User interface for real data
interface User {
  id: string
  name: string
  email: string
  role: 'student' | 'department_officer' | 'admin'
  is_active: boolean
  created_at: string

  student_data?: {
    matricule: string
    year_of_study: number
    department_name: string
    complaints_count: number
  }
  officer_data?: {
    position: string
    department_name: string
    assigned_complaints: number
  }
}

// Utility functions
function getRoleColor(role: string) {
  switch (role) {
    case 'admin':
      return 'error'
    case 'department_officer':
      return 'warning'
    case 'student':
      return 'info'
    default:
      return 'default'
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}



export default function AdminUsersEnhanced() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  // Filter options
  const [departments, setDepartments] = useState<Array<{ value: string; label: string }>>([])

  useEffect(() => {
    loadUsers()
    loadDepartments()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get all users with their related data
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          role,
          is_active,
          created_at,

          students(
            matricule,
            year_of_study,
            department_id,
            departments(name)
          ),
          department_officers(
            position,
            department_id,
            departments(name)
          )
        `)
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      // Get complaint counts for students
      const { data: studentComplaints, error: complaintsError } = await supabase
        .from('complaints')
        .select('student_id')

      if (complaintsError) {
        console.error('Error loading complaint counts:', complaintsError)
      }

      // Get assigned complaint counts for officers
      const { data: assignedComplaints, error: assignedError } = await supabase
        .from('complaints')
        .select('assigned_officer_id')
        .not('assigned_officer_id', 'is', null)

      if (assignedError) {
        console.error('Error loading assigned complaints:', assignedError)
      }

      // Format users data
      const formattedUsers: User[] = usersData.map(userData => {
        const user: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          is_active: userData.is_active,
          created_at: userData.created_at,

        }

        // Add student-specific data
        if (userData.role === 'student' && userData.students) {
          const studentComplaintsCount = studentComplaints?.filter(
            c => c.student_id === userData.students.id
          ).length || 0

          user.student_data = {
            matricule: userData.students.matricule,
            year_of_study: userData.students.year_of_study,
            department_name: userData.students.departments?.name || 'Unknown',
            complaints_count: studentComplaintsCount
          }
        }

        // Add officer-specific data
        if (userData.role === 'department_officer' && userData.department_officers) {
          const officerAssignedCount = assignedComplaints?.filter(
            c => c.assigned_officer_id === userData.department_officers.id
          ).length || 0

          user.officer_data = {
            position: userData.department_officers.position || 'Officer',
            department_name: userData.department_officers.departments?.name || 'Unknown',
            assigned_complaints: officerAssignedCount
          }
        }

        return user
      })

      setUsers(formattedUsers)
    } catch (error: any) {
      console.error('Error loading users:', error)
      setError(error.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const loadDepartments = async () => {
    try {
      const { data: departments, error } = await supabase
        .from('departments')
        .select('id, name')
        .order('name')

      if (!error && departments) {
        setDepartments([
          { value: 'all', label: 'All Departments' },
          ...departments.map(dept => ({
            value: dept.name,
            label: dept.name
          }))
        ])
      }
    } catch (error) {
      console.error('Error loading departments:', error)
    }
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.student_data?.matricule?.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active)
    
    const userDepartment = user.student_data?.department_name || user.officer_data?.department_name
    const matchesDepartment = departmentFilter === 'all' || userDepartment === departmentFilter

    return matchesSearch && matchesRole && matchesStatus && matchesDepartment
  })

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(paginatedUsers.map(u => u.id))
    }
  }

  const handleSelectUser = (id: string) => {
    setSelectedUsers(prev => 
      prev.includes(id) 
        ? prev.filter(uId => uId !== id)
        : [...prev, id]
    )
  }

  // Bulk actions
  const handleBulkActivate = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: true })
        .in('id', selectedUsers)

      if (error) throw error

      await loadUsers()
      setSelectedUsers([])
      alert(`Successfully activated ${selectedUsers.length} users`)
    } catch (error: any) {
      console.error('Error activating users:', error)
      alert('Failed to activate users: ' + error.message)
    }
  }

  const handleBulkDeactivate = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .in('id', selectedUsers)

      if (error) throw error

      await loadUsers()
      setSelectedUsers([])
      alert(`Successfully deactivated ${selectedUsers.length} users`)
    } catch (error: any) {
      console.error('Error deactivating users:', error)
      alert('Failed to deactivate users: ' + error.message)
    }
  }

  const handleExport = () => {
    const dataToExport = selectedUsers.length > 0 
      ? users.filter(u => selectedUsers.includes(u.id))
      : filteredUsers

    const csvContent = [
      ['Name', 'Email', 'Role', 'Status', 'Department', 'Created'].join(','),
      ...dataToExport.map(user => [
        `"${user.name}"`,
        user.email,
        user.role,
        user.is_active ? 'Active' : 'Inactive',
        user.student_data?.department_name || user.officer_data?.department_name || 'N/A',
        formatDate(user.created_at)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <DashboardLayout user={{ name: user?.name || '', role: 'admin', email: user?.email || '' }} notifications={0}>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout user={{ name: user?.name || '', role: 'admin', email: user?.email || '' }} notifications={0}>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Users</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadUsers}>Try Again</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={{ name: user?.name || '', role: 'admin', email: user?.email || '' }} notifications={0}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Users</h1>
            <p className="text-gray-600">Manage system users and their permissions</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleExport}>
              Export ({selectedUsers.length > 0 ? selectedUsers.length : filteredUsers.length})
            </Button>
            <Link href="/admin/users/students">
              <Button variant="outline">Students</Button>
            </Link>
            <Link href="/admin/users/officers">
              <Button variant="outline">Officers</Button>
            </Link>
            <Link href="/admin/users/new">
              <Button>Add User</Button>
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.role === 'student').length}
              </div>
              <div className="text-sm text-gray-600">Students</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {users.filter(u => u.role === 'department_officer').length}
              </div>
              <div className="text-sm text-gray-600">Officers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <div className="text-sm text-gray-600">Admins</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Roles' },
                  { value: 'student', label: 'Students' },
                  { value: 'department_officer', label: 'Department Officers' },
                  { value: 'admin', label: 'Admins' }
                ]}
              />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
                ]}
              />
              <Select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                options={departments}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedUsers.length} user(s) selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button size="sm" onClick={handleBulkActivate}>
                    Activate
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleBulkDeactivate}>
                    Deactivate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Users ({filteredUsers.length})
              </CardTitle>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {paginatedUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No users found matching your filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedUsers.map((user) => (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="mt-1 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">{user.name}</h3>
                            <Badge variant={getRoleColor(user.role)} size="sm">
                              {user.role.replace('_', ' ')}
                            </Badge>
                            <Badge variant={user.is_active ? 'success' : 'error'} size="sm">
                              {user.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <Link href={`/admin/users/${user.id}`}>
                            <Button variant="ghost" size="sm">View Details</Button>
                          </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Email:</span> {user.email}
                          </div>
                          {user.student_data && (
                            <>
                              <div>
                                <span className="font-medium">Matricule:</span> {user.student_data.matricule}
                              </div>
                              <div>
                                <span className="font-medium">Department:</span> {user.student_data.department_name}
                              </div>
                              <div>
                                <span className="font-medium">Complaints:</span> {user.student_data.complaints_count}
                              </div>
                            </>
                          )}
                          {user.officer_data && (
                            <>
                              <div>
                                <span className="font-medium">Position:</span> {user.officer_data.position}
                              </div>
                              <div>
                                <span className="font-medium">Department:</span> {user.officer_data.department_name}
                              </div>
                              <div>
                                <span className="font-medium">Assigned:</span> {user.officer_data.assigned_complaints}
                              </div>
                            </>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          Created: {formatDate(user.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
