'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const mockUser = {
  name: 'John Doe',
  role: 'student' as const,
  avatar: undefined
}

export default function NewComplaintPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    courseCode: '',
    courseTitle: '',
    courseLevel: '',
    semester: '',
    academicYear: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [attachments, setAttachments] = useState<File[]>([])

  const categories = [
    { value: 'ca_mark', label: 'CA Mark' },
    { value: 'exam_mark', label: 'Exam Mark' },
    { value: 'other', label: 'Other' }
  ]

  const semesters = ['First Semester', 'Second Semester', 'Summer']
  const currentYear = new Date().getFullYear()
  const academicYears = [
    `${currentYear-1}/${currentYear}`,
    `${currentYear}/${currentYear+1}`
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setAttachments(prev => [...prev, ...newFiles])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (!formData.courseCode.trim()) {
      newErrors.courseCode = 'Course code is required'
    }

    if (!formData.courseTitle.trim()) {
      newErrors.courseTitle = 'Course title is required'
    }

    if (!formData.courseLevel.trim()) {
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
    
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Complaint submission:', { ...formData, attachments })
      alert('Complaint submitted successfully! You will receive updates via email.')
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        courseCode: '',
        courseTitle: '',
        courseLevel: '',
        semester: '',
        academicYear: ''
      })
      setAttachments([])
    } catch (error) {
      console.error('Submission error:', error)
      setErrors({ general: 'Failed to submit complaint. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background-secondary">
      <Header user={mockUser} notifications={3} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
            <span>›</span>
            <span>New Complaint</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Submit New Complaint</h1>
          <p className="text-gray-600 mt-2">Fill out the form below to submit your complaint. All fields marked with * are required.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Complaint Details</CardTitle>
            <CardDescription>
              Please provide detailed information about your complaint to help us process it efficiently.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                
                <Input
                  label="Complaint Title *"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  error={errors.title}
                  placeholder="Brief summary of your complaint"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select complaint category</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-error">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Provide detailed information about your complaint..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-error">{errors.description}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    {formData.description.length}/500 characters (minimum 20 required)
                  </p>
                </div>
              </div>

              {/* Course Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Course Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Course Code *"
                    name="courseCode"
                    value={formData.courseCode}
                    onChange={handleInputChange}
                    error={errors.courseCode}
                    placeholder="e.g., MATH101"
                  />

                  <Input
                    label="Course Level *"
                    name="courseLevel"
                    value={formData.courseLevel}
                    onChange={handleInputChange}
                    error={errors.courseLevel}
                    placeholder="e.g., 100, 200, 300"
                  />
                </div>

                <Input
                  label="Course Title *"
                  name="courseTitle"
                  value={formData.courseTitle}
                  onChange={handleInputChange}
                  error={errors.courseTitle}
                  placeholder="Full course title"
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semester *
                    </label>
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Select semester</option>
                      {semesters.map(sem => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    </select>
                    {errors.semester && (
                      <p className="mt-1 text-sm text-error">{errors.semester}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Academic Year *
                    </label>
                    <select
                      name="academicYear"
                      value={formData.academicYear}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Select academic year</option>
                      {academicYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    {errors.academicYear && (
                      <p className="mt-1 text-sm text-error">{errors.academicYear}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Supporting Documents</h3>
                <p className="text-sm text-gray-600">
                  Upload any relevant documents to support your complaint (optional).
                </p>
                
                <div>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-dark"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Accepted formats: PDF, DOC, DOCX, JPG, PNG (max 5MB each)
                  </p>
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Attached Files:</h4>
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4 pt-6 border-t border-gray-200">
                <Link href="/dashboard">
                  <Button variant="outline" size="lg">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  size="lg"
                  isLoading={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Submitting...' : 'Submit Complaint'}
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
