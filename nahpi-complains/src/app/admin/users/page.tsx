'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

const mockUser = {
  name: 'Sarah Johnson',
  role: 'admin' as const,
  email: 'sarah.johnson@nahpi.edu',
  avatar: undefined
}

const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@student.nahpi.edu',
    role: 'student' as const,
    matricule: 'STU2024001',
    department: 'Computer Science',
    yearOfStudy: 3,
    isActive: true,
    lastLogin: new Date('2024-01-20'),
    createdAt: new Date('2023-09-01'),
    complaintsCount: 5
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    email: 'michael.chen@nahpi.edu',
    role: 'department_officer' as const,
    matricule: null,
    department: 'Computer Science',
    position: 'Senior Lecturer',
    isActive: true,
    lastLogin: new Date('2024-01-21'),
    createdAt: new Date('2022-08-15'),
    assignedComplaints: 12
  },
  {
    id: '3',
    name: 'Jane Smith',
    email: 'jane.smith@student.nahpi.edu',
    role: 'student' as const,
    matricule: 'STU2024002',
    department: 'Mathematics',
    yearOfStudy: 2,
    isActive: true,
    lastLogin: new Date('2024-01-19'),
    createdAt: new Date('2023-09-01'),
    complaintsCount: 2
  },
  {
    id: '4',
    name: 'Dr. Sarah Wilson',
    email: 'sarah.wilson@nahpi.edu',
    role: 'department_officer' as const,
    matricule: null,
    department: 'Mathematics',
    position: 'Associate Professor',
    isActive: true,
    lastLogin: new Date('2024-01-18'),
    createdAt: new Date('2021-01-10'),
    assignedComplaints: 8
  },
  {
    id: '5',
    name: 'Mike Wilson',
    email: 'mike.wilson@student.nahpi.edu',
    role: 'student' as const,
    matricule: 'STU2024003',
    department: 'Physics',
    yearOfStudy: 4,
    isActive: false,
    lastLogin: new Date('2024-01-10'),
    createdAt: new Date('2022-09-01'),
    complaintsCount: 1
  }
]

const departments = ['All Departments', 'Computer Science', 'Mathematics', 'Physics', 'Engineering', 'Business']

function getRoleColor(role: string) {
  switch (role) {
    case 'student':
      return 'info'
    case 'department_officer':
      return 'warning'
    case 'admin':
      return 'error'
    default:
      return 'default'
  }
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.matricule && user.matricule.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesRole = !roleFilter || user.role === roleFilter
    const matchesDepartment = !departmentFilter || departmentFilter === 'All Departments' || user.department === departmentFilter
    const matchesStatus = !statusFilter || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive)

    return matchesSearch && matchesRole && matchesDepartment && matchesStatus
  })

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id))
    }
  }

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length > 0) {
      alert(`${action} ${selectedUsers.length} users`)
    }
  }

  const totalStudents = mockUsers.filter(u => u.role === 'student').length
  const totalOfficers = mockUsers.filter(u => u.role === 'department_officer').length
  const activeUsers = mockUsers.filter(u => u.isActive).length
  const inactiveUsers = mockUsers.filter(u => !u.isActive).length

  return (
    <DashboardLayout user={mockUser} notifications={15}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage student and department officer accounts</p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button 
              variant="outline" 
              onClick={() => handleBulkAction('Block')}
              disabled={selectedUsers.length === 0}
            >
              Block Selected ({selectedUsers.length})
            </Button>
            <Link href="/admin/users/new">
              <Button>Add New User</Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{mockUsers.length}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Students</p>
                  <p className="text-2xl font-bold text-info">{totalStudents}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Officers</p>
                  <p className="text-2xl font-bold text-warning">{totalOfficers}</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-success">{activeUsers}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
              
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Roles</option>
                <option value="student">Students</option>
                <option value="department_officer">Department Officers</option>
                <option value="admin">Administrators</option>
              </select>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setRoleFilter('')
                  setDepartmentFilter('')
                  setStatusFilter('')
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Users ({filteredUsers.length})</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-600">No users match your current filters.</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        <Badge variant={getRoleColor(user.role)} size="sm">
                          {user.role.replace('_', ' ')}
                        </Badge>
                        <Badge variant={user.isActive ? 'success' : 'error'} size="sm">
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                        <div>
                          <span className="font-medium">Email:</span> {user.email}
                        </div>
                        {user.matricule && (
                          <div>
                            <span className="font-medium">Matricule:</span> {user.matricule}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Department:</span> {user.department}
                        </div>
                        {user.role === 'student' && (
                          <div>
                            <span className="font-medium">Year:</span> {user.yearOfStudy}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Joined: {formatDate(user.createdAt)}</span>
                        <span>Last login: {formatDate(user.lastLogin)}</span>
                        {user.role === 'student' && 'complaintsCount' in user && (
                          <span>Complaints: {user.complaintsCount}</span>
                        )}
                        {user.role === 'department_officer' && 'assignedComplaints' in user && (
                          <span>Assigned: {user.assignedComplaints}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Link href={`/admin/users/${user.id}`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <Button 
                        variant={user.isActive ? "ghost" : "primary"} 
                        size="sm"
                        onClick={() => alert(`${user.isActive ? 'Block' : 'Activate'} user: ${user.name}`)}
                      >
                        {user.isActive ? 'Block' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
