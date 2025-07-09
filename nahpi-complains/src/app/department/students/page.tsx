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
import { supabase } from '@/lib/supabase'

const yearOptions = [
  { value: '', label: 'All Years' },
  { value: '1', label: 'Year 1' },
  { value: '2', label: 'Year 2' },
  { value: '3', label: 'Year 3' },
  { value: '4', label: 'Year 4' },
  { value: '5', label: 'Year 5' }
]

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'graduated', label: 'Graduated' }
]

export default function DepartmentStudentsPage() {
  const { user } = useAuth()
  const [students, setStudents] = useState<any[]>([])
  const [filteredStudents, setFilteredStudents] = useState<any[]>([])
  const [departmentInfo, setDepartmentInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [showStudentModal, setShowStudentModal] = useState(false)

  useEffect(() => {
    if (user) {
      loadStudents()
    }
  }, [user])

  useEffect(() => {
    filterStudents()
  }, [students, searchTerm, yearFilter, statusFilter])

  const loadStudents = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Get department officer info
      const { data: officerData, error: officerError } = await supabase
        .from('department_officers')
        .select(`
          *,
          departments(*)
        `)
        .eq('user_id', user.id)
        .single()

      if (officerError) {
        console.error('Error loading officer data:', officerError)
        return
      }

      setDepartmentInfo(officerData)

      // Load students in the department
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          *,
          users(
            id,
            name,
            email,
            is_active,
            created_at
          )
        `)
        .eq('department_id', officerData.department_id)
        .order('created_at', { ascending: false })

      if (studentsError) {
        console.error('Error loading students:', studentsError)
        return
      }

      // Get complaint counts for each student
      const studentsWithComplaints = await Promise.all(
        studentsData.map(async (student) => {
          const { data: complaints, error: complaintsError } = await supabase
            .from('complaints')
            .select('id, status')
            .eq('student_id', student.users.id)

          const complaintStats = {
            total: complaints?.length || 0,
            pending: complaints?.filter(c => c.status === 'pending').length || 0,
            resolved: complaints?.filter(c => c.status === 'resolved').length || 0
          }

          return {
            ...student,
            complaintStats
          }
        })
      )

      setStudents(studentsWithComplaints)
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterStudents = () => {
    let filtered = students

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.users?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Year filter
    if (yearFilter) {
      filtered = filtered.filter(student => student.year_of_study?.toString() === yearFilter)
    }

    // Status filter
    if (statusFilter) {
      if (statusFilter === 'active') {
        filtered = filtered.filter(student => student.users?.is_active === true)
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(student => student.users?.is_active === false)
      }
    }

    setFilteredStudents(filtered)
  }

  const viewStudentDetails = async (student: any) => {
    try {
      // Get detailed student information including complaints
      const { data: detailedStudent, error } = await supabase
        .from('students')
        .select(`
          *,
          users(*),
          complaints(
            id,
            complaint_id,
            title,
            status,
            category,
            submitted_at
          )
        `)
        .eq('id', student.id)
        .single()

      if (error) {
        console.error('Error loading student details:', error)
        return
      }

      setSelectedStudent(detailedStudent)
      setShowStudentModal(true)
    } catch (error) {
      console.error('Error viewing student details:', error)
    }
  }

  if (loading) {
    return (
      <DashboardLayout user={user} notifications={0}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading students...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout user={user} notifications={0}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Please log in to view students.</p>
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
    <DashboardLayout user={userInfo} notifications={0}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Department Students</h1>
            <p className="text-gray-600 mt-1">
              Manage students in {departmentInfo?.departments?.name || 'your department'}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Students
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Students</p>
                  <p className="text-2xl font-bold text-green-600">
                    {students.filter(s => s.users?.is_active).length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">With Complaints</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {students.filter(s => s.complaintStats?.total > 0).length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New This Month</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {students.filter(s => {
                      const created = new Date(s.users?.created_at)
                      const now = new Date()
                      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                    }).length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter Students</CardTitle>
            <CardDescription>Find students by name, matricule, or email</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year of Study</label>
                <Select
                  value={yearFilter}
                  onValueChange={setYearFilter}
                  options={yearOptions}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  options={statusOptions}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setYearFilter('')
                    setStatusFilter('')
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <Card>
          <CardHeader>
            <CardTitle>Students ({filteredStudents.length})</CardTitle>
            <CardDescription>
              {filteredStudents.length === students.length 
                ? 'All students in your department'
                : `Filtered results (${filteredStudents.length} of ${students.length})`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <p className="text-gray-500">No students found matching your criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-medium">
                              {student.users?.name?.charAt(0)?.toUpperCase() || 'S'}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{student.users?.name || 'Unknown Name'}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{student.matricule}</span>
                              <span>Year {student.year_of_study}</span>
                              <span>{student.users?.email}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center space-x-4">
                          <Badge variant={student.users?.is_active ? 'success' : 'error'}>
                            {student.users?.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          
                          {student.complaintStats?.total > 0 && (
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="text-gray-600">Complaints:</span>
                              <Badge variant="outline">{student.complaintStats.total} total</Badge>
                              {student.complaintStats.pending > 0 && (
                                <Badge variant="warning">{student.complaintStats.pending} pending</Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewStudentDetails(student)}
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Details Modal */}
        {showStudentModal && selectedStudent && (
          <StudentDetailsModal
            student={selectedStudent}
            onClose={() => {
              setShowStudentModal(false)
              setSelectedStudent(null)
            }}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

// Student Details Modal Component
interface StudentDetailsModalProps {
  student: any
  onClose: () => void
}

function StudentDetailsModal({ student, onClose }: StudentDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Student Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Student Information */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-medium">{student.users?.name || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">{student.users?.email || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Matricule:</span>
                  <p className="font-medium">{student.matricule}</p>
                </div>
                <div>
                  <span className="text-gray-600">Year of Study:</span>
                  <p className="font-medium">Year {student.year_of_study}</p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={student.users?.is_active ? 'success' : 'error'}>
                    {student.users?.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">Joined:</span>
                  <p className="font-medium">
                    {new Date(student.users?.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Complaint History */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Complaint History</h3>
              {student.complaints && student.complaints.length > 0 ? (
                <div className="space-y-3">
                  {student.complaints.map((complaint: any) => (
                    <div key={complaint.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{complaint.title}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{complaint.complaint_id}</Badge>
                            <Badge variant={
                              complaint.status === 'resolved' ? 'success' :
                              complaint.status === 'in_progress' ? 'info' :
                              complaint.status === 'rejected' ? 'error' : 'warning'
                            }>
                              {complaint.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(complaint.submitted_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Link href={`/department/complaints/${complaint.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No complaints submitted</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
