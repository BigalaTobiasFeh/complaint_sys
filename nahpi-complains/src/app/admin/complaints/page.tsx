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

const mockComplaints = [
  {
    id: '1',
    complaintId: 'CMP-2024-156',
    title: 'CA Mark Discrepancy in Advanced Mathematics',
    student: { name: 'John Doe', email: 'john.doe@student.nahpi.edu', matricule: 'STU2024001' },
    department: 'Mathematics',
    assignedTo: 'Dr. Smith',
    status: 'pending' as const,
    priority: 'high' as const,
    submittedAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    courseCode: 'MATH401',
    category: 'ca_mark' as const,
    isOverdue: false,
    daysOpen: 1
  },
  {
    id: '2',
    complaintId: 'CMP-2024-155',
    title: 'Exam Mark Query for Physics II',
    student: { name: 'Jane Smith', email: 'jane.smith@student.nahpi.edu', matricule: 'STU2024002' },
    department: 'Physics',
    assignedTo: null,
    status: 'unassigned' as const,
    priority: 'medium' as const,
    submittedAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19'),
    courseCode: 'PHYS201',
    category: 'exam_mark' as const,
    isOverdue: false,
    daysOpen: 2
  },
  {
    id: '3',
    complaintId: 'CMP-2024-154',
    title: 'Course Registration System Error',
    student: { name: 'Mike Wilson', email: 'mike.wilson@student.nahpi.edu', matricule: 'STU2024003' },
    department: 'Computer Science',
    assignedTo: 'Dr. Chen',
    status: 'in_progress' as const,
    priority: 'high' as const,
    submittedAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-19'),
    courseCode: 'CS301',
    category: 'other' as const,
    isOverdue: true,
    daysOpen: 3
  },
  {
    id: '4',
    complaintId: 'CMP-2024-153',
    title: 'Missing Assignment Grade Entry',
    student: { name: 'Sarah Davis', email: 'sarah.davis@student.nahpi.edu', matricule: 'STU2024004' },
    department: 'Engineering',
    assignedTo: 'Dr. Brown',
    status: 'resolved' as const,
    priority: 'low' as const,
    submittedAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-17'),
    courseCode: 'ENG201',
    category: 'ca_mark' as const,
    isOverdue: false,
    daysOpen: 6
  }
]

const departments = ['All Departments', 'Computer Science', 'Mathematics', 'Physics', 'Engineering', 'Business']
const officers = ['All Officers', 'Dr. Chen', 'Dr. Smith', 'Dr. Brown', 'Dr. Johnson', 'Unassigned']

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
    case 'unassigned':
      return 'secondary'
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
      return 'secondary'
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

export default function AdminComplaintsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [assignedToFilter, setAssignedToFilter] = useState('')
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([])

  const filteredComplaints = mockComplaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || complaint.status === statusFilter
    const matchesDepartment = !departmentFilter || departmentFilter === 'All Departments' || complaint.department === departmentFilter
    const matchesAssignedTo = !assignedToFilter || assignedToFilter === 'All Officers' || 
                             (assignedToFilter === 'Unassigned' && !complaint.assignedTo) ||
                             complaint.assignedTo === assignedToFilter

    return matchesSearch && matchesStatus && matchesDepartment && matchesAssignedTo
  })

  const handleSelectComplaint = (complaintId: string) => {
    setSelectedComplaints(prev => 
      prev.includes(complaintId) 
        ? prev.filter(id => id !== complaintId)
        : [...prev, complaintId]
    )
  }

  const handleSelectAll = () => {
    if (selectedComplaints.length === filteredComplaints.length) {
      setSelectedComplaints([])
    } else {
      setSelectedComplaints(filteredComplaints.map(c => c.id))
    }
  }

  const handleBulkAssign = () => {
    if (selectedComplaints.length > 0) {
      alert(`Bulk assign ${selectedComplaints.length} complaints`)
    }
  }

  return (
    <DashboardLayout user={mockUser} notifications={15}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Complaint Management</h1>
            <p className="text-gray-600 mt-2">Monitor and manage all complaints in the system</p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button 
              variant="outline" 
              onClick={handleBulkAssign}
              disabled={selectedComplaints.length === 0}
            >
              Bulk Assign ({selectedComplaints.length})
            </Button>
            <Link href="/admin/reports">
              <Button variant="outline">Generate Report</Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{mockComplaints.length}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unassigned</p>
                  <p className="text-2xl font-bold text-warning">{mockComplaints.filter(c => !c.assignedTo).length}</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-error">{mockComplaints.filter(c => c.isOverdue).length}</p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-success">{mockComplaints.filter(c => c.status === 'resolved').length}</p>
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
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
                <option value="unassigned">Unassigned</option>
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
                value={assignedToFilter}
                onChange={(e) => setAssignedToFilter(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {officers.map(officer => (
                  <option key={officer} value={officer}>{officer}</option>
                ))}
              </select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('')
                  setDepartmentFilter('')
                  setAssignedToFilter('')
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Complaints Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Complaints ({filteredComplaints.length})</CardTitle>
                <CardDescription>Manage and assign complaints to department officers</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedComplaints.length === filteredComplaints.length && filteredComplaints.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredComplaints.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
                  <p className="text-gray-600">No complaints match your current filters.</p>
                </div>
              ) : (
                filteredComplaints.map((complaint) => (
                  <div key={complaint.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedComplaints.includes(complaint.id)}
                      onChange={() => handleSelectComplaint(complaint.id)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{complaint.title}</h3>
                        <Badge variant={getStatusColor(complaint.status)} size="sm">
                          {complaint.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant={getPriorityColor(complaint.priority)} size="sm">
                          {complaint.priority}
                        </Badge>
                        {complaint.isOverdue && (
                          <Badge variant="error" size="sm">Overdue</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                        <div>
                          <span className="font-medium">ID:</span> {complaint.complaintId}
                        </div>
                        <div>
                          <span className="font-medium">Student:</span> {complaint.student.name}
                        </div>
                        <div>
                          <span className="font-medium">Course:</span> {complaint.courseCode}
                        </div>
                        <div>
                          <span className="font-medium">Department:</span> {complaint.department}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Submitted: {formatDate(complaint.submittedAt)}</span>
                        <span>Updated: {formatDate(complaint.updatedAt)}</span>
                        <span>{complaint.daysOpen} days open</span>
                        {complaint.assignedTo ? (
                          <span>Assigned to: <span className="font-medium">{complaint.assignedTo}</span></span>
                        ) : (
                          <span className="text-warning font-medium">Unassigned</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Link href={`/admin/complaints/${complaint.id}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                      {!complaint.assignedTo && (
                        <Button variant="primary" size="sm">Assign</Button>
                      )}
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
