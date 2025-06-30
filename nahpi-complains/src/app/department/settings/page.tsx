'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const mockUser = {
  name: 'Dr. Michael Chen',
  role: 'department_officer' as const,
  email: 'michael.chen@nahpi.edu',
  department: 'Computer Science Department',
  avatar: undefined
}

export default function DepartmentSettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    dailySummaryEnabled: true,
    dailySummaryTime: '17:00',
    instantNotifications: true,
    weeklyReports: true,
    weeklyReportDay: 'friday',
    notificationEmail: mockUser.email,
    includeResolved: false,
    includeRejected: false,
    minimumPriority: 'all'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
    setIsSaved(false)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Settings saved:', settings)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestEmail = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Test email sent successfully!')
    } catch (error) {
      console.error('Error sending test email:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout user={mockUser} notifications={8}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
          <p className="text-gray-600 mt-2">Configure your email notifications and daily summaries</p>
        </div>

        {/* Success Message */}
        {isSaved && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800 font-medium">Settings saved successfully!</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure when and how you receive email notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Master Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Enable Email Notifications</h3>
                  <p className="text-sm text-gray-600">Receive email notifications for complaint updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {settings.emailNotifications && (
                <>
                  {/* Notification Email */}
                  <Input
                    label="Notification Email Address"
                    name="notificationEmail"
                    type="email"
                    value={settings.notificationEmail}
                    onChange={handleInputChange}
                    helperText="Email address where notifications will be sent"
                  />

                  {/* Instant Notifications */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Instant Notifications</h3>
                      <p className="text-sm text-gray-600">Get notified immediately when complaints are assigned to you</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="instantNotifications"
                        checked={settings.instantNotifications}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {/* Minimum Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Priority for Instant Notifications
                    </label>
                    <select
                      name="minimumPriority"
                      value={settings.minimumPriority}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="all">All Priorities</option>
                      <option value="medium">Medium and High</option>
                      <option value="high">High Priority Only</option>
                    </select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Daily Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Summary</CardTitle>
              <CardDescription>Configure your daily complaint summary email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Daily Summary Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Enable Daily Summary</h3>
                  <p className="text-sm text-gray-600">Receive a daily summary of complaints and activities</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="dailySummaryEnabled"
                    checked={settings.dailySummaryEnabled}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {settings.dailySummaryEnabled && (
                <>
                  {/* Summary Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Daily Summary Time
                    </label>
                    <input
                      type="time"
                      name="dailySummaryTime"
                      value={settings.dailySummaryTime}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <p className="text-sm text-gray-500 mt-1">Time when daily summary will be sent</p>
                  </div>

                  {/* Include Options */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Include in Summary</h3>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="includeResolved"
                        checked={settings.includeResolved}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label className="text-sm text-gray-700">Include resolved complaints</label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="includeRejected"
                        checked={settings.includeRejected}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label className="text-sm text-gray-700">Include rejected complaints</label>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Weekly Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Reports</CardTitle>
              <CardDescription>Configure weekly performance reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Weekly Reports Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Enable Weekly Reports</h3>
                  <p className="text-sm text-gray-600">Receive weekly performance and activity reports</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="weeklyReports"
                    checked={settings.weeklyReports}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {settings.weeklyReports && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weekly Report Day
                  </label>
                  <select
                    name="weeklyReportDay"
                    value={settings.weeklyReportDay}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                    <option value="sunday">Sunday</option>
                  </select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test & Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Test & Actions</CardTitle>
              <CardDescription>Test your notification settings and manage preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                onClick={handleTestEmail}
                disabled={!settings.emailNotifications || isLoading}
                className="w-full"
              >
                {isLoading ? 'Sending...' : 'Send Test Email'}
              </Button>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Current Settings Summary</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Email notifications: {settings.emailNotifications ? 'Enabled' : 'Disabled'}</li>
                  {settings.emailNotifications && (
                    <>
                      <li>• Daily summary: {settings.dailySummaryEnabled ? `Enabled (${settings.dailySummaryTime})` : 'Disabled'}</li>
                      <li>• Instant notifications: {settings.instantNotifications ? 'Enabled' : 'Disabled'}</li>
                      <li>• Weekly reports: {settings.weeklyReports ? `Enabled (${settings.weeklyReportDay})` : 'Disabled'}</li>
                    </>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          <Button variant="outline">Reset to Defaults</Button>
          <Button 
            onClick={handleSave}
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
