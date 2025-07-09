'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { ComplaintService } from '@/lib/complaints'
import { supabase } from '@/lib/supabase'

// Mock data removed - using real database queries

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
  const { user } = useAuth()
  const [stats, setStats] = useState({
    departmentComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    rejectedComplaints: 0,
    todayNewComplaints: 0,
    averageResponseTime: 0,
    resolutionRate: 0
  })
  const [recentComplaints, setRecentComplaints] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [departmentInfo, setDepartmentInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      // Get department officer info
      const { data: officerData, error: officerError } = await supabase
        .from('department_officers')
        .select(`
          *,
          departments(*)
        `)
        .eq('id', user.id)
        .single()

      if (officerError) throw officerError

      setDepartmentInfo(officerData)

      // Load department complaints
      const complaintsResult = await ComplaintService.getDepartmentComplaints(officerData.department_id)

      if (complaintsResult.success && complaintsResult.complaints) {
        const complaints = complaintsResult.complaints

        // Calculate stats
        const totalComplaints = complaints.length
        const pendingComplaints = complaints.filter(c => c.status === 'pending').length
        const inProgressComplaints = complaints.filter(c => c.status === 'in_progress').length
        const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length
        const rejectedComplaints = complaints.filter(c => c.status === 'rejected').length

        // Calculate today's new complaints
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayNewComplaints = complaints.filter(c =>
          new Date(c.submitted_at) >= today
        ).length

        setStats({
          departmentComplaints: totalComplaints,
          pendingComplaints,
          inProgressComplaints,
          resolvedComplaints,
          rejectedComplaints,
          todayNewComplaints,
          averageResponseTime: 2.1, // TODO: Calculate from data
          resolutionRate: totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0
        })

        // Format recent complaints
        const formattedComplaints = complaints.slice(0, 5).map(complaint => ({
          id: complaint.id,
          complaintId: complaint.complaint_id,
          title: complaint.title,
          student: complaint.students?.users?.name || 'Unknown',
          studentEmail: complaint.students?.users?.email || '',
          courseCode: complaint.course_code,
          status: complaint.status,
          priority: complaint.priority || 'medium',
          submittedAt: new Date(complaint.submitted_at),
          lastUpdated: new Date(complaint.updated_at),
          isOverdue: false, // TODO: Calculate based on deadlines
          daysOpen: Math.floor((Date.now() - new Date(complaint.submitted_at).getTime()) / (1000 * 60 * 60 * 24))
        }))
        setRecentComplaints(formattedComplaints)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access the department dashboard.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <DashboardLayout user={{ name: user.name, role: 'department_officer', email: user.email }} notifications={0}>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const userInfo = {
    name: user.name,
    role: 'department_officer' as const,
    email: user.email,
    department: departmentInfo?.departments?.name || 'Department'
  }

  return (
    <DashboardLayout user={userInfo} notifications={stats.pendingComplaints}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Department Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage complaints for {departmentInfo?.departments?.name || 'your department'}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Link href="/department/complaints">
              <Button variant="outline">
                View All Complaints
              </Button>
            </Link>
            <Button>
              Generate Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Department Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.departmentComplaints}</div>
              <p className="text-xs text-gray-500 mt-1">Total this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.inProgressComplaints}</div>
              <p className="text-xs text-gray-500 mt-1">Being processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Today's New</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">{stats.todayNewComplaints}</div>
              <p className="text-xs text-gray-500 mt-1">Received today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Resolution Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.resolutionRate}%</div>
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
                  <div className="text-2xl font-bold text-yellow-600">{stats.pendingComplaints}</div>
                  <div className="text-sm text-yellow-700">Pending</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.inProgressComplaints}</div>
                  <div className="text-sm text-blue-700">In Progress</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.resolvedComplaints}</div>
                  <div className="text-sm text-green-700">Resolved</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats.rejectedComplaints}</div>
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
              <Link href="/department/complaints">
                <Button className="w-full justify-start" variant="primary">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View All Complaints
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

        {/* Department Complaints & Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Department Complaints</CardTitle>
                  <CardDescription>Latest complaints for your department</CardDescription>
                </div>
                <Link href="/department/complaints">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentComplaints.length > 0 ? recentComplaints.map((complaint) => (
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
                      <Button variant="ghost" size="sm">View Details</Button>
                    </Link>
                  </div>
                )) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">No recent complaints</p>
                  </div>
                )}
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
                {recentActivity.length > 0 ? recentActivity.map((activity) => (
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
                )) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">No recent activity</p>
                  </div>
                )}
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
                  <p className="text-sm text-gray-600">Sent daily at 5:00 PM to {user?.email || 'your email'}</p>
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
