'use client'

import React from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

// Mock data for demonstration
const mockUser = {
  name: 'John Doe',
  role: 'student' as const,
  avatar: undefined
}

const mockStats = {
  totalComplaints: 5,
  pendingComplaints: 2,
  resolvedComplaints: 2,
  rejectedComplaints: 1
}

const mockRecentComplaints = [
  {
    id: '1',
    complaintId: 'CMP-2024-001',
    title: 'CA Mark Discrepancy in Mathematics',
    status: 'pending' as const,
    submittedAt: new Date('2024-01-15'),
    courseCode: 'MATH101',
    category: 'ca_mark' as const
  },
  {
    id: '2',
    complaintId: 'CMP-2024-002',
    title: 'Exam Mark Query for Physics',
    status: 'in_progress' as const,
    submittedAt: new Date('2024-01-10'),
    courseCode: 'PHYS201',
    category: 'exam_mark' as const
  },
  {
    id: '3',
    complaintId: 'CMP-2024-003',
    title: 'Course Registration Issue',
    status: 'resolved' as const,
    submittedAt: new Date('2024-01-05'),
    courseCode: 'CS301',
    category: 'other' as const
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

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-background-secondary">
      <Header user={mockUser} notifications={3} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {mockUser.name}!</h1>
          <p className="text-gray-600 mt-2">Here's an overview of your complaints and recent activity.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{mockStats.totalComplaints}</div>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{mockStats.pendingComplaints}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{mockStats.resolvedComplaints}</div>
              <p className="text-xs text-gray-500 mt-1">Successfully resolved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-error">{mockStats.rejectedComplaints}</div>
              <p className="text-xs text-gray-500 mt-1">Not approved</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Complaints */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Complaints</CardTitle>
                    <CardDescription>Your latest complaint submissions</CardDescription>
                  </div>
                  <Link href="/complaints">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentComplaints.map((complaint) => (
                    <div key={complaint.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{complaint.title}</h3>
                          <Badge variant={getStatusColor(complaint.status)} size="sm">
                            {complaint.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>ID: {complaint.complaintId}</span>
                          <span>Course: {complaint.courseCode}</span>
                          <span>Submitted: {formatDate(complaint.submittedAt)}</span>
                        </div>
                      </div>
                      <Link href={`/complaints/${complaint.id}`}>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/complaints/new" className="block">
                  <Button className="w-full justify-start" variant="primary">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Submit New Complaint
                  </Button>
                </Link>
                
                <Link href="/complaints" className="block">
                  <Button className="w-full justify-start" variant="outline">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View All Complaints
                  </Button>
                </Link>

                <Link href="/profile" className="block">
                  <Button className="w-full justify-start" variant="ghost">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Update Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>Get assistance with the complaint process</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Having trouble with your complaint?</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Check our FAQ section</li>
                    <li>• Contact your department officer</li>
                    <li>• Reach out to admin support</li>
                  </ul>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
