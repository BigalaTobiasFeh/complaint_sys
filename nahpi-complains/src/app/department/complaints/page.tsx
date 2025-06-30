'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

const mockUser = {
  name: 'Dr. Michael Chen',
  role: 'department_officer' as const,
  email: 'michael.chen@nahpi.edu',
  department: 'Computer Science Department',
  avatar: undefined
}

const mockComplaints = [
  {
    id: '1',
    complaintId: 'CMP-2024-145',
    title: 'CA Mark Discrepancy in Data Structures',
    student: { name: 'Alice Johnson', email: 'alice.johnson@student.nahpi.edu', matricule: 'STU2024001' },
    assignedTo: 'Dr. Michael Chen',
    status: 'pending' as const,
    priority: 'high' as const,
    submittedAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    courseCode: 'CS301',
    courseTitle: 'Data Structures and Algorithms',
    category: 'ca_mark' as const,
    isOverdue: false,
    daysOpen: 1,
    lastResponse: null,
    hasUnreadMessages: true
  },
  {
    id: '2',
    complaintId: 'CMP-2024-142',
    title: 'Exam Mark Query for Algorithms',
    student: { name: 'Bob Smith', email: 'bob.smith@student.nahpi.edu', matricule: 'STU2024002' },
    assignedTo: 'Dr. Michael Chen',
    status: 'in_progress' as const,
    priority: 'medium' as const,
    submittedAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-19'),
    courseCode: 'CS401',
    courseTitle: 'Advanced Algorithms',
    category: 'exam_mark' as const,
    isOverdue: false,
    daysOpen: 3,
    lastResponse: new Date('2024-01-19'),
    hasUnreadMessages: false
  },
  {
    id: '3',
    complaintId: 'CMP-2024-138',
    title: 'Missing Assignment Grade',
    student: { name: 'Carol Davis', email: 'carol.davis@student.nahpi.edu', matricule: 'STU2024003' },
    assignedTo: 'Dr. Sarah Wilson',
    status: 'pending' as const,
    priority: 'low' as const,
    submittedAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    courseCode: 'CS201',
    courseTitle: 'Programming Fundamentals',
    category: 'ca_mark' as const,
    isOverdue: true,
    daysOpen: 6,
    lastResponse: null,
    hasUnreadMessages: true
  },
  {
    id: '4',
    complaintId: 'CMP-2024-135',
    title: 'Course Material Access Issue',
    student: { name: 'David Brown', email: 'david.brown@student.nahpi.edu', matricule: 'STU2024004' },
    assignedTo: 'Dr. Michael Chen',
    status: 'resolved' as const,
    priority: 'medium' as const,
    submittedAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-16'),
    courseCode: 'CS101',
    courseTitle: 'Introduction to Computer Science',
    category: 'other' as const,
    isOverdue: false,
    daysOpen: 9,
    lastResponse: new Date('2024-01-16'),
    hasUnreadMessages: false
  }
]

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

export default function DepartmentComplaintsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [assignmentFilter, setAssignmentFilter] = useState('')

  // Filter complaints for this department
  const departmentComplaints = mockComplaints

  const filteredComplaints = departmentComplaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || complaint.status === statusFilter
    const matchesPriority = !priorityFilter || complaint.priority === priorityFilter
    const matchesAssignment = !assignmentFilter || 
                             (assignmentFilter === 'assigned_to_me' && complaint.assignedTo === mockUser.name) ||
                             (assignmentFilter === 'unassigned' && !complaint.assignedTo) ||
                             (assignmentFilter === 'all')

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignment
  })

  const myAssignedComplaints = departmentComplaints.filter(c => c.assignedTo === mockUser.name)
  const pendingComplaints = myAssignedComplaints.filter(c => c.status === 'pending')
  const inProgressComplaints = myAssignedComplaints.filter(c => c.status === 'in_progress')
  const overdueComplaints = myAssignedComplaints.filter(c => c.isOverdue)

  return (
    <DashboardLayout user={mockUser} notifications={8}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Department Complaints</h1>
          <p className="text-gray-600 mt-2">Manage complaints for {mockUser.department}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Department</p>
                  <p className="text-2xl font-bold">{departmentComplaints.length}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Assigned to Me</p>
                  <p className="text-2xl font-bold text-primary">{myAssignedComplaints.length}</p>
                </div>
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Action</p>
                  <p className="text-2xl font-bold text-warning">{pendingComplaints.length}</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-error">{overdueComplaints.length}</p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
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
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>

              <select
                value={assignmentFilter}
                onChange={(e) => setAssignmentFilter(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Assignments</option>
                <option value="assigned_to_me">Assigned to Me</option>
                <option value="unassigned">Unassigned</option>
              </select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('')
                  setPriorityFilter('')
                  setAssignmentFilter('')
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Complaints List */}
        <Card>
          <CardHeader>
            <CardTitle>Complaints ({filteredComplaints.length})</CardTitle>
            <CardDescription>Department complaints requiring attention</CardDescription>
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
                  <div key={complaint.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
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
                        {complaint.hasUnreadMessages && (
                          <Badge variant="info" size="sm">New Message</Badge>
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
                          <span className="font-medium">Category:</span> {complaint.category.replace('_', ' ')}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Submitted: {formatDate(complaint.submittedAt)}</span>
                        <span>Updated: {formatDate(complaint.updatedAt)}</span>
                        <span>{complaint.daysOpen} days open</span>
                        {complaint.lastResponse && (
                          <span>Last response: {formatDate(complaint.lastResponse)}</span>
                        )}
                        {complaint.assignedTo && (
                          <span>Assigned to: <span className="font-medium">{complaint.assignedTo}</span></span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <Link href={`/department/complaints/${complaint.id}`}>
                        <Button variant="primary" size="sm">
                          {complaint.assignedTo === mockUser.name ? 'Respond' : 'View Details'}
                        </Button>
                      </Link>
                      {complaint.assignedTo === mockUser.name && complaint.status !== 'resolved' && (
                        <Button variant="outline" size="sm">
                          Update Status
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/department/assigned">
                <Button className="w-full justify-start">
                  View My Assignments ({myAssignedComplaints.length})
                </Button>
              </Link>
              <Link href="/department/communications">
                <Button variant="outline" className="w-full justify-start">
                  Message Center
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>New complaints:</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex justify-between">
                  <span>Responses sent:</span>
                  <span className="font-medium">2</span>
                </div>
                <div className="flex justify-between">
                  <span>Resolved:</span>
                  <span className="font-medium">1</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending action:</span>
                  <span className="font-medium text-warning">{pendingComplaints.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 mb-3">
                Daily summary emails are sent at 5:00 PM
              </div>
              <Link href="/department/settings">
                <Button variant="outline" size="sm" className="w-full">
                  Configure Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
