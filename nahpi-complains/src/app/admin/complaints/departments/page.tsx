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

// Department complaint data interface
interface DepartmentComplaintData {
  department: {
    id: string
    name: string
    code: string
  }
  total_complaints: number
  pending_complaints: number
  in_progress_complaints: number
  resolved_complaints: number
  rejected_complaints: number
  overdue_complaints: number
  resolution_rate: number
  average_resolution_time: number
  recent_complaints: Array<{
    id: string
    complaint_id: string
    title: string
    student_name: string
    status: string
    priority: string
    submitted_at: string
    days_open: number
  }>
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

export default function ComplaintsByDepartment() {
  const { user } = useAuth()
  const [departmentData, setDepartmentData] = useState<DepartmentComplaintData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('total_complaints')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)

  useEffect(() => {
    loadDepartmentComplaintData()
  }, [])

  const loadDepartmentComplaintData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get all departments
      const { data: departments, error: deptError } = await supabase
        .from('departments')
        .select('id, name, code')
        .order('name')

      if (deptError) throw deptError

      const departmentComplaintData: DepartmentComplaintData[] = []

      // For each department, get complaint statistics
      for (const department of departments) {
        // Get all complaints for this department
        const { data: complaints, error: complaintsError } = await supabase
          .from('complaints')
          .select(`
            id,
            complaint_id,
            title,
            status,
            priority,
            submitted_at,
            resolved_at,
            students(
              users(name)
            )
          `)
          .eq('department_id', department.id)
          .order('submitted_at', { ascending: false })

        if (complaintsError) {
          console.error(`Error loading complaints for ${department.name}:`, complaintsError)
          continue
        }

        // Calculate statistics
        const totalComplaints = complaints.length
        const pendingComplaints = complaints.filter(c => c.status === 'pending').length
        const inProgressComplaints = complaints.filter(c => c.status === 'in_progress').length
        const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length
        const rejectedComplaints = complaints.filter(c => c.status === 'rejected').length
        
        // Calculate overdue complaints (simplified - complaints older than 7 days and not resolved)
        const overdueComplaints = complaints.filter(c => {
          if (c.status === 'resolved' || c.status === 'rejected') return false
          const daysOpen = calculateDaysOpen(c.submitted_at)
          return daysOpen > 7
        }).length

        // Calculate resolution rate
        const resolutionRate = totalComplaints > 0 
          ? Math.round((resolvedComplaints / totalComplaints) * 100)
          : 0

        // Calculate average resolution time
        const resolvedComplaintsWithTime = complaints.filter(c => 
          c.status === 'resolved' && c.resolved_at
        )
        
        let averageResolutionTime = 0
        if (resolvedComplaintsWithTime.length > 0) {
          const totalTime = resolvedComplaintsWithTime.reduce((sum, c) => {
            const submitted = new Date(c.submitted_at)
            const resolved = new Date(c.resolved_at!)
            return sum + (resolved.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24)
          }, 0)
          averageResolutionTime = Math.round(totalTime / resolvedComplaintsWithTime.length)
        }

        // Get recent complaints (last 5)
        const recentComplaints = complaints.slice(0, 5).map(complaint => ({
          id: complaint.id,
          complaint_id: complaint.complaint_id,
          title: complaint.title,
          student_name: complaint.students?.users?.name || 'Unknown Student',
          status: complaint.status,
          priority: complaint.priority || 'medium',
          submitted_at: complaint.submitted_at,
          days_open: calculateDaysOpen(complaint.submitted_at)
        }))

        departmentComplaintData.push({
          department,
          total_complaints: totalComplaints,
          pending_complaints: pendingComplaints,
          in_progress_complaints: inProgressComplaints,
          resolved_complaints: resolvedComplaints,
          rejected_complaints: rejectedComplaints,
          overdue_complaints: overdueComplaints,
          resolution_rate: resolutionRate,
          average_resolution_time: averageResolutionTime,
          recent_complaints: recentComplaints
        })
      }

      setDepartmentData(departmentComplaintData)
    } catch (error: any) {
      console.error('Error loading department complaint data:', error)
      setError(error.message || 'Failed to load department complaint data')
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort department data
  const filteredAndSortedData = departmentData
    .filter(dept => 
      dept.department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.department.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortBy as keyof DepartmentComplaintData] as number
      const bValue = b[sortBy as keyof DepartmentComplaintData] as number
      
      if (sortOrder === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })

  const handleExportDepartmentData = () => {
    const csvContent = [
      ['Department', 'Code', 'Total', 'Pending', 'In Progress', 'Resolved', 'Rejected', 'Overdue', 'Resolution Rate', 'Avg Resolution Time'].join(','),
      ...filteredAndSortedData.map(dept => [
        `"${dept.department.name}"`,
        dept.department.code,
        dept.total_complaints,
        dept.pending_complaints,
        dept.in_progress_complaints,
        dept.resolved_complaints,
        dept.rejected_complaints,
        dept.overdue_complaints,
        `${dept.resolution_rate}%`,
        `${dept.average_resolution_time} days`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `department-complaints-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <DashboardLayout user={{ name: user?.name || '', role: 'admin', email: user?.email || '' }} notifications={0}>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading department complaint data...</p>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Department Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadDepartmentComplaintData}>Try Again</Button>
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
            <h1 className="text-2xl font-bold text-gray-900">Complaints by Department</h1>
            <p className="text-gray-600">Department-wise complaint analysis and management</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleExportDepartmentData}>
              Export Data
            </Button>
            <Link href="/admin/complaints">
              <Button variant="outline">All Complaints</Button>
            </Link>
            <Link href="/admin/complaints/overdue">
              <Button variant="outline">Overdue</Button>
            </Link>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {departmentData.reduce((sum, dept) => sum + dept.total_complaints, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Complaints</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {departmentData.reduce((sum, dept) => sum + dept.pending_complaints, 0)}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {departmentData.reduce((sum, dept) => sum + dept.overdue_complaints, 0)}
              </div>
              <div className="text-sm text-gray-600">Overdue</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {departmentData.length > 0 
                  ? Math.round(departmentData.reduce((sum, dept) => sum + dept.resolution_rate, 0) / departmentData.length)
                  : 0}%
              </div>
              <div className="text-sm text-gray-600">Avg Resolution Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Sorting */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Sorting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={[
                  { value: 'total_complaints', label: 'Total Complaints' },
                  { value: 'pending_complaints', label: 'Pending Complaints' },
                  { value: 'overdue_complaints', label: 'Overdue Complaints' },
                  { value: 'resolution_rate', label: 'Resolution Rate' },
                  { value: 'average_resolution_time', label: 'Avg Resolution Time' }
                ]}
              />
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                options={[
                  { value: 'desc', label: 'Highest First' },
                  { value: 'asc', label: 'Lowest First' }
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Department Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAndSortedData.map((deptData) => (
            <Card key={deptData.department.id} className="h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{deptData.department.name}</CardTitle>
                    <CardDescription>{deptData.department.code}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDepartment(
                      selectedDepartment === deptData.department.id ? null : deptData.department.id
                    )}
                  >
                    {selectedDepartment === deptData.department.id ? 'Hide Details' : 'View Details'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{deptData.total_complaints}</div>
                    <div className="text-xs text-blue-700">Total</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-xl font-bold text-yellow-600">{deptData.pending_complaints}</div>
                    <div className="text-xs text-yellow-700">Pending</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{deptData.resolved_complaints}</div>
                    <div className="text-xs text-green-700">Resolved</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-xl font-bold text-red-600">{deptData.overdue_complaints}</div>
                    <div className="text-xs text-red-700">Overdue</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">{deptData.resolution_rate}%</div>
                    <div className="text-xs text-purple-700">Resolution Rate</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-600">{deptData.average_resolution_time}</div>
                    <div className="text-xs text-gray-700">Avg Days</div>
                  </div>
                </div>

                {/* Recent Complaints */}
                {selectedDepartment === deptData.department.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Recent Complaints</h4>
                    {deptData.recent_complaints.length === 0 ? (
                      <p className="text-sm text-gray-500">No recent complaints</p>
                    ) : (
                      <div className="space-y-2">
                        {deptData.recent_complaints.map((complaint) => (
                          <div key={complaint.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {complaint.title}
                              </div>
                              <div className="text-xs text-gray-500">
                                {complaint.student_name} • {complaint.days_open} days open
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 ml-2">
                              <Badge variant={getStatusColor(complaint.status)} size="sm">
                                {complaint.status}
                              </Badge>
                              <Badge variant={getPriorityColor(complaint.priority)} size="sm">
                                {complaint.priority}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAndSortedData.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No departments found matching your search criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
