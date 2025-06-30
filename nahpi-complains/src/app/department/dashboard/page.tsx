'use client'

import React from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

// Mock data
const mockUser = {
  name: 'Dr. Michael Chen',
  role: 'department_officer' as const,
  email: 'michael.chen@nahpi.edu',
  department: 'Computer Science Department',
  avatar: undefined
}

const mockStats = {
  departmentComplaints: 34,
  assignedToMe: 12,
  pendingComplaints: 8,
  inProgressComplaints: 4,
  resolvedComplaints: 20,
  rejectedComplaints: 2,
  todayNewComplaints: 3,
  averageResponseTime: 2.1,
  resolutionRate: 85
}

const mockAssignedComplaints = [
  {
    id: '1',
    complaintId: 'CMP-2024-145',
    title: 'CA Mark Discrepancy in Data Structures',
    student: 'Alice Johnson',
    studentEmail: 'alice.johnson@student.nahpi.edu',
    courseCode: 'CS301',
    status: 'pending' as const,
    priority: 'high' as const,
    submittedAt: new Date('2024-01-20'),
    lastUpdated: new Date('2024-01-20'),
    isOverdue: false,
    daysOpen: 1
  },
  {
    id: '2',
    complaintId: 'CMP-2024-142',
    title: 'Exam Mark Query for Algorithms',
    student: 'Bob Smith',
    studentEmail: 'bob.smith@student.nahpi.edu',
    courseCode: 'CS401',
    status: 'in_progress' as const,
    priority: 'medium' as const,
    submittedAt: new Date('2024-01-18'),
    lastUpdated: new Date('2024-01-19'),
    isOverdue: false,
    daysOpen: 3
  },
  {
    id: '3',
    complaintId: 'CMP-2024-138',
    title: 'Missing Assignment Grade',
    student: 'Carol Davis',
    studentEmail: 'carol.davis@student.nahpi.edu',
    courseCode: 'CS201',
    status: 'pending' as const,
    priority: 'low' as const,
    submittedAt: new Date('2024-01-15'),
    lastUpdated: new Date('2024-01-15'),
    isOverdue: true,
    daysOpen: 6
  }
]

const mockRecentActivity = [
  {
    id: '1',
    type: 'complaint_assigned',
    message: 'New complaint assigned: CA Mark Discrepancy in Data Structures',
    timestamp: new Date('2024-01-20T14:30:00'),
    complaintId: 'CMP-2024-145'
  },
  {
    id: '2',
    type: 'complaint_updated',
    message: 'Updated status for Exam Mark Query for Algorithms',
    timestamp: new Date('2024-01-19T16:45:00'),
    complaintId: 'CMP-2024-142'
  },
  {
    id: '3',
    type: 'student_response',
    message: 'Student responded to Missing Assignment Grade complaint',
    timestamp: new Date('2024-01-19T10:20:00'),
    complaintId: 'CMP-2024-138'
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

function formatDateTime(date: Date) {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function DepartmentDashboard() {
  return (
    <DashboardLayout user={mockUser} notifications={8}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Department Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage complaints for {mockUser.department}</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Department Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{mockStats.departmentComplaints}</div>
              <p className="text-xs text-gray-500 mt-1">Total this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Assigned to Me</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{mockStats.assignedToMe}</div>
              <p className="text-xs text-gray-500 mt-1">Active assignments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Today's New</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">{mockStats.todayNewComplaints}</div>
              <p className="text-xs text-gray-500 mt-1">Received today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Resolution Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{mockStats.resolutionRate}%</div>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Status Overview & Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>My Complaint Status</CardTitle>
              <CardDescription>Status of complaints assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{mockStats.pendingComplaints}</div>
                  <div className="text-sm text-yellow-700">Pending</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{mockStats.inProgressComplaints}</div>
                  <div className="text-sm text-blue-700">In Progress</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{mockStats.resolvedComplaints}</div>
                  <div className="text-sm text-green-700">Resolved</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{mockStats.rejectedComplaints}</div>
                  <div className="text-sm text-red-700">Rejected</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/department/assigned">
                <Button className="w-full justify-start" variant="primary">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View My Assignments
                </Button>
              </Link>
              
              <Link href="/department/complaints">
                <Button className="w-full justify-start" variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Department Complaints
                </Button>
              </Link>

              <Link href="/department/communications">
                <Button className="w-full justify-start" variant="ghost">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Communications
                </Button>
              </Link>

              <Link href="/department/settings">
                <Button className="w-full justify-start" variant="ghost">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Notification Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Complaints & Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Assigned Complaints</CardTitle>
                  <CardDescription>Complaints requiring your attention</CardDescription>
                </div>
                <Link href="/department/assigned">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAssignedComplaints.map((complaint) => (
                  <div key={complaint.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-sm text-gray-900 truncate">{complaint.title}</h4>
                        {complaint.isOverdue && (
                          <Badge variant="error" size="sm">Overdue</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                        <span>ID: {complaint.complaintId}</span>
                        <span>Student: {complaint.student}</span>
                        <span>Course: {complaint.courseCode}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusColor(complaint.status)} size="sm">
                          {complaint.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant={getPriorityColor(complaint.priority)} size="sm">
                          {complaint.priority}
                        </Badge>
                        <span className="text-xs text-gray-500">{complaint.daysOpen} days open</span>
                      </div>
                    </div>
                    <Link href={`/department/complaints/${complaint.id}`}>
                      <Button variant="ghost" size="sm">Respond</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">{formatDateTime(activity.timestamp)}</span>
                        {activity.complaintId && (
                          <Link 
                            href={`/department/complaints/${activity.complaintId}`}
                            className="text-xs text-primary hover:text-primary-dark"
                          >
                            View →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="ghost" size="sm">View All Activity</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Email Summary</CardTitle>
            <CardDescription>Configure your daily complaint summary notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Daily Summary Enabled</p>
                  <p className="text-sm text-gray-600">Sent daily at 5:00 PM to {mockUser.email}</p>
                </div>
              </div>
              <Link href="/department/settings">
                <Button variant="outline" size="sm">Configure</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
