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
import { DeadlineService } from '@/lib/deadlines'

// Overdue complaint interface
interface OverdueComplaint {
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
  days_overdue: number
  deadline_date: string
  escalation_level: 'warning' | 'critical' | 'urgent'
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

function getEscalationColor(level: string) {
  switch (level) {
    case 'urgent':
      return 'error'
    case 'critical':
      return 'warning'
    case 'warning':
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

function calculateDaysOverdue(submittedAt: string, category: string): number {
  const submitted = new Date(submittedAt)
  const now = new Date()
  const deadline = DeadlineService.calculateDeadline(submitted, category)
  
  if (now > deadline) {
    const diffTime = now.getTime() - deadline.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }
  
  return 0
}

function getEscalationLevel(daysOverdue: number): 'warning' | 'critical' | 'urgent' {
  if (daysOverdue >= 14) return 'urgent'
  if (daysOverdue >= 7) return 'critical'
  return 'warning'
}

export default function OverdueComplaints() {
  const { user } = useAuth()
  const [overdueComplaints, setOverdueComplaints] = useState<OverdueComplaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [escalationFilter, setEscalationFilter] = useState('all')
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([])
  
  // Filter options
  const [departments, setDepartments] = useState<Array<{ value: string; label: string }>>([])

  useEffect(() => {
    loadOverdueComplaints()
    loadDepartments()
  }, [])

  const loadOverdueComplaints = async () => {
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
        .in('status', ['pending', 'in_progress'])
        .order('submitted_at', { ascending: true })

      if (complaintsError) throw complaintsError

      // Filter and format overdue complaints
      const overdueData: OverdueComplaint[] = []
      
      for (const complaint of complaintsData) {
        const daysOverdue = calculateDaysOverdue(complaint.submitted_at, complaint.category)
        
        if (daysOverdue > 0) {
          const deadline = DeadlineService.calculateDeadline(
            new Date(complaint.submitted_at), 
            complaint.category
          )
          
          overdueData.push({
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
            days_overdue: daysOverdue,
            deadline_date: deadline.toISOString(),
            escalation_level: getEscalationLevel(daysOverdue)
          })
        }
      }

      // Sort by days overdue (most overdue first)
      overdueData.sort((a, b) => b.days_overdue - a.days_overdue)
      
      setOverdueComplaints(overdueData)
    } catch (error: any) {
      console.error('Error loading overdue complaints:', error)
      setError(error.message || 'Failed to load overdue complaints')
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

  // Filter overdue complaints
  const filteredComplaints = overdueComplaints.filter(complaint => {
    const matchesSearch = 
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.complaint_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.student.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDepartment = departmentFilter === 'all' || complaint.department.id === departmentFilter
    const matchesEscalation = escalationFilter === 'all' || complaint.escalation_level === escalationFilter

    return matchesSearch && matchesDepartment && matchesEscalation
  })

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedComplaints.length === filteredComplaints.length) {
      setSelectedComplaints([])
    } else {
      setSelectedComplaints(filteredComplaints.map(c => c.id))
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
  const handleBulkEscalate = async () => {
    try {
      // Update priority to high for selected overdue complaints
      const { error } = await supabase
        .from('complaints')
        .update({ 
          priority: 'high',
          updated_at: new Date().toISOString()
        })
        .in('id', selectedComplaints)

      if (error) throw error

      await loadOverdueComplaints()
      setSelectedComplaints([])
      alert(`Successfully escalated ${selectedComplaints.length} complaints`)
    } catch (error: any) {
      console.error('Error escalating complaints:', error)
      alert('Failed to escalate complaints: ' + error.message)
    }
  }

  const handleBulkAssign = async () => {
    // TODO: Implement bulk assignment to department officers
    alert('Bulk assignment feature coming soon')
  }

  if (loading) {
    return (
      <DashboardLayout user={{ name: user?.name || '', role: 'admin', email: user?.email || '' }} notifications={0}>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading overdue complaints...</p>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Overdue Complaints</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadOverdueComplaints}>Try Again</Button>
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
            <h1 className="text-2xl font-bold text-gray-900">Overdue Complaints</h1>
            <p className="text-gray-600">Complaints that have exceeded their resolution deadlines</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/admin/complaints">
              <Button variant="outline">All Complaints</Button>
            </Link>
            <Link href="/admin/complaints/departments">
              <Button variant="outline">By Department</Button>
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{overdueComplaints.length}</div>
              <div className="text-sm text-gray-600">Total Overdue</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {overdueComplaints.filter(c => c.escalation_level === 'urgent').length}
              </div>
              <div className="text-sm text-gray-600">Urgent (14+ days)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {overdueComplaints.filter(c => c.escalation_level === 'critical').length}
              </div>
              <div className="text-sm text-gray-600">Critical (7-13 days)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {overdueComplaints.filter(c => c.escalation_level === 'warning').length}
              </div>
              <div className="text-sm text-gray-600">Warning (1-6 days)</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Search overdue complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                options={departments}
              />
              <Select
                value={escalationFilter}
                onChange={(e) => setEscalationFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Escalation Levels' },
                  { value: 'urgent', label: 'Urgent' },
                  { value: 'critical', label: 'Critical' },
                  { value: 'warning', label: 'Warning' }
                ]}
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
                  <Button size="sm" onClick={handleBulkEscalate}>
                    Escalate Priority
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleBulkAssign}>
                    Bulk Assign
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overdue Complaints List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Overdue Complaints ({filteredComplaints.length})
              </CardTitle>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedComplaints.length === filteredComplaints.length && filteredComplaints.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-green-500 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Overdue Complaints</h3>
                <p className="text-gray-500">All complaints are within their resolution deadlines.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredComplaints.map((complaint) => (
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
                            <Badge variant={getEscalationColor(complaint.escalation_level)} size="sm">
                              {complaint.escalation_level.toUpperCase()}
                            </Badge>
                            <Badge variant="error" size="sm">
                              {complaint.days_overdue} days overdue
                            </Badge>
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
                            <span className="font-medium">Deadline:</span> {formatDate(complaint.deadline_date)}
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
