'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

// Complaint interface
interface Complaint {
  id: string
  complaint_id: string
  title: string
  category: string
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected'
  priority: 'low' | 'medium' | 'high'
  submitted_at: string
  department_name?: string
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    rejected: 0
  })

  useEffect(() => {
    if (user) {
      loadStudentData()
    }
  }, [user])

  const loadStudentData = async () => {
    try {
      setLoading(true)

      // Get student's complaints
      const { data: complaintsData, error: complaintsError } = await supabase
        .from('complaints')
        .select(`
          id,
          complaint_id,
          title,
          category,
          status,
          priority,
          submitted_at,
          departments(name)
        `)
        .eq('student_id', user?.id)
        .order('submitted_at', { ascending: false })

      if (complaintsError) {
        console.error('Error loading complaints:', complaintsError)
        return
      }

      const formattedComplaints = complaintsData?.map(complaint => ({
        id: complaint.id,
        complaint_id: complaint.complaint_id,
        title: complaint.title,
        category: complaint.category,
        status: complaint.status,
        priority: complaint.priority || 'medium',
        submitted_at: complaint.submitted_at,
        department_name: complaint.departments?.name || 'Unknown Department'
      })) || []

      setComplaints(formattedComplaints)

      // Calculate statistics
      const total = formattedComplaints.length
      const pending = formattedComplaints.filter(c => c.status === 'pending').length
      const in_progress = formattedComplaints.filter(c => c.status === 'in_progress').length
      const resolved = formattedComplaints.filter(c => c.status === 'resolved').length
      const rejected = formattedComplaints.filter(c => c.status === 'rejected').length

      setStats({ total, pending, in_progress, resolved, rejected })

    } catch (error) {
      console.error('Error loading student data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'in_progress': return 'info'
      case 'resolved': return 'success'
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error'
      case 'medium': return 'warning'
      case 'low': return 'success'
      default: return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <DashboardLayout user={{ name: user?.name || '', role: 'student', email: user?.email || '' }} notifications={0}>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={{ name: user?.name || '', role: 'student', email: user?.email || '' }} notifications={0}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/student/complaints/submit">
              <Button>Submit New Complaint</Button>
            </Link>
            <Link href="/student/complaints">
              <Button variant="outline">View All Complaints</Button>
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Complaints</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.in_progress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Complaints */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Complaints</CardTitle>
            <CardDescription>Your latest complaint submissions and their status</CardDescription>
          </CardHeader>
          <CardContent>
            {complaints.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Complaints Yet</h3>
                <p className="text-gray-600 mb-4">You haven't submitted any complaints yet.</p>
                <Link href="/student/complaints/submit">
                  <Button>Submit Your First Complaint</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.slice(0, 5).map((complaint) => (
                  <div key={complaint.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{complaint.title}</h3>
                        <Badge variant={getStatusColor(complaint.status)} size="sm">
                          {complaint.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant={getPriorityColor(complaint.priority)} size="sm">
                          {complaint.priority}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">#{complaint.complaint_id}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Category:</span> {complaint.category.replace('_', ' ')}
                      </div>
                      <div>
                        <span className="font-medium">Department:</span> {complaint.department_name}
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span> {formatDate(complaint.submitted_at)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {complaints.length > 5 && (
                  <div className="text-center pt-4">
                    <Link href="/student/complaints">
                      <Button variant="outline">View All {complaints.length} Complaints</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Submit Complaint</CardTitle>
              <CardDescription>Report issues with grades, exams, or other academic matters</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/student/complaints/submit">
                <Button className="w-full">Submit New Complaint</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Track Complaints</CardTitle>
              <CardDescription>Monitor the progress of your submitted complaints</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/student/complaints">
                <Button variant="outline" className="w-full">View All Complaints</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/student/profile">
                <Button variant="outline" className="w-full">Manage Profile</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
