'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { FileUpload } from '@/components/ui/FileUpload'
import { useAuth } from '@/contexts/AuthContext'
import { ComplaintService } from '@/lib/complaints'
import { ComplaintFormData, ComplaintCategory } from '@/types'
import { supabase } from '@/lib/supabase'

const complaintCategories = [
  { value: 'ca_mark', label: 'CA Mark Discrepancy' },
  { value: 'exam_mark', label: 'Exam Mark Query' },
  { value: 'other', label: 'Other Academic Issue' }
]

const courseLevels = [
  { value: '100', label: '100 Level' },
  { value: '200', label: '200 Level' },
  { value: '300', label: '300 Level' },
  { value: '400', label: '400 Level' },
  { value: '500', label: '500 Level' }
]

const semesters = [
  { value: 'First Semester', label: 'First Semester' },
  { value: 'Second Semester', label: 'Second Semester' }
]

const academicYears = [
  { value: '2023/2024', label: '2023/2024' },
  { value: '2024/2025', label: '2024/2025' },
  { value: '2025/2026', label: '2025/2026' }
]

export default function SubmitComplaintPage() {
  const router = useRouter()
  const { user, studentProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<ComplaintFormData>({
    title: '',
    description: '',
    category: 'ca_mark',
    courseCode: '',
    courseTitle: '',
    courseLevel: '',
    semester: '',
    academicYear: '',
    attachments: []
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFilesChange = (files: File[]) => {
    setFormData(prev => ({ ...prev, attachments: files }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Complaint title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Complaint description is required'
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters'
    }

    if (!formData.courseCode.trim()) {
      newErrors.courseCode = 'Course code is required'
    }

    if (!formData.courseTitle.trim()) {
      newErrors.courseTitle = 'Course title is required'
    }

    if (!formData.courseLevel) {
      newErrors.courseLevel = 'Course level is required'
    }

    if (!formData.semester) {
      newErrors.semester = 'Semester is required'
    }

    if (!formData.academicYear) {
      newErrors.academicYear = 'Academic year is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !user || !studentProfile) return

    setIsLoading(true)

    try {
      // Get student's department ID
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('department_id')
        .eq('id', user.id)
        .single()

      if (studentError || !student) {
        throw new Error('Unable to determine student department')
      }

      const result = await ComplaintService.submitComplaint(
        formData,
        user.id,
        student.department_id
      )

      if (result.success) {
        alert('Complaint submitted successfully!')
        router.push('/dashboard')
      } else {
        const errorMessage = typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to submit complaint'
        setErrors({ general: errorMessage })
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || !studentProfile) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to submit a complaint.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-secondary">
      <Header user={{ name: studentProfile.name, role: 'student', avatar: undefined }} notifications={0} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Submit New Complaint</h1>
          <p className="text-gray-600 mt-2">
            Fill out the form below to submit your academic complaint. All fields marked with * are required.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Complaint Details</CardTitle>
            <CardDescription>
              Provide detailed information about your academic concern. This will help us route your complaint to the appropriate department.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{errors.general}</p>
                </div>
              )}

              {/* Student Info Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Name:</span>
                    <p className="text-blue-900">{studentProfile.name}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Matricule:</span>
                    <p className="text-blue-900">{studentProfile.matricule}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Department:</span>
                    <p className="text-blue-900">{studentProfile.department}</p>
                  </div>
                </div>
              </div>

              {/* Complaint Category */}
              <Select
                label="Complaint Category *"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                options={complaintCategories}
                error={errors.category}
                helperText="Select the type of academic issue you're experiencing"
              />

              {/* Complaint Title */}
              <Input
                label="Complaint Title *"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                error={errors.title}
                placeholder="Brief summary of your complaint"
                helperText="Provide a clear, concise title for your complaint"
              />

              {/* Course Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Course Code *"
                  name="courseCode"
                  value={formData.courseCode}
                  onChange={handleInputChange}
                  error={errors.courseCode}
                  placeholder="e.g., MATH101, CS201"
                />

                <Input
                  label="Course Title *"
                  name="courseTitle"
                  value={formData.courseTitle}
                  onChange={handleInputChange}
                  error={errors.courseTitle}
                  placeholder="e.g., Calculus I, Data Structures"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Select
                  label="Course Level *"
                  name="courseLevel"
                  value={formData.courseLevel}
                  onChange={handleInputChange}
                  options={courseLevels}
                  error={errors.courseLevel}
                  placeholder="Select level"
                />

                <Select
                  label="Semester *"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  options={semesters}
                  error={errors.semester}
                  placeholder="Select semester"
                />

                <Select
                  label="Academic Year *"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleInputChange}
                  options={academicYears}
                  error={errors.academicYear}
                  placeholder="Select year"
                />
              </div>

              {/* Complaint Description */}
              <Textarea
                label="Detailed Description *"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                error={errors.description}
                placeholder="Provide a detailed explanation of your complaint, including specific dates, circumstances, and any relevant information..."
                rows={6}
                helperText={`${formData.description.length}/50 characters minimum`}
              />

              {/* File Attachments */}
              <FileUpload
                label="Supporting Documents"
                helperText="Upload any supporting documents (transcripts, screenshots, emails, etc.)"
                onFilesChange={handleFilesChange}
                maxFiles={5}
                maxSize={10}
              />

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push('/dashboard')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  Submit Complaint
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
