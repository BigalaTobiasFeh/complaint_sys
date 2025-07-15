'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

// Department interface
interface Department {
  id: string
  name: string
  code: string
  description?: string
  is_active: boolean
  created_at: string
  head_of_department?: string
  contact_email?: string
  total_students: number
  total_officers: number
  total_complaints: number
  pending_complaints: number
  resolved_complaints: number
  resolution_rate: number
  officers: Array<{
    id: string
    name: string
    position: string
    email: string
    assigned_complaints: number
  }>
}

// Utility functions
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default function DepartmentManagement() {
  const { user } = useAuth()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  
  // Create/Edit department form
  const [showForm, setShowForm] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    head_of_department: '',
    contact_email: ''
  })

  useEffect(() => {
    loadDepartments()
  }, [])

  const loadDepartments = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get all departments
      const { data: departmentsData, error: deptError } = await supabase
        .from('departments')
        .select('*')
        .order('name')

      if (deptError) throw deptError

      const departmentsWithStats: Department[] = []

      for (const dept of departmentsData) {
        // Get student count
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('id')
          .eq('department_id', dept.id)

        // Get officer count and details
        const { data: officers, error: officersError } = await supabase
          .from('department_officers')
          .select(`
            id,
            position,
            users(name, email)
          `)
          .eq('department_id', dept.id)

        // Get complaint statistics
        const { data: complaints, error: complaintsError } = await supabase
          .from('complaints')
          .select('id, status')
          .eq('department_id', dept.id)

        // Get officer assignments
        const officerStats = []
        if (officers) {
          for (const officer of officers) {
            const { data: assignments, error: assignError } = await supabase
              .from('complaints')
              .select('id')
              .eq('assigned_officer_id', officer.id)

            officerStats.push({
              id: officer.id,
              name: officer.users?.name || 'Unknown',
              position: officer.position || 'Officer',
              email: officer.users?.email || '',
              assigned_complaints: assignments?.length || 0
            })
          }
        }

        const totalComplaints = complaints?.length || 0
        const pendingComplaints = complaints?.filter(c => c.status === 'pending').length || 0
        const resolvedComplaints = complaints?.filter(c => c.status === 'resolved').length || 0
        const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0

        departmentsWithStats.push({
          id: dept.id,
          name: dept.name,
          code: dept.code,
          description: dept.description,
          is_active: dept.is_active !== false, // Default to true if not specified
          created_at: dept.created_at,
          head_of_department: dept.head_of_department,
          contact_email: dept.contact_email,
          total_students: students?.length || 0,
          total_officers: officers?.length || 0,
          total_complaints: totalComplaints,
          pending_complaints: pendingComplaints,
          resolved_complaints: resolvedComplaints,
          resolution_rate: resolutionRate,
          officers: officerStats
        })
      }

      setDepartments(departmentsWithStats)
    } catch (error: any) {
      console.error('Error loading departments:', error)
      setError(error.message || 'Failed to load departments')
    } finally {
      setLoading(false)
    }
  }

  // Filter departments
  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = 
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && dept.is_active) ||
      (statusFilter === 'inactive' && !dept.is_active)

    return matchesSearch && matchesStatus
  })

  // Form handlers
  const handleCreateDepartment = async () => {
    try {
      if (!formData.name || !formData.code) {
        alert('Please fill in required fields (Name and Code)')
        return
      }

      const { error } = await supabase
        .from('departments')
        .insert({
          name: formData.name,
          code: formData.code.toUpperCase(),
          description: formData.description || null,
          head_of_department: formData.head_of_department || null,
          contact_email: formData.contact_email || null,
          is_active: true
        })

      if (error) throw error

      await loadDepartments()
      setShowForm(false)
      setFormData({ name: '', code: '', description: '', head_of_department: '', contact_email: '' })
      alert('Department created successfully')
    } catch (error: any) {
      console.error('Error creating department:', error)
      alert('Failed to create department: ' + error.message)
    }
  }

  const handleEditDepartment = async () => {
    try {
      if (!editingDepartment || !formData.name || !formData.code) {
        alert('Please fill in required fields')
        return
      }

      const { error } = await supabase
        .from('departments')
        .update({
          name: formData.name,
          code: formData.code.toUpperCase(),
          description: formData.description || null,
          head_of_department: formData.head_of_department || null,
          contact_email: formData.contact_email || null
        })
        .eq('id', editingDepartment)

      if (error) throw error

      await loadDepartments()
      setShowForm(false)
      setEditingDepartment(null)
      setFormData({ name: '', code: '', description: '', head_of_department: '', contact_email: '' })
      alert('Department updated successfully')
    } catch (error: any) {
      console.error('Error updating department:', error)
      alert('Failed to update department: ' + error.message)
    }
  }

  const handleDeleteDepartment = async (departmentId: string) => {
    if (!confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      return
    }

    try {
      // Check if department has students or officers
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .eq('department_id', departmentId)

      const { data: officers } = await supabase
        .from('department_officers')
        .select('id')
        .eq('department_id', departmentId)

      if ((students && students.length > 0) || (officers && officers.length > 0)) {
        alert('Cannot delete department with existing students or officers. Please reassign them first.')
        return
      }

      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', departmentId)

      if (error) throw error

      await loadDepartments()
      alert('Department deleted successfully')
    } catch (error: any) {
      console.error('Error deleting department:', error)
      alert('Failed to delete department: ' + error.message)
    }
  }

  const handleToggleStatus = async (departmentId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('departments')
        .update({ is_active: !currentStatus })
        .eq('id', departmentId)

      if (error) throw error

      await loadDepartments()
      alert(`Department ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
    } catch (error: any) {
      console.error('Error updating department status:', error)
      alert('Failed to update department status: ' + error.message)
    }
  }

  const startEdit = (department: Department) => {
    setEditingDepartment(department.id)
    setFormData({
      name: department.name,
      code: department.code,
      description: department.description || '',
      head_of_department: department.head_of_department || '',
      contact_email: department.contact_email || ''
    })
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingDepartment(null)
    setFormData({ name: '', code: '', description: '', head_of_department: '', contact_email: '' })
  }

  if (loading) {
    return (
      <DashboardLayout user={{ name: user?.name || '', role: 'admin', email: user?.email || '' }} notifications={0}>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading departments...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout user={{ name: user?.name || '', role: 'admin', email: user?.email || '' }} notifications={0}>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Departments</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadDepartments}>Try Again</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={{ name: user?.name || '', role: 'admin', email: user?.email || '' }} notifications={0}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
            <p className="text-gray-600">Manage departments, officers, and organizational structure</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={() => setShowForm(true)}>
              Create Department
            </Button>
            <Link href="/admin/users/officers">
              <Button variant="outline">Manage Officers</Button>
            </Link>
          </div>
        </div>

        {/* Create/Edit Department Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingDepartment ? 'Edit Department' : 'Create New Department'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Department Name *"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Department Code *"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                />
                <Input
                  placeholder="Head of Department"
                  value={formData.head_of_department}
                  onChange={(e) => setFormData(prev => ({ ...prev, head_of_department: e.target.value }))}
                />
                <Input
                  placeholder="Contact Email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                />
              </div>
              <div className="mt-4">
                <Input
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <Button onClick={editingDepartment ? handleEditDepartment : handleCreateDepartment}>
                  {editingDepartment ? 'Update Department' : 'Create Department'}
                </Button>
                <Button variant="outline" onClick={cancelForm}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{departments.length}</div>
              <div className="text-sm text-gray-600">Total Departments</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {departments.filter(d => d.is_active).length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {departments.reduce((sum, d) => sum + d.total_students, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Students</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {departments.reduce((sum, d) => sum + d.total_officers, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Officers</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Departments List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDepartments.map((department) => (
            <Card key={department.id} className="h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{department.name}</CardTitle>
                    <CardDescription>{department.code}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={department.is_active ? 'success' : 'error'} size="sm">
                      {department.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDepartment(
                        selectedDepartment === department.id ? null : department.id
                      )}
                    >
                      {selectedDepartment === department.id ? 'Hide Details' : 'View Details'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Department Info */}
                {department.description && (
                  <p className="text-sm text-gray-600 mb-4">{department.description}</p>
                )}
                
                {department.head_of_department && (
                  <div className="text-sm mb-2">
                    <span className="font-medium">Head:</span> {department.head_of_department}
                  </div>
                )}
                
                {department.contact_email && (
                  <div className="text-sm mb-4">
                    <span className="font-medium">Contact:</span> {department.contact_email}
                  </div>
                )}

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{department.total_students}</div>
                    <div className="text-xs text-blue-700">Students</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">{department.total_officers}</div>
                    <div className="text-xs text-purple-700">Officers</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-xl font-bold text-yellow-600">{department.total_complaints}</div>
                    <div className="text-xs text-yellow-700">Complaints</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{department.resolution_rate}%</div>
                    <div className="text-xs text-green-700">Resolution Rate</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-xl font-bold text-orange-600">{department.pending_complaints}</div>
                    <div className="text-xs text-orange-700">Pending</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-600">{formatDate(department.created_at)}</div>
                    <div className="text-xs text-gray-700">Created</div>
                  </div>
                </div>

                {/* Officers List */}
                {selectedDepartment === department.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Department Officers</h4>
                    {department.officers.length === 0 ? (
                      <p className="text-sm text-gray-500">No officers assigned</p>
                    ) : (
                      <div className="space-y-2">
                        {department.officers.map((officer) => (
                          <div key={officer.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {officer.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {officer.position} • {officer.email}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {officer.assigned_complaints} assignments
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 mt-4">
                  <Button size="sm" onClick={() => startEdit(department)}>
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleToggleStatus(department.id, department.is_active)}
                  >
                    {department.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDeleteDepartment(department.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDepartments.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No departments found matching your search criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
