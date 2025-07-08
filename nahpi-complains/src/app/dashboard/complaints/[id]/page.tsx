'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

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

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getCategoryLabel(category: string) {
  switch (category) {
    case 'ca_mark':
      return 'CA Mark Discrepancy'
    case 'exam_mark':
      return 'Exam Mark Query'
    case 'other':
      return 'Other Academic Issue'
    default:
      return category
  }
}

export default function ComplaintDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, studentProfile } = useAuth()
  const [complaint, setComplaint] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && params.id) {
      loadComplaint()
    }
  }, [user, params.id])

  const loadComplaint = async () => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          departments(name, code),
          complaint_attachments(*),
          complaint_responses(
            *,
            users(name, role)
          )
        `)
        .eq('id', params.id)
        .eq('student_id', user?.id) // Ensure student can only see their own complaints
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Complaint not found or you do not have permission to view it.')
        } else {
          throw error
        }
        return
      }

      setComplaint(data)
    } catch (err: any) {
      console.error('Error loading complaint:', err)
      setError('Failed to load complaint details.')
    } finally {
      setLoading(false)
    }
  }

  if (!user || !studentProfile) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view complaint details.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-secondary">
        <Header user={{ name: studentProfile.name, role: 'student', avatar: undefined }} notifications={0} />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading complaint details...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-background-secondary">
        <Header user={{ name: studentProfile.name, role: 'student', avatar: undefined }} notifications={0} />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Error</h3>
              <p className="mt-2 text-gray-600">{error}</p>
              <div className="mt-6">
                <Link href="/dashboard/complaints">
                  <Button>Back to Complaints</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-secondary">
      <Header user={{ name: studentProfile.name, role: 'student', avatar: undefined }} notifications={0} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/dashboard/complaints">
              <Button variant="ghost" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Complaints
              </Button>
            </Link>
            <Badge variant={getStatusColor(complaint.status)}>
              {complaint.status.replace('_', ' ')}
            </Badge>
            <Badge variant="outline">
              {getCategoryLabel(complaint.category)}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{complaint.title}</h1>
          <p className="text-gray-600 mt-2">Complaint ID: {complaint.complaint_id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Complaint Details */}
            <Card>
              <CardHeader>
                <CardTitle>Complaint Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <h4 className="font-medium text-gray-900">Course Information</h4>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Code:</span> {complaint.course_code}</p>
                      <p><span className="font-medium">Title:</span> {complaint.course_title}</p>
                      <p><span className="font-medium">Level:</span> {complaint.course_level}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Academic Period</h4>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Semester:</span> {complaint.semester}</p>
                      <p><span className="font-medium">Academic Year:</span> {complaint.academic_year}</p>
                      <p><span className="font-medium">Department:</span> {complaint.departments?.name}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attachments */}
            {complaint.complaint_attachments && complaint.complaint_attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {complaint.complaint_attachments.map((attachment: any) => (
                      <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{attachment.file_name}</p>
                            <p className="text-xs text-gray-500">
                              {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <a
                          href={attachment.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-dark"
                        >
                          <Button variant="outline" size="sm">
                            Download
                          </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Responses */}
            {complaint.complaint_responses && complaint.complaint_responses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Responses & Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {complaint.complaint_responses
                      .filter((response: any) => !response.is_internal)
                      .map((response: any) => (
                      <div key={response.id} className="border-l-4 border-blue-200 pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{response.users.name}</span>
                            <Badge variant="outline" size="sm">
                              {response.users.role.replace('_', ' ')}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(new Date(response.created_at))}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{response.message}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Status Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">Submitted</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(new Date(complaint.submitted_at))}
                      </p>
                    </div>
                  </div>
                  
                  {complaint.status !== 'pending' && (
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-900">In Progress</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(new Date(complaint.updated_at))}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {(complaint.status === 'resolved' || complaint.status === 'rejected') && complaint.resolved_at && (
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${complaint.status === 'resolved' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {complaint.status === 'resolved' ? 'Resolved' : 'Rejected'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(new Date(complaint.resolved_at))}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/submit-complaint">
                  <Button className="w-full" variant="outline">
                    Submit New Complaint
                  </Button>
                </Link>
                <Link href="/dashboard/complaints">
                  <Button className="w-full" variant="outline">
                    View All Complaints
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
