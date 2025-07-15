'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { AdminService } from '@/lib/admin'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

// Complaint interface for real data
interface Complaint {
  id: string
  complaint_id: string
  title: string
  student: {
    id: string
    name: string
    email: string
    matricule: string
  }
  department: {
    id: string
    name: string
    code: string
  }
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected'
  priority: 'low' | 'medium' | 'high'
  submitted_at: string
  updated_at: string
  course_code: string
  course_title: string
  category: string
  is_overdue: boolean
  days_open: number
  description?: string
  response?: string
}

// Filter options
interface FilterOptions {
  departments: Array<{ value: string; label: string }>
  statuses: Array<{ value: string; label: string }>
  priorities: Array<{ value: string; label: string }>
  categories: Array<{ value: string; label: string }>
}

// Utility functions
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

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high':
      return 'error'
    case 'medium':
      return 'warning'
    case 'low':
      return 'success'
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

function calculateDaysOpen(submittedAt: string): number {
  const submitted = new Date(submittedAt)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - submitted.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export default function AdminComplaintsEnhanced() {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    departments: [],
    statuses: [],
    priorities: [],
    categories: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([])
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Load complaints and filter options
  useEffect(() => {
    loadComplaints()
    loadFilterOptions()
  }, [])

  const loadComplaints = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: complaintsData, error: complaintsError } = await supabase
        .from('complaints')
        .select(`
          id,
          complaint_id,
          title,
          status,
          priority,
          submitted_at,
          updated_at,
          course_code,
          course_title,
          category,
          description,
          department_id,
          student_id,
          departments(
            id,
            name,
            code
          ),
          students(
            id,
            matricule,
            users(
              id,
              name,
              email
            )
          )
        `)
        .order('submitted_at', { ascending: false })

      if (complaintsError) throw complaintsError

      // Format complaints data
      const formattedComplaints: Complaint[] = complaintsData.map(complaint => ({
        id: complaint.id,
        complaint_id: complaint.complaint_id,
        title: complaint.title,
        student: {
          id: complaint.students?.id || '',
          name: complaint.students?.users?.name || 'Unknown Student',
          email: complaint.students?.users?.email || '',
          matricule: complaint.students?.matricule || ''
        },
        department: {
          id: complaint.departments?.id || '',
          name: complaint.departments?.name || 'Unknown Department',
          code: complaint.departments?.code || ''
        },
        status: complaint.status,
        priority: complaint.priority || 'medium',
        submitted_at: complaint.submitted_at,
        updated_at: complaint.updated_at,
        course_code: complaint.course_code || '',
        course_title: complaint.course_title || '',
        category: complaint.category || 'general',
        is_overdue: false, // TODO: Calculate based on deadlines
        days_open: calculateDaysOpen(complaint.submitted_at),
        description: complaint.description
      }))

      setComplaints(formattedComplaints)
    } catch (error: any) {
      console.error('Error loading complaints:', error)
      setError(error.message || 'Failed to load complaints')
    } finally {
      setLoading(false)
    }
  }

  const loadFilterOptions = async () => {
    try {
      // Load departments
      const { data: departments, error: deptError } = await supabase
        .from('departments')
        .select('id, name, code')
        .order('name')

      if (!deptError && departments) {
        const deptOptions = [
          { value: 'all', label: 'All Departments' },
          ...departments.map(dept => ({
            value: dept.id,
            label: dept.name
          }))
        ]
        
        setFilterOptions(prev => ({
          ...prev,
          departments: deptOptions,
          statuses: [
            { value: 'all', label: 'All Statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'rejected', label: 'Rejected' }
          ],
          priorities: [
            { value: 'all', label: 'All Priorities' },
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' }
          ],
          categories: [
            { value: 'all', label: 'All Categories' },
            { value: 'ca_mark', label: 'CA Mark' },
            { value: 'exam_mark', label: 'Exam Mark' },
            { value: 'final_grade', label: 'Final Grade' },
            { value: 'other', label: 'Other' }
          ]
        }))
      }
    } catch (error) {
      console.error('Error loading filter options:', error)
    }
  }

  // Filter complaints
  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.complaint_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.course_code.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter
    const matchesDepartment = departmentFilter === 'all' || complaint.department.id === departmentFilter
    const matchesPriority = priorityFilter === 'all' || complaint.priority === priorityFilter
    const matchesCategory = categoryFilter === 'all' || complaint.category === categoryFilter

    return matchesSearch && matchesStatus && matchesDepartment && matchesPriority && matchesCategory
  })

  // Pagination
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedComplaints = filteredComplaints.slice(startIndex, startIndex + itemsPerPage)

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedComplaints.length === paginatedComplaints.length) {
      setSelectedComplaints([])
    } else {
      setSelectedComplaints(paginatedComplaints.map(c => c.id))
    }
  }

  const handleSelectComplaint = (id: string) => {
    setSelectedComplaints(prev => 
      prev.includes(id) 
        ? prev.filter(cId => cId !== id)
        : [...prev, id]
    )
  }

  // Bulk actions
  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .in('id', selectedComplaints)

      if (error) throw error

      await loadComplaints()
      setSelectedComplaints([])
      alert(`Successfully updated ${selectedComplaints.length} complaints to ${newStatus}`)
    } catch (error: any) {
      console.error('Error updating complaints:', error)
      alert('Failed to update complaints: ' + error.message)
    }
  }

  const handleExport = () => {
    const dataToExport = selectedComplaints.length > 0 
      ? complaints.filter(c => selectedComplaints.includes(c.id))
      : filteredComplaints

    const csvContent = [
      ['ID', 'Title', 'Student', 'Department', 'Status', 'Priority', 'Submitted', 'Days Open'].join(','),
      ...dataToExport.map(complaint => [
        complaint.complaint_id,
        `"${complaint.title}"`,
        complaint.student.name,
        complaint.department.name,
        complaint.status,
        complaint.priority,
        formatDate(complaint.submitted_at),
        complaint.days_open
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `complaints-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <DashboardLayout user={{ name: user?.name || '', role: 'admin', email: user?.email || '' }} notifications={0}>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading complaints...</p>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Complaints</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadComplaints}>Try Again</Button>
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
            <h1 className="text-2xl font-bold text-gray-900">All Complaints</h1>
            <p className="text-gray-600">Manage and review all student complaints</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleExport}>
              Export ({selectedComplaints.length > 0 ? selectedComplaints.length : filteredComplaints.length})
            </Button>
            <Link href="/admin/complaints/overdue">
              <Button variant="outline">View Overdue</Button>
            </Link>
            <Link href="/admin/complaints/departments">
              <Button variant="outline">By Department</Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Input
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={filterOptions.statuses}
              />
              <Select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                options={filterOptions.departments}
              />
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                options={filterOptions.priorities}
              />
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={filterOptions.categories}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedComplaints.length > 0 && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedComplaints.length} complaint(s) selected
                </span>
                <div className="flex items-center space-x-2">
                  <Button size="sm" onClick={() => handleBulkStatusUpdate('in_progress')}>
                    Mark In Progress
                  </Button>
                  <Button size="sm" onClick={() => handleBulkStatusUpdate('resolved')}>
                    Mark Resolved
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate('rejected')}>
                    Mark Rejected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Complaints Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Complaints ({filteredComplaints.length})
              </CardTitle>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedComplaints.length === paginatedComplaints.length && paginatedComplaints.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {paginatedComplaints.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No complaints found matching your filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedComplaints.map((complaint) => (
                  <div key={complaint.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedComplaints.includes(complaint.id)}
                        onChange={() => handleSelectComplaint(complaint.id)}
                        className="mt-1 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">{complaint.title}</h3>
                            {complaint.is_overdue && (
                              <Badge variant="error" size="sm">Overdue</Badge>
                            )}
                          </div>
                          <Link href={`/admin/complaints/${complaint.id}`}>
                            <Button variant="ghost" size="sm">View Details</Button>
                          </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">ID:</span> {complaint.complaint_id}
                          </div>
                          <div>
                            <span className="font-medium">Student:</span> {complaint.student.name}
                          </div>
                          <div>
                            <span className="font-medium">Department:</span> {complaint.department.name}
                          </div>
                          <div>
                            <span className="font-medium">Course:</span> {complaint.course_code}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant={getStatusColor(complaint.status)} size="sm">
                              {complaint.status.replace('_', ' ')}
                            </Badge>
                            <Badge variant={getPriorityColor(complaint.priority)} size="sm">
                              {complaint.priority}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {complaint.days_open} days open
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Submitted: {formatDate(complaint.submitted_at)}
                          </div>
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
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredComplaints.length)} of {filteredComplaints.length} complaints
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
