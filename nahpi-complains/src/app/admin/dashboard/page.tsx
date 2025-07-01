'use client'

import React from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

// Mock data
const mockUser = {
  name: 'Sarah Johnson',
  role: 'admin' as const,
  email: 'sarah.johnson@nahpi.edu',
  avatar: undefined
}

const mockStats = {
  totalComplaints: 156,
  pendingComplaints: 23,
  inProgressComplaints: 18,
  resolvedComplaints: 98,
  rejectedComplaints: 17,
  overdueComplaints: 8,
  totalUsers: 1247,
  totalStudents: 1198,
  totalOfficers: 45,
  totalDepartments: 12,
  averageResolutionTime: 4.2
}

const mockRecentComplaints = [
  {
    id: '1',
    complaintId: 'CMP-2024-156',
    title: 'CA Mark Discrepancy in Advanced Mathematics',
    student: 'John Doe',
    department: 'Mathematics',
    status: 'pending' as const,
    priority: 'high' as const,
    submittedAt: new Date('2024-01-20'),
    isOverdue: false
  },
  {
    id: '2',
    complaintId: 'CMP-2024-155',
    title: 'Exam Mark Query for Physics II',
    student: 'Jane Smith',
    department: 'Physics',
    status: 'in_progress' as const,
    priority: 'medium' as const,
    submittedAt: new Date('2024-01-19'),
    isOverdue: true
  },
  {
    id: '3',
    complaintId: 'CMP-2024-154',
    title: 'Course Registration System Error',
    student: 'Mike Wilson',
    department: 'Computer Science',
    status: 'pending' as const,
    priority: 'high' as const,
    submittedAt: new Date('2024-01-18'),
    isOverdue: false
  }
]

const mockDepartmentStats = [
  { name: 'Computer Science', complaints: 34, resolved: 28, pending: 6, officers: 8 },
  { name: 'Mathematics', complaints: 28, resolved: 22, pending: 6, officers: 6 },
  { name: 'Physics', complaints: 22, resolved: 18, pending: 4, officers: 5 },
  { name: 'Engineering', complaints: 19, resolved: 15, pending: 4, officers: 7 }
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

export default function AdminDashboard() {
  return (
    <DashboardLayout user={mockUser} notifications={15}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of the complaint management system</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{mockStats.totalComplaints}</div>
              <p className="text-xs text-green-600 mt-1">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">{mockStats.inProgressComplaints}</div>
              <p className="text-xs text-gray-500 mt-1">Being processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-error">{mockStats.overdueComplaints}</div>
              <p className="text-xs text-gray-500 mt-1">Past deadline</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Resolution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{mockStats.averageResolutionTime} days</div>
              <p className="text-xs text-green-600 mt-1">-0.8 days improved</p>
            </CardContent>
          </Card>
        </div>

        {/* Status Overview */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Complaint Status Overview</CardTitle>
              <CardDescription>Current distribution of complaint statuses</CardDescription>
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
              <CardTitle>System Users</CardTitle>
              <CardDescription>User account statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Users</span>
                <span className="font-semibold">{mockStats.totalUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Students</span>
                <span className="font-semibold">{mockStats.totalStudents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Department Officers</span>
                <span className="font-semibold">{mockStats.totalOfficers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Departments</span>
                <span className="font-semibold">{mockStats.totalDepartments}</span>
              </div>
              <Link href="/admin/users">
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Manage Users
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Complaints & Department Performance */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Complaints</CardTitle>
                  <CardDescription>Latest complaint submissions requiring attention</CardDescription>
                </div>
                <Link href="/admin/complaints">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentComplaints.map((complaint) => (
                  <div key={complaint.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-sm text-gray-900 truncate">{complaint.title}</h4>
                        {complaint.isOverdue && (
                          <Badge variant="error" size="sm">Overdue</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>ID: {complaint.complaintId}</span>
                        <span>Student: {complaint.student}</span>
                        <span>{formatDate(complaint.submittedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant={getStatusColor(complaint.status)} size="sm">
                          {complaint.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant={getPriorityColor(complaint.priority)} size="sm">
                          {complaint.priority}
                        </Badge>
                        <span className="text-xs text-gray-500">{complaint.department}</span>
                      </div>
                    </div>
                    <Link href={`/admin/complaints/${complaint.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>Complaint resolution by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDepartmentStats.map((dept) => (
                  <div key={dept.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{dept.name}</span>
                      <span className="text-xs text-gray-500">{dept.officers} officers</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-gray-600">Total: {dept.complaints}</span>
                      <span className="text-green-600">Resolved: {dept.resolved}</span>
                      <span className="text-yellow-600">Pending: {dept.pending}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(dept.resolved / dept.complaints) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/admin/departments">
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Manage Departments
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/admin/complaints">
                <Button variant="outline" className="w-full h-20 flex-col">
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Complaints
                </Button>
              </Link>
              
              <Link href="/admin/users/new">
                <Button variant="outline" className="w-full h-20 flex-col">
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Add User
                </Button>
              </Link>
              
              <Link href="/admin/departments/new">
                <Button variant="outline" className="w-full h-20 flex-col">
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Add Department
                </Button>
              </Link>
              
              <Link href="/admin/reports">
                <Button variant="outline" className="w-full h-20 flex-col">
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Generate Report
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
