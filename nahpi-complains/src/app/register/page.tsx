'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { AuthService } from '@/lib/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    matricule: '',
    department: '',
    yearOfStudy: '',
    phoneNumber: '',
    academicYear: '',
    password: '',
    confirmPassword: '',
    verificationMethod: 'email' as 'email' | 'phone'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState(1)

  const departments = [
    'Centre for Cybersecurity and Mathematical Cryptology',
    'Chemical and Biological Engineering',
    'Civil Engineering and Architecture',
    'Computer Engineering',
    'Electrical and Electronics Engineering',
    'Mechanical and Industrial Engineering',
    'Mining and Mineral Engineering',
    'Petroleum Engineering'
  ]

  const currentYear = new Date().getFullYear()
  const academicYears = [
    `${currentYear-1}/${currentYear}`,
    `${currentYear}/${currentYear+1}`,
    `${currentYear+1}/${currentYear+2}`
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.matricule.trim()) {
      newErrors.matricule = 'Matricule number is required'
    } else if (!/^UBa\d{2}[A-Z]\d{4}$/.test(formData.matricule)) {
      newErrors.matricule = 'Matricule must follow format: UBa25T1000 (UBa + year + letter + 4 digits)'
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.department) {
      newErrors.department = 'Department is required'
    }

    if (!formData.yearOfStudy) {
      newErrors.yearOfStudy = 'Year of study is required'
    }

    if (!formData.academicYear) {
      newErrors.academicYear = 'Academic year is required'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep2()) return

    setIsLoading(true)

    try {
      const result = await AuthService.registerStudent({
        name: formData.name,
        email: formData.email,
        matricule: formData.matricule,
        department: formData.department,
        yearOfStudy: parseInt(formData.yearOfStudy),
        phoneNumber: formData.phoneNumber,
        academicYear: formData.academicYear,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        verificationMethod: formData.verificationMethod
      })

      if (result.success) {
        alert('Registration successful! Please check your email for verification, then you can login.')
        router.push('/login')
      } else {
        setErrors({ general: result.error || 'Registration failed. Please try again.' })
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ general: 'Registration failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-accent-blue py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[32rem] mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">NC</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">NAHPI Complaints</h1>
              <p className="text-sm text-gray-600">Student Registration</p>
            </div>
          </Link>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
            <CardDescription className="text-base mt-2">
              Register as a student to submit and track complaints
            </CardDescription>
            <div className="flex justify-center mt-4">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <div className={`w-8 h-1 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {step === 1 ? (
              <div className="space-y-[1.5rem]">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={errors.name}
                  placeholder="Enter your full name"
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  placeholder="Enter your email address"
                />

                <Input
                  label="Matricule Number"
                  name="matricule"
                  value={formData.matricule}
                  onChange={handleInputChange}
                  error={errors.matricule}
                  placeholder="e.g., UBa25T1000"
                  helperText="Format: UBa + year + letter + 4 digits"
                />

                <Input
                  label="Phone Number"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  error={errors.phoneNumber}
                  placeholder="Enter your phone number"
                />

                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-full h-[3rem] text-base font-semibold"
                  size="lg"
                >
                  Next Step
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-[1.5rem]">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-[0.5rem]">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 px-[1rem] py-[0.75rem] text-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select your department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="mt-1 text-sm text-error">{errors.department}</p>
                  )}
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-[0.5rem]">
                    Year of Study
                  </label>
                  <select
                    name="yearOfStudy"
                    value={formData.yearOfStudy}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 px-[1rem] py-[0.75rem] text-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select year of study</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                    <option value="5">Year 5</option>
                  </select>
                  {errors.yearOfStudy && (
                    <p className="mt-1 text-sm text-error">{errors.yearOfStudy}</p>
                  )}
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-[0.5rem]">
                    Academic Year
                  </label>
                  <select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 px-[1rem] py-[0.75rem] text-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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

                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password}
                  placeholder="Create a password"
                  helperText="Must be at least 8 characters"
                />

                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={errors.confirmPassword}
                  placeholder="Confirm your password"
                />

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 h-[3rem] text-base font-semibold"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-[3rem] text-base font-semibold"
                    isLoading={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </div>
              </form>
            )}

            <div className="mt-[2rem] text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-primary hover:text-primary-dark font-medium transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="text-sm text-gray-600 hover:text-primary transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
