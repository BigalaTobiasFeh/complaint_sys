'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/contexts/AuthContext'
import { ComplaintService } from '@/lib/complaints'
import { Complaint, ComplaintStatus, ComplaintCategory } from '@/types'

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

export default function StudentComplaintsPage() {
  const { user, studentProfile } = useAuth()
  const [complaints, setComplaints] = useState<any[]>([])
  const [filteredComplaints, setFilteredComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    if (user) {
      loadComplaints()
    }
  }, [user])

  useEffect(() => {
    filterComplaints()
  }, [complaints, searchTerm, statusFilter, categoryFilter])

  const loadComplaints = async () => {
    if (!user) return

    try {
      const result = await ComplaintService.getStudentComplaints(user.id)
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
        complaint.course_code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter) {
      filtered = filtered.filter(complaint => complaint.status === statusFilter)
    }

    if (categoryFilter) {
      filtered = filtered.filter(complaint => complaint.category === categoryFilter)
    }

    setFilteredComplaints(filtered)
  }

  if (!user || !studentProfile) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your complaints.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-secondary">
      <Header user={{ name: studentProfile.name, role: 'student', avatar: undefined }} notifications={0} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Complaints</h1>
              <p className="text-gray-600 mt-2">Track and manage your submitted complaints</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link href="/dashboard/submit-complaint">
                <Button>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Submit New Complaint
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('')
                  setCategoryFilter('')
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Complaints List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading complaints...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No complaints found</h3>
              <p className="mt-2 text-gray-600">
                {complaints.length === 0 
                  ? "You haven't submitted any complaints yet."
                  : "No complaints match your current filters."
                }
              </p>
              {complaints.length === 0 && (
                <div className="mt-6">
                  <Link href="/dashboard/submit-complaint">
                    <Button>Submit Your First Complaint</Button>
                  </Link>
                </div>
              )}
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
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Complaint ID:</span> {complaint.complaint_id}
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
                    
                    <div className="ml-4">
                      <Link href={`/dashboard/complaints/${complaint.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
