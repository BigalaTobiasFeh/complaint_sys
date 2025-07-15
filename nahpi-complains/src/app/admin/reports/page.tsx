'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/contexts/AuthContext'

// Report interface
interface Report {
  id: string
  name: string
  description: string
  type: 'summary' | 'detailed' | 'analytics' | 'export'
  category: string
  last_generated?: string
  is_scheduled: boolean
}

export default function ReportsManagement() {
  const { user } = useAuth()
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })

  const availableReports: Report[] = [
    {
      id: '1',
      name: 'Complaint Summary Report',
      description: 'Overview of all complaints with status breakdown and key metrics',
      type: 'summary',
      category: 'complaints',
      last_generated: '2024-01-20T10:30:00Z',
      is_scheduled: false
    },
    {
      id: '2',
      name: 'Department Performance Report',
      description: 'Detailed analysis of each department\'s complaint handling performance',
      type: 'analytics',
      category: 'departments',
      last_generated: '2024-01-19T15:45:00Z',
      is_scheduled: true
    },
    {
      id: '3',
      name: 'Student Activity Report',
      description: 'Student complaint submission patterns and resolution outcomes',
      type: 'detailed',
      category: 'students',
      is_scheduled: false
    },
    {
      id: '4',
      name: 'Officer Workload Report',
      description: 'Analysis of officer assignments, resolution times, and workload distribution',
      type: 'analytics',
      category: 'officers',
      last_generated: '2024-01-18T09:15:00Z',
      is_scheduled: true
    },
    {
      id: '5',
      name: 'Overdue Complaints Report',
      description: 'Detailed list of overdue complaints with escalation recommendations',
      type: 'detailed',
      category: 'overdue',
      is_scheduled: false
    },
    {
      id: '6',
      name: 'Resolution Time Analytics',
      description: 'Statistical analysis of complaint resolution times across categories',
      type: 'analytics',
      category: 'performance',
      last_generated: '2024-01-17T14:20:00Z',
      is_scheduled: false
    }
  ]

  const handleGenerateReport = (reportId: string) => {
    const report = availableReports.find(r => r.id === reportId)
    if (report) {
      alert(`Generating ${report.name}...\n\nThis feature will be fully implemented in the next phase with real data export capabilities.`)
    }
  }

  const handleScheduleReport = (reportId: string) => {
    const report = availableReports.find(r => r.id === reportId)
    if (report) {
      alert(`Scheduling ${report.name}...\n\nAutomated report scheduling will be available in the next update.`)
    }
  }

  const handleExportData = () => {
    alert('Data export functionality will be implemented in the next phase with multiple format options (PDF, Excel, CSV).')
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'summary': return 'info'
      case 'detailed': return 'warning'
      case 'analytics': return 'success'
      case 'export': return 'error'
      default: return 'default'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <DashboardLayout user={{ name: user?.name || '', role: 'admin', email: user?.email || '' }} notifications={0}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Generate comprehensive reports and analyze system performance</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleExportData}>
              Export Data
            </Button>
            <Button>
              Custom Report
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{availableReports.length}</div>
              <div className="text-sm text-gray-600">Available Reports</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {availableReports.filter(r => r.is_scheduled).length}
              </div>
              <div className="text-sm text-gray-600">Scheduled Reports</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {availableReports.filter(r => r.last_generated).length}
              </div>
              <div className="text-sm text-gray-600">Generated Today</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {availableReports.filter(r => r.type === 'analytics').length}
              </div>
              <div className="text-sm text-gray-600">Analytics Reports</div>
            </CardContent>
          </Card>
        </div>

        {/* Date Range Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Report Parameters</CardTitle>
            <CardDescription>Configure date range and filters for report generation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                type="date"
                placeholder="Start Date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
              <Input
                type="date"
                placeholder="End Date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
              <Select
                value=""
                onChange={() => {}}
                options={[
                  { value: '', label: 'All Departments' },
                  { value: 'com', label: 'Computer Engineering' },
                  { value: 'cmc', label: 'Cybersecurity & Cryptology' },
                  { value: 'math', label: 'Mathematics' }
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Available Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
            <CardDescription>Select and generate reports for different aspects of the complaint system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {availableReports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">{report.name}</h3>
                        <Badge variant={getTypeColor(report.type)} size="sm">
                          {report.type}
                        </Badge>
                        {report.is_scheduled && (
                          <Badge variant="success" size="sm">Scheduled</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Category:</span> {report.category} • 
                        <span className="font-medium"> Last Generated:</span> {formatDate(report.last_generated)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" onClick={() => handleGenerateReport(report.id)}>
                      Generate
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleScheduleReport(report.id)}
                    >
                      {report.is_scheduled ? 'Modify Schedule' : 'Schedule'}
                    </Button>
                    <Button size="sm" variant="ghost">
                      Preview
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Report Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Analytics</CardTitle>
              <CardDescription>Instant insights and key metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Total Complaints This Month</span>
                  <span className="text-lg font-bold text-blue-600">127</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Resolution Rate</span>
                  <span className="text-lg font-bold text-green-600">84%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium">Avg Resolution Time</span>
                  <span className="text-lg font-bold text-yellow-600">5.2 days</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium">Overdue Complaints</span>
                  <span className="text-lg font-bold text-red-600">12</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>Download data in various formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export as PDF
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export as Excel
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Export as CSV
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Export as JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Notice */}
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-blue-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Reporting & Analytics</h3>
            <p className="text-gray-600 mb-4">
              Full reporting functionality including real-time data visualization, 
              automated report generation, custom report builder, and advanced analytics 
              will be available in the next update.
            </p>
            <Badge variant="info">Coming Soon</Badge>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
