'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/contexts/AuthContext'
import { ComplaintService } from '@/lib/complaints'
import { EmailService } from '@/lib/emailService'
import { supabase } from '@/lib/supabase'
import { ComplaintStatus } from '@/types'
import { WorkflowService } from '@/lib/workflow'
import { DeadlineService } from '@/lib/deadlines'

// Status options will be dynamically generated based on workflow

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

export default function DepartmentComplaintDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [complaint, setComplaint] = useState<any>(null)
  const [departmentInfo, setDepartmentInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableTransitions, setAvailableTransitions] = useState<ComplaintStatus[]>([])
  const [transitionErrors, setTransitionErrors] = useState<string[]>([])
  const [deadlineInfo, setDeadlineInfo] = useState<any>(null)

  useEffect(() => {
    if (user && params.id) {
      loadComplaint()
    }
  }, [user, params.id])

  const loadComplaint = async () => {
    try {
      // Get department officer info first
      const { data: officerData, error: officerError } = await supabase
        .from('department_officers')
        .select(`
          *,
          departments(*)
        `)
        .eq('id', user?.id)
        .single()

      if (officerError) throw officerError
      setDepartmentInfo(officerData)

      // Load complaint details
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          students(
            matricule,
            year_of_study,
            phone_number,
            academic_year,
            users(name, email)
          ),
          departments(name, code),
          complaint_attachments(*),
          complaint_responses(
            *,
            users(name, role)
          )
        `)
        .eq('id', params.id)
        .eq('department_id', officerData.department_id) // Ensure officer can only see their department's complaints
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
      setNewStatus(data.status)

      // Calculate available transitions based on workflow
      const transitions = WorkflowService.getAvailableTransitions(data.status, 'department_officer')
      setAvailableTransitions(transitions)

      // Calculate deadline information
      const deadline = DeadlineService.calculateDeadline(new Date(data.submitted_at), data.category)
      const isOverdue = DeadlineService.isOverdue(new Date(data.submitted_at), data.category, data.status)
      const daysUntilDeadline = DeadlineService.getDaysUntilDeadline(new Date(data.submitted_at), data.category)

      setDeadlineInfo({
        deadline,
        isOverdue,
        daysUntilDeadline
      })
    } catch (err: any) {
      console.error('Error loading complaint:', err)
      setError('Failed to load complaint details.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!complaint || !newStatus) return

    // Validate transition using workflow service
    const validation = WorkflowService.validateTransition(
      complaint.status,
      newStatus as ComplaintStatus,
      'department_officer',
      responseText.trim().length > 0,
      newStatus === 'in_progress' ? true : false
    )

    if (!validation.valid) {
      setTransitionErrors(validation.errors)
      return
    }

    setIsSubmitting(true)
    setTransitionErrors([])

    try {
      const result = await ComplaintService.updateComplaintStatus(
        complaint.id,
        newStatus as ComplaintStatus,
        newStatus === 'in_progress' ? user?.id : undefined
      )

      if (result.success) {
        // Add response if provided
        if (responseText.trim()) {
          await ComplaintService.addComplaintResponse(
            complaint.id,
            user!.id,
            responseText,
            false // Not internal
          )
        }

        // Send email notification for resolved or rejected complaints
        if ((newStatus === 'resolved' || newStatus === 'rejected') && responseText.trim()) {
          try {
            const emailResult = await EmailService.sendComplaintStatusEmail(
              complaint.id,
              newStatus,
              responseText,
              user?.name || 'Department Officer'
            )

            if (emailResult.success) {
              console.log('✅ Email notification sent successfully')
            } else {
              console.error('❌ Failed to send email notification:', emailResult.error)
              // Don't fail the entire operation if email fails
            }
          } catch (emailError) {
            console.error('❌ Email service error:', emailError)
            // Continue with the operation even if email fails
          }
        }

        // Reload complaint data
        await loadComplaint()
        setResponseText('')
        alert('Complaint status updated successfully!')
      } else {
        alert('Failed to update complaint status')
      }
    } catch (error) {
      console.error('Error updating complaint:', error)
      alert('Failed to update complaint status')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddResponse = async () => {
    if (!complaint || !responseText.trim()) return

    setIsSubmitting(true)
    try {
      const result = await ComplaintService.addComplaintResponse(
        complaint.id,
        user!.id,
        responseText,
        false
      )

      if (result.success) {
        await loadComplaint()
        setResponseText('')
        alert('Response added successfully!')
      } else {
        alert('Failed to add response')
      }
    } catch (error) {
      console.error('Error adding response:', error)
      alert('Failed to add response')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view complaint details.</p>
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
            <p className="mt-4 text-gray-600">Loading complaint details...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !complaint) {
    return (
      <DashboardLayout user={{ name: user.name, role: 'department_officer', email: user.email }} notifications={0}>
        <div className="p-6">
          <Card>
            <CardContent className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Error</h3>
              <p className="mt-2 text-gray-600">{error}</p>
              <div className="mt-6">
                <Link href="/department/complaints">
                  <Button>Back to Complaints</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
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
    <DashboardLayout user={userInfo} notifications={0}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/department/complaints">
              <Button variant="ghost" size="sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Complaints
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusColor(complaint.status)}>
                {complaint.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline">
                {getCategoryLabel(complaint.category)}
              </Badge>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            ID: {complaint.complaint_id}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">{complaint.title}</h1>
          <p className="text-gray-600 mt-1">
            Submitted by {complaint.students?.users?.name} • {formatDate(new Date(complaint.submitted_at))}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

            {/* Student Information */}
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Personal Details</h4>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Name:</span> {complaint.students?.users?.name}</p>
                      <p><span className="font-medium">Email:</span> {complaint.students?.users?.email}</p>
                      <p><span className="font-medium">Phone:</span> {complaint.students?.phone_number}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Academic Details</h4>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Matricule:</span> {complaint.students?.matricule}</p>
                      <p><span className="font-medium">Year of Study:</span> {complaint.students?.year_of_study}</p>
                      <p><span className="font-medium">Academic Year:</span> {complaint.students?.academic_year}</p>
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

            {/* Responses & Communication */}
            {complaint.complaint_responses && complaint.complaint_responses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Responses & Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {complaint.complaint_responses
                      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                      .map((response: any) => (
                      <div key={response.id} className="border-l-4 border-blue-200 pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{response.users.name}</span>
                            <Badge variant="outline" size="sm">
                              {response.users.role.replace('_', ' ')}
                            </Badge>
                            {response.is_internal && (
                              <Badge variant="warning" size="sm">Internal</Badge>
                            )}
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

            {/* Deadline Information */}
            {deadlineInfo && (
              <Card>
                <CardHeader>
                  <CardTitle>Deadline Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Deadline:</span>
                      <span className="font-medium">
                        {deadlineInfo.deadline.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge variant={deadlineInfo.isOverdue ? 'error' : deadlineInfo.daysUntilDeadline <= 2 ? 'warning' : 'success'}>
                        {deadlineInfo.isOverdue
                          ? `${Math.abs(deadlineInfo.daysUntilDeadline)} days overdue`
                          : deadlineInfo.daysUntilDeadline === 0
                          ? 'Due today'
                          : `${deadlineInfo.daysUntilDeadline} days remaining`
                        }
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status Management */}
            <Card>
              <CardHeader>
                <CardTitle>Status Management</CardTitle>
                <CardDescription>
                  Update complaint status and add responses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Transition Errors */}
                {transitionErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-red-800 mb-1">Cannot update status:</h4>
                    <ul className="text-sm text-red-700 list-disc list-inside">
                      {transitionErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Select
                  label="Update Status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  options={[
                    { value: complaint.status, label: `Current: ${complaint.status.replace('_', ' ')}` },
                    ...availableTransitions.map(status => ({
                      value: status,
                      label: WorkflowService.getTransitionDescription(complaint.status, status)
                    }))
                  ]}
                  helperText={
                    newStatus !== complaint.status
                      ? WorkflowService.getTransitionMetadata(complaint.status, newStatus as ComplaintStatus).description
                      : 'Select a new status to update the complaint'
                  }
                />

                {/* Show requirements for selected transition */}
                {newStatus !== complaint.status && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Requirements for this transition:</h4>
                    <div className="text-sm text-blue-700">
                      {(() => {
                        const requirements = WorkflowService.getTransitionRequirements(complaint.status, newStatus as ComplaintStatus)
                        const items = []
                        if (requirements.requiresResponse) items.push('Response message required')
                        if (requirements.requiresAssignment) items.push('Officer assignment required')
                        if (items.length === 0) items.push('No additional requirements')
                        return (
                          <ul className="list-disc list-inside">
                            {items.map((item, index) => <li key={index}>{item}</li>)}
                          </ul>
                        )
                      })()}
                    </div>
                  </div>
                )}

                <Textarea
                  label="Response Message"
                  placeholder="Add a response to the student..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={4}
                  error={
                    newStatus !== complaint.status &&
                    WorkflowService.getTransitionRequirements(complaint.status, newStatus as ComplaintStatus).requiresResponse &&
                    !responseText.trim()
                      ? 'Response message is required for this status change'
                      : undefined
                  }
                />

                <div className="flex space-x-2">
                  <Button
                    onClick={handleStatusUpdate}
                    isLoading={isSubmitting}
                    disabled={!newStatus || newStatus === complaint.status}
                    className="flex-1"
                  >
                    Update Status
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleAddResponse}
                    isLoading={isSubmitting}
                    disabled={!responseText.trim()}
                  >
                    Add Response
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  Print Complaint
                </Button>
                <Button variant="outline" className="w-full">
                  Export to PDF
                </Button>
                <Button variant="outline" className="w-full">
                  Forward to Admin
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
