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

// Officer interface
interface Officer {
  id: string
  user_id?: string
  name: string
  email: string
  position: string
  department: {
    id: string
    name: string
    code: string
  }
  is_active: boolean
  created_at: string

  assigned_complaints: number
  resolved_complaints: number
  pending_complaints: number
  average_resolution_time: number
  workload_status: 'light' | 'moderate' | 'heavy'
  recent_assignments: Array<{
    id: string
    complaint_id: string
    title: string
    status: string
    assigned_at: string
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

function getWorkloadColor(workload: string) {
  switch (workload) {
    case 'light':
      return 'success'
    case 'moderate':
      return 'warning'
    case 'heavy':
      return 'error'
    default:
      return 'default'
  }
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

function calculateWorkloadStatus(assignedCount: number): 'light' | 'moderate' | 'heavy' {
  if (assignedCount <= 5) return 'light'
  if (assignedCount <= 15) return 'moderate'
  return 'heavy'
}

export default function OfficerManagement() {
  const { user } = useAuth()
  const [officers, setOfficers] = useState<Officer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [workloadFilter, setWorkloadFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOfficers, setSelectedOfficers] = useState<string[]>([])
  const [selectedOfficer, setSelectedOfficer] = useState<string | null>(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  // Filter options
  const [departments, setDepartments] = useState<Array<{ value: string; label: string }>>([])

  // New officer form
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newOfficer, setNewOfficer] = useState({
    name: '',
    email: '',
    position: '',
    department_id: ''
  })

  useEffect(() => {
    loadOfficers()
    loadDepartments()
  }, [])

  const loadOfficers = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get all department officers with their data - using direct join approach
      const { data: officersData, error: officersError } = await supabase
        .from('department_officers')
        .select(`
          id,
          position,
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

      if (officersError) throw officersError

      // Get complaint assignment data
      const officersWithData: Officer[] = []
      
      for (const officerData of officersData) {
        // Get assigned complaints for this officer (with fallback)
        let assignedComplaints: any[] = []
        try {
          const { data, error: complaintsError } = await supabase
            .from('complaints')
            .select('id, complaint_id, title, status, assigned_at, submitted_at, resolved_at')
            .eq('assigned_officer_id', officerData.id)
            .order('assigned_at', { ascending: false })

          if (complaintsError) {
            // If assignment columns don't exist, continue without assignment data
            // This is expected behavior when assignment tracking is not set up
            assignedComplaints = []
          } else {
            assignedComplaints = data || []
          }
        } catch (error) {
          // Assignment tracking not available - this is expected
          assignedComplaints = []
        }

        const assignedCount = assignedComplaints?.length || 0
        const resolvedComplaints = assignedComplaints?.filter(c => c.status === 'resolved').length || 0
        const pendingComplaints = assignedComplaints?.filter(c => c.status === 'pending').length || 0

        // Calculate average resolution time
        const resolvedComplaintsWithTime = assignedComplaints?.filter(c => 
          c.status === 'resolved' && c.resolved_at && c.submitted_at
        ) || []
        
        let averageResolutionTime = 0
        if (resolvedComplaintsWithTime.length > 0) {
          const totalTime = resolvedComplaintsWithTime.reduce((sum, c) => {
            const submitted = new Date(c.submitted_at)
            const resolved = new Date(c.resolved_at!)
            return sum + (resolved.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24)
          }, 0)
          averageResolutionTime = Math.round(totalTime / resolvedComplaintsWithTime.length)
        }

        const userInfo = Array.isArray(officerData.users) ? officerData.users[0] : officerData.users

        officersWithData.push({
          id: officerData.id,
          user_id: userInfo?.id,
          name: userInfo?.name || 'Unknown',
          email: userInfo?.email || '',
          position: officerData.position || 'Officer',
          department: {
            id: officerData.departments?.id || '',
            name: officerData.departments?.name || 'Unknown Department',
            code: officerData.departments?.code || ''
          },
          is_active: userInfo?.is_active || false,
          created_at: userInfo?.created_at || '',

          assigned_complaints: assignedCount,
          resolved_complaints: resolvedComplaints,
          pending_complaints: pendingComplaints,
          average_resolution_time: averageResolutionTime,
          workload_status: calculateWorkloadStatus(assignedCount),
          recent_assignments: assignedComplaints?.slice(0, 5) || []
        })
      }

      setOfficers(officersWithData)
    } catch (error: any) {
      console.error('Error loading officers:', error)
      setError(error.message || 'Failed to load officers')
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

  // Filter officers
  const filteredOfficers = officers.filter(officer => {
    const matchesSearch = 
      officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.position.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment = departmentFilter === 'all' || officer.department.id === departmentFilter
    const matchesWorkload = workloadFilter === 'all' || officer.workload_status === workloadFilter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && officer.is_active) ||
      (statusFilter === 'inactive' && !officer.is_active)

    return matchesSearch && matchesDepartment && matchesWorkload && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredOfficers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedOfficers = filteredOfficers.slice(startIndex, startIndex + itemsPerPage)

  // Create new officer
  const handleCreateOfficer = async () => {
    try {
      if (!newOfficer.name || !newOfficer.email || !newOfficer.department_id) {
        alert('Please fill in all required fields')
        return
      }

      // Create user account first
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          name: newOfficer.name,
          email: newOfficer.email,
          role: 'department_officer',
          is_active: true
        })
        .select()
        .single()

      if (userError) throw userError

      // Create department officer record
      const { error: officerError } = await supabase
        .from('department_officers')
        .insert({
          user_id: userData.id,
          department_id: newOfficer.department_id,
          position: newOfficer.position || 'Officer'
        })

      if (officerError) throw officerError

      await loadOfficers()
      setShowCreateForm(false)
      setNewOfficer({ name: '', email: '', position: '', department_id: '' })
      alert('Officer created successfully')
    } catch (error: any) {
      console.error('Error creating officer:', error)
      alert('Failed to create officer: ' + error.message)
    }
  }

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedOfficers.length === paginatedOfficers.length) {
      setSelectedOfficers([])
    } else {
      setSelectedOfficers(paginatedOfficers.map(o => o.id))
    }
  }

  const handleSelectOfficer = (id: string) => {
    setSelectedOfficers(prev => 
      prev.includes(id) 
        ? prev.filter(oId => oId !== id)
        : [...prev, id]
    )
  }

  if (loading) {
    return (
      <DashboardLayout user={{ name: user?.name || '', role: 'admin', email: user?.email || '' }} notifications={0}>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading officers...</p>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Officers</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadOfficers}>Try Again</Button>
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
            <h1 className="text-2xl font-bold text-gray-900">Department Officer Management</h1>
            <p className="text-gray-600">Manage department officers and their assignments</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => setShowCreateForm(true)}>
              Create Officer
            </Button>
            <Link href="/admin/users">
              <Button variant="outline">All Users</Button>
            </Link>
            <Link href="/admin/users/students">
              <Button variant="outline">Students</Button>
            </Link>
          </div>
        </div>

        {/* Create Officer Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Department Officer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Full Name"
                  value={newOfficer.name}
                  onChange={(e) => setNewOfficer(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Email Address"
                  type="email"
                  value={newOfficer.email}
                  onChange={(e) => setNewOfficer(prev => ({ ...prev, email: e.target.value }))}
                />
                <Input
                  placeholder="Position/Title"
                  value={newOfficer.position}
                  onChange={(e) => setNewOfficer(prev => ({ ...prev, position: e.target.value }))}
                />
                <Select
                  value={newOfficer.department_id}
                  onChange={(e) => setNewOfficer(prev => ({ ...prev, department_id: e.target.value }))}
                  options={departments.filter(d => d.value !== 'all')}
                />
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <Button onClick={handleCreateOfficer}>Create Officer</Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{officers.length}</div>
              <div className="text-sm text-gray-600">Total Officers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {officers.filter(o => o.workload_status === 'light').length}
              </div>
              <div className="text-sm text-gray-600">Light Workload</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {officers.filter(o => o.workload_status === 'moderate').length}
              </div>
              <div className="text-sm text-gray-600">Moderate Workload</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {officers.filter(o => o.workload_status === 'heavy').length}
              </div>
              <div className="text-sm text-gray-600">Heavy Workload</div>
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
                placeholder="Search officers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                options={departments}
              />
              <Select
                value={workloadFilter}
                onChange={(e) => setWorkloadFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Workloads' },
                  { value: 'light', label: 'Light (≤5)' },
                  { value: 'moderate', label: 'Moderate (6-15)' },
                  { value: 'heavy', label: 'Heavy (>15)' }
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
            </div>
          </CardContent>
        </Card>

        {/* Officers List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Department Officers ({filteredOfficers.length})
              </CardTitle>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedOfficers.length === paginatedOfficers.length && paginatedOfficers.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {paginatedOfficers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No officers found matching your filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedOfficers.map((officer) => (
                  <div key={officer.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedOfficers.includes(officer.id)}
                        onChange={() => handleSelectOfficer(officer.id)}
                        className="mt-1 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">{officer.name}</h3>
                            <Badge variant={officer.is_active ? 'success' : 'error'} size="sm">
                              {officer.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant={getWorkloadColor(officer.workload_status)} size="sm">
                              {officer.workload_status} workload
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOfficer(
                                selectedOfficer === officer.id ? null : officer.id
                              )}
                            >
                              {selectedOfficer === officer.id ? 'Hide Assignments' : 'View Assignments'}
                            </Button>
                            <Link href={`/admin/users/${officer.user_id}`}>
                              <Button variant="ghost" size="sm">View Profile</Button>
                            </Link>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Email:</span> {officer.email}
                          </div>
                          <div>
                            <span className="font-medium">Position:</span> {officer.position}
                          </div>
                          <div>
                            <span className="font-medium">Department:</span> {officer.department.name}
                          </div>
                          <div>
                            <span className="font-medium">Avg Resolution:</span> {officer.average_resolution_time} days
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="font-bold text-blue-600">{officer.assigned_complaints}</div>
                            <div className="text-blue-700 text-xs">Assigned</div>
                          </div>
                          <div className="text-center p-2 bg-green-50 rounded">
                            <div className="font-bold text-green-600">{officer.resolved_complaints}</div>
                            <div className="text-green-700 text-xs">Resolved</div>
                          </div>
                          <div className="text-center p-2 bg-yellow-50 rounded">
                            <div className="font-bold text-yellow-600">{officer.pending_complaints}</div>
                            <div className="text-yellow-700 text-xs">Pending</div>
                          </div>
                        </div>

                        {/* Recent Assignments */}
                        {selectedOfficer === officer.id && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3">Recent Assignments</h4>
                            {officer.recent_assignments.length === 0 ? (
                              <p className="text-sm text-gray-500">No assignments yet</p>
                            ) : (
                              <div className="space-y-2">
                                {officer.recent_assignments.map((assignment) => (
                                  <div key={assignment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-gray-900 truncate">
                                        {assignment.title}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {assignment.complaint_id} • {formatDate(assignment.assigned_at)}
                                      </div>
                                    </div>
                                    <Badge variant={getStatusColor(assignment.status)} size="sm">
                                      {assignment.status}
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
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredOfficers.length)} of {filteredOfficers.length} officers
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
