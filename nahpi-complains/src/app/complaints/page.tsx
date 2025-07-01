'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

const mockUser = {
  name: 'John Doe',
  role: 'student' as const,
  avatar: undefined
}

const mockComplaints = [
  {
    id: '1',
    complaintId: 'CMP-2024-001',
    title: 'CA Mark Discrepancy in Mathematics',
    status: 'pending' as const,
    submittedAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    courseCode: 'MATH101',
    courseTitle: 'Calculus I',
    category: 'ca_mark' as const,
    priority: 'medium' as const,
    description: 'There seems to be an error in my CA mark calculation for the midterm exam.'
  },
  {
    id: '2',
    complaintId: 'CMP-2024-002',
    title: 'Exam Mark Query for Physics',
    status: 'in_progress' as const,
    submittedAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
    courseCode: 'PHYS201',
    courseTitle: 'Physics II',
    category: 'exam_mark' as const,
    priority: 'high' as const,
    description: 'I believe there was an error in grading my final exam paper.'
  },
  {
    id: '3',
    complaintId: 'CMP-2024-003',
    title: 'Course Registration Issue',
    status: 'resolved' as const,
    submittedAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-08'),
    courseCode: 'CS301',
    courseTitle: 'Data Structures',
    category: 'other' as const,
    priority: 'low' as const,
    description: 'Unable to register for the course due to system error.'
  },
  {
    id: '4',
    complaintId: 'CMP-2024-004',
    title: 'Missing CA Mark Entry',
    status: 'rejected' as const,
    submittedAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-03'),
    courseCode: 'ENG102',
    courseTitle: 'English Composition',
    category: 'ca_mark' as const,
    priority: 'medium' as const,
    description: 'My CA mark for assignment 2 is not showing in the system.'
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

export default function ComplaintsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const filteredComplaints = mockComplaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || complaint.status === statusFilter
    const matchesCategory = !categoryFilter || complaint.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  return (
    <div className="min-h-screen bg-background-secondary">
      <Header user={mockUser} notifications={3} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
            <span>›</span>
            <span>My Complaints</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Complaints</h1>
              <p className="text-gray-600 mt-2">Track and manage all your submitted complaints</p>
            </div>
            <Link href="/complaints/new">
              <Button className="mt-4 sm:mt-0">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Complaint
              </Button>
            </Link>
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
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Categories</option>
                <option value="ca_mark">CA Mark</option>
                <option value="exam_mark">Exam Mark</option>
                <option value="other">Other</option>
              </select>

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
        <div className="space-y-4">
          {filteredComplaints.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter || categoryFilter 
                    ? "No complaints match your current filters."
                    : "You haven't submitted any complaints yet."
                  }
                </p>
                {!searchTerm && !statusFilter && !categoryFilter && (
                  <Link href="/complaints/new">
                    <Button>Submit Your First Complaint</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredComplaints.map((complaint) => (
              <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
                        <Badge variant={getStatusColor(complaint.status)} size="sm">
                          {complaint.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant={getPriorityColor(complaint.priority)} size="sm">
                          {complaint.priority} priority
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">ID:</span> {complaint.complaintId}
                        </div>
                        <div>
                          <span className="font-medium">Course:</span> {complaint.courseCode}
                        </div>
                        <div>
                          <span className="font-medium">Submitted:</span> {formatDate(complaint.submittedAt)}
                        </div>
                        <div>
                          <span className="font-medium">Updated:</span> {formatDate(complaint.updatedAt)}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4 line-clamp-2">{complaint.description}</p>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
                          {complaint.category.replace('_', ' ')}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600">{complaint.courseTitle}</span>
                      </div>
                    </div>
                    
                    <div className="ml-6 flex flex-col space-y-2">
                      <Link href={`/complaints/${complaint.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      {complaint.status === 'resolved' && (
                        <Button variant="ghost" size="sm">
                          Give Feedback
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination would go here in a real application */}
        {filteredComplaints.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <span className="px-3 py-2 text-sm text-gray-600">
                Page 1 of 1
              </span>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
