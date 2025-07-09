'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export default function DepartmentSettings() {
  const { user, logout } = useAuth()
  const [departmentInfo, setDepartmentInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    department: ''
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newComplaintAlerts: true,
    dailySummary: false,
    overdueReminders: true,
    statusUpdates: true
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (user) {
      loadSettings()
    }
  }, [user])

  const loadSettings = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Get department officer info
      const { data: officerData, error: officerError } = await supabase
        .from('department_officers')
        .select(`
          *,
          departments(*),
          users(*)
        `)
        .eq('user_id', user.id)
        .single()

      if (officerError) {
        console.error('Error loading officer data:', officerError)
        return
      }

      setDepartmentInfo(officerData)
      setProfileData({
        name: officerData.users?.name || '',
        email: officerData.users?.email || '',
        phone: officerData.phone || '',
        bio: officerData.bio || '',
        department: officerData.departments?.name || ''
      })

    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!user || !departmentInfo) return

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

      // Update department officer profile
      const { error: officerError } = await supabase
        .from('department_officers')
        .update({
          phone: profileData.phone,
          bio: profileData.bio,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (officerError) throw officerError

      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Error saving profile:', error)
      setSaveStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const saveNotifications = async () => {
    // In a real implementation, you would save these to the database
    setSaveStatus('success')
    setTimeout(() => setSaveStatus('idle'), 3000)
  }

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      alert('Password updated successfully')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error updating password:', error)
      alert('Failed to update password')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (loading) {
    return (
      <DashboardLayout user={user} notifications={0}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading settings...</p>
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
            <p className="text-gray-600">Please log in to access settings.</p>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account and preferences</p>
          </div>
          <div className="flex items-center space-x-4">
            {saveStatus === 'success' && (
              <div className="flex items-center text-green-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">Settings saved successfully!</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center text-red-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-sm">Failed to save settings</span>
              </div>
            )}
            <Button variant="outline" onClick={handleLogout}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </Button>
          </div>
        </div>

        {/* Department Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Department Information</CardTitle>
            <CardDescription>Your department assignment and role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Department:</span>
                  <p className="text-blue-900">{departmentInfo?.departments?.name || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Department Code:</span>
                  <p className="text-blue-900">{departmentInfo?.departments?.code || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Role:</span>
                  <p className="text-blue-900">Department Officer</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input 
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input value={profileData.email} disabled />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input 
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <Input value={profileData.department} disabled />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={saveProfile} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Choose how you want to be notified</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
                <input 
                  type="checkbox" 
                  className="rounded" 
                  checked={notificationSettings.emailNotifications}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    emailNotifications: e.target.checked
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Complaint Alerts</p>
                  <p className="text-sm text-gray-600">Get notified when new complaints are assigned</p>
                </div>
                <input 
                  type="checkbox" 
                  className="rounded" 
                  checked={notificationSettings.newComplaintAlerts}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    newComplaintAlerts: e.target.checked
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Daily Summary</p>
                  <p className="text-sm text-gray-600">Receive daily summary of department activities</p>
                </div>
                <input 
                  type="checkbox" 
                  className="rounded" 
                  checked={notificationSettings.dailySummary}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    dailySummary: e.target.checked
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Overdue Reminders</p>
                  <p className="text-sm text-gray-600">Get reminded about overdue complaints</p>
                </div>
                <input 
                  type="checkbox" 
                  className="rounded" 
                  checked={notificationSettings.overdueReminders}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    overdueReminders: e.target.checked
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Status Updates</p>
                  <p className="text-sm text-gray-600">Get notified when complaint statuses change</p>
                </div>
                <input 
                  type="checkbox" 
                  className="rounded" 
                  checked={notificationSettings.statusUpdates}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    statusUpdates: e.target.checked
                  })}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={saveNotifications}>Save Preferences</Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <Input
                type="password"
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={changePassword}
                disabled={!passwordData.newPassword || !passwordData.confirmPassword}
              >
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
