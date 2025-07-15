'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/contexts/AuthContext'

// Deadline configuration interface
interface DeadlineConfig {
  id: string
  category: string
  description: string
  days_to_resolve: number
  escalation_days: number
  is_active: boolean
  created_at: string
}

export default function DeadlineManagement() {
  const { user } = useAuth()
  const [deadlineConfigs] = useState<DeadlineConfig[]>([
    {
      id: '1',
      category: 'ca_mark',
      description: 'CA Mark Complaints',
      days_to_resolve: 7,
      escalation_days: 3,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      category: 'exam_mark',
      description: 'Exam Mark Complaints',
      days_to_resolve: 14,
      escalation_days: 7,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      category: 'final_grade',
      description: 'Final Grade Complaints',
      days_to_resolve: 21,
      escalation_days: 10,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '4',
      category: 'other',
      description: 'Other Complaints',
      days_to_resolve: 10,
      escalation_days: 5,
      is_active: true,
      created_at: new Date().toISOString()
    }
  ])

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newDeadline, setNewDeadline] = useState({
    category: '',
    description: '',
    days_to_resolve: 7,
    escalation_days: 3
  })

  const handleCreateDeadline = () => {
    // TODO: Implement deadline creation
    alert('Deadline configuration feature will be implemented in the next phase')
    setShowCreateForm(false)
  }

  const handleUpdateDeadline = (id: string) => {
    // TODO: Implement deadline update
    alert('Deadline update feature will be implemented in the next phase')
  }

  const handleToggleStatus = (id: string) => {
    // TODO: Implement status toggle
    alert('Deadline status toggle feature will be implemented in the next phase')
  }

  return (
    <DashboardLayout user={{ name: user?.name || '', role: 'admin', email: user?.email || '' }} notifications={0}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deadline Management</h1>
            <p className="text-gray-600">Configure complaint resolution deadlines and escalation rules</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={() => setShowCreateForm(true)}>
              Add Deadline Rule
            </Button>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Deadline Rule</CardTitle>
              <CardDescription>Set resolution timeframes for different complaint categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  value={newDeadline.category}
                  onChange={(e) => setNewDeadline(prev => ({ ...prev, category: e.target.value }))}
                  options={[
                    { value: '', label: 'Select Category' },
                    { value: 'ca_mark', label: 'CA Mark' },
                    { value: 'exam_mark', label: 'Exam Mark' },
                    { value: 'final_grade', label: 'Final Grade' },
                    { value: 'other', label: 'Other' }
                  ]}
                />
                <Input
                  placeholder="Description"
                  value={newDeadline.description}
                  onChange={(e) => setNewDeadline(prev => ({ ...prev, description: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Days to Resolve"
                  value={newDeadline.days_to_resolve}
                  onChange={(e) => setNewDeadline(prev => ({ ...prev, days_to_resolve: parseInt(e.target.value) || 7 }))}
                />
                <Input
                  type="number"
                  placeholder="Escalation Days"
                  value={newDeadline.escalation_days}
                  onChange={(e) => setNewDeadline(prev => ({ ...prev, escalation_days: parseInt(e.target.value) || 3 }))}
                />
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <Button onClick={handleCreateDeadline}>Create Rule</Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{deadlineConfigs.length}</div>
              <div className="text-sm text-gray-600">Total Rules</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {deadlineConfigs.filter(d => d.is_active).length}
              </div>
              <div className="text-sm text-gray-600">Active Rules</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {Math.round(deadlineConfigs.reduce((sum, d) => sum + d.days_to_resolve, 0) / deadlineConfigs.length)}
              </div>
              <div className="text-sm text-gray-600">Avg Resolution Days</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(deadlineConfigs.reduce((sum, d) => sum + d.escalation_days, 0) / deadlineConfigs.length)}
              </div>
              <div className="text-sm text-gray-600">Avg Escalation Days</div>
            </CardContent>
          </Card>
        </div>

        {/* Deadline Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Deadline Configuration Rules</CardTitle>
            <CardDescription>Manage resolution timeframes for different complaint categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deadlineConfigs.map((config) => (
                <div key={config.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">{config.description}</h3>
                        <Badge variant={config.is_active ? 'success' : 'error'} size="sm">
                          {config.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="info" size="sm">
                          {config.category.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Resolution Time:</span> {config.days_to_resolve} days
                        </div>
                        <div>
                          <span className="font-medium">Escalation After:</span> {config.escalation_days} days
                        </div>
                        <div>
                          <span className="font-medium">Category:</span> {config.category.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" onClick={() => handleUpdateDeadline(config.id)}>
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleToggleStatus(config.id)}
                      >
                        {config.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>How Deadlines Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <strong>Resolution Time:</strong> The maximum number of days allowed to resolve a complaint of this category.
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <strong>Escalation Time:</strong> Complaints are automatically escalated if not addressed within this timeframe.
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <strong>Overdue Status:</strong> Complaints become overdue if they exceed the resolution time without being resolved.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Notice */}
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-blue-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Deadline Management</h3>
            <p className="text-gray-600 mb-4">
              Full deadline management functionality including automated notifications, 
              custom escalation rules, and deadline analytics will be available in the next update.
            </p>
            <Badge variant="info">Coming Soon</Badge>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
