'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

export default function ProfileSettings() {
  const { user, studentProfile, loading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    bio: ''
  })

  useEffect(() => {
    if (user && studentProfile) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: studentProfile.phone || '',
        address: studentProfile.address || '',
        emergency_contact_name: studentProfile.emergency_contact_name || '',
        emergency_contact_phone: studentProfile.emergency_contact_phone || '',
        bio: studentProfile.bio || ''
      })
    }
  }, [user, studentProfile])

  const handleSave = async () => {
    if (!user || !studentProfile) return

    setSaving(true)
    setSaveStatus('idle')

    try {
      // Update user table
      const { error: userError } = await supabase
        .from('users')
        .update({
          name: profileData.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (userError) throw userError

      // Update student profile
      const { error: studentError } = await supabase
        .from('students')
        .update({
          phone: profileData.phone,
          address: profileData.address,
          emergency_contact_name: profileData.emergency_contact_name,
          emergency_contact_phone: profileData.emergency_contact_phone,
          bio: profileData.bio,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (studentError) throw studentError

      setSaveStatus('success')
      setIsEditing(false)
      
      // Reset success message after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form data
    if (user && studentProfile) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: studentProfile.phone || '',
        address: studentProfile.address || '',
        emergency_contact_name: studentProfile.emergency_contact_name || '',
        emergency_contact_phone: studentProfile.emergency_contact_phone || '',
        bio: studentProfile.bio || ''
      })
    }
    setIsEditing(false)
    setSaveStatus('idle')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user || !studentProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Unable to load profile. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
              </div>
              <div className="flex items-center space-x-3">
                {saveStatus === 'success' && (
                  <div className="flex items-center text-green-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">Profile updated successfully!</span>
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="flex items-center text-red-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-sm">Failed to update profile</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            {/* Student Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Matricule:</span>
                  <p className="text-blue-900">{studentProfile.matricule}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Year of Study:</span>
                  <p className="text-blue-900">Year {studentProfile.year_of_study}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Department:</span>
                  <p className="text-blue-900">{studentProfile.department || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Editable Profile Form */}
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled={true}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Enter your address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={profileData.emergency_contact_name}
                      onChange={(e) => setProfileData({ ...profileData, emergency_contact_name: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Emergency contact name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={profileData.emergency_contact_phone}
                      onChange={(e) => setProfileData({ ...profileData, emergency_contact_phone: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Emergency contact phone"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">About Me</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="primary"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleCancel}
                      variant="ghost"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      variant="primary"
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
