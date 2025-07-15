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

// Student interface
interface Student {
  id: string
  user_id?: string
  name: string
  email: string
  matricule: string
  year_of_study: number
  department: {
    id: string
    name: string
    code: string
  }
  is_active: boolean
  created_at: string

  complaints_count: number
  resolved_complaints: number
  pending_complaints: number
  complaint_history: Array<{
    id: string
    complaint_id: string
    title: string
    status: string
    submitted_at: string
  }>
}

// Utility functions
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'in_progress':
      return 'info'
    case 'resolved':
      return 'success'
    case 'rejected':
      return 'error'
    default:
      return 'default'
  }
}

export default function StudentManagement() {
  const { user } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  // Filter options
  const [departments, setDepartments] = useState<Array<{ value: string; label: string }>>([])

  useEffect(() => {
    loadStudents()
    loadDepartments()
  }, [])

  const loadStudents = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get all students with their data - using direct join approach
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          matricule,
          year_of_study,
          department_id,
          departments(
            id,
            name,
            code
          ),
          users!inner(
            id,
            name,
            email,
            is_active,
            created_at
          )
        `)

      if (studentsError) throw studentsError

      // Get complaint data for each student
      const studentsWithComplaints: Student[] = []

      for (const studentData of studentsData) {
        // Get complaints for this student
        const { data: complaints, error: complaintsError } = await supabase
          .from('complaints')
          .select('id, complaint_id, title, status, submitted_at')
          .eq('student_id', studentData.id)
          .order('submitted_at', { ascending: false })

        if (complaintsError) {
          console.error(`Error loading complaints for student ${studentData.id}:`, complaintsError)
        }

        const complaintsCount = complaints?.length || 0
        const resolvedComplaints = complaints?.filter(c => c.status === 'resolved').length || 0
        const pendingComplaints = complaints?.filter(c => c.status === 'pending').length || 0

        const userInfo = Array.isArray(studentData.users) ? studentData.users[0] : studentData.users

        studentsWithComplaints.push({
          id: studentData.id,
          user_id: userInfo?.id,
          name: userInfo?.name || 'Unknown',
          email: userInfo?.email || '',
          matricule: studentData.matricule,
          year_of_study: studentData.year_of_study,
          department: {
            id: studentData.departments?.id || '',
            name: studentData.departments?.name || 'Unknown Department',
            code: studentData.departments?.code || ''
          },
          is_active: userInfo?.is_active || false,
          created_at: userInfo?.created_at || '',

          complaints_count: complaintsCount,
          resolved_complaints: resolvedComplaints,
          pending_complaints: pendingComplaints,
          complaint_history: complaints?.slice(0, 5) || []
        })
      }

      setStudents(studentsWithComplaints)
    } catch (error: any) {
      console.error('Error loading students:', error)
      setError(error.message || 'Failed to load students')
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
            value: dept.id,
            label: dept.name
          }))
        ])
      }
    } catch (error) {
      console.error('Error loading departments:', error)
    }
  }

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.matricule.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment = departmentFilter === 'all' || student.department.id === departmentFilter
    const matchesYear = yearFilter === 'all' || student.year_of_study.toString() === yearFilter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && student.is_active) ||
      (statusFilter === 'inactive' && !student.is_active)

    return matchesSearch && matchesDepartment && matchesYear && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage)

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedStudents.length === paginatedStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(paginatedStudents.map(s => s.id))
    }
  }

  const handleSelectStudent = (id: string) => {
    setSelectedStudents(prev => 
      prev.includes(id) 
        ? prev.filter(sId => sId !== id)
        : [...prev, id]
    )
  }

  // Bulk actions
  const handleBulkBlock = async () => {
    try {
      const userIds = students
        .filter(s => selectedStudents.includes(s.id))
        .map(s => s.user_id)
        .filter(id => id) // Remove undefined values

      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .in('id', userIds)

      if (error) throw error

      await loadStudents()
      setSelectedStudents([])
      alert(`Successfully blocked ${selectedStudents.length} students`)
    } catch (error: any) {
      console.error('Error blocking students:', error)
      alert('Failed to block students: ' + error.message)
    }
  }

  const handleBulkUnblock = async () => {
    try {
      const userIds = students
        .filter(s => selectedStudents.includes(s.id))
        .map(s => s.user_id)
        .filter(id => id) // Remove undefined values

      const { error } = await supabase
        .from('users')
        .update({ is_active: true })
        .in('id', userIds)

      if (error) throw error

      await loadStudents()
      setSelectedStudents([])
      alert(`Successfully unblocked ${selectedStudents.length} students`)
    } catch (error: any) {
      console.error('Error unblocking students:', error)
      alert('Failed to unblock students: ' + error.message)
    }
  }

  const handleExport = () => {
    const dataToExport = selectedStudents.length > 0 
      ? students.filter(s => selectedStudents.includes(s.id))
      : filteredStudents

    const csvContent = [
      ['Name', 'Email', 'Matricule', 'Department', 'Year', 'Status', 'Total Complaints', 'Resolved', 'Pending'].join(','),
      ...dataToExport.map(student => [
        `"${student.name}"`,
        student.email,
        student.matricule,
        student.department.name,
        student.year_of_study,
        student.is_active ? 'Active' : 'Blocked',
        student.complaints_count,
        student.resolved_complaints,
        student.pending_complaints
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `students-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <DashboardLayout user={{ name: user?.name || '', role: 'admin', email: user?.email || '' }} notifications={0}>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading students...</p>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Students</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadStudents}>Try Again</Button>
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
            <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
            <p className="text-gray-600">Manage student accounts and view complaint history</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleExport}>
              Export ({selectedStudents.length > 0 ? selectedStudents.length : filteredStudents.length})
            </Button>
            <Link href="/admin/users">
              <Button variant="outline">All Users</Button>
            </Link>
            <Link href="/admin/users/officers">
              <Button variant="outline">Officers</Button>
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{students.length}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {students.filter(s => s.is_active).length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {students.filter(s => !s.is_active).length}
              </div>
              <div className="text-sm text-gray-600">Blocked</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {students.reduce((sum, s) => sum + s.complaints_count, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Complaints</div>
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
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                options={departments}
              />
              <Select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Years' },
                  { value: '1', label: 'Year 1' },
                  { value: '2', label: 'Year 2' },
                  { value: '3', label: 'Year 3' },
                  { value: '4', label: 'Year 4' },
                  { value: '5', label: 'Year 5' }
                ]}
              />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Blocked' }
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedStudents.length > 0 && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedStudents.length} student(s) selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button size="sm" onClick={handleBulkUnblock}>
                    Unblock
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleBulkBlock}>
                    Block
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Students List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Students ({filteredStudents.length})
              </CardTitle>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedStudents.length === paginatedStudents.length && paginatedStudents.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {paginatedStudents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No students found matching your filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedStudents.map((student) => (
                  <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                        className="mt-1 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">{student.name}</h3>
                            <Badge variant={student.is_active ? 'success' : 'error'} size="sm">
                              {student.is_active ? 'Active' : 'Blocked'}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedStudent(
                                selectedStudent === student.id ? null : student.id
                              )}
                            >
                              {selectedStudent === student.id ? 'Hide History' : 'View History'}
                            </Button>
                            <Link href={`/admin/users/${student.user_id}`}>
                              <Button variant="ghost" size="sm">View Profile</Button>
                            </Link>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Matricule:</span> {student.matricule}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span> {student.email}
                          </div>
                          <div>
                            <span className="font-medium">Department:</span> {student.department.name}
                          </div>
                          <div>
                            <span className="font-medium">Year:</span> {student.year_of_study}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="font-bold text-blue-600">{student.complaints_count}</div>
                            <div className="text-blue-700 text-xs">Total Complaints</div>
                          </div>
                          <div className="text-center p-2 bg-green-50 rounded">
                            <div className="font-bold text-green-600">{student.resolved_complaints}</div>
                            <div className="text-green-700 text-xs">Resolved</div>
                          </div>
                          <div className="text-center p-2 bg-yellow-50 rounded">
                            <div className="font-bold text-yellow-600">{student.pending_complaints}</div>
                            <div className="text-yellow-700 text-xs">Pending</div>
                          </div>
                        </div>

                        {/* Complaint History */}
                        {selectedStudent === student.id && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3">Recent Complaint History</h4>
                            {student.complaint_history.length === 0 ? (
                              <p className="text-sm text-gray-500">No complaints submitted</p>
                            ) : (
                              <div className="space-y-2">
                                {student.complaint_history.map((complaint) => (
                                  <div key={complaint.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-gray-900 truncate">
                                        {complaint.title}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {complaint.complaint_id} • {formatDate(complaint.submitted_at)}
                                      </div>
                                    </div>
                                    <Badge variant={getStatusColor(complaint.status)} size="sm">
                                      {complaint.status}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
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
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
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
