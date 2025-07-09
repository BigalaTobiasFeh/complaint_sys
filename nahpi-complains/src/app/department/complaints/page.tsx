'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/contexts/AuthContext'
import { ComplaintService } from '@/lib/complaints'
import { supabase } from '@/lib/supabase'
import { ComplaintStatus, ComplaintCategory } from '@/types'

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' }
]

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'ca_mark', label: 'CA Mark' },
  { value: 'exam_mark', label: 'Exam Mark' },
  { value: 'other', label: 'Other' }
]

const priorityOptions = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
]

function getStatusColor(status: ComplaintStatus) {
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
function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function getCategoryLabel(category: ComplaintCategory) {
  switch (category) {
    case 'ca_mark':
      return 'CA Mark'
    case 'exam_mark':
      return 'Exam Mark'
    case 'other':
      return 'Other'
    default:
      return category
  }
}



export default function DepartmentComplaintsPage() {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState<any[]>([])
  const [filteredComplaints, setFilteredComplaints] = useState<any[]>([])
  const [departmentInfo, setDepartmentInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (user) {
      loadComplaints()
    }
  }, [user])

  useEffect(() => {
    filterComplaints()
  }, [complaints, searchTerm, statusFilter, categoryFilter, priorityFilter])

  const loadComplaints = async () => {
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
      const result = await ComplaintService.getDepartmentComplaints(officerData.department_id)
      if (result.success && result.complaints) {
        setComplaints(result.complaints)
      }
    } catch (error) {
      console.error('Error loading complaints:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterComplaints = () => {
    let filtered = complaints

    if (searchTerm) {
      filtered = filtered.filter(complaint =>
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.complaint_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.students?.users?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter) {
      filtered = filtered.filter(complaint => complaint.status === statusFilter)
    }

    if (categoryFilter) {
      filtered = filtered.filter(complaint => complaint.category === categoryFilter)
    }

    if (priorityFilter) {
      filtered = filtered.filter(complaint => complaint.priority === priorityFilter)
    }

    setFilteredComplaints(filtered)
  }

  const handleStatusUpdate = async (complaintId: string, newStatus: ComplaintStatus) => {
    try {
      const result = await ComplaintService.updateComplaintStatus(
        complaintId,
        newStatus,
        newStatus === 'in_progress' ? user?.id : undefined
      )

      if (result.success) {
        // Reload complaints to get updated data
        loadComplaints()
      } else {
        alert('Failed to update complaint status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update complaint status')
    }
  }

  // Export functions
  const exportToCSV = async () => {
    setIsExporting(true)
    try {
      const dataToExport = filteredComplaints.map(complaint => ({
        'Complaint ID': complaint.complaint_id,
        'Title': complaint.title,
        'Student Name': complaint.students?.users?.name || 'Unknown',
        'Student Email': complaint.students?.users?.email || '',
        'Matricule': complaint.students?.matricule || '',
        'Course Code': complaint.course_code,
        'Course Title': complaint.course_title,
        'Category': getCategoryLabel(complaint.category),
        'Status': complaint.status,
        'Priority': complaint.priority || 'medium',
        'Submitted Date': new Date(complaint.submitted_at).toLocaleDateString(),
        'Last Updated': new Date(complaint.updated_at).toLocaleDateString(),
        'Description': complaint.description
      }))

      const csvContent = [
        Object.keys(dataToExport[0]).join(','),
        ...dataToExport.map(row =>
          Object.values(row).map(value =>
            `"${String(value).replace(/"/g, '""')}"`
          ).join(',')
        )
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `department-complaints-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting CSV:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportComplaintToPDF = async (complaintId: string) => {
    try {
      // Find the complaint
      const complaint = complaints.find(c => c.id === complaintId)
      if (!complaint) return

      // Get complaint details with responses
      const { data: detailedComplaint, error } = await supabase
        .from('complaints')
        .select(`
          *,
          students(
            matricule,
            users(name, email)
          ),
          departments(name, code),
          complaint_attachments(*),
          complaint_responses(
            *,
            users(name, role)
          )
        `)
        .eq('id', complaintId)
        .single()

      if (error) {
        console.error('Error fetching complaint details:', error)
        return
      }

      // Create PDF content (as text file for now)
      const pdfContent = `NAHPI COMPLAINT MANAGEMENT SYSTEM
COMPLAINT DETAILS REPORT

Complaint ID: ${detailedComplaint.complaint_id}
Title: ${detailedComplaint.title}
Status: ${detailedComplaint.status.toUpperCase()}
Priority: ${detailedComplaint.priority || 'Medium'}

STUDENT INFORMATION:
Name: ${detailedComplaint.students?.users?.name || 'Unknown'}
Email: ${detailedComplaint.students?.users?.email || 'Unknown'}
Matricule: ${detailedComplaint.students?.matricule || 'Unknown'}

COURSE INFORMATION:
Course Code: ${detailedComplaint.course_code}
Course Title: ${detailedComplaint.course_title}
Course Level: ${detailedComplaint.course_level}
Semester: ${detailedComplaint.semester}
Academic Year: ${detailedComplaint.academic_year}

DEPARTMENT:
${detailedComplaint.departments?.name || 'Unknown Department'}

COMPLAINT DETAILS:
Category: ${getCategoryLabel(detailedComplaint.category)}
Submitted: ${new Date(detailedComplaint.submitted_at).toLocaleString()}
Last Updated: ${new Date(detailedComplaint.updated_at).toLocaleString()}

DESCRIPTION:
${detailedComplaint.description}

ATTACHMENTS:
${detailedComplaint.complaint_attachments?.length > 0
  ? detailedComplaint.complaint_attachments.map((att: any) => `- ${att.file_name}`).join('\n')
  : 'No attachments'
}

RESPONSE HISTORY:
${detailedComplaint.complaint_responses?.length > 0
  ? detailedComplaint.complaint_responses.map((resp: any) =>
      `[${new Date(resp.created_at).toLocaleString()}] ${resp.users?.name || 'Unknown'} (${resp.users?.role || 'Unknown'}): ${resp.message}`
    ).join('\n\n')
  : 'No responses yet'
}

Generated on: ${new Date().toLocaleString()}`

      // Create and download file
      const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `complaint-${detailedComplaint.complaint_id}.txt`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting complaint:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access the department complaints.</p>
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
            <p className="mt-4 text-gray-600">Loading complaints...</p>
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
    <DashboardLayout
      user={userInfo}
      notifications={complaints.filter(c => c.status === 'pending').length}
      complaintsBadge={complaints.length}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Department Complaints</h1>
            <p className="text-gray-600 mt-1">
              Manage complaints for {departmentInfo?.departments?.name || 'your department'}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button
              variant="outline"
              onClick={exportToCSV}
              disabled={isExporting || filteredComplaints.length === 0}
            >
              {isExporting ? 'Exporting...' : 'Export All CSV'}
            </Button>
            <Button variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Filters
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Department</p>
                  <p className="text-2xl font-bold">{complaints.length}</p>
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
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-primary">{complaints.filter(c => c.status === 'in_progress').length}</p>
                </div>
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <p className="text-sm text-gray-600">Pending Action</p>
                  <p className="text-2xl font-bold text-warning">{complaints.filter(c => c.status === 'pending').length}</p>
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
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-success">{complaints.filter(c => c.status === 'resolved').length}</p>
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
              <Select
                placeholder="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={statusOptions}
              />
              <Select
                placeholder="Filter by category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={categoryOptions}
              />
              <Select
                placeholder="Filter by priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                options={priorityOptions}
              />
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('')
                  setCategoryFilter('')
                  setPriorityFilter('')
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Complaints List */}
        {filteredComplaints.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No complaints found</h3>
              <p className="mt-2 text-gray-600">
                {complaints.length === 0
                  ? "No complaints have been submitted to your department yet."
                  : "No complaints match your current filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredComplaints.map((complaint) => (
              <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
                        <Badge variant={getStatusColor(complaint.status)} size="sm">
                          {complaint.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" size="sm">
                          {getCategoryLabel(complaint.category)}
                        </Badge>
                        <Badge variant={getPriorityColor(complaint.priority)} size="sm">
                          {complaint.priority} priority
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">ID:</span> {complaint.complaint_id}
                        </div>
                        <div>
                          <span className="font-medium">Student:</span> {complaint.students?.users?.name}
                        </div>
                        <div>
                          <span className="font-medium">Course:</span> {complaint.course_code}
                        </div>
                        <div>
                          <span className="font-medium">Submitted:</span> {formatDate(new Date(complaint.submitted_at))}
                        </div>
                      </div>

                      <p className="text-gray-700 line-clamp-2">{complaint.description}</p>

                      {complaint.complaint_responses && complaint.complaint_responses.length > 0 && (
                        <div className="mt-3 flex items-center text-sm text-blue-600">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {complaint.complaint_responses.length} response(s)
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex flex-col space-y-2">
                      <Link href={`/department/complaints/${complaint.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-gray-600 hover:text-gray-800"
                        onClick={() => exportComplaintToPDF(complaint.id)}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
